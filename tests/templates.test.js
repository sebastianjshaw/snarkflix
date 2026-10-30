/**
 * sf-templates.js is the single source of truth for the HTML shared by the app (browser)
 * and the generated pages (Node), so these tests run it against every real review.
 */
const T = require('../sf-templates.js');
const reviews = require('../reviews-data.js');

const review = (over = {}) => ({
    id: 99,
    title: 'Test Film (2024)',
    releaseYear: 2024,
    publishDate: 'Jan 5, 2026',
    readingDuration: '4 min read',
    aiScore: 70,
    aiSummary: 'tldr: A summary.',
    tagline: 'A tagline',
    content: 'First paragraph.\n\nSecond paragraph.',
    category: 'drama',
    imageUrl: 'images/reviews/test/header-test.webp',
    youtubeTrailer: '',
    ...over,
});

describe('score system', () => {
    test.each([
        [100, 'excellent'], [90, 'excellent'], [89, 'great'], [80, 'great'], [79, 'good'],
        [70, 'good'], [69, 'fair'], [60, 'fair'], [59, 'poor'], [0, 'poor'],
    ])('score %i is in the %s band', (score, key) => {
        expect(T.bandFor(score).key).toBe(key);
    });

    test('band labels match the score filter options on the homepage', () => {
        const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
        T.BANDS.forEach((band) => {
            const range = band.range.replace('–', '-');
            expect(html).toContain(`value="${range}">${band.label}`);
        });
    });

    test('scores are clamped and always exposed to assistive tech', () => {
        expect(T.clampScore(140)).toBe(100);
        expect(T.clampScore(-5)).toBe(0);
        expect(T.clampScore('abc')).toBe(0);
        const html = T.scoreHTML(70);
        expect(html).toContain('--score:70');
        expect(html).toContain('aria-label="SnarkAI score: 70 out of 100, Good"');
    });

    test('every band has a mascot reaction', () => {
        [95, 85, 75, 65, 10].forEach((score) => {
            const reaction = T.reactionFor(score);
            expect(['merlin', 'snarkai']).toContain(reaction.who);
            expect(reaction.text.length).toBeGreaterThan(5);
        });
    });
});

describe('cards', () => {
    test('link to the review, drop the year from the title and keep the tagline as the hook', () => {
        const html = T.cardHTML(review());
        expect(html).toContain('href="/review/99"');
        expect(html).toContain('>Test Film</a>');
        expect(html).toContain('“A tagline”');
        expect(html).toContain('2024');
        expect(html).toContain('Drama');
    });

    test('review text is escaped', () => {
        const html = T.cardHTML(review({ title: '<img src=x onerror=alert(1)> (2020)', tagline: '"><script>x</script>' }));
        expect(html).not.toContain('<img src=x');
        expect(html).not.toContain('<script>x</script>');
    });

    test('the card link honours a custom href (file:// support in the app)', () => {
        const html = T.cardHTML(review(), { reviewHref: (r) => `?review=${r.id}` });
        expect(html).toContain('href="?review=99"');
    });
});

describe('article', () => {
    test('puts the image first, then title and score, then the tl;dr without a doubled label', () => {
        const html = T.articleHTML(review());
        expect(html.indexOf('sf-article__hero')).toBeLessThan(html.indexOf('<h1'));
        expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('sf-scorecard'));
        expect(html.indexOf('sf-scorecard')).toBeLessThan(html.indexOf('sf-tldr'));
        expect(html).toContain('A summary.');
        expect(html).not.toMatch(/tldr:/i);
    });

    test('has exactly one h1 and one main landmark', () => {
        const html = T.articleHTML(review());
        expect(html.match(/<h1/g)).toHaveLength(1);
        expect(html.match(/<main/g)).toHaveLength(1);
    });

    test('splits the body into escaped paragraphs', () => {
        const html = T.articleHTML(review({ content: 'One <b>bold</b>.\n\nTwo.' }));
        expect(html).toContain('<p>One &lt;b&gt;bold&lt;/b&gt;.</p>');
        expect(html).toContain('<p>Two.</p>');
    });

    test('renders standalone [IMAGE:] markers as figures, not stray text', () => {
        const html = T.proseHTML(review({ content: 'Before.\n\n[IMAGE:images/x/y.png]\n\nAfter.' }));
        expect(html).toContain('<figure class="sf-prose__figure">');
        expect(html).not.toContain('[IMAGE:');
    });

    test('share links are real anchors so they work without JavaScript', () => {
        const html = T.articleHTML(review());
        expect(html).toContain('href="https://twitter.com/intent/tweet');
        expect(html).toContain('href="https://www.facebook.com/sharer/sharer.php');
        expect(html).toContain('data-share="copy"');
    });

    test('related reviews prefer the same category and never include the review itself', () => {
        const target = reviews.find((r) => r.category === 'horror');
        const related = T.pickRelated(target, reviews, 3);
        expect(related).toHaveLength(3);
        expect(related.some((r) => r.id === target.id)).toBe(false);
        expect(related[0].category).toBe('horror');
    });
});

describe('every real review renders', () => {
    test.each(reviews.map((r) => [r.id, r.title, r]))('#%i %s', (_id, _title, r) => {
        const card = T.cardHTML(r);
        const article = T.articleHTML(r);
        const related = T.relatedHTML(r, reviews);
        [card, article, related].forEach((html) => {
            expect(html).not.toMatch(/undefined|NaN|\[object/);
        });
        expect(article).toContain(`/review/${r.id}`);
        expect(article).not.toMatch(/tldr:/i);
    });
});

describe('site chrome', () => {
    test('archive is alphabetical, ignoring a leading "The"', () => {
        const html = T.archiveHTML([
            review({ id: 1, title: 'Zoolander (2001)' }),
            review({ id: 2, title: 'The Batman (2022)' }),
            review({ id: 3, title: 'Avatar (2009)' }),
        ]);
        const order = ['Avatar', 'The Batman', 'Zoolander'].map((t) => html.indexOf(t));
        expect(order).toEqual([...order].sort((a, b) => a - b));
        expect(html).toContain('All reviews A–Z');
    });

    test('header and footer link back to the homepage sections', () => {
        expect(T.headerHTML()).toContain('href="/#reviews"');
        expect(T.headerHTML()).toContain('href="/#about"');
        expect(T.footerHTML()).not.toContain('sf-shortcuts');
        expect(T.footerHTML(undefined, { shortcuts: true })).toContain('sf-shortcuts');
    });

    test('keyboard shortcut list only documents shortcuts that exist', () => {
        const html = T.footerHTML(undefined, { shortcuts: true });
        expect(html).toContain('<kbd>/</kbd>');
        expect(html).toContain('<kbd>Esc</kbd>');
        expect(html).not.toContain('Navigate review cards');
    });
});

describe('generated static pages', () => {
    const fs = require('fs');
    const path = require('path');
    const page = fs.readFileSync(path.join(__dirname, '..', 'review', '57.html'), 'utf8');

    test('use the shared header, article and footer, and no longer carry the archive banner', () => {
        expect(page).toContain('class="sf-header"');
        expect(page).toContain('class="sf-article"');
        expect(page).toContain('class="sf-footer"');
        expect(page).not.toContain('Crawlable archive copy');
        expect(page).toContain('Browse all reviews');
    });

    test('load the real stylesheet and web fonts', () => {
        expect(page).toContain('href="/styles.css"');
        expect(page).toContain('fonts.googleapis.com/css2');
    });

    test('keep the SEO essentials', () => {
        expect(page).toContain('<link rel="canonical" href="https://snarkflix.com/review/57">');
        expect(page).toContain('"@type":"Review"');
        expect(page).toMatch(/<title>[^<]+<\/title>/);
    });
});
