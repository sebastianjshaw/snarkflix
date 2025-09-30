// Performance tests for Snarkflix
const { 
  createMockReviews, 
  setupDOM, 
  mockReviewsData, 
  waitFor 
} = require('./test-utils.js');

describe('Snarkflix Performance Tests', () => {
  let mockReviews;
  let consoleSpy;

  beforeEach(() => {
    setupDOM();
    mockReviews = mockReviewsData();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('Review Loading Performance', () => {
    test('should load reviews within acceptable time', async () => {
      const startTime = performance.now();
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Simulate loading reviews
      const reviewsToLoad = mockReviews.slice(0, 6);
      reviewsToLoad.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
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
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      expect(loadTime).toBeLessThan(100); // Should load in under 100ms
      expect(reviewsGrid.children).toHaveLength(6);
    });

    test('should handle large number of reviews efficiently', async () => {
      const largeReviewSet = createMockReviews(100);
      const startTime = performance.now();
      
      // Simulate filtering large dataset
      const filteredReviews = largeReviewSet.filter(review => review.category === 'action');
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      expect(filterTime).toBeLessThan(50); // Should filter in under 50ms
      expect(filteredReviews.length).toBeGreaterThan(0);
    });

    test('should handle search across large dataset efficiently', async () => {
      const largeReviewSet = createMockReviews(100);
      const searchTerm = 'test';
      const startTime = performance.now();
      
      // Simulate search across all fields
      const searchResults = largeReviewSet.filter(review => 
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.aiSummary.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(100); // Should search in under 100ms
      expect(searchResults.length).toBeGreaterThan(0);
    });
  });

  describe('DOM Manipulation Performance', () => {
    test('should create review elements efficiently', async () => {
      const startTime = performance.now();
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Create multiple review elements
      for (let i = 0; i < 20; i++) {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.innerHTML = `
          <div class="snarkflix-review-image">
            <img src="test-image.jpg" alt="Test Movie" loading="lazy">
          </div>
          <div class="snarkflix-review-content">
            <h3 class="snarkflix-review-title">Test Movie ${i}</h3>
            <p class="snarkflix-review-summary">Test summary</p>
          </div>
        `;
        reviewsGrid.appendChild(reviewCard);
      }
      
      const endTime = performance.now();
      const createTime = endTime - startTime;
      
      expect(createTime).toBeLessThan(200); // Should create 20 elements in under 200ms
      expect(reviewsGrid.children).toHaveLength(20);
    });

    test('should update DOM efficiently during filtering', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      
      // Pre-populate with reviews
      const reviews = createMockReviews(10);
      reviews.forEach(review => {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.setAttribute('data-category', review.category);
        reviewsGrid.appendChild(reviewCard);
      });
      
      const startTime = performance.now();
      
      // Simulate filtering by removing non-matching elements
      const actionReviews = Array.from(reviewsGrid.children).filter(card => 
        card.getAttribute('data-category') === 'action'
      );
      
      // Clear and re-add filtered elements
      reviewsGrid.innerHTML = '';
      actionReviews.forEach(card => reviewsGrid.appendChild(card));
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      expect(filterTime).toBeLessThan(50); // Should filter DOM in under 50ms
      expect(reviewsGrid.children.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Memory Usage', () => {
    test('should not create memory leaks with repeated operations', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        // Create reviews
        const reviews = createMockReviews(5);
        reviews.forEach(review => {
          const reviewCard = document.createElement('article');
          reviewCard.className = 'snarkflix-review-card';
          reviewCard.innerHTML = `<h3>${review.title}</h3>`;
          reviewsGrid.appendChild(reviewCard);
        });
        
        // Clear reviews
        reviewsGrid.innerHTML = '';
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    test('should handle large datasets without excessive memory usage', async () => {
      const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Create large dataset
      const largeDataset = createMockReviews(1000);
      
      // Process dataset
      const filtered = largeDataset.filter(r => r.category === 'action');
      const sorted = filtered.sort((a, b) => b.aiScore - a.aiScore);
      
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryUsed = endMemory - startMemory;
      
      // Should use less than 10MB for 1000 reviews
      expect(memoryUsed).toBeLessThan(10 * 1024 * 1024);
      expect(sorted.length).toBeGreaterThan(0);
    });
  });

  describe('Image Loading Performance', () => {
    test('should handle lazy loading efficiently', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const startTime = performance.now();
      
      // Create elements with lazy loading images
      for (let i = 0; i < 10; i++) {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.innerHTML = `
          <div class="snarkflix-review-image">
            <img src="test-image.jpg" alt="Test Movie" loading="lazy">
          </div>
        `;
        reviewsGrid.appendChild(reviewCard);
      }
      
      const endTime = performance.now();
      const createTime = endTime - startTime;
      
      expect(createTime).toBeLessThan(100); // Should create lazy-loaded images quickly
      
      const images = reviewsGrid.querySelectorAll('img[loading="lazy"]');
      expect(images).toHaveLength(10);
    });

    test('should handle image error states efficiently', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const startTime = performance.now();
      
      // Create image with error
      const img = document.createElement('img');
      img.src = 'invalid-image.jpg';
      img.loading = 'lazy';
      img.alt = 'Test Movie';
      
      // Simulate error handling
      const errorEvent = new Event('error');
      img.dispatchEvent(errorEvent);
      
      const endTime = performance.now();
      const errorTime = endTime - startTime;
      
      expect(errorTime).toBeLessThan(10); // Should handle errors quickly
    });
  });

  describe('Search Performance', () => {
    test('should handle debounced search efficiently', async () => {
      const searchInput = document.getElementById('search-input');
      const startTime = performance.now();
      
      // Simulate rapid typing
      const searchTerms = ['t', 'te', 'tes', 'test', 'testi', 'testin', 'testing'];
      
      for (const term of searchTerms) {
        searchInput.value = term;
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
      }
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(50); // Should handle rapid input efficiently
    });

    test('should handle complex search queries efficiently', async () => {
      const largeReviewSet = createMockReviews(100);
      const complexSearchTerm = 'test movie with great visuals and decent story';
      const startTime = performance.now();
      
      // Complex search across multiple fields
      const searchResults = largeReviewSet.filter(review => {
        const searchFields = [
          review.title,
          review.content,
          review.tagline,
          review.aiSummary
        ];
        
        return searchFields.some(field => 
          field.toLowerCase().includes(complexSearchTerm.toLowerCase())
        );
      });
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(100); // Should handle complex search efficiently
    });
  });

  describe('Sorting Performance', () => {
    test('should sort large datasets efficiently', async () => {
      const largeReviewSet = createMockReviews(500);
      const startTime = performance.now();
      
      // Test different sorting algorithms
      const byDate = [...largeReviewSet].sort((a, b) => 
        new Date(b.publishDate) - new Date(a.publishDate)
      );
      
      const byScore = [...largeReviewSet].sort((a, b) => b.aiScore - a.aiScore);
      
      const byLength = [...largeReviewSet].sort((a, b) => b.content.length - a.content.length);
      
      const endTime = performance.now();
      const sortTime = endTime - startTime;
      
      expect(sortTime).toBeLessThan(200); // Should sort 500 items in under 200ms
      expect(byDate.length).toBe(500);
      expect(byScore.length).toBe(500);
      expect(byLength.length).toBe(500);
    });
  });

  describe('Event Handling Performance', () => {
    test('should handle multiple event listeners efficiently', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const startTime = performance.now();
      
      // Add multiple event listeners
      for (let i = 0; i < 50; i++) {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.addEventListener('click', () => {});
        reviewCard.addEventListener('keydown', () => {});
        reviewCard.addEventListener('mouseenter', () => {});
        reviewCard.addEventListener('mouseleave', () => {});
        reviewsGrid.appendChild(reviewCard);
      }
      
      const endTime = performance.now();
      const eventTime = endTime - startTime;
      
      expect(eventTime).toBeLessThan(100); // Should add event listeners efficiently
      expect(reviewsGrid.children).toHaveLength(50);
    });

    test('should handle event delegation efficiently', async () => {
      const reviewsGrid = document.getElementById('reviews-grid');
      const startTime = performance.now();
      
      // Use event delegation
      reviewsGrid.addEventListener('click', (e) => {
        if (e.target.closest('.snarkflix-review-card')) {
          // Handle click
        }
      });
      
      // Create many child elements
      for (let i = 0; i < 100; i++) {
        const reviewCard = document.createElement('article');
        reviewCard.className = 'snarkflix-review-card';
        reviewCard.innerHTML = '<h3>Test Movie</h3>';
        reviewsGrid.appendChild(reviewCard);
      }
      
      const endTime = performance.now();
      const delegationTime = endTime - startTime;
      
      expect(delegationTime).toBeLessThan(100); // Should set up delegation efficiently
    });
  });
});
