import { baseUrl } from '@/lib/baseUrl';
import router from '@/lib/router';
import {
  getLatestVersion,
  getLatestMajorVersion,
} from '@/lib/handlers/changelog/helpers';

import { generateOpenApiDocument } from 'trpc-to-openapi';

import { applyRequestMetadata } from './requestMetadata';

const version = getLatestVersion(getLatestMajorVersion());

const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
} as const;

// trpc-to-openapi rebuilds query parameters from the input schema's shape,
// which loses the descriptions and cross-field rules declared on it, so we copy
// them back onto the document afterwards.
export const openApiDocument = applyRequestMetadata(
  generateOpenApiDocument(router, {
    title: 'Oak Curriculum API',
    version: process.env.VERCEL_GIT_COMMIT_SHA
      ? `${version}-${process.env.VERCEL_GIT_COMMIT_SHA}`
      : version,
    baseUrl,
    docsUrl: '/docs',
    description: `This Oak Curriculum API is an intermediary that enables software applications to communicate with each other to exchange - in this case - data and assets. Through the Oak Curriculum API, you will have access to a wide range of educational content across subjects for key stages 1-4.

### How could you use this API?

Our aim is that the curriculum data and lessons resources in the Oak Curriculum API can be used flexibly within almost any product or service that would benefit teachers and pupils.

To give you some inspiration, here are just a few examples of how you could use the Oak Curriculum API:

- Use the endpoint \`GET /lessons/{lesson}/summary\` to retrieve common misconceptions and suggested responses. This data could be used to train the AI in a revision tool to identify and respond to misconceptions in pupil answers.
- Use the endpoint \`GET /sequences/{sequence}/units\` to retrieve threads in sequence order, plus threads that demonstrate how common bodies of knowledge build across the curriculum. This data could be used in teacher training materials to demonstrate a sequenced, coherent curriculum.
- Use the endpoint \`GET /key-stages/{keyStage}/subject/{subject}/questions\` to retrieve the quiz questions and answers for a given subject and key stage. This data could be used to build a quizzing tool that supports formative assessment.
- Use the endpoint \`GET /lessons/{lesson}/assets\` to retrieve all of the resources for a given lesson. You could embed these lesson resources in your own product or service to give teachers a starting point for their lesson planning.

Full documentation for the Oak Curriculum API is available on the URL below:
`,
    securitySchemes: {
      bearerAuth,
    },
    tags: [
      'internal',
      'lists',
      'assets',
      'lessons',
      'questions',
      'units',
      'search',
      'sequences',
      'programmes',
    ],
  }),
  router,
);
