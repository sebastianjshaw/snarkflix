#!/usr/bin/env node
/**
 * Records which responsive image sizes exist on disk, and which images referenced by
 * reviews-data.js are missing, then writes the result into the IMAGE_ASSETS block of
 * sf-templates.js. Run as the first step of `npm run build`.
 *
 *   standard: <name>-400w.webp, -800w.webp, -1200w.webp
 *   legacy:   <name>-sm.webp, -md.webp, -lg.webp, -xl.webp
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const reviews = require('./reviews-data.js');

const exists = (rel) => fs.existsSync(path.join(root, rel));
const bare = (p) => String(p || '').replace(/^\/+/, '');

const variants = {};
const missing = new Set();

function variantFor(imagePath) {
    const m = imagePath.match(/^(.*)\.(webp|avif|png|jpe?g)$/i);
    if (!m) return null;
    const base = m[1];
    if (['-400w', '-800w', '-1200w'].every((s) => exists(`${base}${s}.webp`))) return 'standard';
    if (['-sm', '-md', '-lg', '-xl'].every((s) => exists(`${base}${s}.webp`))) return 'legacy';
    return null;
}

reviews.forEach((review) => {
    const hero = bare(review.imageUrl);
    if (hero) {
        if (!exists(hero)) missing.add(hero);
        const v = variantFor(hero);
        if (v) variants[hero] = v;
    }

    const extras = [];
    if (review.additionalImage) extras.push(review.additionalImage);
    (review.additionalImages || []).forEach((p) => extras.push(p));
    (String(review.content || '').match(/\[IMAGE:([^\]]+)\]/g) || []).forEach((m) => {
        extras.push(m.replace(/^\[IMAGE:|\]$/g, ''));
    });
    extras.map(bare).forEach((p) => {
        if (!exists(p)) missing.add(p);
    });
});

const sortedVariants = {};
Object.keys(variants).sort().forEach((k) => { sortedVariants[k] = variants[k]; });
const assets = { variants: sortedVariants, missing: Array.from(missing).sort() };

const file = path.join(root, 'sf-templates.js');
const source = fs.readFileSync(file, 'utf8');
const pattern = /(\/\/ SF_IMAGE_ASSETS_START[^\n]*\n)[\s\S]*?(\n\s*\/\/ SF_IMAGE_ASSETS_END)/;
if (!pattern.test(source)) {
    throw new Error('sf-templates.js is missing the SF_IMAGE_ASSETS_START / END markers');
}

const next = source.replace(pattern, `$1    var IMAGE_ASSETS = ${JSON.stringify(assets, null, 4).replace(/\n/g, '\n    ')};$2`);
if (next !== source) fs.writeFileSync(file, next, 'utf8');

const counts = Object.values(sortedVariants).reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});
console.log(`Image assets: ${counts.standard || 0} standard, ${counts.legacy || 0} legacy variant sets; ` +
    `${assets.missing.length} referenced image(s) missing on disk${assets.missing.length ? ': ' + assets.missing.join(', ') : ''}`);
