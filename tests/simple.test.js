// Simple test to verify Jest setup
const { createMockReview, setupDOM } = require('./test-utils.js');

describe('Snarkflix Basic Tests', () => {
  test('should create mock review', () => {
    const review = createMockReview();
    
    expect(review).toBeDefined();
    expect(review.id).toBe(1);
    expect(review.title).toBe('Test Movie (2023)');
    expect(review.category).toBe('action');
  });

  test('should setup DOM structure', () => {
    setupDOM();
    
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    
    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  test('should have search input', () => {
    setupDOM();
    
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    
    expect(searchInput).toBeInTheDocument();
    expect(sortSelect).toBeInTheDocument();
  });

  test('should have reviews grid', () => {
    setupDOM();
    
    const reviewsGrid = document.getElementById('reviews-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    expect(reviewsGrid).toBeInTheDocument();
    expect(loadMoreBtn).toBeInTheDocument();
  });
});
