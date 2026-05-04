/**
 * Injects a crawlable list of /review/:id links into index.html between markers.
 * Run as part of `npm run build` so Googlebot gets internal links without executing JS.
 */
const fs = require('fs');
const path = require('path');

const SITE_ORIGIN = 'https://snarkflix.com';

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const reviewsDataPath = path.join(__dirname, 'reviews-data.js');
const reviewsDataContent = fs.readFileSync(reviewsDataPath, 'utf8');
const reviewsMatch = reviewsDataContent.match(/const snarkflixReviews = (\[[\s\S]*?\]);/);
if (!reviewsMatch) {
  throw new Error('Could not find snarkflixReviews array in reviews-data.js');
}

const reviews = eval('(' + reviewsMatch[1] + ')');
const sorted = reviews.slice().sort((a, b) => a.id - b.id);

const items = sorted
  .map((r) => {
    const title = escHtml(r.title);
    return `        <li class="snarkflix-seo-indexed-review-archive-item"><a href="${SITE_ORIGIN}/review/${r.id}">${title}</a></li>`;
  })
  .join('\n');

const block = `<!-- SNARKFLIX_SEO_REVIEW_LINKS_START -->
<section class="snarkflix-seo-indexed-review-archive-wrap">
  <div class="snarkflix-container">
    <h2 class="snarkflix-seo-indexed-review-archive-heading">Review archive</h2>
    <p class="snarkflix-seo-indexed-review-archive-lede">Dedicated page for each review (same URLs as in the sitemap).</p>
    <nav class="snarkflix-seo-indexed-review-archive" aria-label="All reviews by title">
      <ul class="snarkflix-seo-indexed-review-archive-list">
${items}
      </ul>
    </nav>
  </div>
</section>
<!-- SNARKFLIX_SEO_REVIEW_LINKS_END -->`;

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const pattern = /<!-- SNARKFLIX_SEO_REVIEW_LINKS_START -->[\s\S]*?<!-- SNARKFLIX_SEO_REVIEW_LINKS_END -->/;
if (!pattern.test(html)) {
  throw new Error('index.html must contain SNARKFLIX_SEO_REVIEW_LINKS_START / END markers');
}

html = html.replace(pattern, block);
fs.writeFileSync(indexPath, html, 'utf8');
console.log(`Injected ${reviews.length} crawlable /review/ links into index.html`);
