const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Images that need responsive versions (from PageSpeed Insights)
const imagesToOptimize = [
    'images/reviews/fantastic-four-first-steps/header-fantastic-four-first-steps.webp',
    'images/reviews/palm-springs-2020/header-palm-springs-2020.webp', 
    'images/reviews/superman-2025/header-superman.webp',
    'images/reviews/iron-giant-1999/header-iron-giant.webp',
    'images/site-assets/logo.webp'
];

// Responsive sizes based on display dimensions from PageSpeed Insights
const sizes = [
    { width: 400, suffix: '-400w' },   // Close to 396px display width
    { width: 800, suffix: '-800w' },    // 2x for retina
    { width: 1200, suffix: '-1200w' }   // 3x for high-DPI
];

console.log('🖼️  Creating responsive image versions...\n');

imagesToOptimize.forEach(imagePath => {
    if (!fs.existsSync(imagePath)) {
        console.log(`❌ Skipping ${imagePath} - file not found`);
        return;
    }

    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    
    console.log(`📸 Processing ${imagePath}`);
    
    sizes.forEach(size => {
        const outputPath = path.join(dir, `${baseName}${size.suffix}${ext}`);
        
        try {
            // Use ImageMagick to resize
            execSync(`magick "${imagePath}" -resize ${size.width}x -quality 85 "${outputPath}"`, { stdio: 'pipe' });
            
            const originalSize = fs.statSync(imagePath).size;
            const newSize = fs.statSync(outputPath).size;
            const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
            
            console.log(`  ✅ Created ${path.basename(outputPath)} (${size.width}px) - ${reduction}% smaller`);
        } catch (error) {
            console.log(`  ❌ Failed to create ${path.basename(outputPath)}: ${error.message}`);
        }
    });
    
    console.log('');
});

console.log('✨ Responsive image creation complete!\n');
console.log('Next: Update reviews-data.js to use responsive images with <picture> elements');
