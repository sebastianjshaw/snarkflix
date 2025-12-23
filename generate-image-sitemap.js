#!/usr/bin/env node

/**
 * Generate Image Sitemap for Snarkflix
 * Creates an XML sitemap specifically for images to help with Google Images ranking
 */

const fs = require('fs');
const path = require('path');

// Load reviews data
const reviewsDataPath = path.join(__dirname, 'reviews-data.js');
let reviewsDataContent = fs.readFileSync(reviewsDataPath, 'utf8');

// Extract snarkflixReviews array using eval (safe in this context as it's our own file)
// We'll use a regex to extract the array
const arrayMatch = reviewsDataContent.match(/const snarkflixReviews\s*=\s*(\[[\s\S]*\]);/);
if (!arrayMatch) {
    console.error('Could not find snarkflixReviews array in reviews-data.js');
    process.exit(1);
}

// Use Function constructor to safely evaluate the array
const getReviews = new Function('return ' + arrayMatch[1]);
const reviews = getReviews();

// Base URL
const baseUrl = 'https://snarkflix.com';

// Generate image sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

reviews.forEach(review => {
    // Main review page URL
    const reviewUrl = `${baseUrl}/review/${review.id}`;
    
    // Main review image
    const mainImageUrl = review.imageUrl.startsWith('http') 
        ? review.imageUrl 
        : `${baseUrl}/${review.imageUrl}`;
    
    // Extract image filename for better description
    const imageFilename = review.imageUrl.split('/').pop().replace(/\.(webp|avif|png|jpg|jpeg)$/i, '');
    // Remove year from title if it's already included (e.g., "Superman (2025)" -> "Superman")
    const titleWithoutYear = review.title.replace(/\s*\(\d{4}\)\s*$/, '');
    const imageTitle = `${titleWithoutYear} (${review.releaseYear}) Movie Review Poster`;
    const imageCaption = `Official movie poster for ${titleWithoutYear} (${review.releaseYear}) - ${review.category.charAt(0).toUpperCase() + review.category.slice(1)} film review on Snarkflix`;
    const imageLicense = 'https://snarkflix.com';
    
    sitemap += `  <url>
    <loc>${reviewUrl}</loc>
    <image:image>
      <image:loc>${mainImageUrl}</image:loc>
      <image:title>${imageTitle}</image:title>
      <image:caption>${imageCaption}</image:caption>
      <image:license>${imageLicense}</image:license>
    </image:image>
`;
    
    // Add additional images if they exist
    if (review.additionalImage) {
        const additionalImageUrl = review.additionalImage.startsWith('http')
            ? review.additionalImage
            : `${baseUrl}/${review.additionalImage}`;
        sitemap += `    <image:image>
      <image:loc>${additionalImageUrl}</image:loc>
      <image:title>${titleWithoutYear} (${review.releaseYear}) - Additional Scene</image:title>
      <image:caption>Scene from ${titleWithoutYear} (${review.releaseYear})</image:caption>
      <image:license>${imageLicense}</image:license>
    </image:image>
`;
    }
    
    // Add additional images array if it exists
    if (review.additionalImages && Array.isArray(review.additionalImages)) {
        review.additionalImages.forEach((img, index) => {
            const additionalImageUrl = img.startsWith('http')
                ? img
                : `${baseUrl}/${img}`;
            sitemap += `    <image:image>
      <image:loc>${additionalImageUrl}</image:loc>
      <image:title>${titleWithoutYear} (${review.releaseYear}) - Scene ${index + 1}</image:title>
      <image:caption>Scene ${index + 1} from ${titleWithoutYear} (${review.releaseYear})</image:caption>
      <image:license>${imageLicense}</image:license>
    </image:image>
`;
        });
    }
    
    sitemap += `  </url>
`;
});

sitemap += `</urlset>`;

// Write sitemap to file
const sitemapPath = path.join(__dirname, 'image-sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`✅ Image sitemap generated successfully!`);
console.log(`   Location: ${sitemapPath}`);
console.log(`   Reviews processed: ${reviews.length}`);
console.log(`   Total images: ${reviews.length + (reviews.filter(r => r.additionalImage).length) + (reviews.reduce((sum, r) => sum + (r.additionalImages?.length || 0), 0))}`);

