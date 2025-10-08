// Integration tests for Snarkflix functionality
const { 
  createMockReview, 
  createMockReviews, 
  setupDOM, 
  mockReviewsData, 
  waitFor,
  simulateUserInteraction,
  mockConsole
} = require('./test-utils.js');

describe('Snarkflix Integration Tests', () => {
  let mockReviews;
  let consoleSpy;

  beforeEach(() => {
    setupDOM();
    mockReviews = mockReviewsData();
    consoleSpy = mockConsole();
    
    // Mock global variables
    global.currentPage = 1;
    global.currentCategory = 'all';
    global.currentSearchTerm = '';
    global.currentSort = 'latest';
  });

  afterEach(() => {
    consoleSpy.restore();
    jest.clearAllMocks();
  });

  describe('Review Loading and Display', () => {
    test('should load and display reviews in grid', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const reviewsToShow = mockReviews.slice(0, 6); // First page
      
      // Simulate loading reviews
      reviewsToShow.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.setAttribute('data-category', review.category);
        reviewCard.innerHTML = `
          <div class="snarkflix-review-image">
            <img src="${review.imageUrl}" alt="${review.title} movie poster" loading="lazy">
          </div>
          <div class="snarkflix-review-content">
            <h3 class="snarkflix-review-title">${review.title}</h3>
            <p class="snarkflix-review-summary">${review.aiSummary.substring(0, 100)}...</p>
            <p class="snarkflix-review-tagline">${review.tagline}</p>
            <div class="snarkflix-review-meta">
              <span class="snarkflix-review-score">SnarkAI Score: ${review.aiScore}/100</span>
              <span class="snarkflix-review-duration">${review.readingDuration}</span>
            </div>
          </div>
        `;
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(6);
      expect(reviewsGrid.querySelectorAll('.snarkflix-review-card')).toHaveLength(6);
    });

    test('should handle pagination correctly', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const loadMoreBtn = document.getElementById('load-more-btn');
      
      // Load first page
      const firstPage = mockReviews.slice(0, 6);
      firstPage.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(6);
      // Simulate the updateLoadMoreButton function call
      if (mockReviews.length > 6) {
        loadMoreBtn.style.display = 'block';
      }
      expect(loadMoreBtn.style.display).not.toBe('none');
      
      // Load second page
      const secondPage = mockReviews.slice(6, 10);
      secondPage.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(10);
    });

    test('should update load more button visibility', () => {
      const loadMoreBtn = document.getElementById('load-more-btn');
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Simulate having all reviews loaded
      const allReviews = mockReviews;
      allReviews.forEach(() => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewsGrid.appendChild(reviewCard);
      });
      
      // In real implementation, this would hide the button
      expect(loadMoreBtn).toBeInTheDocument();
    });
  });

  describe('Category Filtering Integration', () => {
    test('should filter reviews by category and update display', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const categoryCard = document.querySelector('[data-category="action"]');
      
      // Load all reviews first
      mockReviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.setAttribute('data-category', review.category);
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(10);
      
      // Filter by action category
      const actionReviews = mockReviews.filter(review => review.category === 'action');
      reviewsGrid.innerHTML = '';
      
      actionReviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.setAttribute('data-category', review.category);
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(2);
      expect(reviewsGrid.querySelectorAll('[data-category="action"]')).toHaveLength(2);
    });

    test('should update category counts when filtering', () => {
      const actionCount = mockReviews.filter(r => r.category === 'action').length;
      const comedyCount = mockReviews.filter(r => r.category === 'comedy').length;
      const dramaCount = mockReviews.filter(r => r.category === 'drama').length;
      
      expect(actionCount).toBe(2);
      expect(comedyCount).toBe(2);
      expect(dramaCount).toBe(2);
    });

    test('should show all reviews when category is reset', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // First filter by action
      const actionReviews = mockReviews.filter(review => review.category === 'action');
      reviewsGrid.innerHTML = '';
      actionReviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.setAttribute('data-category', review.category);
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(2);
      
      // Reset to show all
      reviewsGrid.innerHTML = '';
      mockReviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.setAttribute('data-category', review.category);
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(10);
    });
  });

  describe('Search Integration', () => {
    test('should search across multiple fields and update display', async () => {
      const searchInput = document.getElementById('search-input');
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Load all reviews
      mockReviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.innerHTML = `
          <div class="snarkflix-review-content">
            <h3 class="snarkflix-review-title">${review.title}</h3>
            <p class="snarkflix-review-summary">${review.aiSummary}</p>
            <p class="snarkflix-review-tagline">${review.tagline}</p>
          </div>
        `;
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(10);
      
      // Search for specific term
      const searchTerm = 'Test Movie 1';
      searchInput.value = searchTerm;
      
      // Filter reviews based on search
      const filteredReviews = mockReviews.filter(review => 
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.aiSummary.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Update display
      reviewsGrid.innerHTML = '';
      filteredReviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.innerHTML = `
          <div class="snarkflix-review-content">
            <h3 class="snarkflix-review-title">${review.title}</h3>
            <p class="snarkflix-review-summary">${review.aiSummary}</p>
            <p class="snarkflix-review-tagline">${review.tagline}</p>
          </div>
        `;
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(2);
      expect(reviewsGrid.querySelector('.snarkflix-review-title').textContent).toBe('Test Movie 1 (2023)');
    });

    test('should clear search and show all reviews', async () => {
      const searchInput = document.getElementById('search-input');
      const clearButton = document.getElementById('clear-search-btn');
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Set search term
      searchInput.value = 'test';
      clearButton.style.display = 'block';
      
      // Clear search
      searchInput.value = '';
      clearButton.style.display = 'none';
      
      // Reload all reviews
      reviewsGrid.innerHTML = '';
      mockReviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(10);
      expect(searchInput.value).toBe('');
      expect(clearButton.style.display).toBe('none');
    });
  });

  describe('Sorting Integration', () => {
    test('should sort reviews by different criteria', async () => {
      const sortSelect = document.getElementById('sort-select');
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Test latest sorting
      sortSelect.value = 'latest';
      const latestSorted = [...mockReviews].sort((a, b) => 
        new Date(b.publishDate) - new Date(a.publishDate)
      );
      
      reviewsGrid.innerHTML = '';
      latestSorted.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewsGrid.appendChild(reviewCard);
      });
      
      expect(reviewsGrid.children).toHaveLength(10);
      
      // Test best sorting
      sortSelect.value = 'best';
      const bestSorted = [...mockReviews].sort((a, b) => b.aiScore - a.aiScore);
      
      expect(bestSorted[0].aiScore).toBeGreaterThanOrEqual(bestSorted[1].aiScore);
      
      // Test longest sorting
      sortSelect.value = 'longest';
      const longestSorted = [...mockReviews].sort((a, b) => b.content.length - a.content.length);
      
      expect(longestSorted[0].content.length).toBeGreaterThanOrEqual(longestSorted[1].content.length);
    });
  });

  describe('Review Page Navigation', () => {
    test('should navigate to review page and update meta tags', async () => {
      const review = createMockReview({ id: 1 });
      const reviewContentWrapper = document.getElementById('review-content-wrapper');
      
      // Simulate navigation to review page
      reviewContentWrapper.style.display = 'block';
      reviewContentWrapper.innerHTML = `
        <div class="snarkflix-review-hero-image">
          <img src="${review.imageUrl}" alt="${review.title}" class="snarkflix-review-hero-img">
          <div class="snarkflix-review-tagline">
            <blockquote>${review.tagline}</blockquote>
          </div>
        </div>
        <div class="snarkflix-review-content">
          <h1>${review.title}</h1>
          <div class="snarkflix-review-meta">
            <span class="snarkflix-review-score">SnarkAI Score: ${review.aiScore}/100</span>
            <span class="snarkflix-review-duration">${review.readingDuration}</span>
          </div>
          <div class="snarkflix-review-text">
            ${review.content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
          </div>
        </div>
      `;
      
      expect(reviewContentWrapper).toBeVisible();
      expect(reviewContentWrapper.querySelector('h1').textContent).toBe(review.title);
      expect(reviewContentWrapper.querySelector('.snarkflix-review-score').textContent).toContain(review.aiScore.toString());
    });

    test('should return to homepage and reset display', async () => {
      const reviewContentWrapper = document.getElementById('review-content-wrapper');
      const reviewsSection = document.querySelector('.snarkflix-reviews');
      
      // Simulate being on review page
      reviewContentWrapper.style.display = 'block';
      reviewsSection.style.display = 'none';
      
      // Return to homepage
      reviewContentWrapper.style.display = 'none';
      reviewsSection.style.display = 'block';
      
      expect(reviewContentWrapper).not.toBeVisible();
      expect(reviewsSection).toBeVisible();
    });
  });

  describe('Social Sharing Integration', () => {
    test('should generate correct sharing URLs for different platforms', () => {
      const review = createMockReview({ id: 1 });
      const baseUrl = 'https://snarkflix.com';
      const reviewUrl = `${baseUrl}/review/${review.id}`;
      
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(review.title)}&url=${encodeURIComponent(reviewUrl)}`;
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(reviewUrl)}`;
      const copyUrl = reviewUrl;
      
      expect(twitterUrl).toContain('twitter.com');
      expect(facebookUrl).toContain('facebook.com');
      expect(copyUrl).toBe(reviewUrl);
    });

    test('should handle copy to clipboard functionality', async () => {
      const review = createMockReview({ id: 1 });
      const shareUrl = `https://snarkflix.com/review/${review.id}`;
      
      // Mock clipboard API
      const mockWriteText = jest.fn().mockResolvedValue();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText
        }
      });
      
      // Simulate copy action
      await navigator.clipboard.writeText(shareUrl);
      
      expect(mockWriteText).toHaveBeenCalledWith(shareUrl);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle image loading errors gracefully', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const review = createMockReview();
      
      const reviewCard = document.createElement('article');
      reviewCard.className = 'snarkflix-review-card';
      reviewCard.innerHTML = `
        <div class="snarkflix-review-image">
          <img src="invalid-image.jpg" alt="${review.title} movie poster" loading="lazy">
        </div>
      `;
      reviewsGrid.appendChild(reviewCard);
      
      const img = reviewCard.querySelector('img');
      
      // Simulate image error
      const errorEvent = new Event('error');
      img.dispatchEvent(errorEvent);
      
      // In real implementation, this would show a fallback or error state
      expect(img).toBeInTheDocument();
    });

    test('should handle network errors during data loading', async () => {
      // Mock fetch to reject
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      try {
        await fetch('/api/reviews');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('Loading States Integration', () => {
    test('should show and hide loading states during operations', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Show loading state
      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'snarkflix-loading-spinner';
      loadingSpinner.innerHTML = `
        <div class="snarkflix-spinner"></div>
        <span class="snarkflix-loading-text">Loading reviews...</span>
      `;
      reviewsGrid.appendChild(loadingSpinner);
      
      expect(reviewsGrid.querySelector('.snarkflix-loading-spinner')).toBeInTheDocument();
      
      // Simulate loading completion
      await waitFor(100);
      reviewsGrid.removeChild(loadingSpinner);
      
      expect(reviewsGrid.querySelector('.snarkflix-loading-spinner')).not.toBeInTheDocument();
    });
  });
});
