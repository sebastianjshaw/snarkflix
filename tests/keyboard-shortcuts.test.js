/**
 * Regression tests for global keyboard shortcuts.
 *
 * Unlike most tests in this repo, these load the REAL script.js into the jsdom window,
 * because the bug they guard against lived in the real file: a global keydown handler
 * treated the keys 1-9 as "jump to category N" and called preventDefault() even while
 * the user was typing in the search box, so "M3GAN" could never be entered.
 *
 * SCRIPT_UNDER_TEST can point at another copy of script.js (e.g. `git show HEAD~:script.js`)
 * to prove these tests fail against the old code.
 */
const fs = require('fs');
const path = require('path');

const scriptPath = process.env.SCRIPT_UNDER_TEST || path.join(__dirname, '..', 'script.js');

function loadScript() {
    window.SnarkflixTemplates = require('../sf-templates.js');
    window.snarkflixReviews = require('../reviews-data.js');
    window.eval(fs.readFileSync(scriptPath, 'utf8'));
}

// The fixture carries both the legacy category tiles and the current genre chips, so the same
// test exercises the old shortcut handler (which looked for tiles) and the current code.
const FIXTURE = `
    <div id="a11y-live-region"></div>
    <div class="snarkflix-search-container">
        <div class="snarkflix-search-wrapper">
            <input type="text" id="search-input" class="snarkflix-search-input">
            <button type="button" id="clear-search-btn" style="display:none"></button>
            <div id="search-suggestions" style="display:none"><div id="recent-searches"></div></div>
        </div>
    </div>
    <select id="sort-dropdown"><option value="latest">Newest</option></select>
    <select id="filter-score"><option value="">Any</option></select>
    <select id="filter-year"><option value="">Any</option></select>
    <div id="category-chips"></div>
    <button class="snarkflix-category-card" data-category="action"></button>
    <button class="snarkflix-category-card" data-category="adventure"></button>
    <button class="snarkflix-category-card" data-category="animation"></button>
    <div id="reviews-grid"></div>
    <div id="search-results-count"></div>
    <div id="reviews-progress"></div>
    <button id="load-more-btn"><span class="snarkflix-btn-text"></span></button>
    <button id="back-to-top-btn"></button>
`;

function press(target, key, init = {}) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
}

describe('global keyboard shortcuts', () => {
    let tileClicks;

    beforeAll(() => {
        loadScript();
        // Registered once, like the app does; handlers look elements up live, so the DOM can be rebuilt per test
        window.setupKeyboardNavigation();
    });

    beforeEach(() => {
        document.body.innerHTML = FIXTURE;
        tileClicks = 0;
        document.querySelectorAll('.snarkflix-category-card, .sf-chip').forEach((el) => {
            el.addEventListener('click', () => { tileClicks += 1; });
        });
    });

    test.each(['1', '2', '3', '9'])('typing "%s" into the search box is not intercepted', (digit) => {
        const input = document.getElementById('search-input');
        input.focus();
        const event = press(input, digit);

        expect(event.defaultPrevented).toBe(false);
        expect(tileClicks).toBe(0);
    });

    test('"M3GAN" can be typed key by key', () => {
        const input = document.getElementById('search-input');
        input.focus();
        const prevented = [...'M3GAN'].map((ch) => press(input, ch).defaultPrevented);

        expect(prevented).toEqual([false, false, false, false, false]);
    });

    test('digits pressed outside a field no longer jump between categories either', () => {
        const event = press(document.body, '3');

        expect(event.defaultPrevented).toBe(false);
        expect(tileClicks).toBe(0);
    });

    test('Escape closes the suggestions first, then clears the search box', () => {
        const input = document.getElementById('search-input');
        const suggestions = document.getElementById('search-suggestions');
        input.value = 'dog';
        input.focus();
        suggestions.style.display = 'block';

        press(input, 'Escape');
        expect(suggestions.style.display).toBe('none');
        expect(input.value).toBe('dog');

        press(input, 'Escape');
        expect(input.value).toBe('');
    });

    test('isTypingTarget recognises form fields and editable content only', () => {
        const input = document.createElement('input');
        const select = document.createElement('select');
        const textarea = document.createElement('textarea');
        const button = document.createElement('button');
        const editable = document.createElement('div');
        Object.defineProperty(editable, 'isContentEditable', { value: true });

        expect(window.isTypingTarget(input)).toBe(true);
        expect(window.isTypingTarget(select)).toBe(true);
        expect(window.isTypingTarget(textarea)).toBe(true);
        expect(window.isTypingTarget(editable)).toBe(true);
        expect(window.isTypingTarget(button)).toBe(false);
        expect(window.isTypingTarget(null)).toBe(false);
    });
});
