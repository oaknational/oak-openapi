// import { protectedProcedure } from '~/lib/protect';
// // import { zodToJsonSchema } from 'zod-to-json-schema';

// import { router } from '~/lib/trpc';
// import { keyStageSlugs, subjectSlugs } from 'lib/keyStageAndSubjects';
// import {
//   QuestionTypeEnum,
//   getClient,
//   gql,
//   lessonView,
//   sequenceView,
//   sequenceViewWhereInput,
// } from 'lib/owaClient';
// import type {
//   LessonView,
//   Lesson,
//   Question as DBQuestion,
//   ImageStem,
//   TextType,
//   Match as DBMatch,
//   OrderAnswer as DBOrder,
//   ShortAnswer as DBShortAnswer,
//   MultipleChoiceAnswer as DBMultipleChoiceAnswer,
//   SequenceView,
// } from 'lib/owaClient';
// import { z } from 'zod';
// import { baseUrl } from '../baseUrl';
// import {
//   blockedSubjects,
//   getSubjectAndUnitForLesson,
//   isBlockedUnitOrSubject,
//   supportsImages,
// } from '../queryGate';
// import allowedUnits from '../queryGateData/supportedUnits.json' with { type: 'json' };
// import { TRPCError } from '@trpc/server';
// import { sequenceWhere } from './sequences';
// import { parseSubjectPhaseSlug } from '../sequenceSlugParser';
// import { blockedSequenceSubjects } from '../blockedContent';

// const multipleChoiceLit = z.literal('multiple-choice');
// const shortAnswerLit = z.literal('short-answer');
// const matchAnswerLit = z.literal('match');
// const orderAnswerLit = z.literal('order');

// const availableQuestionTypes = z.union([
//   multipleChoiceLit,
//   shortAnswerLit,
//   matchAnswerLit,
//   orderAnswerLit,
// ]);

// const imageContent = z.object({
//   url: z.string(),
//   width: z.number(),
//   height: z.number(),
//   alt: z.string().optional(),
//   text: z
//     .string({
//       description: 'Supplementary text for the image, if any',
//     })
//     .optional(),
//   // RS disabled license for now until we have final answer on how we deal
//   // with unknown/uncategorised licenses
//   attribution: z.string().optional(),

//   // license: z
//   //   .object({
//   //     source: z.string().optional(),
//   //     attribution_required: z.boolean().optional(),
//   //     usageRestrictions: z.string().optional(),
//   //     usage_notes: z.string().optional(),
//   //   })
//   //   .optional(),
// });

// const textAnswer = z.object({
//   type: z.literal('text'),
//   content: z.string(),
// });

// const imageAnswer = z.object({
//   type: z.literal('image'),
//   content: imageContent,
// });

// const multipleChoiceAnswer = z
//   .object({ distractor: z.boolean() })
//   .and(z.union([textAnswer, imageAnswer]));

// const shortAnswer = textAnswer;

// const matchAnswer = z.object({
//   matchOption: textAnswer,
//   correctChoice: textAnswer,
// });

// const orderAnswer = z
//   .object({
//     order: z.number(),
//   })
//   .and(textAnswer);

// const questionZod = z
//   .object({
//     question: z.string(),
//     questionType: availableQuestionTypes,
//     questionImage: imageContent.optional(),
//   })
//   .and(
//     z.discriminatedUnion('questionType', [
//       z.object(
//         {
//           questionType: multipleChoiceLit,
//           answers: z.array(multipleChoiceAnswer),
//         },
//         {
//           description:
//             'Multiple choice answer allows for one or more than one answer to be correct as defined by the distractor field being set to false',
//         },
//       ),
//       z.object(
//         {
//           questionType: shortAnswerLit,
//           answers: z.array(shortAnswer),
//         },
//         {
//           description:
//             'Short answers allow students to enter a free text answer, and the answers array contains a list of acceptable answers',
//         },
//       ),
//       z.object(
//         {
//           questionType: matchAnswerLit,
//           answers: z.array(matchAnswer),
//         },
//         {
//           description:
//             'The student is offered a list from the `match_option` field in the answers array, and must correctly match them to the `correct_choice` value',
//         },
//       ),
//       z.object(
//         {
//           questionType: orderAnswerLit,
//           answers: z.array(orderAnswer),
//         },
//         {
//           description:
//             'The student is offered a list of items to order, and must correctly order them according to the `order` field. When presenting the answer options to the student, you should randomise the order of the items',
//         },
//       ),
//     ]),
//   );

// const questionsSchema = z.array(
//   z.object({
//     lessonSlug: z.string(),
//     lessonTitle: z.string(),
//     // unitSlug: z.string(),
//     starterQuiz: z.array(questionZod),
//     exitQuiz: z.array(questionZod),
//   }),
// );

// type Question = z.infer<typeof questionZod>;
// type QuizKey = 'exitQuiz' | 'starterQuiz';
// type TextAnswer = z.infer<typeof textAnswer>;
// type MatchAnswer = z.infer<typeof matchAnswer>;
// type OrderAnswer = z.infer<typeof orderAnswer>;
// type MultipleChoiceAnswer = z.infer<typeof multipleChoiceAnswer>;
// type ImageDataSchemaType = z.infer<typeof imageContent>;

// function emptyQuizResults(): Record<QuizKey, Question[]> {
//   return {
//     starterQuiz: [],
//     exitQuiz: [],
//   };
// }

// export function formatShortAnswer(answer: DBShortAnswer): TextAnswer {
//   // sample slug: solving-equations-with-surds
//   if (answer.answer[0].type === 'text') {
//     return {
//       type: answer.answer[0].type,
//       content: answer.answer[0].text,
//     };
//   }

//   throw new TRPCError({
//     message: 'Unexpected answer type',
//     code: 'INTERNAL_SERVER_ERROR',
//   });
// }

// export function formatMatchAnswer(answer: DBMatch): MatchAnswer {
//   // sample slug: the-theme-of-family-in-grandads-island
//   const matchOption = answer.match_option.filter((_) => _.type === 'text')[0];
//   const correctChoice = answer.correct_choice.filter(
//     (_) => _.type === 'text',
//   )[0];

//   return {
//     matchOption: {
//       type: matchOption.type,
//       content: matchOption.text,
//     },
//     correctChoice: {
//       type: correctChoice.type,
//       content: correctChoice.text,
//     },
//   };
// }

// export function formatOrderAnswer(answer: DBOrder): OrderAnswer {
//   // sample slug: ordering-negative-integers
//   const content = answer.answer[0].text;

//   return {
//     type: 'text',
//     content,
//     order: answer.correct_order,
//   };
// }

// function formatMultipleChoiceAnswer(
//   answer: DBMultipleChoiceAnswer,
// ): MultipleChoiceAnswer {
//   // sample slug: solving-equations-with-surds

//   if (answer.answer[0].type === 'text') {
//     return {
//       type: 'text',
//       content: answer.answer[0].text,
//       distractor: !answer.answer_is_correct,
//     };
//   }

//   // next two declarations are cast in TypeScript because TS doesn't
//   // know that _.type = 'image' always returns an ImageAnswerStem
//   // (or undefined, which we handle)
//   const image = answer.answer.find((_) => _.type === 'image') as ImageStem;

//   if (image) {
//     const text = answer.answer.find((_) => _.type === 'text') as TextType;

//     const content = formatImage(image, text);

//     const res = {
//       type: answer.answer[0].type,
//       content,
//       distractor: !answer.answer_is_correct,
//     };

//     // RS disabled license for now until we have final answer on how we deal
//     // with unknown/uncategorised licenses (and)

//     // if (res.content.license) {
//     //   if (res.content.license?.attribution_required) {
//     //     res.content.license.attribution_required =
//     //       res.content.license.attribution_required ===
//     //       ('yes' as unknown as boolean);
//     //   }
//     // }

//     return res;
//   }

//   throw new TRPCError({
//     message: 'Unexpected answer type',
//     code: 'INTERNAL_SERVER_ERROR',
//   });
// }

// function formatImageUrl(url: string) {
//   const urlObj = new URL(url);
//   urlObj.hostname = 'cloudinary-res.thenational.academy';
//   return urlObj.href;
// }

// function formatImage(image: ImageStem, text: null | { text: string } = null) {
//   const content: ImageDataSchemaType = {
//     url: formatImageUrl(
//       image.image_object.secure_url || image.image_object.url || '',
//     ),
//     width: image.image_object.width || 0,
//     height: image.image_object.height || 0,
//     alt: image.image_object.context?.custom?.alt || undefined,
//     text: text?.text || undefined,
//     attribution: image.image_object.metadata?.attribution || undefined,
//   };

//   return content;
// }

// function formatQuestion(
//   question: DBQuestion,
//   imagesAllowed: boolean = false,
// ): Question | undefined {
//   const questionText = question.questionStem
//     .filter((_) => _.type === 'text')
//     .map((_) => _.text)
//     .join(' ');

//   let questionImage: undefined | ImageDataSchemaType;

//   if (imagesAllowed && question.questionStem.length === 2) {
//     // probably contains the image
//     const image = question.questionStem.filter((_) => _.type === 'image').pop();

//     if (image) {
//       questionImage = formatImage(image);
//     }
//   }

//   // TypeScript really doesn't like DRY. This code could…should be able to reuse
//   // the `questionType`, but TS parser can't handle it, so it's exploded out like this

//   if (question.questionType === QuestionTypeEnum.MultipleChoice) {
//     return {
//       question: questionText,
//       questionType: QuestionTypeEnum.MultipleChoice,
//       questionImage,
//       answers: question.answers[QuestionTypeEnum.MultipleChoice].map(
//         formatMultipleChoiceAnswer,
//       ),
//     };
//   }

//   if (question.questionType === QuestionTypeEnum.ShortAnswer) {
//     return {
//       question: questionText,
//       questionType: QuestionTypeEnum.ShortAnswer,
//       questionImage,
//       answers:
//         question.answers[QuestionTypeEnum.ShortAnswer].map(formatShortAnswer),
//     };
//   }

//   if (question.questionType === QuestionTypeEnum.Match) {
//     return {
//       question: questionText,
//       questionType: QuestionTypeEnum.Match,
//       answers: question.answers[QuestionTypeEnum.Match].map(formatMatchAnswer),
//     };
//   }

//   if (question.questionType === QuestionTypeEnum.Order) {
//     return {
//       question: questionText,
//       questionType: QuestionTypeEnum.Order,
//       questionImage,
//       answers: question.answers[QuestionTypeEnum.Order].map(formatOrderAnswer),
//     };
//   }
// }

// function questionsForQuiz(
//   lesson: Lesson,
//   imagesAllowed: boolean = false,
// ): Record<QuizKey, Question[]> {
//   const result = emptyQuizResults();
//   for (const quiz of ['starterQuiz', 'exitQuiz'] as QuizKey[]) {
//     let lessonContent;

//     // seems verbose, but TS won't let me access `lesson` with an arbitrary string
//     if (quiz === 'starterQuiz') {
//       lessonContent = lesson.starterQuiz;
//     } else {
//       lessonContent = lesson.exitQuiz;
//     }

//     if (!lessonContent) {
//       continue;
//     }

//     const questions: Question[] = [];
//     for (const question of lessonContent) {
//       if (!question.answers) {
//         continue;
//       }

//       // filter out questions where the answers contain an image
//       if (question.questionType === QuestionTypeEnum.MultipleChoice) {
//         // images only appear in multiple choice questions (validated by checking db)
//         const hasImageAnswer = question.answers[question.questionType].some(
//           (answer) => answer.answer.some((a) => a.type === 'image'),
//         );

//         if (hasImageAnswer && imagesAllowed === false) {
//           continue;
//         }
//       }

//       const res = formatQuestion(question, imagesAllowed);
//       if (res) {
//         questions.push(res);
//       }
//     }

//     result[quiz] = questions;
//   }
//   return result;
// }

// export const getQuestions = router({
//   getQuestionsForLessons: protectedProcedure
//     .meta({
//       openapi: {
//         method: 'GET',
//         tags: ['lessons', 'questions'],
//         path: '/lessons/{lesson}/quiz',
//         description:
//           'The endpoint returns the quiz questions and answers for a given lesson. The answers data indicates which answers are correct, and which are distractors.',
//         example: {
//           request: {
//             lesson: 'joining-using-and',
//           },
//           response: {
//             starterQuiz: [
//               {
//                 question: 'Tick the sentence with the correct punctuation.',
//                 questionType: 'multiple-choice',
//                 answers: [
//                   {
//                     distractor: true,
//                     type: 'text',
//                     content: 'the baby cried',
//                   },
//                   {
//                     distractor: true,
//                     type: 'text',
//                     content: 'The baby cried',
//                   },
//                   {
//                     distractor: false,
//                     type: 'text',
//                     content: 'The baby cried.',
//                   },
//                   {
//                     distractor: true,
//                     type: 'text',
//                     content: 'the baby cried.',
//                   },
//                 ],
//               },
//             ],
//             exitQuiz: [
//               {
//                 question: 'Which word is a verb?',
//                 questionType: 'multiple-choice',
//                 answers: [
//                   {
//                     distractor: true,
//                     type: 'text',
//                     content: 'shops',
//                   },
//                   {
//                     distractor: true,
//                     type: 'text',
//                     content: 'Jun',
//                   },
//                   {
//                     distractor: true,
//                     type: 'text',
//                     content: 'I',
//                   },
//                   {
//                     distractor: false,
//                     type: 'text',
//                     content: 'shout',
//                   },
//                 ],
//               },
//             ],
//           },
//         },
//       },
//     })
//     .input(
//       z.object({
//         lesson: z.string(),
//       }),
//     )
//     .output(
//       z.object({
//         starterQuiz: z.array(questionZod),
//         exitQuiz: z.array(questionZod),
//       }),
//     )
//     .query(async ({ input }) => {
//       const slug = decodeURIComponent(input.lesson);

//       const client = getClient();

//       const subjectUnit = await getSubjectAndUnitForLesson(client, slug);

//       if (!subjectUnit) {
//         throw new TRPCError({
//           message: 'Lesson not found',
//           code: 'NOT_FOUND',
//         });
//       }

//       const blocked = isBlockedUnitOrSubject(subjectUnit);

//       if (blocked) {
//         throw new TRPCError({
//           message: 'Lesson not available for this query',
//           code: 'NOT_FOUND',
//         });
//       }

//       const query = gql`
//         query ($slug: String!) {
//           ${lessonView}(
//             where: {
//               lessonSlug: { _eq: $slug }
//               isLegacy: { _eq: false }
//             }
//           ) {
//             exitQuiz
//             starterQuiz
//           }
//         }
//       `;

//       const res: LessonView = await client.request(query, {
//         slug,
//       });

//       const result: Record<QuizKey, Question[]> = {
//         starterQuiz: [],
//         exitQuiz: [],
//       };

//       const data = res[lessonView];

//       if (data.length === 0) {
//         return result;
//       }

//       const lesson = data[0];

//       if (!lesson) {
//         return result;
//       }

//       const imagesAllowed = supportsImages(
//         subjectUnit.subjectSlug,
//         subjectUnit.unitSlug,
//       );

//       return questionsForQuiz(lesson, imagesAllowed);
//     }),
//   getQuestionsForSequence: protectedProcedure
//     .meta({
//       openapi: {
//         method: 'GET',
//         tags: ['questions', 'sequences'],
//         path: '/sequences/{sequence}/questions',
//         description:
//           'This endpoint returns the quiz questions and answers (and indicates which answers are correct and which are distractors) for a given sequence',
//         example: {
//           response: [
//             {
//               lessonTitle: '3D shapes can be composed from 2D nets',
//               lessonSlug: '3d-shapes-can-be-composed-from-2d-nets',
//               starterQuiz: [
//                 {
//                   question:
//                     'Select all of the names of shapes that are polygons.',
//                   questionType: 'multiple-choice',
//                   answers: [
//                     {
//                       type: 'text',
//                       content: 'Cube ',
//                       distractor: true,
//                     },
//                     {
//                       type: 'text',
//                       content: ' Square',
//                       distractor: false,
//                     },
//                     {
//                       type: 'text',
//                       content: 'Triangle',
//                       distractor: false,
//                     },
//                     {
//                       type: 'text',
//                       content: 'Semi-circle',
//                       distractor: true,
//                     },
//                   ],
//                 },
//               ],
//               exitQuiz: [
//                 {
//                   question: 'What is a net?',
//                   questionType: 'multiple-choice',
//                   answers: [
//                     {
//                       type: 'text',
//                       content: 'A 3D shape made of 2D shapes folded together. ',
//                       distractor: false,
//                     },
//                     {
//                       type: 'text',
//                       content: 'A 2D shape made of 3D shapes folded togehther.',
//                       distractor: true,
//                     },
//                     {
//                       type: 'text',
//                       content: 'A type of cube.',
//                       distractor: true,
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//           request: {
//             sequence: 'maths-secondary',
//           },
//         },
//       },
//     })
//     .input(
//       z.object({
//         sequence: z.string(),
//         year: z.number().optional(),

//         offset: z.number().optional().default(0),
//         limit: z
//           .number({
//             description: 'Limit the number of results returned, max 100',
//           })
//           .lte(100)
//           .optional()
//           .default(10),
//       }),
//     )
//     .output(z.any())
//     .query(async ({ input, ctx }) => {
//       const { limit, offset, sequence, year } = input;
//       const client = getClient();

//       const { subjectSlug } = parseSubjectPhaseSlug(input.sequence);

//       if (blockedSequenceSubjects.includes(subjectSlug)) {
//         throw new TRPCError({
//           code: 'BAD_REQUEST',
//           message: `The subject "${subjectSlug}" is not currently available`,
//         });
//       }

//       const where = sequenceWhere(sequence, year?.toString());

//       const query = gql`
//       query ($where: ${sequenceViewWhereInput}!) {
//         ${sequenceView}(
//           where: $where
//           order_by: { order: asc }
//         ) {
//           lessons
//         }
//       }`;

//       const sequenceResult: SequenceView = await client.request(query, {
//         where,
//       });
//       const rawData = sequenceResult[sequenceView];

//       // unique lesson slugs
//       const lessonSlugs = new Set(
//         rawData
//           .map((unit) => {
//             return unit.lessons.map((lesson) => lesson.slug);
//           })
//           .flat(),
//       );

//       const questionQuery = gql`
//         query getQuestions($lessonSlugs: [String!]!, $limit: Int!, $offset: Int!) {
//           ${lessonView}(
//             where: {
//               lessonSlug: { _in: $lessonSlugs }
//               isLegacy: { _eq: false }
//             }
//             distinct_on:lessonSlug
//             offset: $offset
//             limit: $limit
//           ) {
//             lessonTitle
//             lessonSlug
//             unitSlug
//             exitQuiz
//             starterQuiz
//           }
//         }
//       `;

//       const res: LessonView = await client.request(questionQuery, {
//         lessonSlugs: Array.from(lessonSlugs),
//         offset,
//         limit,
//       });

//       const data = res[lessonView];

//       if (data.length === 0) {
//         return [];
//       }

//       let next = null;
//       if (data.length === limit) {
//         next = `${baseUrl}${ctx.req.url}?offset=${
//           offset + limit
//         }&limit=${limit}`;
//         ctx.res.setHeader('link', `<${next}>; rel="next"`);
//       }

//       const lessons = [];

//       for (const {
//         exitQuiz,
//         starterQuiz,
//         lessonSlug,
//         lessonTitle,
//         unitSlug,
//         subjectSlug,
//       } of data) {
//         if (!lessonSlug || !lessonTitle) {
//           continue;
//         }

//         if (!exitQuiz && !starterQuiz) {
//           continue;
//         }

//         const imagesAllowed = supportsImages(subjectSlug || '', unitSlug || '');

//         const results = questionsForQuiz(
//           { exitQuiz, starterQuiz },
//           imagesAllowed,
//         );

//         lessons.push({
//           lessonTitle,
//           lessonSlug,
//           // unitSlug,
//           ...results,
//         });
//       }

//       return lessons;
//     }),
//   getQuestionsForKeyStageAndSubject: protectedProcedure
//     .meta({
//       openapi: {
//         tags: ['questions'],
//         method: 'GET',
//         path: '/key-stages/{keyStage}/subject/{subject}/questions',
//         description:
//           'This endpoint returns all the quiz questions and answers (and indicates which answers are correct and which are distractors), grouped by lesson, for a given key stage and subject',
//         example: {
//           response: [
//             {
//               lessonSlug: 'predicting-the-size-of-a-product',
//               lessonTitle: 'Predicting the size of a product',
//               starterQuiz: [
//                 {
//                   question: 'Match the number to its written representation.',
//                   questionType: 'match',
//                   answers: [
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: 'seven tenths',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '0.7',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: 'nine tenths',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '0.9',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: 'seven ones',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '7',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: 'seven hundredths',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '0.07',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: 'nine hundredths',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '0.09',
//                       },
//                     },
//                   ],
//                 },
//               ],
//               exitQuiz: [
//                 {
//                   question:
//                     'Use the fact that 9 × 8 = 72, to match the expressions to their product.',
//                   questionType: 'match',
//                   answers: [
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: '9 × 80',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '720',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: '9 × 800 ',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '7,200',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: '9 × 0.8',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '7.2',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: '9 × 0',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '0',
//                       },
//                     },
//                     {
//                       matchOption: {
//                         type: 'text',
//                         content: '9 × 0.08',
//                       },
//                       correctChoice: {
//                         type: 'text',
//                         content: '0.72',
//                       },
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     })
//     .input(
//       z.object({
//         keyStage: z.enum(keyStageSlugs as [string], {
//           description:
//             "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
//         }),
//         subject: z.enum(subjectSlugs as [string], {
//           description:
//             "Subject slug to search by, e.g. 'science' - note that casing is important here",
//         }),
//         offset: z.number().optional().default(0),
//         limit: z
//           .number({
//             description: 'Limit the number of results returned, max 100',
//           })
//           .lte(100)
//           .optional()
//           .default(10),
//       }),
//     )
//     .output(questionsSchema)
//     .query(async ({ input, ctx }) => {
//       const keyStage = decodeURIComponent(input.keyStage);
//       const subject = decodeURIComponent(input.subject);

//       const offset = input.offset;
//       const limit = input.limit;

//       const client = getClient();

//       let query;

//       // this is a brittle hack to get us through the hackathon. I know that
//       if (blockedSubjects.includes(subject)) {
//         query = gql`
//         query (
//           $keyStage: String!
//           $subject: String!
//           $offset: Int!
//           $limit: Int!
//         ) {
//           ${lessonView}(
//             where: {
//               keyStageSlug: { _eq: $keyStage }
//               subjectSlug: { _eq: $subject }
//               isLegacy: { _eq: false }
//               unitSlug: { _in: ${JSON.stringify(allowedUnits)} }
//             }
//             offset: $offset
//             limit: $limit
//           ) {
//             lessonTitle
//             lessonSlug
//             unitSlug
//             exitQuiz
//             starterQuiz
//           }
//         }
//       `;
//       } else {
//         query = gql`
//         query (
//           $keyStage: String!
//           $subject: String!
//           $offset: Int!
//           $limit: Int!
//         ) {
//           ${lessonView}(
//             where: {
//               keyStageSlug: { _eq: $keyStage }
//               subjectSlug: { _eq: $subject }
//               isLegacy: { _eq: false }
//             }
//             offset: $offset
//             limit: $limit
//           ) {
//             lessonTitle
//             lessonSlug
//             unitSlug
//             exitQuiz
//             starterQuiz
//           }
//         }
//       `;
//       }

//       const res: LessonView = await client.request(query, {
//         keyStage,
//         subject,
//         offset,
//         limit,
//       });

//       const data = res[lessonView];

//       if (data.length === 0) {
//         return [];
//       }

//       let next = null;
//       if (data.length === limit) {
//         next = `${baseUrl}${ctx.req.url}?offset=${
//           offset + limit
//         }&limit=${limit}`;
//         ctx.res.setHeader('link', `<${next}>; rel="next"`);
//       }

//       const lessons = [];

//       for (const {
//         exitQuiz,
//         starterQuiz,
//         lessonSlug,
//         lessonTitle,
//         unitSlug,
//         subjectSlug,
//       } of data) {
//         if (!lessonSlug || !lessonTitle) {
//           continue;
//         }

//         if (!exitQuiz && !starterQuiz) {
//           continue;
//         }

//         const imagesAllowed = supportsImages(subjectSlug || '', unitSlug || '');

//         const results = questionsForQuiz(
//           { exitQuiz, starterQuiz },
//           imagesAllowed,
//         );

//         lessons.push({
//           lessonTitle,
//           lessonSlug,
//           // unitSlug,
//           ...results,
//         });
//       }

//       return lessons;
//     }),
// });
