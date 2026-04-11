/**
 * ISO date (YYYY-MM-DD) for Schema.org Movie.datePublished.
 * Prefer optional review.theatricalReleaseISO when you know the real premiere.
 * Otherwise use mid-year anchor from releaseYear (better than Jan 1 for "theatrical" semantics).
 */
function getMovieTheatricalReleaseISO(review) {
    if (review.theatricalReleaseISO && /^\d{4}-\d{2}-\d{2}$/.test(review.theatricalReleaseISO)) {
        return review.theatricalReleaseISO;
    }
    const y = Number(review.releaseYear);
    if (!Number.isFinite(y)) return undefined;
    return `${y}-07-01`;
}

module.exports = { getMovieTheatricalReleaseISO };
