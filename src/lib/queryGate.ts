/*

This is a short term fix to prevent requests to content where we've not completed
the Third Party Content licence data audit. For the time being, we're going to
allow access to the following lessons:

- All of Maths
- more… hopefully (via units or based on links in database related to licence data)

*/

import { gql, GraphQLClient } from 'graphql-request';
import { LessonView, lessonView } from './owaClient';

const supportedSubjects = ['maths'];
const supportedUnits: string[] = [
  'victorian-childhood-non-fiction-reading-and-writing',
];

export const blockedSubjects = ['english'];
export const allowedUnits = [
  'a-christmas-carol-narrative-writing-and-reading',
  'action-words',
  'ada-twist-scientist-reading-and-writing',
  'adverbial-complex-sentences',
  'a-history-of-language',
  'a-kind-of-spark-narrative-writing',
  'a-kind-of-spark-reading',
  'alternative-gpcs-for-consonants-and-homophones',
  'alternative-gpcs-for-long-vowels',
  'a-midsummer-nights-dream',
  'a-monster-within-reading-gothic-fiction',
  'anansi-and-the-antelope-baby-reading',
  'ancient-greeks-or-anglo-saxons-non-chronological-report',
  'ancient-islamic-civilisation-essay-writing',
  'ancient-islamic-civilisation-essay-writing',
  'and-tango-makes-three-book-club',
  'angler-fish-non-chronological-report',
  'anna-hibiscus-song-reading-and-writing',
  'apostrophes',
  'apostrophes-and-speech-punctuation',
  'a-superhero-like-you-reading-and-writing',
  'atinuke-and-other-authors-information-text',
  'a-world-at-war-poetry',
  'beowulf-narrative-writing',
  'beowulf-reading',
  'blackberry-blue-reading',
  'building-fluency-in-silent-letters-homophones-and-common-exception-words',
  'building-fluency-in-the-four-joins-suffixes-and-common-exception-words',
  'building-fluency-with-note-taking-choice-quotations-and-emphasis',
  'building-handwriting-fluency-through-speed-choices-and-writing-dialogue',
  'capital-letters',
  'capital-letters-and-numerals',
  'character-big-beautiful-and-eye-words',
  'character-clever-and-clumsy-words',
  'character-small-confident-and-shy-words',
  'charles-darwin-biographical-writing',
  'climate-emergency-journalistic-report-writing',
  'cloudbusting-book-club',
  'coming-to-england-reading',
  'compound-sentences',
  'creating-and-performing-slam-poetry',
  'curiosity-reading',
  'danny-chung-does-not-do-maths-book-club',
  'debating-important-topics',
  'dont-cross-the-line-book-club',
  'dystopian-settings-descriptive-writing',
  'el-deafo-book-club',
  'emmeline-pankhurst-little-people-big-dreams-reading',
  'emotions-words',
  'escape-from-pompeii-reading',
  'etymology-and-prefixes',
  'feelings-vocabulary',
  'fiction-books-that-changed-my-world',
  'fiction-ending-stories',
  'fiction-inner-musings',
  'fiction-read-around-the-world',
  'fiction-science-fiction-writing',
  'five-sentence-types',
  'florence-nightingale-and-mary-seacole-non-chronological-report',
  'florence-nightingale-diary-writing',
  'front-desk-book-club',
  'front-desk-persuasive-letter-writing',
  'further-study-of-the-four-joins',
  'getting-ready-to-debate',
  'girl-of-ink-and-stars-book-club',
  'gothic-poetry',
  'greenling-reading',
  'hansel-and-gretel-reading',
  'harriet-tubman-biographical-writing',
  'healthy-eating-adverts-persuasive-writing',
  'homophones-and-tense',
  'how-bees-make-honey-explanation-text',
  'how-to-train-your-dragon-diary-and-narrative-writing',
  'how-to-train-your-dragon-reading',
  'into-the-forest-diary-writing',
  'introduction-to-debate',
  'introduction-to-speeches',
  'jack-and-the-beanstalk-reading-and-writing',
  'key-grammar-terminology-including-determiners-and-fronted-adverbials',
  'key-terminology-including-determiners-fronted-adverbials-and-parenthesis',
  'king-tut-or-healthy-lifestyle-non-chronological-report',
  'letter-strings',
  'letter-strings-etymology-and-curriculum-words',
  'little-red-riding-hood-journalistic-report',
  'looking-after-pets-reading-and-writing',
  'lord-of-the-flies',
  'macbeth-and-masculinity-the-struggle-for-power',
  'macbeth-a-tragic-hero',
  'macbeth-lady-macbeth-as-a-machiavellian-villain',
  'macbeth-the-role-of-guilt',
  'malevolent-characters-descriptive-and-narrative-writing',
  'mirror-reading',
  'monster-pizza-instructions-writing',
  'more-suffixes-and-silent-letters',
  'mulan-reading',
  'mummification-explanation-text',
  'myths-and-legends-re-told-poetry-and-short-stories',
  'nineteenth-century-text-first-deep-dive',
  'nineteenth-century-text-first-study',
  'nineteenth-century-text-second-deep-dive',
  'nineteenth-century-text-third-deep-dive',
  'nocturnal-animals-non-chronological-report',
  'non-fiction-explorers',
  'non-fiction-letter-writing-v3731',
  'non-fiction-teenage-kicks',
  'noun-and-adjective-suffixes',
  'noun-suffixes-letter-strings-and-homophones',
  'numerals-1-10',
  'numerals-1-10',
  'nursery-rhymes-reading-poetry',
  'oliver-twist-reading',
  'oral-storytelling',
  'othello',
  'paddington-reading-and-writing',
  'pandas-or-antarctic-animals-non-chronological-report',
  'participating-in-effective-debates',
  'poet-focus-joseph-coelho',
  'polar-regions-essay-writing',
  'pre-cursive-lower-case-letters-or-lower-case-letters-revision',
  'prefixes-homonyms-and-homophones',
  'princess-sophia-duleep-singh-my-story-reading',
  'punctuation',
  'reading-and-performing-scripts',
  'review-and-revision-of-all-taught-spelling',
  'review-including-word-class-sentence-types-tense-commas-and-colons',
  'review-of-determiners-prepositions-and-fronted-adverbials',
  'review-using-lead-ins-or-no-lead-ins',
  'school-trip-recount-writing',
  'school-trip-writing-a-recount',
  'school-uniform-persuasive-letter-writing',
  'setting-words',
  'shackletons-journey-reading',
  'shakespeare-third-deep-dive',
  'sharing-our-opinions-agreeing-and-disagreeing',
  'sherlock-holmes-descriptive-and-letter-writing',
  'sherlock-holmes-short-stories',
  'simple-compound-adverbial-and-relative-complex-sentences',
  'simple-compound-and-adverbial-complex-sentences',
  'simple-sentences',
  'single-poet-study-maya-angelou',
  'speaking-and-listening',
  'speaking-loud-and-proud',
  'speeches',
  'speech-first-punctuation-and-apostrophes',
  'speech-punctuation-parenthesis-and-apostrophes',
  'spoken-language-sharing-your-opinion',
  'spoken-language-the-language-of-change',
  'successful-speeches',
  'suffixes',
  'suffixes-etymology-and-homophones',
  'swallows-kiss-book-club',
  'talking-transitions',
  'taste-and-smell-words',
  'tense-forms-simple-progressive-and-perfect',
  'tense-forms-simple-progressive-and-perfect-consolidation',
  'the-amazon-rainforest-essay-writing',
  'the-aye-aye-or-wild-cats-non-chronological-report',
  'the-bfg-reading-and-narrative-writing',
  'the-borrowers-narrative-writing-and-reading',
  'the-children-of-lir-reading',
  'the-day-the-crayons-quit-reading-and-writing-persuasive-letters',
  'the-digestive-system-explanation-writing',
  'the-empire-windrush-diary-writing',
  'the-empire-windrush-essay-writing',
  'the-firework-makers-daughter-reading-and-diary-writing',
  'the-firework-makers-daughter-reading-and-narrative-writing',
  'the-four-joins',
  'the-fundamentals-of-effective-discussion',
  'the-great-fire-of-london-non-chronological-report',
  'the-happy-prince-narrative-writing-and-reading',
  'the-iron-man-narrative-writing',
  'the-iron-man-reading',
  'the-jabberwocky-narrative-writing',
  'the-magic-box-reading-imaginative-poetry',
  'the-magic-porridge-pot-reading-and-writing',
  'the-miraculous-journey-of-edward-tulane-book-club',
  'the-moon-dragons-reading',
  'the-owl-who-was-afraid-of-the-dark-reading',
  'the-portia-spider-non-chronological-report',
  'the-proudest-blue-reading-and-writing',
  'the-sheep-pig-reading',
  'the-stone-age-non-chronological-report',
  'the-tempest',
  'the-three-billy-goats-gruff-reading-and-writing',
  'the-titanic-journalistic-report-writing',
  'the-twisted-tree-fiction-reading',
  'the-unforgotten-coat-book-club',
  'the-viewer-narrative-writing',
  'the-wild-robot-book-club',
  'the-wolf-the-duck-and-the-mouse-book-club',
  'three-tense-forms-and-modal-verbs',
  'three-tense-forms-modality-active-voice-and-passive-voice',
  'using-five-sentence-types',
  'varjak-paw-book-club',
  'verb-adjective-and-noun-suffixes',
  'verb-and-adjective-suffixes',
  'weather-cloudy-dark-and-rainy-words',
  'weather-cold-calm-and-stormy-words',
  'weather-descriptive-writing',
  'weather-wind-and-hot-words',
  'when-stars-are-scattered-book-club',
  'when-the-sky-falls-narrative-and-diary-writing',
  'when-the-sky-falls-reading',
  'wonder-book-club',
  'word-class',
  'writing-ed-and-ing-suffixes',
  'writing-lower-case-letters-in-print',
  'writing-masters',
  'yoshi-the-stonecutter-reading',
  'zim-zam-zoom-by-james-carter-reading-poetry',
];

type KV = Record<string, string>;

export function modifyQueryWithSubject(query: string, vars: KV) {
  vars.subjectSlug = 'maths';
  if (query.includes('subjectSlug')) {
    return query;
  }

  query += `, _and: { subjectSlug: { _eq: $subject } }`;
  return query;
}

export async function blockLessonForCopyrightText(
  client: GraphQLClient,
  lessonSlug: string
) {
  const res = await getSubjectAndUnitForLesson(client, lessonSlug);

  if (!res) {
    // unknown subject - block
    return true;
  }

  return isBlockedUnitOrSubject(res);
}

export function isBlockedUnitOrSubject({
  unitSlug,
  subjectSlug,
}: {
  unitSlug: string;
  subjectSlug: string;
}): boolean {
  if (allowedUnits.includes(unitSlug)) {
    // not copyright
    return false;
  }

  if (blockedSubjects.includes(subjectSlug)) {
    return true;
  }

  return false;
}

export async function blockUnitForCopyrightText(
  client: GraphQLClient,
  unitSlug: string
) {
  if (allowedUnits.includes(unitSlug)) {
    // not copyright
    return false;
  }

  const res = await getSubjectForUnit(client, unitSlug);

  if (!res) {
    // unknown subject - block
    return true;
  }

  const { subjectSlug } = res;

  if (blockedSubjects.includes(subjectSlug)) {
    return true;
  }

  return false;
}

export function modifySubject(subject: string) {
  // this is stupid code, but my thinking is that hopefully we can open up to
  // more subjects quickly
  if (isUnitSupported(subject)) {
    return subject;
  }
  return supportedSubjects[0];
}

export function checkQueryAllowedAssets(
  subject: string = '',
  unit: string = ''
) {
  return isSubjectSupported(subject) || isUnitSupported(unit);
}

export async function checkLessonAllowedAsset(
  client: GraphQLClient,
  slug: string
) {
  const res = await getSubjectAndUnitForLesson(client, slug);

  if (!res) {
    return false;
  }

  const { subjectSlug, unitSlug } = res;

  return isSubjectSupported(subjectSlug) || isUnitSupported(unitSlug);
}

export function supportsImages(subject: string, unit: string) {
  return isSubjectSupported(subject) || isUnitSupported(unit);
}

export function isSubjectSupported(subject: string) {
  return supportedSubjects.includes(subject);
}

export function isUnitSupported(unit: string) {
  return supportedUnits.includes(unit);
}

export async function getSubjectAndUnitForLesson(
  client: GraphQLClient,
  slug: string
): Promise<{ subjectSlug: string; unitSlug: string } | false> {
  const query = gql`
  query ($slug: String!) {
    ${lessonView}(
      where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
    ) {
      subjectSlug
      unitSlug
    }
  }
  `;

  const res: LessonView = await client.request(query, {
    slug,
  });

  if (!res[lessonView].length) {
    return false;
  }

  const { subjectSlug = '', unitSlug = '' } = res[lessonView][0];

  return { subjectSlug, unitSlug };
}

async function getSubjectForUnit(
  client: GraphQLClient,
  slug: string
): Promise<{ subjectSlug: string } | false> {
  const query = gql`
  query ($slug: String!) {
    ${lessonView}(
      where: { unitSlug: { _eq: $slug }, isLegacy: { _eq: false } }
      limit: 1
    ) {
      subjectSlug
    }
  }
  `;

  const res: LessonView = await client.request(query, {
    slug,
  });

  if (!res[lessonView].length) {
    return false;
  }

  const { subjectSlug = '' } = res[lessonView][0];

  return { subjectSlug };
}
