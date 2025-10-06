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
    
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="../images/site-assets/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../images/site-assets/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../images/site-assets/favicon/favicon-16x16.png">
    <link rel="manifest" href="../images/site-assets/favicon/site.webmanifest">
    <link rel="shortcut icon" href="../images/site-assets/favicon/favicon.ico">
    <meta name="msapplication-TileColor" content="#1a1a1a">
    <meta name="theme-color" content="#1a1a1a">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://snarkflix.com/review/${review.id}">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://snarkflix.com/review/${review.id}">
    <meta property="og:title" content="${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix">
    <meta property="og:description" content="${review.title} - ${review.aiSummary.substring(0, 200)}...">
    <meta property="og:image" content="https://snarkflix.com/${review.imageUrl}">
    <meta property="og:image:secure_url" content="https://snarkflix.com/${review.imageUrl}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${review.title} Review">
    <meta property="og:site_name" content="Snarkflix">
    <meta property="og:locale" content="en_US">
    
    <!-- WhatsApp specific meta tags -->
    <meta property="og:image:url" content="https://snarkflix.com/${review.imageUrl}">
    <meta name="twitter:image:src" content="https://snarkflix.com/${review.imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://snarkflix.com/review/${review.id}">
    <meta property="twitter:title" content="${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix">
    <meta property="twitter:description" content="${review.title} - ${review.aiSummary.substring(0, 200)}...">
    <meta property="twitter:image" content="https://snarkflix.com/${review.imageUrl}">
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
        // Delay redirect to allow social media crawlers to read meta tags
        // But redirect immediately if this is a real user (not a crawler)
        if (navigator.userAgent && !navigator.userAgent.includes('bot') && !navigator.userAgent.includes('crawler')) {
            // Immediate redirect for real users
            window.location.href = 'https://snarkflix.com/?review=${review.id}';
        } else {
            // Delayed redirect for crawlers
            setTimeout(function() {
                window.location.href = 'https://snarkflix.com/?review=${review.id}';
            }, 3000);
        }
    </script>
</head>
<body>
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1a1a1a; color: white; min-height: 100vh;">
        <h1>${review.title} Review</h1>
        <p>Loading review...</p>
        <p><a href="https://snarkflix.com/?review=${review.id}" style="color: #007bff;">Click here if you're not redirected automatically</a></p>
    </div>
</body>
</html>`;

  // Write the HTML file
  const filePath = path.join(reviewDir, `${review.id}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Generated review page for: ${review.title} (ID: ${review.id})`);
});

console.log(`Generated ${reviews.length} review pages`);
