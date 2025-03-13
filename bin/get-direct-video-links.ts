import 'renvy';
import { DownloadView, downloadView, getClient, gql } from '~/lib/owaClient';
import { promises as fs, existsSync } from 'fs';
import { exec } from 'child_process';

// check argument exists, and then check if the file (given on the argument) exists
if (process.argv.length < 3) {
  console.error(`Usage: tsx get-direct-video-links.ts <file> > result.csv
  where <file> is a list of lesson slugs\n

  Note that any failures will result in "not found" in the result`);
  process.exit(1);
}

const filePath = process.argv[2];
if (!existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const muxToken = process.env.MUX_TOKEN;
if (!muxToken) {
  console.error(
    'MUX_TOKEN not found - this is required to recover from missing video urls',
  );
  process.exit(1);
}

// then read in, expecting to be a list of strings (lessonSlugs)
const slugs = (await fs.readFile(filePath, 'utf-8'))
  .split('\n')
  .map((s: string) => s.trim())
  .filter((s: string) => s.length > 0);

const client = getClient();
const queryDownloads = gql`
    query GetDownloads($slugs: [String!]!) {
      ${downloadView}(
        where: {
          lessonSlug: { _in: $slugs }
        }
      ) {
        lessonSlug
        video: videos
      }
    }
  `;

const variables = {
  slugs,
};

const lessonDetailViewResult: DownloadView = await client.request(
  queryDownloads,
  variables,
);

const res = lessonDetailViewResult[downloadView];

// map res so that it's slug -> video
const map = res.reduce(
  (acc, { lessonSlug, video }) => {
    acc[lessonSlug] = video.stream;
    return acc;
  },
  {} as Record<string, string>,
);

// loop through each result, and in video.stream replace the .m3u8 with /high.mp4,
// then run a curl -I on the new url to get check whether the status is 200 OK or a
// 404 Not Found, putting the successful requests on STDOUT and the errors on STDERR
// note that I originally used `fetch` but for some reason it would timeout and
// lock up, so I switched to curl -I to get the headers only.
for (const lessonSlug of slugs) {
  const originalUrl = map[lessonSlug];

  const url = originalUrl.replace('.m3u8', '/high.mp4');
  const result = await new Promise((resolve) => {
    exec(`curl -I ${url}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        return;
      }
      const statusLine = stdout.split('\n')[0];
      const status = parseInt(statusLine.split(' ')[1], 10);
      if (status === 200) {
        return resolve(url);
      }

      const altUrl = await getUrlFromMux(url);

      if (altUrl) {
        resolve(altUrl);
      } else {
        resolve('not found');
      }
    });
  });

  console.log(`${result},${lessonSlug}`);

  // wait for 100ms before the next fetch
  await new Promise((resolve) => setTimeout(resolve, 100));
}

async function getUrlFromMux(url: string) {
  // 1. call the mux api to find the asset id from the playback id

  const playbackId = url.split('/').slice(-2)[0];

  // curl -H "Authorization: Basic ${MUX_TOKEN}" https://api.mux.com/video/v1/playback-ids/sI8kgTM9rQcWIqFX8Gqm019YZNVcd02R0101lHYWClOWNB8
  const res1 = await fetch(
    `https://api.mux.com/video/v1/playback-ids/${playbackId}`,
    {
      headers: {
        Authorization: `Basic ${muxToken}`,
      },
    },
  );
  const assetId = (await res1.json()).data.object.id;

  // now check the static renditions
  const res2 = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
    headers: {
      Authorization: `Basic ${muxToken}`,
    },
  });

  const { data } = await res2.json();

  const staticRenditions = data.static_renditions;

  if (!staticRenditions || staticRenditions.status !== 'ready') {
    throw new Error(`Rendition not ready: ${url}`);
  }

  // 5. if it succeeds, add it to stdout
  const file = staticRenditions.files[0].name;
  return url.replace(/\/high\.mp4$/, `/${file}`);
}
