import { Storage } from '@google-cloud/storage';
import { log, logError } from './logger';
import { createReadStream } from 'node:fs';
import { tuplesToObjects } from './utils';

const bucketName = process.env.BUCKET_NAME;

// Initialize Google Cloud Storage
export function getGoogleCloudStorage() {
  let storage: Storage;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
    );
    storage = new Storage({ credentials });
  } else {
    storage = new Storage();
  }

  return storage;
}

export async function runSQL(sql: string): Promise<unknown> {
  const body = {
    type: 'run_sql',
    args: {
      source: 'Oak DB',
      sql,
      read_only: true,
    },
  };

  const res = await fetch(`${process.env.OAK_GRAPHQL_HOST}/v2/query`, {
    headers: {
      'x-oak-auth-key': process.env.OAK_GRAPHQL_SECRET as string,
      'x-oak-auth-type': 'oak-admin',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (json.error) {
    console.error('Error running SQL:', json);
    throw new Error(json.error);
  }

  // note that this also maps "null" to null, and "t" and "f" to true and false
  // and parses JSON strings
  const result = tuplesToObjects(json.result);

  return result as unknown;
}

export function uploadToStorage(
  sequenceDir: string,
  slug: string,
  storage: Storage,
) {
  // if there's no bucket, let the workflow handle the uploading to GCP storage
  if (!bucketName) {
    return;
  }

  // now send the lesson to gcp storage under the `oak_bulk_data_store` bucket
  const bucket = storage.bucket(bucketName);
  const filePath = `${sequenceDir}/${slug}.json`;
  const destination = `${slug}/${slug}.json`;
  const file = bucket.file(destination);
  const readStream = createReadStream(filePath);
  const writeStream = file.createWriteStream({
    resumable: false,
    gzip: true, // reduces upload time by about 15 seconds
  });
  readStream.on('error', (err) => {
    logError(`Error reading file: ${err}`);
    readStream.destroy();
    writeStream.destroy();
  });
  writeStream.on('error', (err) => {
    logError(`Error uploading file: ${err}`);
    readStream.destroy();
    writeStream.destroy();
  });
  writeStream.on('finish', () => {
    log(`File uploaded to ${bucketName}/${destination}`);
  });
  readStream.pipe(writeStream);
}
