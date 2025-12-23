// Snarkflix JavaScript - Movie Review Blog

// Helper function to create responsive image HTML
function createResponsiveImage(imageUrl, alt, loading = 'lazy') {
    // Ensure image URL is absolute (starts with /) to avoid path resolution issues on review pages
    let normalizedImageUrl = imageUrl;
    if (!normalizedImageUrl.startsWith('http') && !normalizedImageUrl.startsWith('/')) {
        normalizedImageUrl = '/' + normalizedImageUrl;
    }
    
    // Extract base path and extension
    const pathParts = normalizedImageUrl.split('/');
    const filename = pathParts[pathParts.length - 1];
    const basePath = pathParts.slice(0, -1).join('/');
    const nameWithoutExt = filename.replace(/\.(webp|avif|png)$/, '');
    const ext = filename.match(/\.(webp|avif|png)$/)?.[1] || 'webp';
    
    // Check if responsive versions exist by looking for common patterns
    // Only use responsive images for images that we know have responsive versions
    const hasResponsiveVersions = normalizedImageUrl.includes('fantastic-four') || 
                                 normalizedImageUrl.includes('palm-springs') || 
                                 normalizedImageUrl.includes('superman') || 
                                 normalizedImageUrl.includes('iron-giant') ||
                                 normalizedImageUrl.includes('kpop-demonhunters') ||
                                 normalizedImageUrl.includes('zootopia') ||
                                 normalizedImageUrl.includes('care-2018') ||
                                 normalizedImageUrl.includes('logo');
    
    if (!hasResponsiveVersions) {
        // Fall back to simple img tag for images without responsive versions
        const fetchPriority = loading === 'eager' ? ' fetchpriority="high"' : '';
        // Add blur-up placeholder for lazy loaded images
        const placeholderStyle = loading === 'lazy' ? ' style="background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"' : '';
        return `<img src="${normalizedImageUrl}" alt="${alt}" loading="${loading}"${fetchPriority}${placeholderStyle}>`;
    }
    
    // Create responsive image HTML for images with responsive versions
    // Use WebP format with responsive sizes and PNG fallback
    // Handle different naming patterns
    let srcset;
    if (normalizedImageUrl.includes('kpop-demonhunters') || normalizedImageUrl.includes('zootopia')) {
        // Kpop Demon Hunters and Zootopia use old naming pattern
        srcset = `${basePath}/${nameWithoutExt}-sm.webp 320w, ${basePath}/${nameWithoutExt}-md.webp 640w, ${basePath}/${nameWithoutExt}-lg.webp 1024w, ${basePath}/${nameWithoutExt}-xl.webp 1920w`;
    } else {
        // Other images use new naming pattern
        srcset = `${basePath}/${nameWithoutExt}-400w.webp 400w, ${basePath}/${nameWithoutExt}-800w.webp 800w, ${basePath}/${nameWithoutExt}-1200w.webp 1200w`;
    }
    
    // Use appropriate sizes based on naming pattern
    const sizes = (normalizedImageUrl.includes('kpop-demonhunters') || normalizedImageUrl.includes('zootopia')) 
        ? "(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
        : "(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px";
    
    // Add fetchpriority for eager loading (LCP optimization)
    const fetchPriority = loading === 'eager' ? ' fetchpriority="high"' : '';
    
    // Ensure srcset paths are also absolute
    const normalizedSrcset = srcset.split(', ').map(item => {
        const [path, size] = item.split(' ');
        // If path doesn't start with / or http, make it absolute
        const normalizedPath = (!path.startsWith('/') && !path.startsWith('http')) 
            ? '/' + path 
            : path;
        return `${normalizedPath} ${size}`;
    }).join(', ');
    
    // Add blur-up placeholder for lazy loaded images
    const placeholderStyle = loading === 'lazy' ? ' style="background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"' : '';
    
    return `
        <picture>
            <source srcset="${normalizedSrcset}" 
                    sizes="${sizes}" 
                    type="image/webp">
            <img src="${normalizedImageUrl}" alt="${alt}" loading="${loading}"${fetchPriority}${placeholderStyle}>
        </picture>
    `;
}

// Import review data from external file
// Note: In a real application, this would be loaded via script tag or module import
// For now, we'll use the data directly from reviews-data.js
// The reviews are now loaded from reviews-data.js via script tag

// Category data
const snarkflixCategories = [
    { name: "Action", slug: "action", count: 15, color: "action" },
    { name: "Adventure", slug: "adventure", count: 1, color: "adventure" },
    { name: "Animation", slug: "animation", count: 7, color: "animation" },
    { name: "Comedy", slug: "comedy", count: 8, color: "comedy" },
    { name: "Crime & Mystery", slug: "crime-mystery", count: 1, color: "crime-mystery" },
    { name: "Drama", slug: "drama", count: 6, color: "drama" },
    { name: "Experimental", slug: "experimental", count: 0, color: "other" },
    { name: "Fantasy", slug: "fantasy", count: 6, color: "fantasy" },
    { name: "Horror", slug: "horror", count: 4, color: "horror" },
    { name: "Historical", slug: "historical", count: 0, color: "other" },
    { name: "Romance", slug: "romance", count: 0, color: "other" },
    { name: "Sci-Fi", slug: "scifi", count: 11, color: "scifi" },
    { name: "Thriller", slug: "thriller", count: 2, color: "thriller" },
    { name: "Western", slug: "western", count: 1, color: "western" },
    { name: "Other", slug: "other", count: 1, color: "other" },
    { name: "Musical", slug: "musical", count: 1, color: "other" }
];

// DOM elements
let reviewsGrid;
let loadMoreBtn;
let currentPage = 1;
const reviewsPerPage = 6;
let currentSort = 'latest';
let currentCategory = 'all';
let currentSearchTerm = '';
let currentScoreFilter = '';
let currentYearFilter = '';
let allFilteredReviews = []; // Store all filtered reviews for progress indicator

// Initialize the application
// Wait for both DOM and reviews data to be ready
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
    
    // Wait for reviews data to be available before initializing
    waitForReviewsData(function() {
        initializeApp();
        
        // Check for review parameter and update meta tags before checking for shared review
        const urlParams = new URLSearchParams(window.location.search);
        const reviewParam = urlParams.get('review');
        
        if (reviewParam) {
            const reviewId = parseInt(reviewParam);
            const review = snarkflixReviews.find(r => r.id === reviewId);
            
            if (review) {
                // Update meta tags for social media sharing (using extracted function)
                updateMetaTagsForReview(review);
            }
        }
        
        checkForSharedReview();
    });
});

// Listen for hash changes (back/forward navigation) - legacy support
window.addEventListener('hashchange', function() {
    checkForSharedReview();
});

// Listen for popstate (back/forward navigation with History API)
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.type === 'review') {
        const reviewId = event.state.reviewId;
        const review = snarkflixReviews.find(r => r.id === reviewId);
        if (review) {
            showReviewLoadingSkeleton();
            setTimeout(() => {
                createReviewPage(review);
                hideReviewLoadingSkeleton();
            }, 150);
        }
    } else {
        // Return to homepage
        returnToHomepage();
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
            // Show loading skeleton
            showReviewLoadingSkeleton();
            
            // Update state for History API
            window.history.replaceState({ reviewId: reviewId, type: 'review' }, '', `/review/${reviewId}`);
            
            // Small delay to show skeleton, then create review page
            setTimeout(() => {
                createReviewPage(review);
                hideReviewLoadingSkeleton();
            }, 150);
        }
    } else if ((hash === '' || hash === '#') && !reviewParam && !pathMatch) {
        // If no review in URL, ensure we're on homepage
        if (path !== '/' && !path.endsWith('/index.html') && !path.endsWith('index.html')) {
            returnToHomepage();
        }
    }
}

function initializeApp() {
    // Get DOM elements
    reviewsGrid = document.getElementById('reviews-grid');
    loadMoreBtn = document.getElementById('load-more-btn');
    
    // Initialize components
    loadReviews();
    setupEventListeners();
    setupAccessibility();
    setupCategoryFiltering();
    setupSortDropdown();
    setupSearch();
    setupBackToTop();
    setupKeyboardNavigation();
    setupHeaderNavigation();
}

function setupHeaderNavigation() {
    // Update header logo to use returnToHomepage function
    const headerLogo = document.querySelector('.snarkflix-logo h1 a');
    if (headerLogo) {
        headerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            returnToHomepage();
        });
    }
    
    // Update navigation links to use returnToHomepage function
    const navLinks = document.querySelectorAll('.snarkflix-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            returnToHomepage();
            // Scroll to the specific section after a short delay
            setTimeout(() => {
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        });
    });
}

function loadReviews(page = 1, category = currentCategory, searchTerm = currentSearchTerm, sort = currentSort, scoreFilter = currentScoreFilter, yearFilter = currentYearFilter) {
    try {
        // Check if reviewsGrid exists
        if (!reviewsGrid) {
            console.warn('Reviews grid not found, waiting for DOM...');
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
    
    // Sort based on current sort option
    filteredReviews = filteredReviews.sort((a, b) => {
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
    }
    
    // Render only the new reviews for this page
    reviewsToShow.forEach((review, index) => {
        const reviewElement = createReviewElement(review);
        // Add animation delay based on index for staggered effect
        reviewElement.style.animationDelay = `${index * 0.05}s`;
        reviewsGrid.appendChild(reviewElement);
    });
    
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
        announceToScreenReader(`Loaded ${reviewsToShow.length} review${reviewsToShow.length !== 1 ? 's' : ''}. ${filteredReviews.length} total review${filteredReviews.length !== 1 ? 's' : ''} available.`);
        
        // Update current page
        currentPage = page;
    } catch (error) {
        console.error('Error loading reviews:', error);
        handleReviewLoadError(error);
    }
}

function createReviewElement(review) {
    const reviewCard = document.createElement('article');
    reviewCard.className = 'snarkflix-review-card';
    
    // Add score-based class for color coding
    const scoreClass = getScoreClass(review.aiScore);
    
    // Add featured class for high-scoring reviews (90+)
    if (review.aiScore >= 90) {
        reviewCard.classList.add('snarkflix-review-featured');
    }
    
    reviewCard.setAttribute('data-category', review.category);
    reviewCard.setAttribute('data-score', review.aiScore);
    reviewCard.setAttribute('tabindex', '0');
    reviewCard.setAttribute('role', 'article');
    reviewCard.setAttribute('aria-label', `Review of ${review.title}`);
    
    reviewCard.innerHTML = `
        <div class="snarkflix-review-image">
            ${createResponsiveImage(review.imageUrl, `Movie poster for ${review.title} (${review.releaseYear})`, 'lazy')}
        </div>
        <div class="snarkflix-review-content">
            <h3 class="snarkflix-review-title">${review.title}</h3>
            <div class="snarkflix-review-meta">
                <span class="snarkflix-review-date">${review.publishDate}</span>
                <span class="snarkflix-review-duration">${review.readingDuration}</span>
                <span class="snarkflix-review-score ${scoreClass}">SnarkAI: ${review.aiScore}/100</span>
            </div>
            <p class="snarkflix-review-summary">${review.aiSummary}</p>
            <p class="snarkflix-review-tagline">"${review.tagline}"</p>
            <div class="snarkflix-review-share">
                <button class="snarkflix-share-btn snarkflix-share-twitter" data-review-id="${review.id}" title="Share on Twitter">
                    <svg class="snarkflix-share-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </button>
                <button class="snarkflix-share-btn snarkflix-share-facebook" data-review-id="${review.id}" title="Share on Facebook">
                    <svg class="snarkflix-share-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                </button>
                <button class="snarkflix-share-btn snarkflix-share-copy" data-review-id="${review.id}" title="Copy link">
                    <svg class="snarkflix-share-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Add click handler for navigation (but not for share buttons)
    reviewCard.addEventListener('click', (e) => {
        // Don't navigate if clicking on share buttons
        if (!e.target.closest('.snarkflix-share-btn')) {
            navigateToReview(review.id);
        }
    });
    
    // Add share button event listeners
    const shareButtons = reviewCard.querySelectorAll('.snarkflix-share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            const platform = button.classList[1].replace('snarkflix-share-', '');
            shareReview(review, platform);
        });
    });
    
    // Add keyboard navigation
    reviewCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigateToReview(review.id);
        }
    });
    
    // Add image loading state
    const img = reviewCard.querySelector('img');
    if (img) {
        // Show loading state when image starts loading
        img.addEventListener('loadstart', () => {
            showImageLoadingState(img);
        });
        
        // Hide loading state when image loads
        img.addEventListener('load', () => {
            handleImageLoad(img);
        });
        
        // Handle image errors
        img.addEventListener('error', () => {
            handleImageError(img);
        });
    }
    
    return reviewCard;
}

// Get score class for color coding
function getScoreClass(score) {
    // Green for 80+, Yellow for 60-79, Red for <60
    if (score >= 80) {
        return 'snarkflix-score-excellent'; // Green
    } else if (score >= 60) {
        return 'snarkflix-score-good'; // Yellow
    } else if (score >= 40) {
        return 'snarkflix-score-fair'; // Red
    } else {
        return 'snarkflix-score-poor'; // Darker red
    }
}

function navigateToReview(reviewId) {
    const review = snarkflixReviews.find(r => r.id === reviewId);
    if (review) {
        // Show loading skeleton
        showReviewLoadingSkeleton();
        
        // Update URL using History API
        const newUrl = `/review/${reviewId}`;
        window.history.pushState({ reviewId: reviewId, type: 'review' }, '', newUrl);
        
        // Update meta tags for SEO
        updateMetaTagsForReview(review);
        
        // Small delay to show skeleton, then create review page
        setTimeout(() => {
            createReviewPage(review);
            hideReviewLoadingSkeleton();
        }, 150);
    }
}

function shareReview(review, platform) {
    // Create a proper URL that works for both local and production
    let baseUrl;
    if (window.location.protocol === 'file:') {
        // For local file:// URLs, use a relative path
        baseUrl = window.location.href.replace(/\/[^\/]*$/, '/index.html');
    } else {
        // For http/https URLs, use the current origin and path
        baseUrl = window.location.origin + window.location.pathname;
    }
    
    // Always use the custom domain for sharing
    const reviewUrl = `https://snarkflix.com/review/${review.id}`;
    const encodedUrl = encodeURIComponent(reviewUrl);
    const encodedTitle = encodeURIComponent(review.title);
    const encodedDescription = encodeURIComponent(review.tagline);
    const encodedHashtags = encodeURIComponent('#Snarkflix #MovieReview #FilmCritic');
    
    let shareUrl = '';
    
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}%20-%20${encodedDescription}&url=${encodedUrl}&hashtags=${encodedHashtags}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%20-%20${encodedDescription}`;
            break;
        case 'copy':
            // Copy to clipboard
            navigator.clipboard.writeText(reviewUrl).then(() => {
                showShareNotification('Link copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = reviewUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showShareNotification('Link copied to clipboard!');
            });
            return;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function showShareNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'snarkflix-share-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--snarkflix-accent);
        color: var(--snarkflix-dark);
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
    `;
    
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

function insertImagesInContent(review) {
    let content = review.content;
    
    // First, process inline image markers [IMAGE:path]
    content = content.replace(/\[IMAGE:([^\]]+)\]/g, (match, imagePath) => {
        return `
            <div class="snarkflix-review-image-inline">
                <img src="${imagePath}" alt="Scene from ${review.title} (${review.releaseYear})" class="snarkflix-review-img-inline" loading="lazy" width="400" height="300" style="background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;">
            </div>
        `;
    });
    
    // Split into paragraphs after processing inline images
    const paragraphs = content.split('\n\n');
    const allImages = [];
    
    // Collect remaining available images (not already used inline)
    if (review.additionalImage) {
        allImages.push(review.additionalImage);
    }
    if (review.additionalImages) {
        // Filter out images that were already used inline
        const inlineImages = (review.content.match(/\[IMAGE:([^\]]+)\]/g) || [])
            .map(match => match.replace(/\[IMAGE:([^\]]+)\]/, '$1'));
        const remainingImages = review.additionalImages.filter(img => !inlineImages.includes(img));
        allImages.push(...remainingImages);
    }
    
    // If no remaining images, just return formatted paragraphs
    if (allImages.length === 0) {
        return paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
    }
    
    // Calculate where to insert remaining images (spread them throughout the content)
    const totalParagraphs = paragraphs.length;
    const imagePositions = [];
    
    if (allImages.length === 1) {
        // Place single image after first third of content
        imagePositions.push(Math.floor(totalParagraphs / 3));
    } else if (allImages.length === 2) {
        // Place images at 1/3 and 2/3 points
        imagePositions.push(Math.floor(totalParagraphs / 3));
        imagePositions.push(Math.floor((totalParagraphs * 2) / 3));
    } else if (allImages.length >= 3) {
        // Place images at 1/4, 1/2, and 3/4 points
        imagePositions.push(Math.floor(totalParagraphs / 4));
        imagePositions.push(Math.floor(totalParagraphs / 2));
        imagePositions.push(Math.floor((totalParagraphs * 3) / 4));
    }
    
    let result = '';
    let imageIndex = 0;
    
    paragraphs.forEach((paragraph, index) => {
        result += `<p>${paragraph}</p>`;
        
        // Insert image if this is a designated position
        if (imagePositions.includes(index) && imageIndex < allImages.length) {
            result += `
                <div class="snarkflix-review-image-inline">
                    <img src="${allImages[imageIndex]}" alt="Scene from ${review.title} (${review.releaseYear})" class="snarkflix-review-img-inline" loading="lazy" width="400" height="300" style="background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;">
                </div>
            `;
            imageIndex++;
        }
    });
    
    return result;
}

// Helper function to update meta tags
function updateMetaTag(property, content) {
    let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                  document.querySelector(`meta[name="${property}"]`);
    
    if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
            metaTag.setAttribute('property', property);
        } else {
            metaTag.setAttribute('name', property);
        }
        document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
}

// Helper function to get absolute URL for images
function getAbsoluteUrl(imagePath) {
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // For local development or relative paths
    if (window.location.protocol === 'file:') {
        return `${window.location.origin}/${imagePath}`;
    } else {
        return `${window.location.origin}/${imagePath}`;
    }
}

// Helper function to convert YouTube watch URL to embed URL
function convertToEmbedUrl(youtubeUrl) {
    if (!youtubeUrl) return '';
    
    // Extract video ID from various YouTube URL formats
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    // Fallback: try to extract from any YouTube URL
    const fallbackMatch = youtubeUrl.match(/[?&]v=([^&\n?#]+)/);
    if (fallbackMatch) {
        return `https://www.youtube.com/embed/${fallbackMatch[1]}`;
    }
    
    return youtubeUrl; // Return original if we can't parse it
}

function createReviewPage(review) {
    // Add page transition class
    document.body.classList.add('snarkflix-page-transitioning');
    
    // Add class to body to indicate we're on a review page
    document.body.classList.add('snarkflix-review-page');
    
    // Update meta tags (using extracted function)
    updateMetaTagsForReview(review);
    
    // Update existing breadcrumb
    const existingBreadcrumb = document.querySelector('.snarkflix-breadcrumb');
    if (existingBreadcrumb) {
        existingBreadcrumb.style.display = 'block';
        const breadcrumbList = existingBreadcrumb.querySelector('ol');
        if (breadcrumbList) {
            breadcrumbList.innerHTML = `
                <li><a href="index.html">Home</a></li>
                <li><a href="index.html#reviews">Reviews</a></li>
                <li aria-current="page">${review.title}</li>
            `;
        }
    }
    const sectionsToHide = document.querySelectorAll('section:not(.snarkflix-header):not(.snarkflix-footer)');
    sectionsToHide.forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove any existing review content
    const existingReviewContent = document.querySelector('.snarkflix-review-content-wrapper');
    if (existingReviewContent) {
        existingReviewContent.remove();
    }
    
    // Create the review content wrapper
    const reviewWrapper = document.createElement('div');
    reviewWrapper.className = 'snarkflix-review-content-wrapper';
    reviewWrapper.innerHTML = createReviewContentHTML(review);
    
    // Immediately attach error handlers to images before they start loading
    // This prevents race conditions where images fail before handlers are attached
    const images = reviewWrapper.querySelectorAll('img');
    images.forEach(img => {
        if (img.dataset.errorHandled !== 'true') {
            img.addEventListener('error', () => {
                if (img.dataset.errorHandled !== 'true') {
                    handleImageError(img);
                }
            }, { once: true });
            img.addEventListener('load', () => handleImageLoad(img), { once: true });
        }
    });
    
    // Insert the review content after the header
    const header = document.querySelector('.snarkflix-header');
    if (header && header.nextSibling) {
        header.parentNode.insertBefore(reviewWrapper, header.nextSibling);
    }
    
    // Add share button event listeners
    const shareButtons = reviewWrapper.querySelectorAll('.snarkflix-share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = button.classList[1].replace('snarkflix-share-', '');
            shareReview(review, platform);
        });
    });
    
    // Load related reviews
    setTimeout(() => {
        loadRelatedReviews(review);
    }, 100);
    
    // Scroll to top of the new page with smooth behavior
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Remove transition class after animation completes
    setTimeout(() => {
        document.body.classList.remove('snarkflix-page-transitioning');
        document.body.classList.add('snarkflix-page-loaded');
    }, 300);
}

function returnToHomepage() {
    // Add page transition class
    document.body.classList.add('snarkflix-page-transitioning');
    
    // Update URL using History API
    window.history.pushState({ type: 'home' }, '', '/');
    
    // Remove review page class from body
    document.body.classList.remove('snarkflix-review-page');
    
    // Hide breadcrumb
    const existingBreadcrumb = document.querySelector('.snarkflix-breadcrumb');
    if (existingBreadcrumb) {
        existingBreadcrumb.style.display = 'none';
    }
    
    // Update the page title back to homepage
    document.title = 'Snarkflix - Snarky Movie Reviews';
    
    // Update canonical URL back to homepage
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://snarkflix.com/');
    
    // Update meta description back to homepage
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', 'Snarky movie reviews with a side of sass. Join our small but mighty team as we take a lighthearted and entertaining approach to critiquing films.');
    }
    
    // Reset Open Graph meta tags
    updateMetaTag('og:title', 'Snarkflix - Snarky Movie Reviews');
    updateMetaTag('og:description', 'Snarky movie reviews with a side of sass. Join our small but mighty team as we take a lighthearted and entertaining approach to critiquing films.');
    updateMetaTag('og:image', getAbsoluteUrl('images/site-assets/logo.avif'));
    updateMetaTag('og:image:secure_url', getAbsoluteUrl('images/site-assets/logo.avif'));
    updateMetaTag('og:image:type', 'image/avif');
    updateMetaTag('og:image:alt', 'Snarkflix - Snarky Movie Reviews');
    updateMetaTag('og:site_name', 'Snarkflix');
    updateMetaTag('og:locale', 'en_US');
    updateMetaTag('og:url', `${window.location.origin}${window.location.pathname}`);
    
    // WhatsApp specific meta tags
    updateMetaTag('og:image:url', getAbsoluteUrl('images/site-assets/logo.avif'));
    updateMetaTag('twitter:image:src', getAbsoluteUrl('images/site-assets/logo.avif'));
    
    // Reset Twitter Card meta tags
    updateMetaTag('twitter:title', 'Snarkflix - Snarky Movie Reviews');
    updateMetaTag('twitter:description', 'Snarky movie reviews with a side of sass. Join our small but mighty team as we take a lighthearted and entertaining approach to critiquing films.');
    updateMetaTag('twitter:image', getAbsoluteUrl('images/site-assets/logo.avif'));
    updateMetaTag('twitter:url', `${window.location.origin}${window.location.pathname}`);
    
    // Show all existing sections
    const sectionsToShow = document.querySelectorAll('section');
    sectionsToShow.forEach(section => {
        section.style.display = '';
    });
    
    // Remove any existing review content
    const existingReviewContent = document.querySelector('.snarkflix-review-content-wrapper');
    if (existingReviewContent) {
        existingReviewContent.remove();
    }
    
    // Scroll to top with smooth behavior
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Remove transition class after animation completes
    setTimeout(() => {
        document.body.classList.remove('snarkflix-page-transitioning');
        document.body.classList.add('snarkflix-page-loaded');
    }, 300);
}

function createReviewContentHTML(review) {
    return `
        <!-- Main Review Content -->
        <main class="snarkflix-review-page">
            <article class="snarkflix-review-article">
                <header class="snarkflix-review-header">
                    <div class="snarkflix-container">
                        <div class="snarkflix-review-meta">
                            <span class="snarkflix-review-date">${review.publishDate}</span>
                            <span class="snarkflix-review-duration">${review.readingDuration}</span>
                            <span class="snarkflix-review-category">${review.category}</span>
                        </div>
                        <h1 class="snarkflix-review-title">${review.title}</h1>
                        
                        <div class="snarkflix-review-score-section">
                            <div class="snarkflix-ai-score">
                                <span class="snarkflix-ai-score-label">SnarkAI Score:</span>
                                <span class="snarkflix-ai-score-value">${review.aiScore}/100</span>
                            </div>
                        </div>
                        
                        <div class="snarkflix-review-summary">
                            <h2>AI Review Summary</h2>
                            <p>${review.aiSummary}</p>
                        </div>
                        
                        <div class="snarkflix-review-disclaimer">
                            <strong>Disclaimer:</strong> Our Scores are generated by SnarkAI's analysis of our reviewer's writing. The tldr summary is drafted by SnarkAI based on that review. All Images are AI-generated based on the reviewer's descriptions of scenes.
                        </div>
                    </div>
                </header>
                
                <div class="snarkflix-review-hero-image">
                    ${createResponsiveImage(review.imageUrl, `${review.title} movie poster`, 'eager').replace('<img', '<img class="snarkflix-review-hero-img" fetchpriority="high"')}
                    <div class="snarkflix-review-tagline">
                        <blockquote>"${review.tagline}"</blockquote>
                    </div>
                </div>
                
                <div class="snarkflix-review-content">
                    <div class="snarkflix-container">
                        
                        <div class="snarkflix-review-share-section">
                            <h3>Share this review</h3>
                            <div class="snarkflix-review-share">
                                <button class="snarkflix-share-btn snarkflix-share-twitter" data-review-id="${review.id}" title="Share on Twitter">
                                    <svg class="snarkflix-share-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                    <span class="snarkflix-share-text">Twitter</span>
                                </button>
                                <button class="snarkflix-share-btn snarkflix-share-facebook" data-review-id="${review.id}" title="Share on Facebook">
                                    <svg class="snarkflix-share-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span class="snarkflix-share-text">Facebook</span>
                                </button>
                                <button class="snarkflix-share-btn snarkflix-share-copy" data-review-id="${review.id}" title="Copy link">
                                    <svg class="snarkflix-share-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                    </svg>
                                    <span class="snarkflix-share-text">Copy Link</span>
                                </button>
                            </div>
                        </div>
                        
                        <div class="snarkflix-review-text">
                            ${insertImagesInContent(review)}
                        </div>
                        
                        ${review.youtubeTrailer ? `
                        <div class="snarkflix-review-trailer">
                            <h3>Watch the Trailer</h3>
                            <div class="snarkflix-youtube-container">
                                <iframe 
                                    class="snarkflix-youtube-iframe"
                                    src="${convertToEmbedUrl(review.youtubeTrailer)}"
                                    title="${review.title} Trailer"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </article>
        </main>

        <!-- Related Reviews Section -->
        <section class="snarkflix-related-reviews">
            <div class="snarkflix-container">
                <h2 class="snarkflix-section-title">More Reviews</h2>
                <div class="snarkflix-reviews-grid" id="related-reviews-grid">
                    <!-- Related reviews will be loaded here -->
                </div>
            </div>
        </section>
    `;
}

function loadRelatedReviews(currentReview) {
    const relatedReviews = snarkflixReviews
        .filter(r => r.id !== currentReview.id)
        .sort((a, b) => {
            const dateA = new Date(a.publishDate);
            const dateB = new Date(b.publishDate);
            return dateB - dateA; // Newest first
        })
        .slice(0, 3);
    const relatedGrid = document.getElementById('related-reviews-grid');
    
    if (!relatedGrid) return;
    
    relatedReviews.forEach(relatedReview => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.setAttribute('data-category', relatedReview.category);
        reviewCard.setAttribute('tabindex', '0');
        reviewCard.setAttribute('role', 'article');
        reviewCard.setAttribute('aria-label', `Review of ${relatedReview.title}`);
        
        reviewCard.innerHTML = `
            <div class="snarkflix-review-image">
                ${createResponsiveImage(relatedReview.imageUrl, `${relatedReview.title} movie poster`, 'lazy')}
            </div>
            <div class="snarkflix-review-content">
                <h3 class="snarkflix-review-title">${relatedReview.title}</h3>
                <div class="snarkflix-review-meta">
                    <span class="snarkflix-review-date">${relatedReview.publishDate}</span>
                    <span class="snarkflix-review-duration">${relatedReview.readingDuration}</span>
                    <span class="snarkflix-review-score">SnarkAI: ${relatedReview.aiScore}/100</span>
                </div>
                <p class="snarkflix-review-summary">${relatedReview.aiSummary}</p>
                <p class="snarkflix-review-tagline">"${relatedReview.tagline}"</p>
            </div>
        `;
        
        reviewCard.addEventListener('click', () => {
            createReviewPage(relatedReview);
        });
        
        relatedGrid.appendChild(reviewCard);
    });
}

function updateLoadMoreButton(totalReviews, currentCount) {
    if (currentCount >= totalReviews) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
        loadMoreBtn.textContent = `Load More Reviews (${totalReviews - currentCount} remaining)`;
    }
}

function setupEventListeners() {
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadReviews(currentPage + 1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter);
        });
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.snarkflix-mobile-menu-toggle');
    const navLinks = document.querySelector('.snarkflix-nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('snarkflix-mobile-menu-open');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupAccessibility() {
    // Skip link is now in HTML for better accessibility and SEO
    // Add keyboard user detection for enhanced skip link visibility
    let isKeyboardUser = false;
    
    // Handle skip link click with smooth scroll
    const skipLink = document.querySelector('.snarkflix-skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Focus the target element for screen readers
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    // Remove tabindex after focus to avoid tab order issues
                    setTimeout(() => {
                        targetElement.removeAttribute('tabindex');
                    }, 1000);
                }
            }
        });
    }
    
    // Add ARIA labels to interactive elements
    const categoryCards = document.querySelectorAll('.snarkflix-category-card');
    categoryCards.forEach(card => {
        const categoryName = card.querySelector('h3').textContent;
        card.setAttribute('aria-label', `Browse ${categoryName} movies`);
    });
    
    // Add keyboard navigation support (consolidated)
    document.addEventListener('keydown', (e) => {
        // Tab key indicates keyboard navigation - show skip link
        if (e.key === 'Tab' || e.keyCode === 9) {
            isKeyboardUser = true;
            document.body.classList.add('snarkflix-keyboard-user');
        }
        
        // Escape key closes mobile menu
        if (e.key === 'Escape') {
            const mobileMenuToggle = document.querySelector('.snarkflix-mobile-menu-toggle');
            const navLinks = document.querySelector('.snarkflix-nav-links');
            
            if (mobileMenuToggle && navLinks) {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('snarkflix-mobile-menu-open');
            }
        }
    });
}

function setupCategoryFiltering() {
    const categoryCards = document.querySelectorAll('.snarkflix-category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const category = card.getAttribute('data-category');
            
            // Update active state
            categoryCards.forEach(c => c.classList.remove('snarkflix-category-active'));
            card.classList.add('snarkflix-category-active');
            
            // Load reviews for this category
            currentCategory = category;
            currentPage = 1; // Reset current page when filtering
            currentSearchTerm = ''; // Clear search when filtering by category
            currentScoreFilter = ''; // Clear score filter
            currentYearFilter = ''; // Clear year filter
            loadReviews(1, category, '', currentSort, '', '');
            
            // Scroll to reviews section
            document.getElementById('reviews').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
    
    // Update category counts
    updateCategoryCounts();
}

function updateCategoryCounts() {
    if (!snarkflixReviews) return;
    
    const categoryCounts = {};
    snarkflixReviews.forEach(review => {
        categoryCounts[review.category] = (categoryCounts[review.category] || 0) + 1;
    });
    
    document.querySelectorAll('.snarkflix-category-card').forEach(card => {
        const category = card.getAttribute('data-category');
        const count = categoryCounts[category] || 0;
        const countEl = card.querySelector('.snarkflix-category-count');
        if (countEl) {
            countEl.textContent = `${count} post${count !== 1 ? 's' : ''}`;
        }
    });
}

function setupSortDropdown() {
    const sortDropdown = document.getElementById('sort-dropdown');
    
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1; // Reset to first page when changing sort
            loadReviews(1, currentCategory, currentSearchTerm, currentSort);
        });
    }
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
            }
            currentSearchTerm = searchTerm;
            currentPage = 1; // Reset to first page when searching
            loadReviews(1, currentCategory, currentSearchTerm, currentSort, currentScoreFilter, currentYearFilter);
            
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
            
            // Show/hide clear button
            if (searchTerm) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
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
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    searchInput.focus();
                }
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            currentPage = 1;
            clearSearchBtn.style.display = 'none';
            if (suggestionsContainer) suggestionsContainer.style.display = 'none';
            loadReviews(1, currentCategory, '', currentSort, currentScoreFilter, currentYearFilter);
        });
    }
    
    // Setup filter handlers
    setupFilters();
}

function highlightMatch(text, term) {
    const regex = new RegExp(`(${term})`, 'gi');
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
        const message = `Found ${total} review${total !== 1 ? 's' : ''}`;
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
        progressEl.textContent = `Showing ${loaded} of ${total} reviews`;
        progressEl.style.display = 'block';
    } else if (loaded >= total && total > 0) {
        progressEl.textContent = `All ${total} review${total !== 1 ? 's' : ''} loaded`;
        progressEl.style.display = 'block';
    } else {
        progressEl.style.display = 'none';
    }
}

function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function setupKeyboardNavigation() {
    let focusedCardIndex = -1;
    const cards = () => Array.from(document.querySelectorAll('.snarkflix-review-card:not([style*="display: none"])'));
    
    document.addEventListener('keydown', (e) => {
        const activeElement = document.activeElement;
        
        // Handle Enter key on review cards
        if (e.key === 'Enter' && activeElement.classList.contains('snarkflix-review-card')) {
            e.preventDefault();
            activeElement.click();
            return;
        }
        
        // Handle Escape key to close search suggestions
        if (e.key === 'Escape') {
            const suggestionsContainer = document.getElementById('search-suggestions');
            if (suggestionsContainer && suggestionsContainer.style.display !== 'none') {
                suggestionsContainer.style.display = 'none';
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.focus();
                return;
            }
        }
        
        // Only handle arrow keys when not in input/textarea/select
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            if (activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA' || 
                activeElement.tagName === 'SELECT' ||
                activeElement.closest('.snarkflix-search-suggestions')) {
                return;
            }
            
            e.preventDefault();
            const cardList = cards();
            if (cardList.length === 0) return;
            
            if (focusedCardIndex === -1) {
                focusedCardIndex = 0;
            } else {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    focusedCardIndex = (focusedCardIndex + 1) % cardList.length;
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    focusedCardIndex = (focusedCardIndex - 1 + cardList.length) % cardList.length;
                }
            }
            
            cardList[focusedCardIndex].focus();
            cardList[focusedCardIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            <button onclick="this.parentElement.parentElement.remove()" class="snarkflix-btn snarkflix-btn-primary">
                Dismiss
            </button>
        </div>
    `;
    
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
    
    const reviewsGrid = document.querySelector('.snarkflix-reviews-grid');
    if (reviewsGrid) {
        reviewsGrid.innerHTML = `
            <div class="snarkflix-error-state">
                <h3>Unable to load reviews</h3>
                <p>We're having trouble loading the reviews. Please refresh the page or try again later.</p>
                <button onclick="location.reload()" class="snarkflix-btn snarkflix-btn-primary">
                    Refresh Page
                </button>
            </div>
        `;
    }
}

function handleSearchError(error) {
    console.error('Error during search:', error);
    
    const searchInput = document.querySelector('.snarkflix-search-input');
    if (searchInput) {
        searchInput.placeholder = 'Search temporarily unavailable';
        searchInput.disabled = true;
        
        setTimeout(() => {
            searchInput.placeholder = 'Search for movies...';
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


// Update category counts based on actual review data
function updateCategoryCounts() {
    // Count reviews by category
    const categoryCounts = {};
    snarkflixReviews.forEach(review => {
        const category = review.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Update the category count displays
    const categoryCards = document.querySelectorAll('.snarkflix-category-card');
    categoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const countElement = card.querySelector('.snarkflix-category-count');
        
        if (countElement && categoryCounts[category] !== undefined) {
            const count = categoryCounts[category];
            countElement.textContent = `${count} post${count !== 1 ? 's' : ''}`;
        }
    });
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Uncomment the line below to enable search functionality
    // setupSearch();
});

// Keyboard navigation support
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Close mobile menu with Escape key
        if (e.key === 'Escape') {
            const mobileMenuToggle = document.querySelector('.snarkflix-mobile-menu-toggle');
            if (mobileMenuToggle && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
                closeMobileMenu();
            }
            
            // Clear search if search input is focused
            const searchInput = document.querySelector('.snarkflix-search-input');
            if (searchInput === document.activeElement) {
                clearSearch();
            }
        }
        
        // Category navigation with number keys (1-9)
        if (e.key >= '1' && e.key <= '9') {
            const categoryIndex = parseInt(e.key) - 1;
            const categoryCards = document.querySelectorAll('.snarkflix-category-card');
            if (categoryCards[categoryIndex]) {
                e.preventDefault();
                categoryCards[categoryIndex].click();
            }
        }
        
        // Quick search with '/' key
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
            const searchInput = document.querySelector('.snarkflix-search-input');
            if (searchInput && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        }
        
        // Sort dropdown navigation
        if (e.key === 's' && e.ctrlKey) {
            e.preventDefault();
            const sortSelect = document.querySelector('.snarkflix-sort-select');
            if (sortSelect) {
                sortSelect.focus();
            }
        }
    });
    
    // Add keyboard support for category cards
    const categoryCards = document.querySelectorAll('.snarkflix-category-card');
    categoryCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        
        // Safely get category name with null check
        const categoryNameElement = card.querySelector('.snarkflix-category-name');
        const categoryName = categoryNameElement ? categoryNameElement.textContent : `Category ${index + 1}`;
        card.setAttribute('aria-label', `Filter by ${categoryName} category (${index + 1})`);
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
    
    // Add keyboard support for review cards
    function addKeyboardSupportToReviewCards() {
        const reviewCards = document.querySelectorAll('.snarkflix-review-card');
        reviewCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }
    
    // Add keyboard support to share buttons
    function addKeyboardSupportToShareButtons() {
        const shareButtons = document.querySelectorAll('.snarkflix-share-btn');
        shareButtons.forEach(button => {
            button.setAttribute('tabindex', '0');
            
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });
    }
    
    // Add keyboard support to existing elements
    addKeyboardSupportToReviewCards();
    addKeyboardSupportToShareButtons();
    
    // Add keyboard support to new elements when they're created
    const originalLoadReviews = loadReviews;
    loadReviews = function(...args) {
        const result = originalLoadReviews.apply(this, args);
        // Add keyboard support to newly loaded cards
        setTimeout(() => {
            addKeyboardSupportToReviewCards();
            addKeyboardSupportToShareButtons();
        }, 100);
        return result;
    };
}

// Initialize error handling and keyboard navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupImageErrorHandling();
    // Delay keyboard navigation setup to ensure all elements are loaded
    setTimeout(() => {
        try {
            setupKeyboardNavigation();
        } catch (error) {
            console.error('Error setting up keyboard navigation:', error);
            // Don't let keyboard navigation errors break the app
        }
    }, 100);
});

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
            const spinner = showLoadingSpinner(searchContainer, 'Searching...');
            spinner.className += ' snarkflix-search-loading';
        }
    }
}

function hideSearchLoading() {
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
    
    // Hide existing sections
    const sectionsToHide = document.querySelectorAll('section:not(.snarkflix-header):not(.snarkflix-footer)');
    sectionsToHide.forEach(section => {
        section.style.display = 'none';
    });
    
    // Create skeleton wrapper
    const skeletonWrapper = document.createElement('div');
    skeletonWrapper.className = 'snarkflix-review-skeleton-wrapper';
    skeletonWrapper.innerHTML = `
        <div class="snarkflix-review-skeleton">
            <div class="snarkflix-skeleton-breadcrumb">
                <div class="snarkflix-skeleton-line snarkflix-skeleton-short"></div>
            </div>
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
    
    // Insert after header
    const header = document.querySelector('.snarkflix-header');
    if (header && header.nextSibling) {
        header.parentNode.insertBefore(skeletonWrapper, header.nextSibling);
    } else if (header) {
        header.parentNode.appendChild(skeletonWrapper);
    }
}

function hideReviewLoadingSkeleton() {
    const skeleton = document.querySelector('.snarkflix-review-skeleton-wrapper');
    if (skeleton) {
        skeleton.remove();
    }
}

// Update meta tags for review (extracted for reuse)
function updateMetaTagsForReview(review) {
    // Update page title
    document.title = `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', `${review.title} - ${review.aiSummary.substring(0, 150)}...`);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `https://snarkflix.com/review/${review.id}`);
    
    // Update Open Graph meta tags
    updateMetaTag('og:title', `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`);
    updateMetaTag('og:description', `${review.title} - ${review.aiSummary.substring(0, 200)}...`);
    updateMetaTag('og:image', getAbsoluteUrl(review.imageUrl));
    updateMetaTag('og:image:secure_url', getAbsoluteUrl(review.imageUrl));
    updateMetaTag('og:image:type', 'image/png');
    updateMetaTag('og:image:alt', `${review.title} Review`);
    updateMetaTag('og:site_name', 'Snarkflix');
    updateMetaTag('og:locale', 'en_US');
    updateMetaTag('og:url', `https://snarkflix.com/review/${review.id}`);
    updateMetaTag('og:type', 'article');
    
    // WhatsApp specific meta tags
    updateMetaTag('og:image:url', getAbsoluteUrl(review.imageUrl));
    updateMetaTag('twitter:image:src', getAbsoluteUrl(review.imageUrl));
    
    // Update Twitter Card meta tags
    updateMetaTag('twitter:title', `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`);
    updateMetaTag('twitter:description', `${review.title} - ${review.aiSummary.substring(0, 200)}...`);
    updateMetaTag('twitter:image', getAbsoluteUrl(review.imageUrl));
    updateMetaTag('twitter:url', `https://snarkflix.com/review/${review.id}`);
    updateMetaTag('twitter:card', 'summary_large_image');
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadReviews,
        createReviewElement,
        snarkflixReviews,
        snarkflixCategories,
        updateCategoryCounts
    };
}

// Make functions available globally for testing
window.handleImageError = handleImageError;
window.handleImageLoad = handleImageLoad;
