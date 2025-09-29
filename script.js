// Snarkflix JavaScript - Movie Review Blog

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Check for review parameter and update meta tags before checking for shared review
    const urlParams = new URLSearchParams(window.location.search);
    const reviewParam = urlParams.get('review');
    
    if (reviewParam) {
        const reviewId = parseInt(reviewParam);
        const review = snarkflixReviews.find(r => r.id === reviewId);
        
        if (review) {
            // Update meta tags for social media sharing
            updateMetaTag('og:title', `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`);
            updateMetaTag('og:description', `${review.title} - ${review.aiSummary.substring(0, 200)}...`);
            updateMetaTag('og:image', getAbsoluteUrl(review.imageUrl));
            const cleanOrigin = window.location.origin.replace(/\/$/, '');
            updateMetaTag('og:url', `${cleanOrigin}/review/${review.id}`);
            
            updateMetaTag('twitter:title', `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`);
            updateMetaTag('twitter:description', `${review.title} - ${review.aiSummary.substring(0, 200)}...`);
            updateMetaTag('twitter:image', getAbsoluteUrl(review.imageUrl));
            updateMetaTag('twitter:url', `${cleanOrigin}/review/${review.id}`);
            
            // Update page title and description
            document.title = `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', `${review.title} - ${review.aiSummary.substring(0, 150)}...`);
            }
        }
    }
    
    checkForSharedReview();
});

// Listen for hash changes (back/forward navigation)
window.addEventListener('hashchange', function() {
    checkForSharedReview();
});

// Check if there's a review ID in the URL hash or parameters and open it
function checkForSharedReview() {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const reviewParam = urlParams.get('review');
    
    let reviewId = null;
    
    // Check hash first (for backward compatibility)
    const reviewMatch = hash.match(/#review-(\d+)/);
    if (reviewMatch) {
        reviewId = parseInt(reviewMatch[1]);
    }
    // Check URL parameter
    else if (reviewParam) {
        reviewId = parseInt(reviewParam);
    }
    
    if (reviewId) {
        const review = snarkflixReviews.find(r => r.id === reviewId);
        
        if (review) {
            // Small delay to ensure the page is fully loaded
            setTimeout(() => {
                createReviewPage(review);
            }, 100);
        }
    } else if ((hash === '' || hash === '#') && !reviewParam) {
        // If hash is empty and no review param, return to homepage
        returnToHomepage();
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
    updateCategoryCounts();
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

function loadReviews(page = 1, category = currentCategory, searchTerm = currentSearchTerm, sort = currentSort) {
    try {
        // Update global variables to match parameters
        currentCategory = category;
        currentSearchTerm = searchTerm;
        currentSort = sort;
        
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
    reviewsToShow.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsGrid.appendChild(reviewElement);
    });
    
        // Update load more button
        const currentDisplayedCount = reviewsGrid.children.length;
        updateLoadMoreButton(filteredReviews.length, currentDisplayedCount);
        
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
    reviewCard.setAttribute('data-category', review.category);
    reviewCard.setAttribute('tabindex', '0');
    reviewCard.setAttribute('role', 'article');
    reviewCard.setAttribute('aria-label', `Review of ${review.title}`);
    
    reviewCard.innerHTML = `
        <div class="snarkflix-review-image">
            <img src="${review.imageUrl}" alt="${review.title} movie poster" loading="lazy">
        </div>
        <div class="snarkflix-review-content">
            <h3 class="snarkflix-review-title">${review.title}</h3>
            <div class="snarkflix-review-meta">
                <span class="snarkflix-review-date">${review.publishDate}</span>
                <span class="snarkflix-review-duration">${review.readingDuration}</span>
                <span class="snarkflix-review-score">SnarkAI: ${review.aiScore}/100</span>
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
    
    return reviewCard;
}

function navigateToReview(reviewId) {
    const review = snarkflixReviews.find(r => r.id === reviewId);
    if (review) {
        // Create a new review page
        createReviewPage(review);
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
    
    // Use a cleaner URL format for better social media support
    const cleanBaseUrl = baseUrl.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const reviewUrl = `${cleanBaseUrl}/review/${review.id}`;
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
    const paragraphs = review.content.split('\n\n');
    const allImages = [];
    
    // Collect all available images
    if (review.additionalImage) {
        allImages.push(review.additionalImage);
    }
    if (review.additionalImages) {
        allImages.push(...review.additionalImages);
    }
    
    // If no images, just return formatted paragraphs
    if (allImages.length === 0) {
        return paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
    }
    
    // Calculate where to insert images (spread them throughout the content)
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
                    <img src="${allImages[imageIndex]}" alt="${review.title} additional image" class="snarkflix-review-img-inline" loading="lazy">
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
    // Update the page title
    document.title = `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', `${review.title} - ${review.aiSummary.substring(0, 150)}...`);
    }
    
    // Update Open Graph meta tags
    updateMetaTag('og:title', `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`);
    updateMetaTag('og:description', `${review.title} - ${review.aiSummary.substring(0, 200)}...`);
    updateMetaTag('og:image', getAbsoluteUrl(review.imageUrl));
    const cleanOrigin = window.location.origin.replace(/\/$/, '');
    updateMetaTag('og:url', `${cleanOrigin}/review/${review.id}`);
    
    // Update Twitter Card meta tags
    updateMetaTag('twitter:title', `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`);
    updateMetaTag('twitter:description', `${review.title} - ${review.aiSummary.substring(0, 200)}...`);
    updateMetaTag('twitter:image', getAbsoluteUrl(review.imageUrl));
    updateMetaTag('twitter:url', `${cleanOrigin}/review/${review.id}`);
    
    // Hide all existing sections except header and footer
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
    
    // Scroll to top of the new page
    window.scrollTo(0, 0);
}

function returnToHomepage() {
    // Update the page title back to homepage
    document.title = 'Snarkflix - Snarky Movie Reviews';
    
    // Update meta description back to homepage
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', 'Snarky movie reviews with a side of sass. Join our small but mighty team as we take a lighthearted and entertaining approach to critiquing films.');
    }
    
    // Reset Open Graph meta tags
    updateMetaTag('og:title', 'Snarkflix - Snarky Movie Reviews');
    updateMetaTag('og:description', 'Snarky movie reviews with a side of sass. Join our small but mighty team as we take a lighthearted and entertaining approach to critiquing films.');
    updateMetaTag('og:image', getAbsoluteUrl('images/site-assets/logo.avif'));
    updateMetaTag('og:url', `${window.location.origin}${window.location.pathname}`);
    
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
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function createReviewContentHTML(review) {
    return `
        <!-- Breadcrumb -->
        <nav class="snarkflix-breadcrumb" aria-label="Breadcrumb">
            <div class="snarkflix-container">
                <ol class="snarkflix-breadcrumb-list">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="index.html#reviews">Reviews</a></li>
                    <li aria-current="page">${review.title}</li>
                </ol>
            </div>
        </nav>

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
                    <div class="snarkflix-container">
                        <img src="${review.imageUrl}" alt="${review.title} movie poster" class="snarkflix-review-hero-img" loading="lazy">
                    </div>
                </div>
                
                <div class="snarkflix-review-content">
                    <div class="snarkflix-container">
                        <div class="snarkflix-review-tagline">
                            <blockquote>"${review.tagline}"</blockquote>
                        </div>
                        
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
                <img src="${relatedReview.imageUrl}" alt="${relatedReview.title} movie poster" loading="lazy">
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
            loadReviews(currentPage + 1, currentCategory, currentSearchTerm, currentSort);
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
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#reviews';
    skipLink.className = 'snarkflix-skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add ARIA labels to interactive elements
    const categoryCards = document.querySelectorAll('.snarkflix-category-card');
    categoryCards.forEach(card => {
        const categoryName = card.querySelector('h3').textContent;
        card.setAttribute('aria-label', `Browse ${categoryName} movies`);
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
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
            loadReviews(1, category);
            
            // Scroll to reviews section
            document.getElementById('reviews').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
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
    
    if (searchInput) {
        // Debounced search to avoid too many API calls
        const debouncedSearch = debounce((searchTerm) => {
            currentSearchTerm = searchTerm;
            currentPage = 1; // Reset to first page when searching
            loadReviews(1, currentCategory, currentSearchTerm, currentSort);
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            debouncedSearch(searchTerm);
            
            // Show/hide clear button
            if (searchTerm) {
                clearSearchBtn.style.display = 'block';
            } else {
                clearSearchBtn.style.display = 'none';
            }
        });
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            currentPage = 1;
            clearSearchBtn.style.display = 'none';
            loadReviews(1, currentCategory, currentSearchTerm, currentSort);
        });
    }
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
function handleImageError(img, fallbackSrc = 'images/site-assets/logo.avif') {
    console.warn('Image failed to load:', img.src);
    img.src = fallbackSrc;
    img.alt = 'Image not available';
    img.classList.add('snarkflix-image-error');
}

function handleImageLoad(img) {
    img.classList.remove('snarkflix-image-error');
    img.classList.add('snarkflix-image-loaded');
}

function setupImageErrorHandling() {
    // Handle existing images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', () => handleImageError(img));
        img.addEventListener('load', () => handleImageLoad(img));
    });
    
    // Handle dynamically loaded images
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Handle single image elements
                    if (node.tagName === 'IMG') {
                        node.addEventListener('error', () => handleImageError(node));
                        node.addEventListener('load', () => handleImageLoad(node));
                    }
                    // Handle images within added nodes
                    const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                    images.forEach(img => {
                        img.addEventListener('error', () => handleImageError(img));
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
