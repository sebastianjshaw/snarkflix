const fs = require('fs');
const path = require('path');
const reviews = require('./reviews-data.js');
const { getMovieTheatricalReleaseISO } = require('./lib/get-movie-release.cjs');

const SITE = 'https://snarkflix.com';
const FEED_TITLE = 'Snarkflix — film reviews';
const FEED_ID = `${SITE}/feed.xml`;

function escXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function parsePublishToISO(publishDate) {
    try {
        const dateMatch = publishDate.match(/(\w+)\s+(\d+),\s+(\d+)/);
        if (dateMatch) {
            const months = {
                Jan: '01', Feb: '02', Mar: '03', Apr: '04',
                May: '05', Jun: '06', Jul: '07', Aug: '08',
                Sep: '09', Oct: '10', Nov: '11', Dec: '12'
            };
            const month = months[dateMatch[1]] || '01';
            const day = dateMatch[2].padStart(2, '0');
            const year = dateMatch[3];
            return `${year}-${month}-${day}T12:00:00.000Z`;
        }
    } catch (e) { /* fall through */ }
    return new Date().toISOString();
}

const sorted = reviews.slice().sort((a, b) => {
    const da = new Date(parsePublishToISO(a.publishDate));
    const db = new Date(parsePublishToISO(b.publishDate));
    return db - da;
});

const lastUpdated = sorted.length ? parsePublishToISO(sorted[0].publishDate) : new Date().toISOString();

const entries = sorted.map((review) => {
    const link = `${SITE}/review/${review.id}`;
    const updated = parsePublishToISO(review.publishDate);
    const summary = escXml((review.aiSummary || '').replace(/\s+/g, ' ').trim().slice(0, 500));
    const title = escXml(review.title);
    const filmDate = getMovieTheatricalReleaseISO(review);
    const extra = filmDate ? ` &lt;p&gt;&lt;small&gt;Theatrical release (approx.): ${escXml(filmDate)}&lt;/small&gt;&lt;/p&gt;` : '';
    return `  <entry>
    <title>${title}</title>
    <link href="${link}" rel="alternate" type="text/html"/>
    <id>${link}</id>
    <updated>${updated}</updated>
    <published>${updated}</published>
    <author><name>Snarkflix</name></author>
    <summary type="html">&lt;p&gt;${summary}&lt;/p&gt;${extra}</summary>
  </entry>`;
}).join('\n');

const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escXml(FEED_TITLE)}</title>
  <link href="${FEED_ID}" rel="self" type="application/atom+xml"/>
  <link href="${SITE}/" rel="alternate" type="text/html"/>
  <id>${FEED_ID}</id>
  <updated>${lastUpdated}</updated>
  <subtitle>First-person film reviews — British English.</subtitle>
  <rights>© Snarkflix</rights>
  <generator uri="${SITE}/">Snarkflix static generator</generator>
${entries}
</feed>
`;

const outPath = path.join(__dirname, 'feed.xml');
fs.writeFileSync(outPath, atom, 'utf8');
console.log(`✅ Generated feed.xml with ${sorted.length} entries`);
