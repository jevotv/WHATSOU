const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourcePath = path.join(__dirname, '..', 'htmls', 'blue black minimalist play media logo design (3).png');
const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Android icon sizes
const iconSizes = {
    'mipmap-mdpi': { launcher: 48, foreground: 108, round: 48 },
    'mipmap-hdpi': { launcher: 72, foreground: 162, round: 72 },
    'mipmap-xhdpi': { launcher: 96, foreground: 216, round: 96 },
    'mipmap-xxhdpi': { launcher: 144, foreground: 324, round: 144 },
    'mipmap-xxxhdpi': { launcher: 192, foreground: 432, round: 192 },
};

async function generateIcons() {
    console.log('Generating Android icons from:', sourcePath);

    for (const [folder, sizes] of Object.entries(iconSizes)) {
        const folderPath = path.join(androidResPath, folder);

        // Ensure folder exists
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Generate ic_launcher.png (square icon)
        await sharp(sourcePath)
            .resize(sizes.launcher, sizes.launcher, { fit: 'cover' })
            .png()
            .toFile(path.join(folderPath, 'ic_launcher.png'));
        console.log(`Generated ${folder}/ic_launcher.png (${sizes.launcher}x${sizes.launcher})`);

        // Generate ic_launcher_round.png (same as launcher for now, Android will mask it)
        await sharp(sourcePath)
            .resize(sizes.round, sizes.round, { fit: 'cover' })
            .png()
            .toFile(path.join(folderPath, 'ic_launcher_round.png'));
        console.log(`Generated ${folder}/ic_launcher_round.png (${sizes.round}x${sizes.round})`);

        // Generate ic_launcher_foreground.png (for adaptive icons)
        // Foreground should have some padding - the icon should be ~66% of the canvas
        await sharp(sourcePath)
            .resize(sizes.foreground, sizes.foreground, { fit: 'cover' })
            .png()
            .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));
        console.log(`Generated ${folder}/ic_launcher_foreground.png (${sizes.foreground}x${sizes.foreground})`);
    }

    console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
