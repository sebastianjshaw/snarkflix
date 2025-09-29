// Test utilities for Snarkflix tests

/**
 * Create a mock review object for testing
 */
function createMockReview(overrides = {}) {
  return {
    id: 1,
    title: "Test Movie (2023)",
    releaseYear: 2023,
    publishDate: "Jan 1, 2023",
    readingDuration: "5 min read",
    aiScore: 75,
    aiSummary: "A test movie with great visuals and decent story.",
    tagline: "Test tagline for testing purposes",
    content: "This is a test review content.\n\nIt has multiple paragraphs for testing.",
    category: "action",
    imageUrl: "images/reviews/test-movie/header-test-movie.png",
    additionalImage: "images/reviews/test-movie/image-test-movie.png",
    additionalImages: [
      "images/reviews/test-movie/image-test-movie-1.png",
      "images/reviews/test-movie/image-test-movie-2.png"
    ],
    youtubeTrailer: "https://www.youtube.com/watch?v=test123",
    ...overrides
  };
}

/**
 * Create multiple mock reviews for testing
 */
function createMockReviews(count = 5) {
  return Array.from({ length: count }, (_, index) => 
    createMockReview({
      id: index + 1,
      title: `Test Movie ${index + 1} (2023)`,
      category: ['action', 'comedy', 'drama', 'sci-fi', 'horror'][index % 5],
      aiScore: 60 + (index * 5)
    })
  );
}

/**
 * Set up a basic DOM structure for testing
 */
function setupDOM() {
  document.body.innerHTML = `
    <div id="app">
      <header class="snarkflix-header">
        <div class="snarkflix-logo">
          <img src="images/site-assets/logo.avif" alt="Snarkflix Logo" class="snarkflix-logo-image">
          <span class="snarkflix-logo-text">Snarkflix</span>
        </div>
        <nav class="snarkflix-nav">
          <button class="snarkflix-mobile-menu-btn" aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul class="snarkflix-nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#reviews">Reviews</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </header>
      
      <main>
        <section class="snarkflix-hero">
          <div class="snarkflix-hero-content">
            <div class="snarkflix-hero-text">
              <h1>Welcome to Snarkflix</h1>
              <p>Snarky movie reviews with a side of sass</p>
            </div>
            <div class="snarkflix-hero-logo">
              <img src="images/site-assets/logo.avif" alt="Snarkflix Logo">
            </div>
          </div>
        </section>
        
        <section class="snarkflix-categories">
          <h2>Categories</h2>
          <div class="snarkflix-categories-grid">
            <a href="#action" data-category="action" class="snarkflix-category-card">
              <div class="snarkflix-category-image">
                <img src="images/category-icons/Action.png" alt="Action" class="snarkflix-category-icon">
              </div>
              <span class="snarkflix-category-name">Action</span>
              <span class="snarkflix-category-count">(5)</span>
            </a>
          </div>
        </section>
        
        <section class="snarkflix-reviews">
          <div class="snarkflix-reviews-header">
            <h2 class="snarkflix-section-title">Reviews</h2>
            <select class="snarkflix-sort-select" id="sort-select">
              <option value="latest">Latest</option>
              <option value="best">Best</option>
              <option value="longest">Longest</option>
            </select>
          </div>
          
          <div class="snarkflix-search-container">
            <input type="text" id="search-input" placeholder="Search reviews..." class="snarkflix-search-input">
            <button id="clear-search-btn" class="snarkflix-clear-search-btn" style="display: none;">Clear</button>
          </div>
          
          <div id="reviews-grid" class="snarkflix-reviews-grid"></div>
          <button id="load-more-btn" class="snarkflix-load-more-btn" style="display: none;">Load More Reviews</button>
        </section>
        
        <div id="review-content-wrapper" class="snarkflix-review-content-wrapper" style="display: none;">
          <!-- Review content will be inserted here -->
        </div>
      </main>
      
      <footer class="snarkflix-footer">
        <p>&copy; 2025 Snarkflix. All rights reserved.</p>
      </footer>
    </div>
  `;
}

/**
 * Mock the reviews data for testing
 */
function mockReviewsData() {
  const mockReviews = createMockReviews(10);
  
  // Mock the global snarkflixReviews array
  global.snarkflixReviews = mockReviews;
  
  return mockReviews;
}

/**
 * Wait for async operations to complete
 */
function waitFor(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simulate user interaction
 */
function simulateUserInteraction(element, eventType, options = {}) {
  const event = new Event(eventType, { bubbles: true, ...options });
  element.dispatchEvent(event);
}

/**
 * Mock console methods and return their calls
 */
function mockConsole() {
  const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    info: jest.spyOn(console, 'info').mockImplementation(),
  };
  
  return {
    ...consoleSpy,
    restore: () => {
      Object.values(consoleSpy).forEach(spy => spy.mockRestore());
    }
  };
}

/**
 * Create a mock DOM element with specific properties
 */
function createMockElement(tagName, attributes = {}, innerHTML = '') {
  const element = document.createElement(tagName);
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  element.innerHTML = innerHTML;
  return element;
}

/**
 * Assert that an element has specific classes
 */
function expectElementToHaveClasses(element, classes) {
  const classList = Array.isArray(classes) ? classes : [classes];
  classList.forEach(className => {
    expect(element).toHaveClass(className);
  });
}

/**
 * Assert that an element has specific attributes
 */
function expectElementToHaveAttributes(element, attributes) {
  Object.entries(attributes).forEach(([key, value]) => {
    expect(element).toHaveAttribute(key, value);
  });
}

// Export all functions
module.exports = {
  createMockReview,
  createMockReviews,
  setupDOM,
  mockReviewsData,
  waitFor,
  simulateUserInteraction,
  mockConsole,
  createMockElement,
  expectElementToHaveClasses,
  expectElementToHaveAttributes
};