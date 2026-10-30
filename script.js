// Snarkflix JavaScript - Movie Review Blog

/**
 * aiSummary values are authored as "tldr: …". Callers add their own "TL;DR:" label
 * (or use the text as a bare description), so drop the leading marker.
 * Keep in sync with lib/strip-tldr.cjs (used by the build scripts).
 */
function stripTldrPrefix(summary) {
    return String(summary || '').replace(/^\s*tl;?dr\s*:\s*/i, '');
}

/**
 * Root-absolute path for http(s) (e.g. /images/...), or file URL relative to the current HTML
 * document when using file:// — so images work from disk and from /review/* routes.
 */
function resolveAssetUrl(path) {
    if (!path || /^https?:\/\//i.test(path)) {
        return path;
    }
    const trimmed = path.replace(/^\/+/, '');
    if (window.location.protocol === 'file:') {
        try {
            return new URL(trimmed, window.location.href).href;
        } catch (e) {
            return '/' + trimmed;
        }
    }
    return '/' + trimmed;
}

/** Escape HTML in review titles used inside innerHTML (cards / links). */
function stripTrailingTitleYear(title) {
    return String(title || '').replace(/\s*\(\d{4}\)\s*$/, '').trim();
}

/** Film line for H1 / JSON-LD headline — year in parens when title omits release year. */
function formatReviewHeadingPlain(review) {
    const t = String(review.title || '');
    if (/\(\d{4}\)/.test(t)) return t;
    const base = stripTrailingTitleYear(t) || 'Film';
    return `${base} (${review.releaseYear})`;
}

function escapeHtmlText(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Shared HTML templates (sf-templates.js is loaded before this file)
const T = window.SnarkflixTemplates;

const TEMPLATE_CTX = {
    assetUrl: (p) => resolveAssetUrl(/^(https?:)?\/\//.test(p) || p.charAt(0) === '/' ? p : '/' + p),
    reviewHref: (review) => getReviewHistoryURL(review.id),
    homeHref: getHomeHref(),
    categoryHref: (slug) => `${getHomeHref()}?category=${encodeURIComponent(slug)}`,
};

// Import review data from external file
// Note: In a real application, this would be loaded via script tag or module import
// For now, we'll use the data directly from reviews-data.js
// The reviews are now loaded from reviews-data.js via script tag

// Default meta tag values for the homepage.
// Used by returnToHomepage() to reset tags after visiting a review.
// Add new meta tags here once — no need to touch returnToHomepage().
/** Canonical origin for structured data, sitemaps, and OG (not file://). */
const SNARKFLIX_SITE_ORIGIN = 'https://snarkflix.com';

const HOMEPAGE_META = {
    title:           'Snarkflix — film reviews in the first person',
    description:     'First-person film reviews in British English: sharp, honest, tangent-prone. Each gets a tl;dr and a SnarkAI score out of 100.',
    canonicalHref:   `${SNARKFLIX_SITE_ORIGIN}/`,
    keywords:        'film reviews, movie reviews, British film critic, UK cinema blog, first person reviews, Snarkflix, film criticism, SnarkAI',
    robots:          'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    ogType:          'website',
    ogImageType:     'image/avif',
    ogImageAlt:      'Snarkflix — film reviews in the first person',
    ogSiteName:      'Snarkflix',
    ogLocale:        'en_GB',
};

/** Rotating lines while search runs — specific to this site, not generic “loading” filler */
const SNARKFLIX_DELIGHT_SEARCH_LINES = [
    'Rifling through my notes…',
    'Checking whether I actually wrote that down…',
    'Grepping my own opinions…',
    'Convincing the grid to behave…',
    'Merlin is “supervising” from the sofa…',
];

const SNARKFLIX_DELIGHT_LOAD_MORE_LINES = [
    'One more reel…',
    'Digging further into the pile…',
    'Still arguing with SnarkAI about the order…',
    'Backlog does not organise itself…',
    'Popcorn patience — almost there…',
];

const SNARKFLIX_DELIGHT_SHARE_TOASTS = [
    'Link copied — paste with conviction.',
    'On your clipboard. Use it wisely.',
    'Pinched. Don’t let it go straight to DVD.',
    'Copied. Share the trauma responsibly.',
];

function pickSnarkflixDelightLine(lines, avoid) {
    if (!lines.length) return '';
    if (lines.length === 1) return lines[0];
    let pick;
    let guard = 0;
    do {
        pick = lines[Math.floor(Math.random() * lines.length)];
        guard++;
    } while (pick === avoid && guard < 12);
    return pick;
}

/** Root href for breadcrumb + navigation (/, or index.html on file://). */
function getHomeHref() {
    const path = window.location.pathname || '';
    if (window.location.protocol === 'file:' && path.endsWith('index.html')) {
        return 'index.html';
    }
    return '/';
}

/** History URL for a review — file:// cannot use path-style /review/:id (SecurityError in some browsers). */
function getReviewHistoryURL(reviewId) {
    if (window.location.protocol === 'file:') {
        return `?review=${reviewId}`;
    }
    return `/review/${reviewId}`;
}

function safePushHomeState() {
    try {
        const url = window.location.protocol === 'file:' ? '' : '/';
        window.history.pushState({ type: 'home', q: '' }, '', url);
    } catch (e) {
        try {
            window.history.pushState({ type: 'home', q: '' }, '', window.location.pathname || '/');
        } catch (e2) {
            console.warn('Snarkflix: could not update history for home', e2);
        }
    }
}

function safePushReviewState(reviewId) {
    const state = { reviewId, type: 'review' };
    const url = getReviewHistoryURL(reviewId);
    try {
        window.history.pushState(state, '', url);
    } catch (e) {
        console.warn('Snarkflix: pushState failed, retrying with query URL', e);
        try {
            window.history.pushState(state, '', `?review=${reviewId}`);
        } catch (e2) {
            console.warn('Snarkflix: pushState failed', e2);
        }
    }
}

function safeReplaceReviewState(reviewId) {
    const state = { reviewId, type: 'review' };
    const url = getReviewHistoryURL(reviewId);
    try {
        window.history.replaceState(state, '', url);
    } catch (e) {
        console.warn('Snarkflix: replaceState failed, retrying with query URL', e);
        try {
            window.history.replaceState(state, '', `?review=${reviewId}`);
        } catch (e2) {
            console.warn('Snarkflix: replaceState failed', e2);
        }
    }
}

/** True when the address bar is the homepage (not a /review/:id view). */
function isSnarkflixHomePathForSearch() {
    const path = window.location.pathname || '';
    if (/\/review\/\d+/.test(path)) return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('review')) return false;
    return path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('index.html');
}

/**
 * Sync grid + input from ?q= (and clear when absent). Skips when a review route is active.
 */
function applySearchQueryFromURL() {
    if (!snarkflixReviews || !Array.isArray(snarkflixReviews)) return;
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const path = window.location.pathname || '';
    if (/\/review\/\d+/.test(path) || params.get('review')) return;

    currentSearchTerm = q;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = q;
    if (reviewsGrid) {
        loadReviews(1, currentCategory, q, currentSort, currentScoreFilter, currentYearFilter).catch(() => {});
    }
}

/**
 * Keep ?q= in the URL on the homepage without spamming history (replaceState).
 */
function syncSearchQueryToURL(searchTerm) {
    if (window.location.protocol === 'file:') return;
    if (!isSnarkflixHomePathForSearch()) return;
    if (document.body.classList.contains('snarkflix-review-page')) return;

    const q = (searchTerm || '').trim();
    const u = new URL(window.location.href);
    u.hash = '';
    if (q) u.searchParams.set('q', q);
    else u.searchParams.delete('q');
    const next = u.pathname + (u.search ? u.search : '') + u.hash;
    const cur = window.location.pathname + window.location.search + window.location.hash;
    if (next === cur) return;

    try {
        window.history.replaceState({ type: 'home', q }, '', next);
    } catch (e) {
        console.warn('Snarkflix: could not sync search to URL', e);
    }
}

function insertReviewWrapperInDocument(reviewWrapper) {
    const header = document.querySelector('.sf-header');
    if (header) {
        header.insertAdjacentElement('afterend', reviewWrapper);
    } else {
        document.body.insertAdjacentElement('afterbegin', reviewWrapper);
    }
}

/** The homepage lives in <main id="main">; hide it while a review is on screen. */
function setHomeVisible(visible) {
    const main = document.getElementById('main');
    if (main) main.hidden = !visible;
}

// DOM elements
let reviewsGrid;
let loadMoreBtn;
let currentPage = 1;
const reviewsPerPage = 12; // divisible by 2, 3 and 4 so the grid never ends on a ragged row
let currentSort = 'latest';
let currentCategory = 'all';
let currentSearchTerm = '';
let currentScoreFilter = '';
let currentYearFilter = '';
let allFilteredReviews = []; // Store all filtered reviews for progress indicator

let snarkflixSearchLoadingRotateId = null;
let snarkflixLoadMoreWhisperId = null;

// Initialize the application
// Wait for both DOM and reviews data to be ready
/** Konami code toggles warm “matinee” stock — harmless, reversible */
function setupSnarkflixDelightKonami() {
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let idx = 0;
    document.addEventListener('keydown', (e) => {
        const want = seq[idx];
        const got = want.startsWith('Arrow') ? e.key : e.key.toLowerCase();
        if (got === want) {
            idx += 1;
            if (idx === seq.length) {
                document.body.classList.toggle('snarkflix-delight-matinee');
                idx = 0;
            }
        } else {
            idx = got === seq[0] ? 1 : 0;
        }
    });
}

function waitForReviewsData(callback, maxAttempts = 50) {
    if (typeof snarkflixReviews !== 'undefined' && Array.isArray(snarkflixReviews)) {
        callback();
    } else if (maxAttempts > 0) {
        setTimeout(() => waitForReviewsData(callback, maxAttempts - 1), 100);
    } else {
        console.error('Reviews data failed to load after maximum attempts');
        // Try to initialize anyway - might work if data loads later
        callback();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Add page loaded class for initial fade-in
    document.body.classList.add('snarkflix-page-loaded');

    if (typeof console !== 'undefined' && console.log) {
        console.log(
            '%cSnarkflix%c Film brain online. If you’re poking the console: the hot takes live in the prose, not the minified bundle.',
            'font-weight:700;font-size:13px;color:#ff6b35;',
            'color:#6c757d;font-size:12px;'
        );
    }

    setupSnarkflixDelightKonami();
    
    // Initialize DOM elements immediately (don't wait for data)
    reviewsGrid = document.getElementById('reviews-grid');
    loadMoreBtn = document.getElementById('load-more-btn');
    
    // In-app links (brand, nav, cards, category links) work from first paint
    setupSpaLinks();
    
    // Wait for reviews data to be available before loading reviews
    waitForReviewsData(function() {
        const bootParams = new URLSearchParams(window.location.search);
        const qBoot = (bootParams.get('q') || '').trim();
        const pathBoot = window.location.pathname || '';
        const hasReviewRouteBoot = /\/review\/\d+/.test(pathBoot) || bootParams.get('review');
        if (!hasReviewRouteBoot && qBoot) {
            currentSearchTerm = qBoot;
            const searchInputBoot = document.getElementById('search-input');
            if (searchInputBoot) searchInputBoot.value = qBoot;
        }

        // ?category=horror (used by the "Every Horror review" links on review pages)
        const categoryBoot = (bootParams.get('category') || '').trim();
        if (!hasReviewRouteBoot && categoryBoot && snarkflixReviews.some((r) => r.category === categoryBoot)) {
            currentCategory = categoryBoot;
        }

        // Genre chips are drawn from the data, so counts can never go stale
        renderCategoryChips();
        setupCategoryChips();

        // Load reviews once data is available
        loadReviews();
        
        // Setup event listeners and other non-critical features
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                setupEventListeners();
                setupAccessibility();
                setupSortDropdown();
                setupSearch();
                setupBackToTop();
                setupKeyboardNavigation();
            }, { timeout: 2000 });
        } else {
            setTimeout(() => {
                setupEventListeners();
                setupAccessibility();
                setupSortDropdown();
                setupSearch();
                setupBackToTop();
                setupKeyboardNavigation();
            }, 100);
        }
        
        // Check for review parameter and update meta tags before checking for shared review
        const reviewParam = bootParams.get('review');
        
        if (reviewParam) {
            const reviewId = parseInt(reviewParam);
            const review = snarkflixReviews.find(r => r.id === reviewId);
            
            if (review) {
                // Update meta tags for social media sharing (using extracted function)
                updateMetaTagsForReview(review);
            }
        }
        
        // Check for shared review after a short delay
        setTimeout(() => {
            checkForSharedReview();
        }, 100);
    });
});

// Listen for hash changes (back/forward navigation) - legacy support
window.addEventListener('hashchange', function() {
    checkForSharedReview();
});

// Listen for popstate (back/forward navigation with History API)
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.type === 'review') {
        const reviewId = Number(event.state.reviewId);
        const review = snarkflixReviews.find(r => Number(r.id) === reviewId);
        if (review) {
            removeReviewNotFoundPage();
            showReviewLoadingSkeleton();
            try {
                createReviewPage(review);
            } finally {
                hideReviewLoadingSkeleton();
            }
        } else {
            showReviewNotFoundPage(reviewId);
        }
    } else {
        returnToHomepage({ skipHistory: true });
    }
});

// Check if there's a review ID in the URL and open it
function checkForSharedReview() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const reviewParam = urlParams.get('review');
    
    let reviewId = null;
    
    // Check for /review/:id path (new format)
    const pathMatch = path.match(/\/review\/(\d+)/);
    if (pathMatch) {
        reviewId = parseInt(pathMatch[1]);
    }
    // Check hash (for backward compatibility)
    else {
        const reviewMatch = hash.match(/#review-(\d+)/);
        if (reviewMatch) {
            reviewId = parseInt(reviewMatch[1]);
        }
        // Check URL parameter (for backward compatibility)
        else if (reviewParam) {
            reviewId = parseInt(reviewParam);
        }
    }
    
    if (reviewId) {
        const review = snarkflixReviews.find(r => r.id === reviewId);

        if (review) {
            removeReviewNotFoundPage();
            showReviewLoadingSkeleton();
            safeReplaceReviewState(reviewId);
            try {
                createReviewPage(review);
            } finally {
                hideReviewLoadingSkeleton();
            }
        } else {
            showReviewNotFoundPage(reviewId);
        }
    } else if ((hash === '' || hash === '#') && !reviewParam && !pathMatch) {
        // If no review in URL, ensure we're on homepage
        if (path !== '/' && !path.endsWith('/index.html') && !path.endsWith('index.html')) {
            returnToHomepage();
        }
    }
}

// initializeApp function removed - initialization now happens directly in DOMContentLoaded

/**
 * One delegated click handler for every in-app link the templates emit:
 *   a[data-review-id]    open a review without a page load
 *   a[data-home]         the brand: back to the homepage
 *   a[data-home-anchor]  Reviews / About links in header, footer and article
 *   a[data-category-link] "Every Horror review" style links
 * Modified clicks (new tab etc.) and anything else fall through to the browser.
 */
function setupSpaLinks() {
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const link = e.target.closest && e.target.closest('a');
        if (!link) return;

        if (link.dataset.reviewId) {
            e.preventDefault();
            navigateToReview(link.dataset.reviewId);
        } else if (link.hasAttribute('data-home')) {
            e.preventDefault();
            goHomeAndScroll(null);
        } else if (link.dataset.homeAnchor) {
            e.preventDefault();
            goHomeAndScroll(link.dataset.homeAnchor);
        } else if (link.dataset.categoryLink) {
            e.preventDefault();
            showCategoryFromLink(link.dataset.categoryLink);
        }
    });
}

function isReviewViewOpen() {
    return document.body.classList.contains('snarkflix-review-page');
}

function goHomeAndScroll(anchorId) {
    const wasReview = isReviewViewOpen();
    if (wasReview) returnToHomepage();
    const scroll = () => {
        const el = anchorId ? document.getElementById(anchorId) : null;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    if (wasReview) setTimeout(scroll, 120);
    else scroll();
}

function showCategoryFromLink(slug) {
    const wasReview = isReviewViewOpen();
    if (wasReview) returnToHomepage();
    const go = () => {
        setCategory(slug);
        const el = document.getElementById('reviews');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (wasReview) setTimeout(go, 120);
    else go();
}

function loadReviews(page = 1, category = currentCategory, searchTerm = currentSearchTerm, sort = currentSort, scoreFilter = currentScoreFilter, yearFilter = currentYearFilter) {
    return new Promise((resolve, reject) => {
        try {
            // Check if reviewsGrid exists
            if (!reviewsGrid) {
                console.warn('Reviews grid not found, waiting for DOM...');
                reject(new Error('Reviews grid not found'));
                return;
            }
        
            // Update global variables to match parameters
            currentCategory = category;
            currentSearchTerm = searchTerm;
            currentSort = sort;
            currentScoreFilter = scoreFilter;
            currentYearFilter = yearFilter;
            
            // Check if reviews data is available
            if (!snarkflixReviews || !Array.isArray(snarkflixReviews)) {
                throw new Error('Reviews data not available');
            }
            
            let filteredReviews = snarkflixReviews;
        
            // Filter by category if specified
            if (category && category !== 'all') {
                filteredReviews = filteredReviews.filter(review => 
                    review.category === category
                );
            }
            
            // Filter by search term if specified
            if (searchTerm) {
                const searchTermLower = searchTerm.toLowerCase();
                filteredReviews = filteredReviews.filter(review => 
                    review.title.toLowerCase().includes(searchTermLower) ||
                    review.content.toLowerCase().includes(searchTermLower) ||
                    review.tagline.toLowerCase().includes(searchTermLower) ||
                    review.aiSummary.toLowerCase().includes(searchTermLower) ||
                    review.category.toLowerCase().includes(searchTermLower)
                );
            }
            
            // Filter by score if specified
            if (scoreFilter) {
                const [min, max] = scoreFilter.split('-').map(Number);
                filteredReviews = filteredReviews.filter(review => 
                    review.aiScore >= min && review.aiScore <= max
                );
            }
            
            // Filter by year if specified
            if (yearFilter) {
                const year = parseInt(yearFilter);
                filteredReviews = filteredReviews.filter(review => 
                    review.releaseYear === year
                );
            }
            
            // Sort based on current sort option — use .slice() to avoid mutating the source array
            filteredReviews = filteredReviews.slice().sort((a, b) => {
                switch (sort) {
                    case 'latest':
                        // Sort by date (newest first)
                        const dateA = new Date(a.publishDate);
                        const dateB = new Date(b.publishDate);
                        return dateB - dateA;
                    case 'best':
                        // Sort by AI score (highest first)
                        return b.aiScore - a.aiScore;
                    case 'longest':
                        // Sort by reading duration (longest first)
                        const durationA = parseInt(a.readingDuration);
                        const durationB = parseInt(b.readingDuration);
                        return durationB - durationA;
                    default:
                        return 0;
                }
            });
            
            // Calculate pagination
            const startIndex = (page - 1) * reviewsPerPage;
            const endIndex = startIndex + reviewsPerPage;
            const reviewsToShow = filteredReviews.slice(startIndex, endIndex);
            
            // Clear existing reviews if it's the first page
            if (page === 1) {
                reviewsGrid.innerHTML = '';
                
                // Show empty state if no reviews found
                if (filteredReviews.length === 0) {
                    showEmptyState(reviewsGrid, searchTerm, category, scoreFilter, yearFilter);
                    updateLoadMoreButton(0, 0);
                    updateProgressIndicator(0, 0);
                    updateSearchResultsCount(0, true);
                    announceToScreenReader('Nothing matched those filters or that search.');
                    setTimeout(() => resolve(), 100);
                    return;
                }
            }
            
            // Render reviews using DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            reviewsToShow.forEach((review, index) => {
                const reviewElement = createReviewElement(review);
                // Add animation delay based on index for staggered effect
                reviewElement.style.animationDelay = `${Math.min(index, 8) * 0.04}s`;
                fragment.appendChild(reviewElement);
            });
            // Append fragment in one operation for better performance
            reviewsGrid.appendChild(fragment);
            
            // Store all filtered reviews for progress indicator
            allFilteredReviews = filteredReviews;
            
            // Update load more button
            const currentDisplayedCount = reviewsGrid.children.length;
            updateLoadMoreButton(filteredReviews.length, currentDisplayedCount);
            
            // Update progress indicator
            updateProgressIndicator(currentDisplayedCount, filteredReviews.length);
            
            // Update search results count
            updateSearchResultsCount(filteredReviews.length, searchTerm || category !== 'all' || scoreFilter || yearFilter);
            
            // Announce to screen readers
            announceToScreenReader(`Showing ${reviewsToShow.length} review${reviewsToShow.length !== 1 ? 's' : ''} on this page; ${filteredReviews.length} match in total.`);
            
            // Update current page
            currentPage = page;
            
            // Resolve immediately - DOM updates are already done via DocumentFragment
            resolve();
        } catch (error) {
            console.error('Error loading reviews:', error);
            handleReviewLoadError(error);
            reject(error);
        }
    });
}

function createReviewElement(review) {
    const holder = document.createElement('div');
    holder.innerHTML = T.cardHTML(review, TEMPLATE_CTX);
    const card = holder.firstElementChild;
    attachImageHandlers(card);
    return card;
}

function attachImageHandlers(root) {
    root.querySelectorAll('img').forEach((img) => {
        img.addEventListener('load', () => handleImageLoad(img));
        img.addEventListener('error', () => handleImageError(img));
    });
}

function navigateToReview(reviewId) {
    const id = Number(reviewId);
    const review = snarkflixReviews.find(r => Number(r.id) === id);
    if (review) {
        showReviewLoadingSkeleton();
        safePushReviewState(id);
        updateMetaTagsForReview(review);
        try {
            createReviewPage(review);
        } finally {
            hideReviewLoadingSkeleton();
        }
    } else {
        console.warn('Snarkflix: navigateToReview — no review for id', reviewId);
        safePushReviewState(id);
        showReviewNotFoundPage(id);
    }
}

function copyReviewLink(review) {
    const reviewUrl = `https://snarkflix.com/review/${review.id}`;
    const legacyCopy = () => {
        const textArea = document.createElement('textarea');
        textArea.value = reviewUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showShareNotification();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(reviewUrl).then(() => showShareNotification()).catch(legacyCopy);
    } else {
        legacyCopy();
    }
}

function showShareNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'snarkflix-share-notification';
    notification.textContent = message || pickSnarkflixDelightLine(SNARKFLIX_DELIGHT_SHARE_TOASTS);

    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Helper function to update meta tags (Twitter uses name=*, Open Graph / article use property=*)
function updateMetaTag(key, content) {
    const useProperty = key.startsWith('og:') || key.startsWith('article:');
    const useName = key.startsWith('twitter:') || !useProperty;

    let metaTag = useProperty
        ? document.querySelector(`meta[property="${key}"]`)
        : document.querySelector(`meta[name="${key}"]`);

    if (!metaTag && useName) {
        metaTag = document.querySelector(`meta[property="${key}"]`);
        if (metaTag) {
            metaTag.removeAttribute('property');
            metaTag.setAttribute('name', key);
        }
    }

    if (!metaTag) {
        metaTag = document.createElement('meta');
        if (useProperty) {
            metaTag.setAttribute('property', key);
        } else {
            metaTag.setAttribute('name', key);
        }
        document.head.appendChild(metaTag);
    }

    metaTag.setAttribute('content', content);
}

function removeOgArticleMeta() {
    document.querySelectorAll('meta[property^="article:"]').forEach((el) => el.remove());
}

/** ISO date YYYY-MM-DD from review.publishDate (e.g. Nov 5, 2025) */
function parseReviewPublishDateISO(review) {
    let datePublished = new Date().toISOString().split('T')[0];
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
            datePublished = `${year}-${month}-${day}`;
        }
    } catch (e) {
        /* keep fallback */
    }
    return datePublished;
}

/** Match lib/get-movie-release.cjs — theatrical date for JSON-LD Movie.datePublished */
function getMovieTheatricalReleaseISO(review) {
    if (review.theatricalReleaseISO && /^\d{4}-\d{2}-\d{2}$/.test(review.theatricalReleaseISO)) {
        return review.theatricalReleaseISO;
    }
    const y = Number(review.releaseYear);
    if (!Number.isFinite(y)) return undefined;
    return `${y}-07-01`;
}

// Helper function to get absolute URL for images
function getAbsoluteUrl(imagePath) {
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `${SNARKFLIX_SITE_ORIGIN}/${imagePath.replace(/^\//, '')}`;
}

function createReviewPage(review) {
    removeReviewNotFoundPage();

    document.body.classList.add('snarkflix-page-transitioning');
    document.body.classList.add('snarkflix-review-page');

    updateMetaTagsForReview(review);
    addReviewStructuredData(review);
    addBreadcrumbStructuredData(review);

    setHomeVisible(false);

    const existingReviewContent = document.querySelector('.snarkflix-review-content-wrapper');
    if (existingReviewContent) {
        existingReviewContent.remove();
    }

    // Same templates as the generated /review/:id pages, so the two can't drift apart
    const reviewWrapper = document.createElement('div');
    reviewWrapper.className = 'snarkflix-review-content-wrapper';
    reviewWrapper.innerHTML = T.articleHTML(review, TEMPLATE_CTX) + T.relatedHTML(review, snarkflixReviews, TEMPLATE_CTX);
    attachImageHandlers(reviewWrapper);
    insertReviewWrapperInDocument(reviewWrapper);

    const copyButton = reviewWrapper.querySelector('[data-share="copy"]');
    if (copyButton) {
        copyButton.addEventListener('click', () => copyReviewLink(review));
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(() => {
        document.body.classList.remove('snarkflix-page-transitioning');
        document.body.classList.add('snarkflix-page-loaded');
    }, 300);
}

function returnToHomepage(options = {}) {
    const skipHistory = options.skipHistory === true;

    removeReviewNotFoundPage();

    document.body.classList.add('snarkflix-page-transitioning');

    if (!skipHistory) {
        safePushHomeState();
    }
    
    // Remove review page class from body
    document.body.classList.remove('snarkflix-review-page');
    
    // Remove structured data scripts
    removeStructuredData();
    
    // Reset page title and canonical URL
    document.title = HOMEPAGE_META.title;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', HOMEPAGE_META.canonicalHref);

    // Reset meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', HOMEPAGE_META.description);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.setAttribute('content', HOMEPAGE_META.keywords);
    }
    updateMetaTag('robots', HOMEPAGE_META.robots);
    updateMetaTag('googlebot', HOMEPAGE_META.robots);
    removeOgArticleMeta();

    // Reset all Open Graph / Twitter meta tags from the single source of truth
    const logoUrl = getAbsoluteUrl('images/site-assets/logo.avif');
    const homepageUrl = HOMEPAGE_META.canonicalHref;
    updateMetaTag('og:title',           HOMEPAGE_META.title);
    updateMetaTag('og:description',     HOMEPAGE_META.description);
    updateMetaTag('og:image',           logoUrl);
    updateMetaTag('og:image:secure_url', logoUrl);
    updateMetaTag('og:image:type',      HOMEPAGE_META.ogImageType);
    updateMetaTag('og:image:alt',       HOMEPAGE_META.ogImageAlt);
    updateMetaTag('og:site_name',       HOMEPAGE_META.ogSiteName);
    updateMetaTag('og:locale',          HOMEPAGE_META.ogLocale);
    updateMetaTag('og:url',             homepageUrl);
    updateMetaTag('og:type',            HOMEPAGE_META.ogType);
    // WhatsApp specific
    updateMetaTag('og:image:url',       logoUrl);
    updateMetaTag('twitter:image:src',  logoUrl);
    // Twitter Card
    updateMetaTag('twitter:card',        'summary_large_image');
    updateMetaTag('twitter:title',       HOMEPAGE_META.title);
    updateMetaTag('twitter:description', HOMEPAGE_META.description);
    updateMetaTag('twitter:image',       logoUrl);
    updateMetaTag('twitter:url',         homepageUrl);

    setHomeVisible(true);
    
    // Remove any existing review content
    const existingReviewContent = document.querySelector('.snarkflix-review-content-wrapper');
    if (existingReviewContent) {
        existingReviewContent.remove();
    }
    
    window.scrollTo({ top: 0, behavior: 'instant' });

    setTimeout(() => {
        document.body.classList.remove('snarkflix-page-transitioning');
        document.body.classList.add('snarkflix-page-loaded');
    }, 300);

    applySearchQueryFromURL();
}

function updateLoadMoreButton(totalReviews, currentCount) {
    if (!loadMoreBtn) return;
    
    const btnText = loadMoreBtn.querySelector('.snarkflix-btn-text');
    const btnLoader = loadMoreBtn.querySelector('.snarkflix-btn-loader');
    
    if (currentCount >= totalReviews) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = '';
        if (btnText) {
            btnText.textContent = `Load more reviews (${totalReviews - currentCount} left)`;
        } else {
            loadMoreBtn.textContent = `Load more reviews (${totalReviews - currentCount} left)`;
        }
        // Hide loader if visible
        if (btnLoader) btnLoader.style.display = 'none';
        loadMoreBtn.disabled = false;
    }
}

function setLoadMoreButtonLoading(isLoading) {
    if (!loadMoreBtn) return;
    
    const btnText = loadMoreBtn.querySelector('.snarkflix-btn-text');
    const btnLoader = loadMoreBtn.querySelector('.snarkflix-btn-loader');
    const caption = loadMoreBtn.querySelector('.snarkflix-btn-loader-caption');
    
    if (snarkflixLoadMoreWhisperId) {
        clearInterval(snarkflixLoadMoreWhisperId);
        snarkflixLoadMoreWhisperId = null;
    }
    
    if (isLoading) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.setAttribute('aria-busy', 'true');
        loadMoreBtn.style.overflow = 'visible';
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-flex';
        if (caption) {
            let last = '';
            const spin = () => {
                last = pickSnarkflixDelightLine(SNARKFLIX_DELIGHT_LOAD_MORE_LINES, last);
                caption.textContent = last;
            };
            spin();
            snarkflixLoadMoreWhisperId = setInterval(spin, 2000);
        }
    } else {
        loadMoreBtn.disabled = false;
        loadMoreBtn.removeAttribute('aria-busy');
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
        if (caption) caption.textContent = '';
    }
}

// Ripple effect for buttons
function addRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('snarkflix-ripple');
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
        button.style.overflow = '';
    }, 600);
}

// Recent searches functionality
function saveRecentSearch(term) {
    if (!term || term.trim().length < 2) return;
    
    try {
        let recentSearches = JSON.parse(localStorage.getItem('snarkflix-recent-searches') || '[]');
        // Remove if already exists
        recentSearches = recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase());
        // Add to beginning
        recentSearches.unshift(term);
        // Keep only last 5
        recentSearches = recentSearches.slice(0, 5);
        localStorage.setItem('snarkflix-recent-searches', JSON.stringify(recentSearches));
    } catch (e) {
        console.warn('Failed to save recent search:', e);
    }
}

function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem('snarkflix-recent-searches') || '[]');
    } catch (e) {
        return [];
    }
}

function showRecentSearches(container) {
    const recentSearches = getRecentSearches();
    const recentContainer = document.getElementById('recent-searches');
    
    if (!recentContainer || recentSearches.length === 0) {
        if (recentContainer) recentContainer.style.display = 'none';
        return;
    }
    
    recentContainer.innerHTML = `
        <div class="snarkflix-recent-searches-header">Recent searches</div>
        ${recentSearches.map(term => `
            <div class="snarkflix-recent-search-item" data-term="${term}">
                <span class="snarkflix-recent-search-icon">🕐</span>
                <span class="snarkflix-recent-search-term">${term}</span>
            </div>
        `).join('')}
    `;
    
    recentContainer.style.display = 'block';
    
    // Add click handlers
    recentContainer.querySelectorAll('.snarkflix-recent-search-item').forEach(item => {
        item.addEventListener('click', () => {
            const term = item.getAttribute('data-term');
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = term;
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });
}

function setupEventListeners() {
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', (e) => {
            addRippleEffect(e.target, e);
            setLoadMoreButtonLoading(true);
            loadReviews(currentPage + 1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter).then(() => {
                setLoadMoreButtonLoading(false);
            }).catch(() => {
                setLoadMoreButtonLoading(false);
            });
        });
    }

    // Smooth scrolling for in-page anchors (hero buttons, skip link)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.dataset.homeAnchor) return; // handled by setupSpaLinks
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function setupAccessibility() {
    // Skip link: jump to whichever <main> is on screen (homepage or review)
    const skipLink = document.querySelector('.snarkflix-skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function (e) {
            const target = Array.from(document.querySelectorAll('main')).find((m) => !m.hidden) ||
                document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
                setTimeout(() => target.removeAttribute('tabindex'), 1000);
            }
        });
    }

    // Tab key marks a keyboard user (lets CSS show focus affordances more loudly)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('snarkflix-keyboard-user');
        }
    });
}

function renderCategoryChips() {
    const host = document.getElementById('category-chips');
    if (!host || !Array.isArray(snarkflixReviews)) return;

    const counts = {};
    snarkflixReviews.forEach((review) => {
        counts[review.category] = (counts[review.category] || 0) + 1;
    });
    const slugs = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

    const chip = (slug, label, count, icon) => `
        <button type="button" class="sf-chip${slug === 'all' ? ' sf-chip--all' : ''}" data-category="${T.esc(slug)}" aria-pressed="${slug === currentCategory}">
            ${icon ? `<img class="sf-chip__icon" src="${T.esc(resolveAssetUrl(`/images/category-icons/${icon}-sm.webp`))}" alt="" width="30" height="30" loading="lazy">` : ''}
            <span class="sf-chip__label">${T.esc(label)}</span>
            <span class="sf-chip__n">${count}</span>
        </button>`;

    host.innerHTML = chip('all', 'All', snarkflixReviews.length, null) +
        slugs.map((slug) => chip(slug, T.categoryLabel(slug), counts[slug], T.categoryIcon(slug))).join('');
}

function updateChipState() {
    document.querySelectorAll('.sf-chip').forEach((chip) => {
        chip.setAttribute('aria-pressed', String(chip.dataset.category === currentCategory));
    });
}

/** Genre, search, score and year all combine; picking a genre never wipes the other filters. */
function setCategory(slug) {
    currentCategory = slug;
    currentPage = 1;
    updateChipState();
    loadReviews(1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter).catch(() => {});
}

function setupCategoryChips() {
    const host = document.getElementById('category-chips');
    if (!host) return;
    host.addEventListener('click', (e) => {
        const chip = e.target.closest('.sf-chip');
        if (!chip) return;
        const slug = chip.dataset.category;
        // Tapping the active genre again goes back to "All"
        setCategory(slug === currentCategory && slug !== 'all' ? 'all' : slug);
    });
}

function setupSortDropdown() {
    const sortDropdown = document.getElementById('sort-dropdown');
    
    if (sortDropdown) {
        // Set initial active option
        updateSortDropdownDisplay();
        
        sortDropdown.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1; // Reset to first page when changing sort
            updateSortDropdownDisplay();
            loadReviews(1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter).catch(() => {});
        });
    }
}

function updateSortDropdownDisplay() {
    const sortDropdown = document.getElementById('sort-dropdown');
    if (!sortDropdown) return;
    
    // Update selected option text to show icon
    const selectedOption = sortDropdown.options[sortDropdown.selectedIndex];
    const icon = selectedOption.getAttribute('data-icon') || '';
    const text = selectedOption.text;
    
    // Create custom display (if needed for styling)
    sortDropdown.setAttribute('data-selected', currentSort);
}

function showEmptyState(container, searchTerm, category, scoreFilter, yearFilter) {
    const emptyState = document.createElement('div');
    emptyState.className = 'snarkflix-empty-state';

    let title = 'Nothing here';
    let message = 'Loosen the filters or clear the search and I\'ll show you the archive again.';
    let mascot = 'merlin';

    if (searchTerm) {
        title = 'No matches for "' + searchTerm + '"';
        message = 'I couldn\'t find that in my reviews. Try different words or clear the search box.';
        mascot = 'snarkai';
    } else if (category && category !== 'all') {
        title = `Nothing filed under ${T.categoryLabel(category)}`;
        message = 'Nothing in this genre yet, or it\'s hiding behind your score and year filters. Try another genre or clear the filters.';
    } else if (scoreFilter || yearFilter) {
        title = 'Nothing matches those filters';
        message = 'Try a wider score band or year. The archive\'s bigger than this filter lets on.';
    }

    const mascotSrc = mascot === 'merlin' ? '/images/site-assets/avatar-merlin.webp' : '/images/site-assets/brand-mark.webp';
    const hasFilters = Boolean(scoreFilter || yearFilter);

    emptyState.innerHTML = `
        <div class="snarkflix-empty-state-icon"><img class="sf-empty-img" src="${T.esc(resolveAssetUrl(mascotSrc))}" alt="" width="96" height="96"></div>
        <h3 class="snarkflix-empty-state-title">${T.esc(title)}</h3>
        <p class="snarkflix-empty-state-message">${T.esc(message)}</p>
        <div class="snarkflix-empty-state-actions">
            ${searchTerm ? `<button type="button" class="sf-btn sf-btn--ghost" data-action="clear-search">Clear search</button>` : ''}
            ${category && category !== 'all' ? `<button type="button" class="sf-btn sf-btn--ghost" data-action="all-categories">View all categories</button>` : ''}
            ${hasFilters ? `<button type="button" class="sf-btn sf-btn--ghost" data-action="clear-filters">Clear filters</button>` : ''}
        </div>
    `;

    const onClick = (action, handler) => {
        const button = emptyState.querySelector(`[data-action="${action}"]`);
        if (button) button.addEventListener('click', handler);
    };

    onClick('clear-search', () => {
        clearSearchBox();
    });
    onClick('all-categories', () => {
        setCategory('all');
    });
    onClick('clear-filters', () => {
        const scoreEl = document.getElementById('filter-score');
        const yearEl = document.getElementById('filter-year');
        if (scoreEl) scoreEl.value = '';
        if (yearEl) yearEl.value = '';
        currentScoreFilter = '';
        currentYearFilter = '';
        currentPage = 1;
        loadReviews(1, currentCategory, currentSearchTerm, currentSort, '', '').catch(() => {});
    });

    container.appendChild(emptyState);
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (searchInput) {
        // Debounced search to avoid too many API calls
        const debouncedSearch = debounce((searchTerm) => {
            if (searchTerm) {
                showSearchLoading();
                // Save to recent searches
                saveRecentSearch(searchTerm);
            }
            currentSearchTerm = searchTerm;
            currentPage = 1; // Reset to first page when searching
            loadReviews(1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter);
            syncSearchQueryToURL(searchTerm);

            // Hide search loading after a short delay
            setTimeout(() => {
                hideSearchLoading();
            }, 500);
        }, 300);
        
        // Show autocomplete suggestions
        const showSuggestions = (term) => {
            if (!term || term.length < 2) {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                return;
            }
            
            const termLower = term.toLowerCase();
            const matches = snarkflixReviews
                .filter(review => 
                    review.title.toLowerCase().includes(termLower) ||
                    review.category.toLowerCase().includes(termLower)
                )
                .slice(0, 5)
                .map(review => ({
                    title: review.title,
                    category: review.category,
                    id: review.id
                }));
            
            if (matches.length > 0 && suggestionsContainer) {
                const recentContainer = document.getElementById('recent-searches');
                if (recentContainer) recentContainer.style.display = 'none';
                
                suggestionsContainer.innerHTML = matches.map(match => 
                    `<div class="snarkflix-suggestion-item" data-id="${match.id}" role="option" tabindex="0">
                        <strong>${highlightMatch(match.title, term)}</strong>
                        <span class="snarkflix-suggestion-category">${match.category}</span>
                    </div>`
                ).join('');
                suggestionsContainer.style.display = 'block';
                
                // Add click and keyboard handlers to suggestions
                suggestionsContainer.querySelectorAll('.snarkflix-suggestion-item').forEach((item, index) => {
                    const reviewId = parseInt(item.getAttribute('data-id'));
                    const review = snarkflixReviews.find(r => r.id === reviewId);
                    
                    if (review) {
                        // Click handler
                        item.addEventListener('click', () => {
                            navigateToReview(reviewId);
                        });
                        
                        // Keyboard handler
                        item.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigateToReview(reviewId);
                            } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                const next = suggestionsContainer.querySelectorAll('.snarkflix-suggestion-item')[index + 1];
                                if (next) next.focus();
                            } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prev = suggestionsContainer.querySelectorAll('.snarkflix-suggestion-item')[index - 1];
                                if (prev) prev.focus();
                                else document.getElementById('search-input')?.focus();
                            }
                        });
                    }
                });
                
                // Focus first suggestion for keyboard navigation
                const firstSuggestion = suggestionsContainer.querySelector('.snarkflix-suggestion-item');
                if (firstSuggestion) {
                    // Don't auto-focus, but make it focusable
                    firstSuggestion.setAttribute('tabindex', '0');
                }
            } else {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
            }
        };
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            showSuggestions(searchTerm);
            debouncedSearch(searchTerm);
            
            // Show/hide clear button with animation
            if (searchTerm) {
                clearSearchBtn.style.display = 'flex';
                clearSearchBtn.classList.add('snarkflix-clear-visible');
            } else {
                clearSearchBtn.classList.remove('snarkflix-clear-visible');
                setTimeout(() => {
                    if (!searchInput.value.trim()) {
                        clearSearchBtn.style.display = 'none';
                    }
                }, 200);
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
            }
        });
        
        // Show recent searches when focused and empty
        searchInput.addEventListener('focus', () => {
            if (!searchInput.value.trim()) {
                showRecentSearches(suggestionsContainer);
                if (suggestionsContainer) suggestionsContainer.style.display = 'block';
            }
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (suggestionsContainer && !searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
        
        
        // Keyboard shortcut: '/' to focus search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(document.activeElement)) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            clearSearchBox();
            searchInput.focus();
        });
    }
    
    // Setup filter handlers
    setupFilters();
}

function highlightMatch(text, term) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function setupFilters() {
    const scoreFilter = document.getElementById('filter-score');
    const yearFilter = document.getElementById('filter-year');
    
    // Populate year filter
    if (yearFilter && snarkflixReviews) {
        const years = [...new Set(snarkflixReviews.map(r => r.releaseYear))].sort((a, b) => b - a);
        const currentYearHtml = yearFilter.innerHTML;
        yearFilter.innerHTML = currentYearHtml + years.map(year => 
            `<option value="${year}">${year}</option>`
        ).join('');
    }
    
    if (scoreFilter) {
        scoreFilter.addEventListener('change', (e) => {
            currentScoreFilter = e.target.value;
            currentPage = 1;
            loadReviews(1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter);
        });
    }
    
    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            currentYearFilter = e.target.value;
            currentPage = 1;
            loadReviews(1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter);
        });
    }
}

function updateSearchResultsCount(total, hasFilters) {
    const resultsCount = document.getElementById('search-results-count');
    if (!resultsCount) return;
    
    if (hasFilters && total > 0) {
        const message = `${total} review${total !== 1 ? 's' : ''} match`;
        resultsCount.textContent = message;
        resultsCount.style.display = 'block';
        // Announce to screen readers
        announceToScreenReader(message);
    } else {
        resultsCount.style.display = 'none';
    }
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        // Clear after announcement to allow re-announcement of same message
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

function updateProgressIndicator(loaded, total) {
    const progressEl = document.getElementById('reviews-progress');
    if (!progressEl) return;
    
    if (total > 0 && loaded < total) {
        progressEl.textContent = `Showing ${loaded} of ${total} reviews so far`;
        progressEl.style.display = 'block';
    } else if (loaded >= total && total > 0) {
        progressEl.textContent = `That's all ${total} — every matching review is loaded`;
        progressEl.style.display = 'block';
    } else {
        progressEl.style.display = 'none';
    }
}

function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('snarkflix-back-to-top--visible');
        } else {
            backToTopBtn.classList.remove('snarkflix-back-to-top--visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/** True while the user is typing into a field; global shortcuts must never fire then. */
function isTypingTarget(el) {
    if (!el || !el.tagName) return false;
    return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

function clearSearchBox() {
    const input = document.getElementById('search-input');
    if (!input) return;
    input.value = '';
    currentSearchTerm = '';
    currentPage = 1;
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        clearBtn.style.display = 'none';
        clearBtn.classList.remove('snarkflix-clear-visible');
    }
    const suggestions = document.getElementById('search-suggestions');
    if (suggestions) suggestions.style.display = 'none';
    loadReviews(1, currentCategory, '', currentSort, currentScoreFilter, currentYearFilter).catch(() => {});
    syncSearchQueryToURL('');
}

// Keyboard shortcuts: "/" focuses search (see setupSearch), Esc closes suggestions then clears the box.
// There are deliberately no single-digit shortcuts: they used to swallow the "3" in "M3GAN".
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const input = document.getElementById('search-input');
            const suggestions = document.getElementById('search-suggestions');
            if (suggestions && suggestions.style.display === 'block') {
                suggestions.style.display = 'none';
            } else if (input && document.activeElement === input && input.value) {
                clearSearchBox();
            }
        }

        if (e.key === 's' && e.ctrlKey) {
            const sortSelect = document.getElementById('sort-dropdown');
            if (sortSelect) {
                e.preventDefault();
                sortSelect.focus();
            }
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling functions
function handleImageError(img) {
    try {
        // Prevent infinite retry loops - only try once
        if (!img || img.dataset.errorHandled === 'true') {
            return;
        }
        
        // Check if image actually failed (not just a false positive)
        // For picture elements, the browser may fire an error during srcset selection
        // but the fallback img should still load, so we check if it's actually loaded
        if (img.complete && img.naturalWidth > 0) {
            // Image actually loaded successfully, ignore the error
            return;
        }
        
        // For picture elements, give a small delay to allow the fallback to load
        const picture = img.closest && img.closest('picture');
        if (picture) {
            // Wait a moment to see if the fallback image loads
            setTimeout(() => {
                try {
                    // Check again if image loaded
                    if (img.complete && img.naturalWidth > 0) {
                        // Image loaded successfully, ignore the error
                        return;
                    }
                    // Image still failed, handle the error
                    handleImageErrorFinal(img);
                } catch (e) {
                    console.error('Error in image error handler timeout:', e);
                }
            }, 50);
            return;
        }
        
        // For regular img elements, handle error immediately
        handleImageErrorFinal(img);
    } catch (e) {
        console.error('Error in handleImageError:', e);
        // Don't let error handler break the page
    }
}

function handleImageErrorFinal(img) {
    try {
        // Double-check we haven't already handled this
        if (!img || img.dataset.errorHandled === 'true') {
            return;
        }
        
        // Final check if image loaded
        if (img.complete && img.naturalWidth > 0) {
            return;
        }
        
        console.warn('Image failed to load:', img.src);
        
        // Mark as handled immediately to prevent further calls
        img.dataset.errorHandled = 'true';
        
        // Set logo as fallback, but try PNG/WebP versions first
        // Use absolute path to avoid path resolution issues
        const logoPath = img.src && img.src.includes('http') 
            ? `${window.location.origin}/images/site-assets/logo.webp`
            : '/images/site-assets/logo.webp';
        img.src = logoPath;
        img.alt = 'Image not available - showing logo';
        if (img.classList) {
            img.classList.add('snarkflix-image-error');
            img.classList.add('snarkflix-image-failed');
        }
        
        // If logo also fails, try AVIF
        img.addEventListener('error', function logoError() {
            try {
                if (img.src && img.src.includes('logo.webp')) {
                    const avifPath = img.src.includes('http')
                        ? `${window.location.origin}/images/site-assets/logo.avif`
                        : '/images/site-assets/logo.avif';
                    img.src = avifPath;
                    img.removeEventListener('error', logoError);
                }
            } catch (e) {
                console.error('Error in logo fallback:', e);
            }
        }, { once: true });
    } catch (e) {
        console.error('Error in handleImageErrorFinal:', e);
        // Don't let error handler break the page
    }
}

function handleImageLoad(img) {
    img.classList.remove('snarkflix-image-error');
    img.classList.add('snarkflix-image-loaded');
    
    // Hide any loading overlay for this image
    const loadingOverlay = img.parentNode?.querySelector('.snarkflix-image-loading');
    if (loadingOverlay) {
        hideImageLoadingState(loadingOverlay);
    }
}

function setupImageErrorHandling() {
    // Handle existing images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Skip if image is already in error state or handled
        if (img.dataset.errorHandled === 'true' || img.classList.contains('snarkflix-image-error')) {
            return;
        }
        
        img.addEventListener('error', () => {
            // Skip if already handled
            if (img.dataset.errorHandled === 'true') return;
            handleImageError(img);
        });
        img.addEventListener('load', () => handleImageLoad(img));
    });
    
    // Handle dynamically loaded images
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Handle single image elements
                    if (node.tagName === 'IMG') {
                        node.addEventListener('error', () => {
                            // Skip if already handled
                            if (node.dataset.errorHandled === 'true') return;
                            handleImageError(node);
                        });
                        node.addEventListener('load', () => handleImageLoad(node));
                    }
                    // Handle images within added nodes
                    const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                    images.forEach(img => {
                        img.addEventListener('error', () => {
                            // Skip if already handled
                            if (img.dataset.errorHandled === 'true') return;
                            handleImageError(img);
                        });
                        img.addEventListener('load', () => handleImageLoad(img));
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function handleFetchError(error, context = 'Unknown operation') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'snarkflix-error-message';
    errorMessage.innerHTML = `
        <div class="snarkflix-error-content">
            <h3>Oops! Something went wrong</h3>
            <p>We encountered an error while ${context.toLowerCase()}. Please try again.</p>
            <button class="sf-btn sf-btn--cta snarkflix-dismiss-btn">
                Dismiss
            </button>
        </div>
    `;
    errorMessage.querySelector('.snarkflix-dismiss-btn').addEventListener('click', () => errorMessage.remove());

    // Add error message to page
    document.body.appendChild(errorMessage);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.remove();
        }
    }, 5000);
}

function handleReviewLoadError(error) {
    console.error('Error loading reviews:', error);
    
    const reviewsGrid = document.getElementById('reviews-grid');
    if (reviewsGrid) {
        reviewsGrid.innerHTML = `
            <div class="snarkflix-error-state">
                <h3>Couldn't load the archive</h3>
                <p>Something went wrong pulling reviews into the page. Give it a refresh — if it persists, I'll be annoyed on your behalf.</p>
                <button class="sf-btn sf-btn--cta snarkflix-reload-btn">
                    Refresh page
                </button>
            </div>
        `;
        reviewsGrid.querySelector('.snarkflix-reload-btn').addEventListener('click', () => location.reload());
    }
}

function handleSearchError(error) {
    console.error('Error during search:', error);
    
    const searchInput = document.querySelector('.snarkflix-search-input');
    if (searchInput) {
        searchInput.placeholder = 'Search is having a moment — try again in a tick';
        searchInput.disabled = true;
        
        setTimeout(() => {
            searchInput.placeholder = 'Search films, cast, or a stray quote…';
            searchInput.disabled = false;
        }, 3000);
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    handleFetchError(event.error, 'page operation');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleFetchError(event.reason, 'async operation');
});


// Image error handling is now set up in initializeApp via setupEventListeners

// Loading States and Indicators
function showLoadingSpinner(container, message = 'Loading...') {
    const spinner = document.createElement('div');
    spinner.className = 'snarkflix-loading-spinner';
    spinner.innerHTML = `
        <div class="snarkflix-spinner"></div>
        <span class="snarkflix-loading-text">${message}</span>
    `;
    
    if (container) {
        container.appendChild(spinner);
    }
    
    return spinner;
}

function hideLoadingSpinner(spinner) {
    if (spinner && spinner.parentNode) {
        spinner.parentNode.removeChild(spinner);
    }
}

function showImageLoadingState(img) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'snarkflix-image-loading';
    loadingOverlay.innerHTML = '<div class="snarkflix-spinner"></div>';
    
    // Position the loading overlay over the image
    const imgContainer = img.parentNode;
    if (imgContainer) {
        imgContainer.style.position = 'relative';
        imgContainer.appendChild(loadingOverlay);
    }
    
    return loadingOverlay;
}

function hideImageLoadingState(loadingOverlay) {
    if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.parentNode.removeChild(loadingOverlay);
    }
}

function showSearchLoading() {
    const searchContainer = document.querySelector('.snarkflix-search-container');
    if (searchContainer) {
        const existingSpinner = searchContainer.querySelector('.snarkflix-loading-spinner');
        if (!existingSpinner) {
            const firstLine = pickSnarkflixDelightLine(SNARKFLIX_DELIGHT_SEARCH_LINES);
            const spinner = showLoadingSpinner(searchContainer, firstLine);
            spinner.className += ' snarkflix-search-loading';
            if (snarkflixSearchLoadingRotateId) {
                clearInterval(snarkflixSearchLoadingRotateId);
                snarkflixSearchLoadingRotateId = null;
            }
            snarkflixSearchLoadingRotateId = setInterval(() => {
                const textEl = searchContainer.querySelector('.snarkflix-search-loading .snarkflix-loading-text');
                if (!textEl) return;
                const next = pickSnarkflixDelightLine(SNARKFLIX_DELIGHT_SEARCH_LINES, textEl.textContent);
                textEl.textContent = next;
            }, 2400);
        }
    }
}

function hideSearchLoading() {
    if (snarkflixSearchLoadingRotateId) {
        clearInterval(snarkflixSearchLoadingRotateId);
        snarkflixSearchLoadingRotateId = null;
    }
    const searchSpinner = document.querySelector('.snarkflix-search-loading');
    if (searchSpinner) {
        hideLoadingSpinner(searchSpinner);
    }
}

function showReviewsLoading() {
    const reviewsGrid = document.getElementById('reviews-grid');
    if (reviewsGrid) {
        // Clear existing content
        reviewsGrid.innerHTML = '';
        const spinner = showLoadingSpinner(reviewsGrid, 'Loading reviews...');
        spinner.className += ' snarkflix-reviews-loading';
    }
}

function hideReviewsLoading() {
    const reviewsSpinner = document.querySelector('.snarkflix-reviews-loading');
    if (reviewsSpinner) {
        hideLoadingSpinner(reviewsSpinner);
    }
}

// Review page skeleton loading
function showReviewLoadingSkeleton() {
    // Remove any existing skeleton
    hideReviewLoadingSkeleton();

    setHomeVisible(false);
    
    // Create skeleton wrapper
    const skeletonWrapper = document.createElement('div');
    skeletonWrapper.className = 'snarkflix-review-skeleton-wrapper';
    skeletonWrapper.innerHTML = `
        <div class="snarkflix-review-skeleton">
            <div class="snarkflix-skeleton-header">
                <div class="snarkflix-skeleton-line snarkflix-skeleton-title"></div>
                <div class="snarkflix-skeleton-line snarkflix-skeleton-meta"></div>
                <div class="snarkflix-skeleton-line snarkflix-skeleton-score"></div>
            </div>
            <div class="snarkflix-skeleton-hero">
                <div class="snarkflix-skeleton-image"></div>
            </div>
            <div class="snarkflix-skeleton-content">
                <div class="snarkflix-skeleton-line"></div>
                <div class="snarkflix-skeleton-line"></div>
                <div class="snarkflix-skeleton-line snarkflix-skeleton-short"></div>
                <div class="snarkflix-skeleton-line"></div>
                <div class="snarkflix-skeleton-line"></div>
                <div class="snarkflix-skeleton-line snarkflix-skeleton-short"></div>
            </div>
        </div>
    `;
    
    insertReviewWrapperInDocument(skeletonWrapper);
}

function hideReviewLoadingSkeleton() {
    const skeleton = document.querySelector('.snarkflix-review-skeleton-wrapper');
    if (skeleton) {
        skeleton.remove();
    }
}

function removeReviewNotFoundPage() {
    const el = document.querySelector('.snarkflix-review-not-found-wrap');
    if (el) el.remove();
}

/**
 * In-SPA “missing review” view (static hosts still 404 on /review/:id.html when absent).
 */
function showReviewNotFoundPage(reviewId) {
    removeReviewNotFoundPage();
    removeStructuredData();

    document.body.classList.add('snarkflix-review-page');

    document.title = 'Review not found | Snarkflix';

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `${HOMEPAGE_META.canonicalHref}`);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', 'No Snarkflix review matches this link. Browse all reviews on the homepage.');
    }
    updateMetaTag('robots', 'noindex, nofollow');

    removeOgArticleMeta();
    const logoUrl = getAbsoluteUrl('images/site-assets/logo.avif');
    updateMetaTag('og:title', 'Review not found | Snarkflix');
    updateMetaTag('og:description', 'This review does not exist or the link is wrong.');
    updateMetaTag('og:image', logoUrl);
    updateMetaTag('og:url', `${SNARKFLIX_SITE_ORIGIN}/review/${reviewId}`);
    updateMetaTag('og:type', 'website');
    updateMetaTag('twitter:title', 'Review not found | Snarkflix');
    updateMetaTag('twitter:description', 'This review does not exist or the link is wrong.');
    updateMetaTag('twitter:image', logoUrl);
    updateMetaTag('twitter:card', 'summary_large_image');

    const existingReviewContent = document.querySelector('.snarkflix-review-content-wrapper');
    if (existingReviewContent) existingReviewContent.remove();

    setHomeVisible(false);

    const wrap = document.createElement('div');
    wrap.className = 'snarkflix-review-not-found-wrap';
    wrap.innerHTML = `
        <div class="snarkflix-review-not-found-inner">
            <p class="snarkflix-review-not-found-code">404</p>
            <h1 class="snarkflix-review-not-found-title">No review here</h1>
            <p class="snarkflix-review-not-found-body">There is no review with id <strong>${String(reviewId)}</strong>. The URL may be mistyped or the review was removed.</p>
            <p class="snarkflix-review-not-found-actions">
                <button type="button" class="sf-btn sf-btn--cta snarkflix-review-not-found-home">Back to all reviews</button>
            </p>
        </div>
    `;
    const homeBtn = wrap.querySelector('.snarkflix-review-not-found-home');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => returnToHomepage());
    }
    insertReviewWrapperInDocument(wrap);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update meta tags for review (extracted for reuse)
// Add Review Structured Data (JSON-LD)
function addReviewStructuredData(review) {
    // Remove existing review structured data if present
    const existingScript = document.querySelector('script[type="application/ld+json"][data-schema="review"]');
    if (existingScript) {
        existingScript.remove();
    }

    const datePublished = parseReviewPublishDateISO(review);
    const imageUrl = getAbsoluteUrl(review.imageUrl);
    const pageUrl = `${SNARKFLIX_SITE_ORIGIN}/review/${review.id}`;
    const reviewBody = review.content.substring(0, 500) + (review.content.length > 500 ? '...' : '');
    const descPlain = stripTldrPrefix(review.aiSummary).replace(/\s+/g, ' ').trim();
    const description = descPlain.length > 360 ? `${descPlain.slice(0, 357)}...` : descPlain;
    const genreLabel = review.category.charAt(0).toUpperCase() + review.category.slice(1);
    const filmReleaseISO = getMovieTheatricalReleaseISO(review);

    const reviewSchema = {
        '@context': 'https://schema.org',
        '@type': 'Review',
        '@id': `${pageUrl}#review`,
        'url': pageUrl,
        'name': `${formatReviewHeadingPlain(review)} — film review`,
        'headline': `${formatReviewHeadingPlain(review)} review`,
        'description': description || undefined,
        'inLanguage': 'en-GB',
        'datePublished': datePublished,
        'reviewBody': reviewBody,
        'image': imageUrl,
        'author': {
            '@type': 'Person',
            'name': 'Snarkflix'
        },
        'publisher': {
            '@type': 'Organization',
            '@id': `${SNARKFLIX_SITE_ORIGIN}/#organization`,
            'name': 'Snarkflix',
            'url': `${SNARKFLIX_SITE_ORIGIN}/`,
            'logo': {
                '@type': 'ImageObject',
                'url': `${SNARKFLIX_SITE_ORIGIN}/images/site-assets/logo.avif`
            }
        },
        'itemReviewed': (() => {
            const movie = {
                '@type': 'Movie',
                'name': review.title,
                'url': pageUrl,
                'image': imageUrl,
                'genre': genreLabel
            };
            if (filmReleaseISO) movie.datePublished = filmReleaseISO;
            return movie;
        })(),
        'reviewRating': {
            '@type': 'Rating',
            'ratingValue': review.aiScore.toString(),
            'bestRating': '100',
            'worstRating': '0',
            'name': 'SnarkAI score'
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${pageUrl}#webpage`,
            'url': pageUrl
        }
    };

    if (!reviewSchema.description) delete reviewSchema.description;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'review');
    script.textContent = JSON.stringify(reviewSchema);
    document.head.appendChild(script);
}

// Add Breadcrumb Structured Data (JSON-LD)
function addBreadcrumbStructuredData(review) {
    // Remove existing breadcrumb structured data if present
    const existingScript = document.querySelector('script[type="application/ld+json"][data-schema="breadcrumb"]');
    if (existingScript) {
        existingScript.remove();
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': `${SNARKFLIX_SITE_ORIGIN}/`
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Reviews',
                'item': `${SNARKFLIX_SITE_ORIGIN}/#reviews`
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': formatReviewHeadingPlain(review),
                'item': `${SNARKFLIX_SITE_ORIGIN}/review/${review.id}`
            }
        ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'breadcrumb');
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);
}

// Remove structured data when returning to homepage
function removeStructuredData() {
    const reviewScript = document.querySelector('script[type="application/ld+json"][data-schema="review"]');
    const breadcrumbScript = document.querySelector('script[type="application/ld+json"][data-schema="breadcrumb"]');
    
    if (reviewScript) reviewScript.remove();
    if (breadcrumbScript) breadcrumbScript.remove();
}

// Generate optimized meta description (under 160 chars with keywords)
function generateMetaDescription(review) {
    const headingTitle = formatReviewHeadingPlain(review);
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
    
    // Ensure it's under 160 characters
    if (description.length > 160) {
        description = description.substring(0, 157) + '...';
    }
    
    return description;
}

function updateMetaTagsForReview(review) {
    // Update page title - consider year at beginning for recent movies
    // Declare currentYear once at the top of the function
    const currentYear = new Date().getFullYear();
    const isRecent = review.releaseYear >= currentYear - 1;
    
    let title;
    if (isRecent) {
        title = `${review.releaseYear} ${stripTrailingTitleYear(review.title)} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
    } else {
        title = `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
    }
    
    document.title = title;
    
    // Update meta description with optimized version
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', generateMetaDescription(review));
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `${SNARKFLIX_SITE_ORIGIN}/review/${review.id}`);

    const datePublished = parseReviewPublishDateISO(review);
    const publishedDateTime = `${datePublished}T12:00:00.000Z`;
    updateMetaTag('article:published_time', publishedDateTime);
    updateMetaTag('article:modified_time', publishedDateTime);
    updateMetaTag('article:author', 'Snarkflix');
    updateMetaTag('article:section', review.category.charAt(0).toUpperCase() + review.category.slice(1));

    const reviewKeywords = `Snarkflix, ${review.title}, ${review.releaseYear}, ${review.category} film review, British film blog, SnarkAI ${review.aiScore}`;
    const metaKwEl = document.querySelector('meta[name="keywords"]');
    if (metaKwEl) {
        metaKwEl.setAttribute('content', reviewKeywords.slice(0, 400));
    }
    
    // Update Open Graph meta tags
    // Reuse currentYear and isRecent from above
    const ogTitle = isRecent
        ? `${review.releaseYear} ${stripTrailingTitleYear(review.title)} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`
        : `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
    
    updateMetaTag('og:title', ogTitle);
    updateMetaTag('og:description', generateMetaDescription(review));
    // Set Open Graph image with proper dimensions and fallback
    const ogImageUrl = getAbsoluteUrl(review.imageUrl);
    updateMetaTag('og:image', ogImageUrl);
    updateMetaTag('og:image:secure_url', ogImageUrl);
    updateMetaTag('og:image:type', 'image/webp');
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:alt', `${review.title} (${review.releaseYear}) movie review poster - SnarkAI Score: ${review.aiScore}/100`);
    
    // Add fallback image if main image fails
    const fallbackImageUrl = getAbsoluteUrl('images/site-assets/logo.avif');
    // Note: OG doesn't support fallback directly, but we can set a default in index.html
    updateMetaTag('og:site_name', 'Snarkflix');
    updateMetaTag('og:locale', 'en_GB');
    updateMetaTag('og:url', `${SNARKFLIX_SITE_ORIGIN}/review/${review.id}`);
    updateMetaTag('og:type', 'article');
    
    // WhatsApp specific meta tags
    updateMetaTag('og:image:url', getAbsoluteUrl(review.imageUrl));
    updateMetaTag('twitter:image:src', getAbsoluteUrl(review.imageUrl));
    
    // Update Twitter Card meta tags
    // Reuse currentYear and isRecent from above
    const twitterTitle = isRecent
        ? `${review.releaseYear} ${stripTrailingTitleYear(review.title)} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`
        : `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
    
    updateMetaTag('twitter:title', twitterTitle);
    updateMetaTag('twitter:description', generateMetaDescription(review));
    updateMetaTag('twitter:image', getAbsoluteUrl(review.imageUrl));
    updateMetaTag('twitter:url', `${SNARKFLIX_SITE_ORIGIN}/review/${review.id}`);
    updateMetaTag('twitter:card', 'summary_large_image');
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadReviews,
        createReviewElement,
        snarkflixReviews,
        setupKeyboardNavigation,
        isTypingTarget,
        clearSearchBox,
        renderCategoryChips,
        setCategory
    };
}

// Make functions available globally for testing
window.handleImageError = handleImageError;
window.handleImageLoad = handleImageLoad;
