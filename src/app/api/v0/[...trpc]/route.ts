import router from 'lib/router';
import { createContext } from 'lib/context';
import { type NextRequest } from 'next/server';
import { createOpenApiFetchHandler } from 'trpc-to-openapi';

export const dynamic = 'force-dynamic';

const handler = (req: NextRequest) => {
  return createOpenApiFetchHandler({
    endpoint: '/api/v0',
    router,
    createContext,
    req,
    responseMeta({ ctx }) {
      return ctx?.headers
        ? {
            headers: ctx?.headers,
          }
        : {};
    },
  });
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
};

// const cors = Cors({
//   methods: ['GET', 'HEAD'],
// });

// const handleCORS = (req: NextApiRequest, res: NextApiResponse) => {
//   // this seems like a weird way to do CORS but apparently it's the way
//   // Vercel/nextjs recommends: https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts

//   cors(req, res, (result: unknown) => {
//     if (result instanceof Error) {
//       throw new TRPCError({
//         message: 'Denied by CORS',
//         code: 'PRECONDITION_FAILED',
//       });
//     }
//   });

//   return createOpenApiNextHandler({
//     router,
//     createContext,
//   })(req, res);
// };

// export async function GET(req: NextApiRequest, res: NextApiResponse) {
//   const handled = handleCORS(req, res);
//   return handled;
// }
