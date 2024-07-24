import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import type { S3Settings } from "~/types";
import mime from "mime";
import newClient from "./newClient";
export default async function (
  file: File | Blob,
  key: string,
  config: S3Settings,
) {
  const client = newClient(config);
  const fileExt = key.split(".").pop();

  let mimeType = "application/octet-stream";
  if (file instanceof String) {
    mimeType = "text/plain";
  } else if (file instanceof File) {
    if (file.type) {
      mimeType = file.type;
    } else if (fileExt) {
      mimeType = mime.getType(fileExt) ?? "application/octet-stream";
    } else {
      mimeType = "application/octet-stream";
    }
  }

  const command = new PutObjectCommand({ Bucket: config.bucket, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  const res = await axios(url, {
    method: "PUT",
    data: file,
    headers: {
      "Content-Type": mimeType,
    },
  });

  if (res.status !== 200) {
    throw new Error(`Failed to upload file: ${res.status}`);
  }

  return res;

  // const command = new PutObjectCommand({
  //   Bucket: config.bucket,
  //   Key: key,
  //   Body: file,
  //   ContentType: mimeType,
  // });
  // const response = await client.send(command);
  // // If the HTTP status code is not 200, throw an error
  // const httpStatusCode = response.$metadata.httpStatusCode!;
  // if (httpStatusCode >= 300) {
  //   throw new Error(`List operation get http code: ${httpStatusCode}`);
  // }

  // return response;
}

export const defaultKeyTemplate = "{{prefix}}/{{random}}.{{ext}}";
