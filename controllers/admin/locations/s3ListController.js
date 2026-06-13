import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const getS3ObjectsController = async (req, res) => {
    try {
        const bucket = process.env.AWS_BUCKET;
        if (!bucket) {
            return res.status(500).json({
                success: false,
                message: "AWS_BUCKET env variable is not set",
            });
        }

        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: "pano/",
        });

        const response = await s3.send(command);
        
        // Filter and format files
        const files = (response.Contents || [])
            .map(item => {
                // Strip "pano/" prefix from key
                const rawKey = item.Key || "";
                const cleanKey = rawKey.replace(/^pano\//, "");
                return {
                    key: cleanKey,
                    size: item.Size,
                    lastModified: item.LastModified,
                };
            })
            // Filter out the directory folder itself ("pano/") or empty keys
            .filter(file => file.key.trim() !== "");

        res.status(200).json({
            success: true,
            message: "S3 objects fetched successfully",
            data: files,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
};
