const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const sourceImage = path.join(projectRoot, 'htmls', 'Gemini_Generated_Image_91vk6291vk6291vk.png');
const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

// Android mipmap sizes
const sizes = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generateIcons() {
    console.log('Generating Android icons from:', sourceImage);

    for (const { folder, size } of sizes) {
        const outputDir = path.join(androidResDir, folder);

        // ic_launcher.png - standard icon
        await sharp(sourceImage)
            .resize(size, size)
            .png()
            .toFile(path.join(outputDir, 'ic_launcher.png'));
        console.log(`Created ${folder}/ic_launcher.png (${size}x${size})`);

        // ic_launcher_round.png - round icon
        await sharp(sourceImage)
            .resize(size, size)
            .png()
            .toFile(path.join(outputDir, 'ic_launcher_round.png'));
        console.log(`Created ${folder}/ic_launcher_round.png (${size}x${size})`);

        // ic_launcher_foreground.png (larger for adaptive icons)
        const foregroundSize = Math.round(size * 1.5);
        await sharp(sourceImage)
            .resize(foregroundSize, foregroundSize)
            .png()
            .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));
        console.log(`Created ${folder}/ic_launcher_foreground.png (${foregroundSize}x${foregroundSize})`);
    }

    console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);
