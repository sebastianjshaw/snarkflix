const fs = require('fs');
const path = require('path');

// Read the reviews data
const reviewsDataPath = path.join(__dirname, 'reviews-data.js');
const reviewsDataContent = fs.readFileSync(reviewsDataPath, 'utf8');

// Extract the reviews array from the JavaScript file
const reviewsMatch = reviewsDataContent.match(/const snarkflixReviews = (\[[\s\S]*?\]);/);
if (!reviewsMatch) {
  throw new Error('Could not find snarkflixReviews array in reviews-data.js');
}

// Use eval to parse the JavaScript array
const reviews = eval('(' + reviewsMatch[1] + ')');

// Get current date for lastmod
const currentDate = new Date().toISOString().split('T')[0];

// Generate sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://snarkflix.com/</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
  <!-- Main Sections -->
  <url>
    <loc>https://snarkflix.com/#reviews</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://snarkflix.com/#categories</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://snarkflix.com/#about</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
`;

// Add all review pages
reviews.forEach(review => {
  // Parse publish date to get lastmod (use publish date or current date)
  let lastmod = currentDate;
  try {
    // Try to parse publish date (format: "Nov 5, 2025")
    const dateMatch = review.publishDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (dateMatch) {
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      const month = months[dateMatch[1]] || '01';
      const day = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      lastmod = `${year}-${month}-${day}`;
    }
  } catch (e) {
    // Use current date if parsing fails
    lastmod = currentDate;
  }
  
  // Determine priority based on score (higher score = higher priority)
  let priority = '0.7';
  if (review.aiScore >= 80) {
    priority = '0.9';
  } else if (review.aiScore >= 60) {
    priority = '0.8';
  } else {
    priority = '0.7';
  }
  
  // Determine changefreq based on age (newer reviews change more often)
  const publishYear = parseInt(review.publishDate.match(/\d{4}/)?.[0] || '2025');
  const currentYear = new Date().getFullYear();
  const age = currentYear - publishYear;
  
  let changefreq = 'monthly';
  if (age === 0) {
    // Reviews from current year: weekly
    changefreq = 'weekly';
  } else if (age <= 1) {
    // Reviews from last year: monthly
    changefreq = 'monthly';
  } else if (age <= 3) {
    // Reviews 2-3 years old: yearly
    changefreq = 'yearly';
  } else {
    // Older reviews: rarely change
    changefreq = 'yearly';
  }
  
  sitemap += `  <!-- Review: ${review.title} -->
  <url>
    <loc>https://snarkflix.com/review/${review.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>
`;
});

sitemap += `</urlset>`;

// Write sitemap to file
const sitemapPath = path.join(__dirname, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`✅ Generated sitemap.xml with ${reviews.length} review pages`);
console.log(`   Total URLs: ${4 + reviews.length}`);

