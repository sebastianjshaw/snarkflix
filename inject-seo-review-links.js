/**
 * Injects the shared, build-time parts of index.html between marker comments:
 *
 *   SF_HEADER / SF_FOOTER   site chrome, identical to the generated /review/:id pages
 *   SF_FEATURED             the "Latest review" card in the hero
 *   SF_LEGEND               the "Score guide" pop-over
 *   SNARKFLIX_SEO_REVIEW_LINKS   a collapsed, crawlable "All reviews A–Z" list
 *
 * Everything comes from sf-templates.js, the same module the app and the static review
 * pages use, so the three can't drift. Run as part of `npm run build`.
 */
const fs = require('fs');
const path = require('path');
const T = require('./sf-templates.js');
const reviews = require('./reviews-data.js');

function replaceBlock(html, name, content) {
  const pattern = new RegExp(`(<!-- ${name}_START -->)[\\s\\S]*?(<!-- ${name}_END -->)`);
  if (!pattern.test(html)) {
    throw new Error(`index.html must contain ${name}_START / ${name}_END markers`);
  }
  return html.replace(pattern, (_, start, end) => `${start}\n${content}\n${end}`);
}

const latest = reviews.slice().sort((a, b) => {
  const byDate = new Date(b.publishDate) - new Date(a.publishDate);
  return byDate || b.id - a.id;
})[0];

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = replaceBlock(html, 'SF_HEADER', T.headerHTML());
html = replaceBlock(html, 'SF_FEATURED', T.featuredHTML(latest));
html = replaceBlock(html, 'SF_LEGEND', T.legendHTML());
html = replaceBlock(html, 'SNARKFLIX_SEO_REVIEW_LINKS', T.archiveHTML(reviews));
html = replaceBlock(html, 'SF_FOOTER', T.footerHTML(undefined, { shortcuts: true }));

fs.writeFileSync(indexPath, html, 'utf8');
console.log(`Injected header, footer, featured card (review ${latest.id}), score guide and ${reviews.length}-link A–Z archive into index.html`);
