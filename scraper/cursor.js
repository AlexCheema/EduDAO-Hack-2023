import { promises as fs } from 'fs';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export function FileCursor(fileName = 'cursor.json', defaultValue = 0) {
  return {
    save: async function(cursor) {
      await fs.writeFile(fileName, JSON.stringify({ cursor }))
    },
    get: async function() {
      try {
        const data = await fs.readFile(fileName);
        if (!data) return defaultValue;
        return JSON.parse(data)?.cursor ?? defaultValue;
      } catch (err) {
        return defaultValue;
      }
    },
  }
}

export function S3Cursor(s3, bucketName, key = 'cursor.json', defaultValue = 0) {
  return {
    save: async function(cursor) {
      await s3.send(new PutObjectCommand({
        Bucket: bucketName, Key: key, Body: JSON.stringify({ cursor })
      }));
    },
    get: async function() {
      try {
        const response = await s3.send(new GetObjectCommand({
          Bucket: bucketName, Key: key
        }));
        if (!response?.Body) return defaultValue;
        const responseBody = await response.Body.transformToString();
        return JSON.parse(responseBody)?.cursor ?? defaultValue;
      } catch (err) {
        console.error(err);
        return defaultValue;
      }
    },
  }
}

