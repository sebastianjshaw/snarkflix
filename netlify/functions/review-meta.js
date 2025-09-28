const fs = require('fs');
const path = require('path');

// Load the reviews data
const reviewsDataPath = path.join(process.cwd(), 'reviews-data.js');
const reviewsDataContent = fs.readFileSync(reviewsDataPath, 'utf8');

// Extract the reviews array from the JavaScript file
const reviewsMatch = reviewsDataContent.match(/const snarkflixReviews = (\[[\s\S]*?\]);/);
if (!reviewsMatch) {
  throw new Error('Could not find snarkflixReviews array in reviews-data.js');
}

const reviews = JSON.parse(reviewsMatch[1]);

exports.handler = async (event, context) => {
  const { id } = event.pathParameters;
  const review = reviews.find(r => r.id === parseInt(id));
  
  if (!review) {
    return {
      statusCode: 404,
      body: 'Review not found'
    };
  }

  const baseUrl = 'https://snarkflix.netlify.app';
  const reviewUrl = `${baseUrl}/review/${id}`;
  const imageUrl = review.imageUrl.startsWith('http') ? review.imageUrl : `${baseUrl}/${review.imageUrl}`;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${review.title} - ${review.aiSummary.substring(0, 150)}...">
    <meta name="keywords" content="movie reviews, film criticism, snarky reviews, cinema, movies, entertainment, ${review.title}">
    <meta name="author" content="Snarkflix">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${reviewUrl}">
    <meta property="og:title" content="${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix">
    <meta property="og:description" content="${review.title} - ${review.aiSummary.substring(0, 200)}...">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Snarkflix">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${reviewUrl}">
    <meta property="twitter:title" content="${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix">
    <meta property="twitter:description" content="${review.title} - ${review.aiSummary.substring(0, 200)}...">
    <meta property="twitter:image" content="${imageUrl}">
    <meta property="twitter:image:alt" content="${review.title} Review">
    <meta property="twitter:site" content="@snarkflix">

    <title>${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix</title>
    
    <script>
        // Redirect to the main page with the review parameter
        window.location.href = '${baseUrl}?review=${id}';
    </script>
</head>
<body>
    <p>Redirecting to review...</p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html
  };
};
