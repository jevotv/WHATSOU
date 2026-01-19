/**
 * Build script for Capacitor static export
 * 
 * This script:
 * 1. Backs up dynamic route folders by copying, then deleting originals
 * 2. Temporarily renames middleware.ts
 * 3. Uses static next.config
 * 4. Builds the static export
 * 5. Restores all files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

// Files to temporarily disable
const DISABLE_FILES = [
    'middleware.ts',
];

// Dynamic route folders to temporarily disable (use copy-delete-restore approach)
const DISABLE_FOLDERS = [
    'app/[slug]',          // Storefront pages
    'app/go',              // Dynamic redirect
    'app/sitemap.xml',     // Server-side sitemap
    'app/api',             // API routes (mobile app calls remote API)
    'app/actions',         // Server actions (not compatible with static export)
    'app/onboarding',      // Uses server actions
];

function copyFolderRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyFolderRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
    }
}

function main() {
    console.log('🚀 Starting Capacitor static build...\n');

    const folderRestorations = []; // { backup: string, original: string }
    const fileRestorations = [];   // { from: string, to: string }

    try {
        // Step 1: Disable middleware
        console.log('📦 Disabling middleware...');
        for (const file of DISABLE_FILES) {
            const filePath = path.join(ROOT, file);
            const backupPath = filePath + '.static-bak';
            if (fs.existsSync(filePath)) {
                fs.renameSync(filePath, backupPath);
                fileRestorations.push({ from: backupPath, to: filePath });
                console.log(`  ✓ Disabled ${file}`);
            }
        }

        // Step 2: Backup and delete dynamic route folders
        console.log('\n📦 Disabling dynamic routes...');
        const backupDir = path.join(ROOT, '.static-backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        for (const folder of DISABLE_FOLDERS) {
            const folderPath = path.join(ROOT, folder);
            const backupPath = path.join(backupDir, folder.replace(/\//g, '_'));

            if (fs.existsSync(folderPath)) {
                // Copy to backup
                copyFolderRecursive(folderPath, backupPath);
                // Delete original
                deleteFolderRecursive(folderPath);
                folderRestorations.push({ backup: backupPath, original: folderPath });
                console.log(`  ✓ Disabled ${folder}`);
            }
        }

        // Step 3: Swap next.config
        console.log('\n📝 Using static next.config...');
        const normalConfig = path.join(ROOT, 'next.config.js');
        const staticConfig = path.join(ROOT, 'next.config.static.js');
        const backupConfig = path.join(ROOT, 'next.config.normal.js.static-bak');

        if (fs.existsSync(normalConfig)) {
            fs.renameSync(normalConfig, backupConfig);
            fileRestorations.push({ from: backupConfig, to: normalConfig });
        }
        fs.copyFileSync(staticConfig, normalConfig);
        console.log('  ✓ Swapped to static config');

        // Step 4: Clean previous build
        console.log('\n🧹 Cleaning previous build...');
        const outDir = path.join(ROOT, 'out');
        const nextDir = path.join(ROOT, '.next');
        if (fs.existsSync(outDir)) {
            deleteFolderRecursive(outDir);
            console.log('  ✓ Cleaned /out directory');
        }
        if (fs.existsSync(nextDir)) {
            deleteFolderRecursive(nextDir);
            console.log('  ✓ Cleaned /.next directory');
        }

        // Step 5: Run build
        console.log('\n🔨 Building static export...\n');
        execSync('npm run build', {
            cwd: ROOT,
            stdio: 'inherit',
            env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
        });

        console.log('\n✅ Build completed successfully!');
        console.log('\n📱 Static build ready in /out folder');
        console.log('   Run: npx cap sync android');

        return 0;

    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        return 1;

    } finally {
        // Restore everything
        console.log('\n🔄 Restoring original files...');

        // First, restore the next.config
        const normalConfig = path.join(ROOT, 'next.config.js');
        for (const { from, to } of fileRestorations) {
            if (fs.existsSync(from)) {
                if (fs.existsSync(to)) {
                    fs.unlinkSync(to);
                }
                fs.renameSync(from, to);
                console.log(`  ✓ Restored ${path.basename(to)}`);
            }
        }

        // Restore folders
        for (const { backup, original } of folderRestorations) {
            if (fs.existsSync(backup)) {
                copyFolderRecursive(backup, original);
                deleteFolderRecursive(backup);
                console.log(`  ✓ Restored ${path.basename(original)}`);
            }
        }

        // Clean backup directory
        const backupDir = path.join(ROOT, '.static-backup');
        if (fs.existsSync(backupDir)) {
            deleteFolderRecursive(backupDir);
        }
    }
}

process.exit(main());
