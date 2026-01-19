import imageCompression from 'browser-image-compression';
import { slugify } from '@/lib/utils/slug';

interface ProcessedImages {
    thumbnail: File;
    full: File;
}

interface ProcessOptions {
    productName: string;
    timestamp?: number;
}

/**
 * Converts image to WebP format with specified dimensions
 */
async function convertToWebP(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
): Promise<File> {
    // First, compress and resize using browser-image-compression
    const options = {
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: quality,
    };

    const compressedBlob = await imageCompression(file, options);

    // Convert to canvas for exact dimensions
    const img = await createImageFromBlob(compressedBlob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Calculate dimensions (maintain aspect ratio, fit within bounds)
    const { width, height } = calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
    );

    canvas.width = width;
    canvas.height = height;

    // Draw with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to WebP blob
    const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/webp', quality);
    });

    return new File([blob], 'image.webp', { type: 'image/webp' });
}

/**
 * Create an image element from a blob
 */
function createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
    });
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
function calculateDimensions(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    // If image is smaller than target, don't upscale
    if (ratio >= 1) {
        return { width: srcWidth, height: srcHeight };
    }

    return {
        width: Math.round(srcWidth * ratio),
        height: Math.round(srcHeight * ratio),
    };
}

/**
 * Process an image file into thumbnail and full-size WebP versions
 */
export async function processProductImage(
    file: File,
    options: ProcessOptions
): Promise<{
    thumbnail: File;
    full: File;
    basePath: string;
}> {
    const timestamp = options.timestamp || Date.now();
    const productSlug = slugify(options.productName);

    // Create both versions in parallel
    const [thumbnail, full] = await Promise.all([
        convertToWebP(file, 400, 400, 0.8),
        convertToWebP(file, 1200, 1200, 0.8),
    ]);

    // Create properly named files
    const thumbFile = new File(
        [thumbnail],
        `${timestamp}-thumb.webp`,
        { type: 'image/webp' }
    );

    const fullFile = new File(
        [full],
        `${timestamp}-full.webp`,
        { type: 'image/webp' }
    );

    return {
        thumbnail: thumbFile,
        full: fullFile,
        basePath: productSlug,
    };
}

export { };
