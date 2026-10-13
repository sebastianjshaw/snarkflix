/**
 * aiSummary values are authored as "tldr: …". Every renderer adds its own
 * "TL;DR:" label (or uses the text as a bare description), so drop the
 * leading marker to avoid "TL;DR: tldr: …".
 */
function stripTldrPrefix(summary) {
  return String(summary || '').replace(/^\s*tl;?dr\s*:\s*/i, '');
}

module.exports = { stripTldrPrefix };
