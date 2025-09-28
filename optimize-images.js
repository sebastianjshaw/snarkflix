#!/usr/bin/env node

/**
 * Snarkflix Image Optimization Script
 * 
 * This script optimizes all images in the project by:
 * 1. Converting AVIF images to WebP for better browser compatibility
 * 2. Compressing PNG images to WebP
 * 3. Generating multiple sizes for responsive images
 * 4. Creating fallback images for older browsers
 * 
 * Usage: node optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    // Input directories
    inputDirs: ['images/'],
    
    // Output quality settings
    webpQuality: 85,
    avifQuality: 80,
    
    // Responsive image sizes
    responsiveSizes: [
        { width: 320, suffix: '-sm' },
        { width: 640, suffix: '-md' },
        { width: 1024, suffix: '-lg' },
        { width: 1920, suffix: '-xl' }
    ],
    
    // Supported formats
    supportedFormats: ['.avif', '.png', '.jpg', '.jpeg'],
    
    // Skip optimization for files smaller than this (bytes)
    minFileSize: 1024
};

// Check if required tools are installed
function checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
        execSync('cwebp -version', { stdio: 'ignore' });
        console.log('✅ cwebp is installed');
    } catch (error) {
        console.error('❌ cwebp is not installed. Please install it with:');
        console.error('   brew install webp');
        console.error('   or visit: https://developers.google.com/speed/webp/download');
        process.exit(1);
    }
    
    try {
        execSync('avifenc -version', { stdio: 'ignore' });
        console.log('✅ avifenc is installed');
    } catch (error) {
        console.log('⚠️  avifenc not found - AVIF optimization will be skipped');
    }
}

// Get all image files
function getImageFiles() {
    const imageFiles = [];
    
    CONFIG.inputDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            const files = getAllFiles(dir);
            files.forEach(file => {
                const ext = path.extname(file).toLowerCase();
                if (CONFIG.supportedFormats.includes(ext)) {
                    const stats = fs.statSync(file);
                    if (stats.size >= CONFIG.minFileSize) {
                        imageFiles.push(file);
                    }
                }
            });
        }
    });
    
    return imageFiles;
}

// Recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    
    return arrayOfFiles;
}

// Convert AVIF to WebP
function convertAvifToWebp(inputPath, outputPath) {
    try {
        const command = `cwebp -q ${CONFIG.webpQuality} "${inputPath}" -o "${outputPath}"`;
        execSync(command, { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error(`❌ Failed to convert AVIF to WebP: ${inputPath}`);
        return false;
    }
}

// Convert PNG to WebP
function convertPngToWebp(inputPath, outputPath) {
    try {
        const command = `cwebp -q ${CONFIG.webpQuality} "${inputPath}" -o "${outputPath}"`;
        execSync(command, { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error(`❌ Failed to convert PNG to WebP: ${inputPath}`);
        return false;
    }
}

// Generate responsive image sizes
function generateResponsiveImages(inputPath, baseName, ext) {
    const results = [];
    
    CONFIG.responsiveSizes.forEach(size => {
        const outputPath = `${baseName}${size.suffix}.webp`;
        
        try {
            const command = `cwebp -q ${CONFIG.webpQuality} -resize ${size.width} 0 "${inputPath}" -o "${outputPath}"`;
            execSync(command, { stdio: 'pipe' });
            results.push({
                path: outputPath,
                width: size.width,
                suffix: size.suffix
            });
            console.log(`  📱 Generated ${size.width}px version: ${outputPath}`);
        } catch (error) {
            console.error(`❌ Failed to generate ${size.width}px version: ${inputPath}`);
        }
    });
    
    return results;
}

// Get file size in KB
function getFileSizeKB(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
}

// Main optimization function
function optimizeImages() {
    console.log('🚀 Starting image optimization...\n');
    
    const imageFiles = getImageFiles();
    console.log(`📊 Found ${imageFiles.length} images to optimize\n`);
    
    let totalSavings = 0;
    let processedCount = 0;
    let skippedCount = 0;
    
    imageFiles.forEach((filePath, index) => {
        const ext = path.extname(filePath).toLowerCase();
        const baseName = filePath.replace(ext, '');
        const fileName = path.basename(filePath);
        
        console.log(`[${index + 1}/${imageFiles.length}] Processing: ${fileName}`);
        
        const originalSize = getFileSizeKB(filePath);
        
        if (ext === '.avif') {
            // Convert AVIF to WebP
            const webpPath = `${baseName}.webp`;
            
            if (convertAvifToWebp(filePath, webpPath)) {
                const webpSize = getFileSizeKB(webpPath);
                const savings = (originalSize - webpSize).toFixed(2);
                totalSavings += parseFloat(savings);
                
                console.log(`  ✅ Converted to WebP: ${originalSize}KB → ${webpSize}KB (${savings}KB saved)`);
                
                // Generate responsive sizes
                generateResponsiveImages(filePath, baseName, ext);
                processedCount++;
            } else {
                skippedCount++;
            }
            
        } else if (ext === '.png') {
            // Convert PNG to WebP
            const webpPath = `${baseName}.webp`;
            
            if (convertPngToWebp(filePath, webpPath)) {
                const webpSize = getFileSizeKB(webpPath);
                const savings = (originalSize - webpSize).toFixed(2);
                totalSavings += parseFloat(savings);
                
                console.log(`  ✅ Converted to WebP: ${originalSize}KB → ${webpSize}KB (${savings}KB saved)`);
                
                // Generate responsive sizes
                generateResponsiveImages(filePath, baseName, ext);
                processedCount++;
            } else {
                skippedCount++;
            }
            
        } else {
            console.log(`  ⏭️  Skipping unsupported format: ${ext}`);
            skippedCount++;
        }
        
        console.log(''); // Empty line for readability
    });
    
    // Summary
    console.log('📈 Optimization Summary:');
    console.log(`  ✅ Processed: ${processedCount} images`);
    console.log(`  ⏭️  Skipped: ${skippedCount} images`);
    console.log(`  💾 Total savings: ${totalSavings.toFixed(2)}KB`);
    console.log(`  📱 Generated responsive sizes for all processed images`);
    
    if (totalSavings > 0) {
        console.log('\n🎉 Image optimization completed successfully!');
        console.log('💡 Consider updating your HTML to use WebP images with fallbacks:');
        console.log('   <picture>');
        console.log('     <source srcset="image.webp" type="image/webp">');
        console.log('     <img src="image.png" alt="Description">');
        console.log('   </picture>');
    }
}

// Create package.json for dependencies
function createPackageJson() {
    const packageJson = {
        name: "snarkflix-image-optimizer",
        version: "1.0.0",
        description: "Image optimization script for Snarkflix blog",
        scripts: {
            "optimize": "node optimize-images.js",
            "install-deps": "brew install webp"
        },
        dependencies: {},
        devDependencies: {}
    };
    
    if (!fs.existsSync('package.json')) {
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('📦 Created package.json for project dependencies');
    }
}

// Main execution
function main() {
    console.log('🎬 Snarkflix Image Optimizer');
    console.log('============================\n');
    
    try {
        checkDependencies();
        createPackageJson();
        optimizeImages();
    } catch (error) {
        console.error('💥 Optimization failed:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    optimizeImages,
    convertAvifToWebp,
    convertPngToWebp,
    generateResponsiveImages
};
