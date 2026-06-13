import dotenv from "dotenv";
dotenv.config();

import {
    S3Client,
    PutObjectCommand
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

console.log("REGION =", process.env.AWS_REGION);

try {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: "test-file.txt",
        ContentType: "text/plain",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log("url", url)
    console.log("SUCCESS: Presigned URL generated");
} catch (err) {
    console.log("FAILED");
    console.error(err);
}