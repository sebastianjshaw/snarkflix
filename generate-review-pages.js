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

// Use eval to parse the JavaScript array (not recommended for production, but works for this use case)
const reviews = eval('(' + reviewsMatch[1] + ')');

// Create review directory if it doesn't exist
const reviewDir = path.join(__dirname, 'review');
if (!fs.existsSync(reviewDir)) {
  fs.mkdirSync(reviewDir);
}

// Generate HTML for each review
reviews.forEach(review => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${review.title} - ${review.aiSummary.substring(0, 150)}...">
    <meta name="keywords" content="movie reviews, film criticism, snarky reviews, cinema, movies, entertainment, ${review.title}">
    <meta name="author" content="Snarkflix">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://snarkflix.netlify.app/review/${review.id}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://snarkflix.netlify.app/review/${review.id}">
    <meta property="og:title" content="${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix">
    <meta property="og:description" content="${review.title} - ${review.aiSummary.substring(0, 200)}...">
    <meta property="og:image" content="https://snarkflix.netlify.app/${review.imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Snarkflix">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://snarkflix.netlify.app/review/${review.id}">
    <meta property="twitter:title" content="${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix">
    <meta property="twitter:description" content="${review.title} - ${review.aiSummary.substring(0, 200)}...">
    <meta property="twitter:image" content="https://snarkflix.netlify.app/${review.imageUrl}">
    <meta property="twitter:image:alt" content="${review.title} Review">
    <meta property="twitter:site" content="@snarkflix">

    <title>${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix</title>
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8SV8W7XL64"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-8SV8W7XL64');
    </script>
    
    <script>
        // Redirect to the main page with the review parameter
        window.location.href = 'https://snarkflix.netlify.app/?review=${review.id}';
    </script>
</head>
<body>
    <p>Redirecting to review...</p>
</body>
</html>`;

  // Write the HTML file
  const filePath = path.join(reviewDir, `${review.id}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Generated review page for: ${review.title} (ID: ${review.id})`);
});

console.log(`Generated ${reviews.length} review pages`);
