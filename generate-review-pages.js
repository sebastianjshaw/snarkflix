const fs = require('fs');
const path = require('path');
const { getMovieTheatricalReleaseISO } = require('./lib/get-movie-release.cjs');

const reviews = require('./reviews-data.js');

const reviewDir = path.join(__dirname, 'review');
if (!fs.existsSync(reviewDir)) {
  fs.mkdirSync(reviewDir);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function contentToHtml(content) {
  return content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${esc(p.trim())}</p>`)
    .join('\n        ');
}

function parsePublishISO(review) {
  try {
    const dateMatch = review.publishDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (dateMatch) {
      const months = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04',
        May: '05', Jun: '06', Jul: '07', Aug: '08',
        Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      const month = months[dateMatch[1]] || '01';
      const day = dateMatch[2].padStart(2, '0');
      const year = dateMatch[3];
      return `${year}-${month}-${day}`;
    }
  } catch (e) { /* noop */ }
  return new Date().toISOString().split('T')[0];
}

reviews.forEach((review) => {
  const title = esc(review.title);
  const score = esc(String(review.aiScore));
  const summary = esc(review.aiSummary.substring(0, 200));
  const tagline = esc(review.tagline);
  const category = esc(review.category.charAt(0).toUpperCase() + review.category.slice(1));
  const year = esc(String(review.releaseYear));
  const imageUrl = `https://snarkflix.com/${review.imageUrl.replace(/^\//, '')}`;
  const reviewUrl = `https://snarkflix.com/review/${review.id}`;
  const pageTitle = `${title} Review - SnarkAI Score: ${score}/100 | Snarkflix`;
  const metaDesc = `${title} (${year}) ${category} review: ${summary}...`;
  const filmReleaseISO = getMovieTheatricalReleaseISO(review);
  const datePublished = parsePublishISO(review);

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${reviewUrl}#review`,
    url: reviewUrl,
    name: `${review.title} — film review`,
    headline: `${review.title} review`,
    inLanguage: 'en-GB',
    datePublished,
    reviewBody: review.content.substring(0, 500) + (review.content.length > 500 ? '...' : ''),
    image: imageUrl,
    author: { '@type': 'Person', name: 'Snarkflix' },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://snarkflix.com/#organization',
      name: 'Snarkflix',
      url: 'https://snarkflix.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://snarkflix.com/images/site-assets/logo.avif'
      }
    },
    itemReviewed: {
      '@type': 'Movie',
      name: review.title,
      url: reviewUrl,
      image: imageUrl,
      genre: review.category.charAt(0).toUpperCase() + review.category.slice(1),
      datePublished: filmReleaseISO
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(review.aiScore),
      bestRating: '100',
      worstRating: '0',
      name: 'SnarkAI score'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${reviewUrl}#webpage`,
      url: reviewUrl
    }
  };

  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${metaDesc}">
    <meta name="keywords" content="film reviews, Snarkflix, ${title}, ${year}, ${category}">
    <meta name="author" content="Snarkflix">
    <meta name="robots" content="index, follow, max-image-preview:large">

    <link rel="canonical" href="${reviewUrl}">
    <link rel="alternate" type="application/atom+xml" title="Snarkflix" href="https://snarkflix.com/feed.xml">
    <link rel="stylesheet" href="../styles.css">

    <link rel="apple-touch-icon" sizes="180x180" href="../images/site-assets/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../images/site-assets/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../images/site-assets/favicon/favicon-16x16.png">
    <link rel="manifest" href="../images/site-assets/favicon/site.webmanifest">
    <link rel="shortcut icon" href="../images/site-assets/favicon/favicon.ico">
    <meta name="msapplication-TileColor" content="#1a1a1a">
    <meta name="theme-color" content="#1a1a1a">

    <meta property="og:type" content="article">
    <meta property="og:url" content="${reviewUrl}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:type" content="image/webp">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title} review poster">
    <meta property="og:site_name" content="Snarkflix">
    <meta property="og:locale" content="en_GB">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${reviewUrl}">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${title} review poster">

    <script type="application/ld+json">${JSON.stringify(ldJson)}</script>

    <title>${pageTitle}</title>

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8SV8W7XL64"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8SV8W7XL64');
    </script>

    <style>
        .snarkflix-static-review-wrap { max-width: 800px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
        .snarkflix-static-banner {
            padding: 0.75rem 1rem; margin-bottom: 1.5rem; border-radius: 8px;
            background: var(--snarkflix-light, #f0e8de); color: var(--snarkflix-dark, #1a1a1a);
            font-size: 0.95rem; border-left: 4px solid var(--snarkflix-primary, #ff6b35);
        }
        .snarkflix-static-review-wrap h1 { font-family: Georgia, serif; color: var(--snarkflix-primary, #ff6b35); }
        .snarkflix-static-meta { color: var(--snarkflix-gray, #6c757d); font-size: 0.9rem; margin-bottom: 1rem; }
        .snarkflix-static-score { display: inline-block; background: var(--snarkflix-primary, #ff6b35); color: #fff;
            padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 700; margin-bottom: 1rem; }
        .snarkflix-static-review-wrap blockquote { border-left: 4px solid var(--snarkflix-primary, #ff6b35); margin: 1.5rem 0; padding-left: 1rem; font-style: italic; }
        .snarkflix-static-review-wrap .review-image { width: 100%; max-height: 420px; object-fit: cover; border-radius: 8px; margin-bottom: 1.25rem; }
    </style>
</head>
<body>
    <div class="snarkflix-static-review-wrap">
        <p class="snarkflix-static-banner">
            Crawlable archive copy. <a href="../index.html?review=${review.id}">Open interactive view</a> for search, related reviews, and sharing.
        </p>

        <article itemscope itemtype="https://schema.org/Review">
            <h1 itemprop="name">${title} Review</h1>
            <p class="snarkflix-static-meta">${category} &middot; ${year} &middot; ${esc(review.readingDuration)} &middot; Published ${esc(review.publishDate)}</p>
            <span class="snarkflix-static-score">SnarkAI Score: ${score}/100</span>
            <img src="${imageUrl}" alt="${title} (${year}) film poster" class="review-image" width="800" height="420" itemprop="image">
            <blockquote>&ldquo;${tagline}&rdquo;</blockquote>
            <p><strong>TL;DR:</strong> ${esc(review.aiSummary)}</p>
            <div itemprop="reviewBody">${contentToHtml(review.content)}</div>
        </article>

        <p style="margin-top:2rem;"><a href="../index.html">← All reviews</a></p>
    </div>
</body>
</html>`;

  const filePath = path.join(reviewDir, `${review.id}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Generated review page for: ${review.title} (ID: ${review.id})`);
});

console.log(`Generated ${reviews.length} review pages`);
