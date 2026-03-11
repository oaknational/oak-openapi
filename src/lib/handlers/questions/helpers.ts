import { QuestionTypeEnum } from 'lib/owaClient';
import type {
  Lesson,
  Question as DBQuestion,
  ImageStem,
  TextType,
  Match as DBMatch,
  OrderAnswer as DBOrder,
  ShortAnswer as DBShortAnswer,
  MultipleChoiceAnswer as DBMultipleChoiceAnswer,
} from 'lib/owaClient';

import { TRPCError } from '@trpc/server';

import type {
  ImageDataSchemaType,
  MatchAnswer,
  MultipleChoiceAnswer,
  OrderAnswer,
  Question,
  QuizKey,
  TextAnswer,
} from './types';

function emptyQuizResults(): Record<QuizKey, Question[]> {
  return {
    starterQuiz: [],
    exitQuiz: [],
  };
}

export function formatShortAnswer(answer: DBShortAnswer): TextAnswer {
  // sample slug: solving-equations-with-surds
  if (answer.answer[0].type === 'text') {
    return {
      type: answer.answer[0].type,
      content: answer.answer[0].text,
    };
  }

  throw new TRPCError({
    message: 'Unexpected answer type',
    code: 'INTERNAL_SERVER_ERROR',
  });
}

export function formatMatchAnswer(answer: DBMatch): MatchAnswer {
  // sample slug: the-theme-of-family-in-grandads-island
  const matchOption = answer.match_option.filter((_) => _.type === 'text')[0];
  const correctChoice = answer.correct_choice.filter(
    (_) => _.type === 'text',
  )[0];

  return {
    matchOption: {
      type: matchOption.type,
      content: matchOption.text,
    },
    correctChoice: {
      type: correctChoice.type,
      content: correctChoice.text,
    },
  };
}

export function formatOrderAnswer(answer: DBOrder): OrderAnswer {
  // sample slug: ordering-negative-integers
  const content = answer.answer[0].text;

  return {
    type: 'text',
    content,
    order: answer.correct_order,
  };
}

function formatMultipleChoiceAnswer(
  answer: DBMultipleChoiceAnswer,
): MultipleChoiceAnswer {
  // sample slug: solving-equations-with-surds

  if (answer.answer[0].type === 'text') {
    return {
      type: 'text',
      content: answer.answer[0].text,
      distractor: !answer.answer_is_correct,
    };
  }

  // next two declarations are cast in TypeScript because TS doesn't
  // know that _.type = 'image' always returns an ImageAnswerStem
  // (or undefined, which we handle)
  const image = answer.answer.find((_) => _.type === 'image') as ImageStem;

  if (image) {
    const text = answer.answer.find((_) => _.type === 'text') as TextType;

    const content = formatImage(image, text);

    const res = {
      type: answer.answer[0].type,
      content,
      distractor: !answer.answer_is_correct,
    };

    // RS disabled license for now until we have final answer on how we deal
    // with unknown/uncategorised licenses (and)

    // if (res.content.license) {
    //   if (res.content.license?.attribution_required) {
    //     res.content.license.attribution_required =
    //       res.content.license.attribution_required ===
    //       ('yes' as unknown as boolean);
    //   }
    // }

    return res;
  }

  throw new TRPCError({
    message: 'Unexpected answer type',
    code: 'INTERNAL_SERVER_ERROR',
  });
}

function formatImageUrl(url: string): string {
  const urlObj = new URL(url);
  urlObj.hostname = 'cloudinary-res.thenational.academy';
  return urlObj.href;
}

function formatImage(
  image: ImageStem,
  text: null | { text: string } = null,
): ImageDataSchemaType {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const attrText = image.image_object.metadata?.attribution as string;
  const attribution = attrText ?? undefined;
  const content: ImageDataSchemaType = {
    url: formatImageUrl(
      image.image_object.secure_url || image.image_object.url || '',
    ),
    width: image.image_object.width || 0,
    height: image.image_object.height || 0,
    alt: image.image_object.context?.custom?.alt || undefined,
    text: text?.text || undefined,
    attribution,
  };

  return content;
}

function formatQuestion(question: DBQuestion): Question | undefined {
  const questionText = question.questionStem
    .filter((_) => _.type === 'text')
    .map((_) => _.text)
    .join(' ');

  let questionImage: undefined | ImageDataSchemaType;

  if (question.questionStem.length === 2) {
    // probably contains the image
    const image = question.questionStem.filter((_) => _.type === 'image').pop();

    if (image) {
      questionImage = formatImage(image);
    }
  }

  // TypeScript really doesn't like DRY. This code could…should be able to reuse
  // the `questionType`, but TS parser can't handle it, so it's exploded out like this

  if (question.questionType === QuestionTypeEnum.MultipleChoice) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.MultipleChoice,
      questionImage,
      answers: question.answers[QuestionTypeEnum.MultipleChoice].map(
        formatMultipleChoiceAnswer,
      ),
    };
  }

  if (question.questionType === QuestionTypeEnum.ShortAnswer) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.ShortAnswer,
      questionImage,
      answers:
        question.answers[QuestionTypeEnum.ShortAnswer].map(formatShortAnswer),
    };
  }

  if (question.questionType === QuestionTypeEnum.Match) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.Match,
      answers: question.answers[QuestionTypeEnum.Match].map(formatMatchAnswer),
    };
  }

  if (question.questionType === QuestionTypeEnum.Order) {
    return {
      question: questionText,
      questionType: QuestionTypeEnum.Order,
      questionImage,
      answers: question.answers[QuestionTypeEnum.Order].map(formatOrderAnswer),
    };
  }
}

export function questionsForQuiz(lesson: Lesson): Record<QuizKey, Question[]> {
  const result = emptyQuizResults();
  for (const quiz of ['starterQuiz', 'exitQuiz'] as QuizKey[]) {
    let lessonContent;

    // seems verbose, but TS won't let me access `lesson` with an arbitrary string
    if (quiz === 'starterQuiz') {
      lessonContent = lesson.starterQuiz;
    } else {
      lessonContent = lesson.exitQuiz;
    }

    if (!lessonContent) {
      continue;
    }

    const questions: Question[] = [];
    for (const question of lessonContent) {
      if (!question.answers) {
        continue;
      }

      const res = formatQuestion(question);
      if (res) {
        questions.push(res);
      }
    }

    result[quiz] = questions;
  }
  return result;
}
