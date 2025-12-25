import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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

async function uploadFile(file: File, key: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    await R2.send(command);
    return `${PUBLIC_URL}/${key}`;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Check if this is a product image upload (with thumbnail + full)
        const thumbnail = formData.get('thumbnail') as File | null;
        const full = formData.get('full') as File | null;

        // New product image upload with both sizes
        if (thumbnail || full) {
            // Strict validation for product uploads
            if (!thumbnail || !full) {
                return NextResponse.json(
                    { error: 'Both thumbnail and full image are required for product uploads.' },
                    { status: 400 }
                );
            }

            const storeSlug = formData.get('storeSlug') as string | null;
            const productPath = formData.get('productPath') as string | null;

            if (!storeSlug || !productPath) {
                return NextResponse.json(
                    { error: 'Missing storeSlug or productPath for product upload.' },
                    { status: 400 }
                );
            }

            const basePath = `${storeSlug}/${productPath}`;

            const [thumbnailUrl, fullUrl] = await Promise.all([
                uploadFile(thumbnail, `${basePath}/${thumbnail.name}`),
                uploadFile(full, `${basePath}/${full.name}`),
            ]);

            return NextResponse.json({
                thumbnailUrl,
                fullUrl,
            });
        }

        // Legacy single file upload (for logos, etc.)
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'products';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const url = await uploadFile(file, fileName);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('R2 upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
