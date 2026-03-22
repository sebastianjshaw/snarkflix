const fs = require('fs');
const path = require('path');

// Load the reviews array directly via the module's CommonJS export
const reviews = require('./reviews-data.js');

// Create review directory if it doesn't exist
const reviewDir = path.join(__dirname, 'review');
if (!fs.existsSync(reviewDir)) {
  fs.mkdirSync(reviewDir);
}

// Escape HTML special characters to prevent XSS / broken markup
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Convert paragraph-separated content to <p> tags for crawlers
function contentToHtml(content) {
  return content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${esc(p.trim())}</p>`)
    .join('\n        ');
}

// Generate HTML for each review
reviews.forEach(review => {
  const title      = esc(review.title);
  const score      = esc(String(review.aiScore));
  const summary    = esc(review.aiSummary.substring(0, 200));
  const tagline    = esc(review.tagline);
  const category   = esc(review.category.charAt(0).toUpperCase() + review.category.slice(1));
  const year       = esc(String(review.releaseYear));
  const imageUrl   = `https://snarkflix.com/${review.imageUrl.replace(/^\//, '')}`;
  const reviewUrl  = `https://snarkflix.com/review/${review.id}`;
  const pageTitle  = `${title} Review - SnarkAI Score: ${score}/100 | Snarkflix`;
  const metaDesc   = `${title} (${year}) ${category} review: ${summary}...`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${metaDesc}">
    <meta name="keywords" content="movie reviews, film criticism, snarky reviews, cinema, movies, entertainment, ${title}">
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
    <link rel="canonical" href="${reviewUrl}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${reviewUrl}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:type" content="image/webp">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title} Review">
    <meta property="og:site_name" content="Snarkflix">
    <meta property="og:locale" content="en_US">
    <meta property="og:image:url" content="${imageUrl}">
    <meta name="twitter:image:src" content="${imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${reviewUrl}">
    <meta property="twitter:title" content="${pageTitle}">
    <meta property="twitter:description" content="${metaDesc}">
    <meta property="twitter:image" content="${imageUrl}">
    <meta property="twitter:image:alt" content="${title} Review">
    <meta property="twitter:site" content="@snarkflix">

    <!-- JSON-LD structured data for search engines -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "Movie",
        "name": "${title}",
        "datePublished": "${year}"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "${score}",
        "bestRating": "100",
        "worstRating": "0"
      },
      "author": { "@type": "Person", "name": "Snarkflix Reviewer" },
      "headline": "${title}",
      "image": "${imageUrl}",
      "url": "${reviewUrl}"
    }
    </script>

    <title>${pageTitle}</title>

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8SV8W7XL64"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8SV8W7XL64');
    </script>

    <!-- Redirect browsers to the SPA; crawlers read the real content below -->
    <script>
        window.location.replace('https://snarkflix.com/review/${review.id}');
    </script>

    <style>
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        h1 { color: #ff6b35; margin-bottom: 8px; }
        .meta { color: #aaa; font-size: 14px; margin-bottom: 24px; }
        .score { display: inline-block; background: #ff6b35; color: #fff; padding: 4px 12px; border-radius: 4px; font-weight: bold; margin-bottom: 16px; }
        blockquote { border-left: 4px solid #ff6b35; margin: 24px 0; padding-left: 16px; font-style: italic; color: #ccc; }
        .review-image { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 24px; }
        p { line-height: 1.7; margin-bottom: 16px; }
        a { color: #ff6b35; }
        .redirect-notice { margin-bottom: 24px; padding: 12px 16px; background: #222; border-radius: 6px; font-size: 14px; color: #aaa; }
    </style>
</head>
<body>
    <div class="container">
        <p class="redirect-notice">Redirecting to Snarkflix&hellip; <a href="https://snarkflix.com/review/${review.id}">Click here if not redirected</a>.</p>

        <article>
            <h1>${title} Review</h1>
            <p class="meta">${category} &middot; ${year} &middot; ${esc(review.readingDuration)} &middot; Published ${esc(review.publishDate)}</p>
            <span class="score">SnarkAI Score: ${score}/100</span>
            <img src="${imageUrl}" alt="${title} (${year}) movie poster" class="review-image" width="800" height="420">
            <blockquote>&ldquo;${tagline}&rdquo;</blockquote>
            <p><strong>TL;DR:</strong> ${esc(review.aiSummary)}</p>
            ${contentToHtml(review.content)}
        </article>

        <p><a href="https://snarkflix.com/">← Back to all reviews</a></p>
    </div>
</body>
</html>`;

  // Write the HTML file
  const filePath = path.join(reviewDir, `${review.id}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Generated review page for: ${review.title} (ID: ${review.id})`);
});

console.log(`Generated ${reviews.length} review pages`);
