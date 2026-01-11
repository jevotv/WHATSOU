import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
 * Delete a single file from Cloudflare R2
 * @param key - The object key (path) to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    await R2.send(command);
}

/**
 * Delete multiple files from Cloudflare R2 by their public URLs
 * Used for account deletion cleanup
 * @param urls - Array of public URLs to delete
 */
export async function deleteMultipleFromR2(urls: string[]): Promise<void> {
    for (const url of urls) {
        if (!url || !PUBLIC_URL || !url.includes(PUBLIC_URL)) continue;
        try {
            const key = url.replace(`${PUBLIC_URL}/`, '');
            await deleteFromR2(key);
        } catch (error) {
            console.error(`Failed to delete R2 object: ${url}`, error);
            // Continue with other deletions even if one fails
        }
    }
}

/**
 * Get the R2 client for advanced operations
 */
export { R2, BUCKET_NAME, PUBLIC_URL };

