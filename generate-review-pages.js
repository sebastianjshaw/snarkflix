const fs = require('fs');
const path = require('path');
const { getMovieTheatricalReleaseISO } = require('./lib/get-movie-release.cjs');
const { stripTldrPrefix } = require('./lib/strip-tldr.cjs');
const T = require('./sf-templates.js');

const reviews = require('./reviews-data.js');

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap';

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

function stripTitleYear(str) {
  return String(str || '').replace(/\s*\(\d{4}\)\s*$/, '').trim();
}

/** Primary film line for H1 / meta — year appended when title omits (YYYY). Matches SPA. */
function reviewHeadingTitle(review) {
  const t = String(review.title || '');
  if (/\(\d{4}\)/.test(t)) return t;
  const base = stripTitleYear(t) || 'Film';
  return `${base} (${review.releaseYear})`;
}

function clampTitleForSERP(title, maxLen = 60) {
  const t = String(title || '').replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  // Prefer trimming at a word boundary; keep an ellipsis for clarity.
  const clipped = t.slice(0, Math.max(0, maxLen - 1));
  const lastSpace = clipped.lastIndexOf(' ');
  const safe = (lastSpace > 20 ? clipped.slice(0, lastSpace) : clipped).trim();
  return `${safe}…`;
}

function buildStaticPageTitle(review) {
  const headingTitle = reviewHeadingTitle(review);
  // Bing flags "title too long" fairly aggressively; keep it concise and stable.
  // The score stays in-page and in meta description; titles prioritize scannability.
  const base = `${headingTitle} Review | Snarkflix`;
  // We clamp pre-escape; HTML entity expansion can add a few chars in-source.
  return clampTitleForSERP(base, 55);
}

function buildStaticMetaDescription(review) {
  const headingTitle = reviewHeadingTitle(review);
  const category = review.category.charAt(0).toUpperCase() + review.category.slice(1);
  const score = review.aiScore;
  const snippet = stripTldrPrefix(review.aiSummary).substring(0, 100);
  let description = '';
  if (score >= 80) {
    description = `${headingTitle} — ${category} review: ${snippet}`;
  } else if (score >= 60) {
    description = `Review of ${headingTitle}: ${snippet}`;
  } else {
    description = `${headingTitle} — film review: ${snippet}`;
  }
  if (description.length > 160) description = `${description.substring(0, 157)}...`;
  return description;
}

reviews.forEach((review) => {
  const headingPlain = reviewHeadingTitle(review);
  const headingEsc = esc(headingPlain);
  const category = esc(review.category.charAt(0).toUpperCase() + review.category.slice(1));
  const imageUrl = `https://snarkflix.com/${review.imageUrl.replace(/^\//, '')}`;
  const reviewUrl = `https://snarkflix.com/review/${review.id}`;
  const pageTitle = esc(buildStaticPageTitle(review));
  const metaDesc = esc(buildStaticMetaDescription(review));
  const filmReleaseISO = getMovieTheatricalReleaseISO(review);
  const datePublished = parsePublishISO(review);

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${reviewUrl}#review`,
    url: reviewUrl,
    name: `${headingPlain} — film review`,
    headline: `${headingPlain} review`,
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
    <meta name="keywords" content="film reviews, Snarkflix, ${headingEsc}, ${category}">
    <meta name="author" content="Snarkflix">
    <meta name="robots" content="index, follow, max-image-preview:large">

    <link rel="canonical" href="${reviewUrl}">
    <link rel="alternate" type="application/atom+xml" title="Snarkflix" href="https://snarkflix.com/feed.xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="/styles.css">
    <link href="${FONTS_URL}" rel="stylesheet" media="print" onload="this.media='all'; this.onload=null;">
    <noscript><link href="${FONTS_URL}" rel="stylesheet"></noscript>

    <link rel="apple-touch-icon" sizes="180x180" href="/images/site-assets/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/site-assets/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/site-assets/favicon/favicon-16x16.png">
    <link rel="manifest" href="/images/site-assets/favicon/site.webmanifest">
    <link rel="shortcut icon" href="/images/site-assets/favicon/favicon.ico">
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
    <meta property="og:image:alt" content="${headingEsc} review poster">
    <meta property="og:site_name" content="Snarkflix">
    <meta property="og:locale" content="en_GB">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${reviewUrl}">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${headingEsc} review poster">

    <script type="application/ld+json">${JSON.stringify(ldJson)}</script>

    <title>${pageTitle}</title>

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-8SV8W7XL64"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8SV8W7XL64');
    </script>

</head>
<body class="sf-static">
    <a href="#review-main" class="snarkflix-skip-link">Skip to main content</a>
    ${T.headerHTML()}
    ${T.articleHTML(review)}
    ${T.relatedHTML(review, reviews)}
    ${T.footerHTML()}
    <script>
        // Copy-link button (the only interactive bit on a static page)
        document.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('[data-share="copy"]');
            if (!btn || !navigator.clipboard) return;
            var label = btn.querySelector('span');
            navigator.clipboard.writeText(btn.getAttribute('data-url')).then(function () {
                if (!label) return;
                var original = label.textContent;
                label.textContent = 'Link copied';
                setTimeout(function () { label.textContent = original; }, 2000);
            }, function () {});
        });
    </script>
</body>
</html>`;

  const filePath = path.join(reviewDir, `${review.id}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`Generated review page for: ${review.title} (ID: ${review.id})`);
});

console.log(`Generated ${reviews.length} review pages`);
