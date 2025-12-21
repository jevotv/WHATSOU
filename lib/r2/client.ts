import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 Client configuration
const R2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'whatsou';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

/**
 * Upload a file to Cloudflare R2
 * @param file - The file to upload
 * @param folder - The folder path (e.g., 'products', 'logos')
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(
    file: File,
    folder: string = 'products'
): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    });

    await R2.send(command);

    // Return the public URL
    return `${PUBLIC_URL}/${fileName}`;
}

/**
 * Get the R2 client for advanced operations
 */
export { R2, BUCKET_NAME, PUBLIC_URL };
