import { TRPCError } from "@trpc/server";
import Cors from "cors";
import router from "lib/router";
import { NextApiRequest, NextApiResponse } from "next";
import { createOpenApiNextHandler } from "trpc-openapi";
import { createContext } from "lib/context";

const cors = Cors({
  methods: ["GET", "HEAD"],
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // this seems like a weird way to do CORS but apparently it's the way
  // Vercel/nextjs recommends: https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts
  cors(req, res, (result: unknown) => {
    if (result instanceof Error) {
      throw new TRPCError({
        message: "Denied by CORS",
        code: "PRECONDITION_FAILED",
      });
    }
  });

  return createOpenApiNextHandler({
    router,
    createContext,
  })(req, res);
};

export default handler;
