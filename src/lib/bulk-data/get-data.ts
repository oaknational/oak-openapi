import { parseSubjectPhaseSlug } from '@/lib/sequenceSlugParser';
import { logError } from './logger';
import {
  ExamBoard,
  LessonAssets,
  LessonAssetsMap,
  SlimSequenceResult,
  UnitWithExamBoards,
  Lesson,
} from './types';
import { gql, GraphQLClient } from 'graphql-request';
import {
  currentCycle,
  DownloadView,
  downloadView,
  lessonContentViewTable,
  lessonViewTable,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
  SubjectPhase,
  SubjectPhaseView,
  subjectPhaseView,
  TitleSlug,
} from '@/lib/owaClient';
import { formatUnitSummary } from '@/lib/handlers/units/helpers';
import { sequenceWhere } from '@/lib/handlers/sequences/sequences';
import { runSQL } from './data-stores';

export async function getAllSubjects(
  client: GraphQLClient,
  subjectPhaseFilter?: string,
) {
  let slugFilter = '';
  if (subjectPhaseFilter) {
    const { subjectSlug } = parseSubjectPhaseSlug(subjectPhaseFilter);
    slugFilter = `slug: { _eq: "${subjectSlug}" }`;
  }

  const query = gql`
    query ($currentCycle: String!) @cached(ttl: 300) {
      ${subjectPhaseView}(
        where: {
          cycle: { _eq: $currentCycle }
          ${slugFilter}
          _not: {slug: {_eq: "financial-education"}}
        }
        order_by: { display_order: asc }
      ) {
        title
        slug
        keystages
        phases
        ks4_options
        display_order
      }
    }`;

  const res: SubjectPhaseView = await client.request(query, {
    currentCycle,
  });

  let reply = res[subjectPhaseView].map(phaseToSequences).flat();

  if (subjectPhaseFilter) {
    reply = reply.filter((s) => s.sequenceSlug == subjectPhaseFilter);
  }

  return reply;
}

export function getUnit(sequence: UnitWithExamBoards[], unit: string) {
  const found = sequence.find((_) => _.unitSlug === unit);

  if (!found) {
    logError(`Unit not found: ${unit}`);
    process.exit(1);
  }

  return found;
}

function phaseToSequences(subject: SubjectPhase): SlimSequenceResult[] {
  return subject.phases.map((phase) => {
    if (phase.slug === 'secondary' && subject.ks4_options) {
      return {
        sequenceSlug: `${subject.slug}-${phase.slug}`,
        subjectTitle: subject.title,
        ks4Options: subject.ks4_options,
      };
    }

    return {
      sequenceSlug: `${subject.slug}-${phase.slug}`,
      subjectTitle: subject.title,
    };
  });
}

export async function getAllSequenceData(
  client: GraphQLClient,
  sequence: string,
  examBoards?: TitleSlug[],
): Promise<UnitWithExamBoards[]> {
  // `true` means there's no pathway - ie. we don't want to limit on core, gcse, etc
  const where = sequenceWhere(sequence, undefined, true);

  const query = gql`
    query ($where: ${sequenceViewWhereInput}!) {
      ${sequenceView}(
        where: $where
        order_by: { order: asc }
      ) {
        title
        threads
        slug
        actions
        domain
        examboard
        examboard_slug
        keystage_slug
        order
        pathway
        pathway_slug
        tier
        features
        actions
        tier_slug
        unit_options
        year

        description
        lessons
        why_this_why_now
        prior_knowledge_requirements
        national_curriculum_content

      }
  }`;

  const queryResult: SequenceView = await client.request(query, { where });

  // before the unit is cleaned up, we need to check for features and do the
  // modifications to the unit

  let units = queryResult[sequenceView]
    .map((_) => {
      if (_.features?.pe_swimming) {
        return {
          ..._,
          year: 'all-years',
        };
      }

      return _;
    })
    .map((_) => formatUnitSummary(_.slug, _)) as UnitWithExamBoards[];

  // some units will appear more than once. equally, if the sequence string
  // ends with `-secondary` then we need to add the exam boards to the object
  // the duplicates need to to removed, but their exam boards need to be added
  if (examBoards) {
    const seen = new Set<string>();
    units = units.reduce((acc, unit, i, allUnits) => {
      // ignore duplicates, they've been dealt with
      if (seen.has(unit.unitSlug)) {
        return acc;
      }

      seen.add(unit.unitSlug);

      // first copy the exam boards onto units have no exam board (this actually
      // means they're in all exam boards).
      if (unit.examboard && unit.examboardSlug) {
        // now we restructure the exam board property
        const { examboard, examboardSlug } = unit;
        delete unit.examboard;
        delete unit.examboardSlug;

        const localExamBoards: ExamBoard[] = [
          { title: examboard, slug: examboardSlug },
        ];

        const subjectOverride =
          queryResult[sequenceView][i].actions?.programme_field_overrides
            ?.subject;

        if (subjectOverride) {
          localExamBoards[0].examSubjectTitle = subjectOverride;
        }

        // now find if there's any other units with the same slug
        allUnits.forEach((_, j) => {
          if (i === j) {
            return false; // this is the current unit
          }
          if (_.unitSlug === unit.unitSlug) {
            if (_.examboard && _.examboardSlug) {
              const res: ExamBoard = {
                title: _.examboard,
                slug: _.examboardSlug,
              };

              if (subjectOverride) {
                res.examSubjectTitle = subjectOverride;
              }
              localExamBoards.push(res);
            }
          }
        });

        unit.examBoards = localExamBoards;
      } else if (!unit.examboardSlug) {
        unit.examBoards = examBoards;
      }

      acc.push(unit);

      return acc;
    }, [] as UnitWithExamBoards[]);
  }

  return units;
}

export async function getAllLessonAssets(
  client: GraphQLClient,
  lessonSlugs: string[],
): Promise<LessonAssetsMap> {
  const query = gql`
      query GetDownloads($slugs: [String!]!) {
        ${downloadView}(
          where: {
            lessonSlug: { _in: $slugs }
          }
        ) {
          lessonSlug
          exitQuiz
          exitQuizAnswers
          slideDeck: slidedeck
          starterQuizAnswers
          starterQuiz: starter_quiz
          supplementaryResource
          video: videos
          worksheet
          worksheetAnswers
        }
      }
    `;

  const variables = {
    slugs: lessonSlugs,
  };

  const res: DownloadView = await client.request(query, variables);

  // map res so that it's slug -> all assets
  const map = res[downloadView].reduce(
    (acc, assets) => {
      const { lessonSlug, ...allAssets } = assets;

      // Extract video stream specifically for backward compatibility
      const videoStream = assets.video?.stream || null;

      acc[lessonSlug] = {
        ...allAssets,
        // @ts-expect-error not worth sorting out the type discrepancy
        videoStream,
      };

      return acc;
    },
    {} as Record<string, LessonAssets>,
  );

  return map;
}

export async function getAllLessonData(unitSlug: string): Promise<Lesson[]> {
  const sql = `
    SELECT
      lessons."lessonTitle",
      lessons."lessonSlug",
      lessons."unitSlug",
      lessons."unitTitle",
      lessons."subjectSlug",
      lessons."subjectTitle",
      lessons."keyStageSlug",
      lessons."keyStageTitle",
      lessons."lessonKeywords",
      lessons."keyLearningPoints",
      lessons."misconceptionsAndCommonMistakes",
      lessons."pupilLessonOutcome",
      lessons."teacherTips",
      lessons."contentGuidance",
      lessons."hasDownloadableResources" AS downloadsAvailable,
      lessons."supervisionLevel",
      transcripts."transcript_sentences",
      transcripts."transcript_vtt"
    FROM
      ${lessonViewTable} AS lessons,
      ${lessonContentViewTable} AS transcripts
    WHERE
      lessons."lessonId" = transcripts."lesson_id"
      AND lessons."unitSlug" = '${unitSlug}'
      AND transcripts."_state" = 'published'`;

  const res = (await runSQL(sql)) as Lesson[];
  // const res = (
  //   await db.query({
  //     text: sql,
  //   })
  // ).rows;

  const seen = new Set();

  return res.reduce((acc, row) => {
    if (seen.has(row.lessonSlug)) {
      return acc;
    }

    seen.add(row.lessonSlug);
    acc.push(row);
    return acc;
  }, [] as Lesson[]);
}
