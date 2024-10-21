import { TRPCError } from "@trpc/server";
import { gql } from "graphql-request";
import { z } from "zod";

import { protectedProcedure } from "~/lib/protect";
import { router } from "~/lib/trpc";
import { DownloadTypeEnum, downloadTypeEnum } from "./assets";
import { DownloadView, downloadView, getClient } from "~/lib/owaClient";

// I'm not keen on this mapping, and wonder if the open api should return
// streams to the actual files in the buckets, but then, what would be
// point in signing the urls if the API gives you direct access?
const downloadMappingToOWA = new Map([
  ["slidedeck", "presentation"],
  ["exitQuiz", "exit-quiz-questions"],
  ["exitQuizAnswers", "exit-quiz-answers"],
  ["starterQuiz", "intro-quiz-questions"],
  ["starterQuizAnswers", "intro-quiz-answers"],
  ["supplementaryResource", "supplementary-pdf"],
  ["worksheet", "worksheet-pdf"],
  ["worksheetAnswers", "worksheet-pdf"],
]);

// NOTE: this is a proxy for the download service, which is not implemented in this repository
// https://downloads-api.thenational.academy/ aka https://github.com/oaknational/curriculum-downloads-api
export const getDownloads = router({
  getDownloads: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        tags: ["downloads"],
        path: "/download/{slug}/type/{type}",
        description:
          "This endpoint provides a zip file containing the requested download type, except for video, which will return a direct download URL to the video file. Note that currently, worksheets and worksheet answers are contained inside the same zip file",
        example: {
          request: {
            slug: "imagining-you-are-the-characters-the-three-billy-goats-gruff",
            type: "video",
          },
          response: [
            {
              url: "https://example.com/video.mp4",
              stream: false,
              type: "video",
            },
          ],
        },
      },
    })
    .input(
      z.object({
        slug: z.string({
          description: "The lesson slug",
        }),
        type: downloadTypeEnum, // FIXME this should be an array but the openapi generator doesn't support it
      }),
    )
    .output(
      z.array(
        z.object({
          url: z.string({
            description: "The downloadable URL",
          }),
          stream: z
            .boolean({
              description:
                "Only present on videos when no direct download/mp4 url is available",
            })
            .optional(),
          signed: z
            .boolean({
              description:
                "Used for non-video assets, the URL will be signed and valid for 1 hour",
            })
            .optional(),
          type: downloadTypeEnum,
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const { slug, type } = input;

      const { user } = ctx;

      // this is never true, but I wasn't sure how to tell TS
      // that it's always going be available because of the
      // protectedProcedure
      if (!user) {
        throw new TRPCError({
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      const graphqlClient = getClient();

      const queryDownloads = gql`
        query GetDownloads($lessonSlug: String!) {
          ${downloadView}(
            where: {
              lessonSlug: { _eq: $lessonSlug }
            }
          ) {
            lessonSlug
            lessonTitle
            exitQuiz
            exitQuizAnswers
            lessonSlug
            lessonTitle
            slidedeck
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
        lessonSlug: slug,
      };

      const downloadsQuery: DownloadView = await graphqlClient.request(
        queryDownloads,
        variables,
      );

      const res = downloadsQuery[downloadView];

      if (!res || res.length === 0 || !res[0]) {
        throw new TRPCError({
          message: "No lessons found",
          code: "NOT_FOUND",
        });
      }

      const downloads = res[0];

      // convert all the props into urls
      const types = (
        type?.length ? [type] : Object.keys(downloads)
      ) as DownloadTypeEnum[];

      const result = [];

      for (const type of types) {
        if (downloads[type]) {
          if (type === "video") {
            result.push({
              type,
              url: downloads.video.download || downloads.video.stream,
              stream: !!downloads.video.stream,
            });
          } else {
            if (downloads[type].bucket_name) {
              const json = await fetch(
                `https://downloads-api.thenational.academy/api/lesson/${slug}/download?selection=${downloadMappingToOWA.get(
                  type,
                )}&openapi_key=${user.id}`,
              ).then((res) => res.json());

              result.push({
                type,
                url: json.data.url,
                signed: true,
              });
            }
          }
        }
      }
      return result;
    }),
});
