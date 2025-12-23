#!/usr/bin/env node

/**
 * Generate responsive images for Care (2018) review
 * 
 * This script generates responsive image sizes for the Care review header image.
 * It expects a source image file to be placed in the care-2018 directory.
 * 
 * Usage:
 *   1. Place your source image as: images/reviews/care-2018/header-care-2018-source.png
 *   2. Run: node generate-care-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REVIEW_DIR = path.join(__dirname, 'images/reviews/care-2018');
const SOURCE_IMAGE = path.join(REVIEW_DIR, 'header-care-2018-source.png');
const BASE_NAME = path.join(REVIEW_DIR, 'header-care-2018');

// Responsive image sizes (matching the newer pattern used by superman, etc.)
const RESPONSIVE_SIZES = [
    { width: 400, suffix: '-400w' },
    { width: 800, suffix: '-800w' },
    { width: 1200, suffix: '-1200w' }
];

// Check if cwebp is installed
function checkDependencies() {
    try {
        execSync('cwebp -version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        console.error('❌ cwebp is not installed. Please install it with:');
        console.error('   brew install webp');
        console.error('   or visit: https://developers.google.com/speed/webp/download');
        return false;
    }
}

// Generate responsive images
function generateResponsiveImages() {
    if (!fs.existsSync(SOURCE_IMAGE)) {
        console.error(`❌ Source image not found: ${SOURCE_IMAGE}`);
        console.error('   Please place your source image at: images/reviews/care-2018/header-care-2018-source.png');
        process.exit(1);
    }

    console.log('🚀 Generating responsive images for Care (2018)...\n');
    console.log(`📁 Source: ${SOURCE_IMAGE}\n`);

    // Generate base WebP
    const baseWebp = `${BASE_NAME}.webp`;
    try {
        console.log('📸 Generating base WebP...');
        execSync(`cwebp -q 85 "${SOURCE_IMAGE}" -o "${baseWebp}"`, { stdio: 'pipe' });
        console.log(`   ✅ Created: ${baseWebp}\n`);
    } catch (error) {
        console.error(`❌ Failed to create base WebP: ${error.message}`);
        process.exit(1);
    }

    // Generate responsive sizes
    RESPONSIVE_SIZES.forEach(size => {
        const outputPath = `${BASE_NAME}${size.suffix}.webp`;
        try {
            console.log(`📱 Generating ${size.width}px version...`);
            execSync(`cwebp -q 85 -resize ${size.width} 0 "${SOURCE_IMAGE}" -o "${outputPath}"`, { stdio: 'pipe' });
            console.log(`   ✅ Created: ${outputPath}`);
        } catch (error) {
            console.error(`❌ Failed to generate ${size.width}px version: ${error.message}`);
        }
    });

    // Generate PNG fallback
    const basePng = `${BASE_NAME}.png`;
    try {
        console.log('\n📸 Generating PNG fallback...');
        // Copy source as PNG if it's already PNG, otherwise convert
        if (SOURCE_IMAGE.endsWith('.png')) {
            fs.copyFileSync(SOURCE_IMAGE, basePng);
        } else {
            // If source is not PNG, we'd need imagemagick or similar
            console.log('   ⚠️  Source is not PNG. Please manually create PNG fallback if needed.');
        }
        if (fs.existsSync(basePng)) {
            console.log(`   ✅ Created: ${basePng}`);
        }
    } catch (error) {
        console.log(`   ⚠️  Could not create PNG fallback: ${error.message}`);
    }

    console.log('\n✅ Responsive images generated successfully!');
    console.log('\n📋 Generated files:');
    console.log(`   - ${BASE_NAME}.webp (base)`);
    RESPONSIVE_SIZES.forEach(size => {
        console.log(`   - ${BASE_NAME}${size.suffix}.webp (${size.width}px)`);
    });
    if (fs.existsSync(`${BASE_NAME}.png`)) {
        console.log(`   - ${BASE_NAME}.png (fallback)`);
    }
    console.log('\n💡 The review is already configured to use these images.');
}

// Main execution
if (!checkDependencies()) {
    process.exit(1);
}

generateResponsiveImages();

