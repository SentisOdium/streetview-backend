import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const getUploadPresignedUrlController = async (req, res) => {
    try {
        const { filename, contentType, key } = req.query;

        if ((!filename && !key) || !contentType) {
            return res.status(400).json({
                success: false,
                message: "Filename/key and content type are required"
            })
        }

        const uniqueKey = key ? `pano/${key}` : `pano/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: uniqueKey,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        res.status(200).json({
            success: true,
            message: "Presigned URL generated successfully",
            data: {
                presignedUrl,
                uniqueKey
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
}