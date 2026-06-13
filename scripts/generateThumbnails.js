import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
}

async function run() {
    const bucket = process.env.AWS_BUCKET;
    if (!bucket) {
        console.error("AWS_BUCKET is not set in environment");
        return;
    }

    console.log("Listing S3 objects in bucket:", bucket);

    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: "pano/",
        });
        const listResponse = await s3.send(listCommand);
        const contents = listResponse.Contents || [];

        const allKeys = contents.map(c => c.Key).filter(Boolean);
        const s3KeysSet = new Set(allKeys);

        // Find main images (those under pano/ that don't have _thumb. in their names)
        const mainKeys = allKeys.filter(key => {
            const lower = key.toLowerCase();
            return lower.startsWith("pano/") && !lower.includes("_thumb.") && key !== "pano/";
        });

        console.log(`Found ${mainKeys.length} main images in S3.`);

        let processedCount = 0;
        let skippedCount = 0;

        for (const mainKey of mainKeys) {
            // Determine matching thumbnail key
            const extIndex = mainKey.lastIndexOf(".");
            const thumbKey = extIndex !== -1 
                ? `${mainKey.substring(0, extIndex)}_thumb.webp` 
                : `${mainKey}_thumb.webp`;

            if (s3KeysSet.has(thumbKey)) {
                skippedCount++;
                continue;
            }

            console.log(`Generating thumbnail for: ${mainKey} -> ${thumbKey}`);

            try {
                // Get the original image
                const getCommand = new GetObjectCommand({
                    Bucket: bucket,
                    Key: mainKey,
                });
                const getResponse = await s3.send(getCommand);
                const imageBuffer = await streamToBuffer(getResponse.Body);

                // Process with Sharp (resizing to max 400px preserving aspect ratio and converting to WebP)
                const thumbBuffer = await sharp(imageBuffer)
                    .resize({
                        width: 400,
                        height: 400,
                        fit: "inside",
                        withoutEnlargement: true
                    })
                    .webp({ quality: 75 })
                    .toBuffer();

                // Upload thumbnail back to S3
                const putCommand = new PutObjectCommand({
                    Bucket: bucket,
                    Key: thumbKey,
                    Body: thumbBuffer,
                    ContentType: "image/webp",
                });
                await s3.send(putCommand);

                console.log(`Successfully uploaded: ${thumbKey}`);
                processedCount++;
            } catch (err) {
                console.error(`Error processing ${mainKey}:`, err.message);
            }
        }

        console.log(`\nMigration completed:`);
        console.log(`- Total main images: ${mainKeys.length}`);
        console.log(`- Already had thumbnails (skipped): ${skippedCount}`);
        console.log(`- New thumbnails generated & uploaded: ${processedCount}`);
    } catch (err) {
        console.error("Migration failed:", err);
    }
}

run();
