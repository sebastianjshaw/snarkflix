// Snarkflix JavaScript - Movie Review Blog

// Import review data from external file
// Note: In a real application, this would be loaded via script tag or module import
// For now, we'll use the data directly from reviews-data.js
const snarkflixReviews = snarkflixReviewsData || [
    {
        id: 1,
        title: "Superman (2025)",
        publishDate: "Aug 1, 2025",
        readingDuration: "3 min read",
        aiScore: 79,
        aiSummary: "tldr: James Gunn breathes fresh, colourful life into Superman, delivering the hopeful hero Snyder never could, complete with perfectly snarky Lois, a petty genius Lex, and a hilariously awkward accidental allegory on immigration and geopolitical invasions. It's exactly the fun reboot DC desperately needed.",
        tagline: "I'm glad Snyder is still alive to see this film and see how fully, fundamentally and totally he failed as a screenwriter, director, and person.",
        content: "All in all, this was the hopeful superman we all wanted and haven't seen on the big screen in a couple of decades. The colour pallet was cheerful in the right places, and whilst it perhaps lacked some of Snyders visual beauty, it more than overcame that with just getting the tone right...",
        category: "action",
        imageUrl: "https://via.placeholder.com/400x200/ff6b35/ffffff?text=Superman+2025",
        youtubeTrailer: "https://www.youtube.com/watch?v=example1"
    },
    {
        id: 2,
        title: "Barbie (2023)",
        publishDate: "Jul 21, 2023",
        readingDuration: "4 min read",
        aiScore: 92,
        aiSummary: "tldr: Greta Gerwig delivers a surprisingly profound and hilarious take on the iconic doll, with Margot Robbie and Ryan Gosling giving career-best performances in a film that's both a celebration and critique of femininity.",
        tagline: "Finally, a movie that understands that being a woman is both a privilege and a burden, and somehow makes that realization absolutely hilarious.",
        content: "Barbie is the kind of movie that sneaks up on you. You think you're going to see a fun, colorful romp about a plastic doll, and instead you get a meditation on what it means to be a woman in the modern world...",
        category: "comedy",
        imageUrl: "https://via.placeholder.com/400x200/ff69b4/ffffff?text=Barbie+2023",
        youtubeTrailer: "https://www.youtube.com/watch?v=example2"
    },
    {
        id: 3,
        title: "Oppenheimer (2023)",
        publishDate: "Jul 21, 2023",
        readingDuration: "5 min read",
        aiScore: 88,
        aiSummary: "tldr: Christopher Nolan's biopic is a masterclass in tension and moral complexity, with Cillian Murphy delivering a career-defining performance as the father of the atomic bomb.",
        tagline: "A three-hour movie about a guy who built a bomb, and somehow it's the most thrilling thing you'll see all year.",
        content: "Oppenheimer is exactly the kind of movie that makes you question everything you thought you knew about history, morality, and the price of scientific progress...",
        category: "drama",
        imageUrl: "https://via.placeholder.com/400x200/2c3e50/ffffff?text=Oppenheimer+2023",
        youtubeTrailer: "https://www.youtube.com/watch?v=example3"
    },
    {
        id: 4,
        title: "Spider-Man: Across the Spider-Verse (2023)",
        publishDate: "Jun 2, 2023",
        readingDuration: "4 min read",
        aiScore: 95,
        aiSummary: "tldr: A visual masterpiece that pushes the boundaries of animation while telling a deeply personal story about growing up, responsibility, and the multiverse of possibilities.",
        tagline: "The best Spider-Man movie ever made, and it's not even close.",
        content: "Spider-Verse 2 is the kind of movie that makes you remember why you fell in love with cinema in the first place. Every frame is a work of art...",
        category: "animation",
        imageUrl: "https://via.placeholder.com/400x200/e74c3c/ffffff?text=Spider-Verse+2023",
        youtubeTrailer: "https://www.youtube.com/watch?v=example4"
    },
    {
        id: 5,
        title: "Dune: Part Two (2024)",
        publishDate: "Mar 1, 2024",
        readingDuration: "6 min read",
        aiScore: 91,
        aiSummary: "tldr: Denis Villeneuve's epic sequel delivers on every promise of the first film, with stunning visuals, complex characters, and a story that finally does justice to Frank Herbert's masterpiece.",
        tagline: "The spice must flow, and so must your tears of joy at finally seeing a proper Dune adaptation.",
        content: "Dune: Part Two is everything a sequel should be - bigger, bolder, and more ambitious than its predecessor, while never losing sight of the human story at its core...",
        category: "scifi",
        imageUrl: "https://via.placeholder.com/400x200/8b4513/ffffff?text=Dune+Part+Two",
        youtubeTrailer: "https://www.youtube.com/watch?v=example5"
    }
];

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

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

function loadReviews(page = 1, category = null) {
    let filteredReviews = snarkflixReviews;
    
    // Filter by category if specified
    if (category && category !== 'all') {
        filteredReviews = snarkflixReviews.filter(review => 
            review.category === category
        );
    }
    
    // Sort based on current sort option
    filteredReviews = filteredReviews.sort((a, b) => {
        switch (currentSort) {
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
        </div>
    `;
    
    // Add click handler for navigation
    reviewCard.addEventListener('click', () => {
        navigateToReview(review.id);
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
                    <img src="${allImages[imageIndex]}" alt="${review.title} additional image" class="snarkflix-review-img-inline">
                </div>
            `;
            imageIndex++;
        }
    });
    
    return result;
}

function createReviewPage(review) {
    // Update the page title
    document.title = `${review.title} Review - SnarkAI Score: ${review.aiScore}/100 | Snarkflix`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', `${review.title} - ${review.aiSummary.substring(0, 150)}...`);
    }
    
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
                        <img src="${review.imageUrl}" alt="${review.title} movie poster" class="snarkflix-review-hero-img">
                    </div>
                </div>
                
                <div class="snarkflix-review-content">
                    <div class="snarkflix-container">
                        <div class="snarkflix-review-tagline">
                            <blockquote>"${review.tagline}"</blockquote>
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
                                    src="${review.youtubeTrailer.replace('watch?v=', 'embed/')}"
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
            loadReviews(currentPage + 1);
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
            loadReviews(1, currentCategory);
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

// Search functionality (for future implementation)
function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search reviews...';
    searchInput.className = 'snarkflix-search-input';
    searchInput.setAttribute('aria-label', 'Search movie reviews');
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'snarkflix-search-container';
    searchContainer.appendChild(searchInput);
    
    // Add search container to the reviews section
    const reviewsSection = document.getElementById('reviews');
    const container = reviewsSection.querySelector('.snarkflix-container');
    container.insertBefore(searchContainer, reviewsGrid);
    
    // Add search functionality
    const debouncedSearch = debounce((query) => {
        const filteredReviews = snarkflixReviews.filter(review =>
            review.title.toLowerCase().includes(query.toLowerCase()) ||
            review.aiSummary.toLowerCase().includes(query.toLowerCase()) ||
            review.tagline.toLowerCase().includes(query.toLowerCase())
        );
        
        // Clear and reload with filtered results
        reviewsGrid.innerHTML = '';
        filteredReviews.forEach(review => {
            const reviewElement = createReviewElement(review);
            reviewsGrid.appendChild(reviewElement);
        });
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}

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
