import { protectedProcedure } from "~/lib/protect";
import { router } from "~/lib/trpc";
import { TRPCError } from "@trpc/server";
import {
  UnitCurriculumView,
  getClient,
  gql,
  unitCurriculumView,
} from "lib/owaClient";
import { z } from "zod";

export const unitSchema = z.object({
  unitSlug: z.string(),
  unitTitle: z.string(),
  tags: z.array(z.string()),
  // notes: z.string(),
  // description: z.string(),
  // plannedNumberOfLessons: z.number(),
  priorKnowledgeRequirements: z.array(z.string()),
  nationalCurriculumContent: z.array(z.string()),
  priorUnit: z.object({
    description: z.string(),
    units: z.array(z.object({ unitSlug: z.string(), unitTitle: z.string() })),
  }),
  futureUnit: z.object({
    description: z.string(),
    units: z.array(z.object({ unitSlug: z.string(), unitTitle: z.string() })),
  }),
  unitLessons: z.array(
    z.object({ lessonSlug: z.string(), lessonTitle: z.string() }),
  ),
});

export const getUnits = router({
  getUnit: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        tags: ["units"],
        path: "/units/{unit}/summary",
        description:
          "This endpoint returns unit information for a given unit, including slug, title, number of lessons, prior knowledge requirements, national curriculum statements, prior unit details, future unit descriptions, and lesson titles that form the unit",
        example: {
          request: {
            unit: "simple-compound-and-adverbial-complex-sentences",
          },
          response: {
            unitSlug: "simple-compound-and-adverbial-complex-sentences",
            unitTitle: "Simple, compound and adverbial complex sentences",
            tags: ["Grammar"],
            priorKnowledgeRequirements: [
              "A simple sentence is about one idea and makes complete sense.",
              "Any simple sentence contains one verb and at least one noun.",
              "Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.",
            ],
            nationalCurriculumContent: [
              "Ask relevant questions to extend their understanding and knowledge",
              "Articulate and justify answers, arguments and opinions",
              "Speak audibly and fluently with an increasing command of Standard English",
            ],
            priorUnit: {
              description:
                "In 'Adverbial complex sentences', pupils built on from co-ordination to how to stretch a simple sentence with subordination and a second idea. In this unit, pupils will learn that the position of the subordinate clause in an adverbial complex sentence can vary.",
              units: [
                {
                  unitSlug: "adverbial-complex-sentences",
                  unitTitle: "Adverbial complex sentences",
                },
              ],
            },
            futureUnit: {
              description:
                "In this unit, pupils learn that the position of the subordinate clause in an adverbial complex sentence can vary. In 'Simple and progressive tense forms', pupils will write a variety of sentence structures in different tenses.",
              units: [
                {
                  unitSlug: "tense-forms-simple-progressive-and-perfect",
                  unitTitle: "Tense forms: simple, progressive and perfect",
                },
              ],
            },
            unitLessons: [
              {
                lessonSlug:
                  "three-ways-for-co-ordination-in-compound-sentences",
                lessonTitle:
                  "Three ways for co-ordination in compound sentences",
              },
              {
                lessonSlug: "compound-and-adverbial-complex-sentences-revision",
                lessonTitle:
                  "Compound and adverbial complex sentences revision",
              },
            ],
          },
        },
      },
    })
    .output(unitSchema)
    .input(z.object({ unit: z.string({ description: "The unit slug" }) }))
    .query(async ({ input }) => {
      const { unit: slug } = input;
      const client = getClient();

      const query = gql`
        query getUnit($slug: String!) {
          ${unitCurriculumView}(where: { unitSlug: { _eq: $slug } }) {
            unitSlug
            unitTitle
            unitTags
            unitNotes
            unitDescription
            priorKnowledgeRequirements
            unitNationalCurriculumContent
            priorUnit
            futureUnit
            futureUnitDescription
            priorUnitDescription
            unitLessons
          }
        }
      `;

      const res: UnitCurriculumView = await client.request(query, { slug });

      if (res[unitCurriculumView].length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Unit not found" });
      }

      // transform the data to clean up objects to arrays
      //   slug, title, tags: .tags | map(.title), notes, description, plannedNumberOfLessons, priorKnowledgeRequirements, nationalCurriculumContent: .nationalCurriculumContent | map(.title), priorUnit: { description: .priorUnitDescription, units: .priorUnit | map({ slug, title }) }, futureUnit: { description: .futureUnitDescription, units: .futureUnit | map({ slug, title }) }
      // }

      const root = res[unitCurriculumView][0];

      return {
        unitSlug: root.unitSlug,
        unitTitle: root.unitTitle,
        unitLessons: (root.unitLessons || []).map((lesson) => ({
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
        })),
        tags: (root.unitTags || []).map((tag) => tag.title),
        priorKnowledgeRequirements: root.priorKnowledgeRequirements || [],
        nationalCurriculumContent: (
          root.unitNationalCurriculumContent || []
        ).map((content) => content.title),
        priorUnit: {
          description: root.priorUnitDescription || "",
          units: (root.priorUnit || []).map((unit) => ({
            unitSlug: unit.slug,
            unitTitle: unit.title,
          })),
        },
        futureUnit: {
          description: root.futureUnitDescription || "",
          units: (root.futureUnit || []).map((unit) => ({
            unitSlug: unit.slug,
            unitTitle: unit.title,
          })),
        },
      };
    }),
});
