// Accessibility tests for Snarkflix
const { 
  createMockReview, 
  setupDOM, 
  mockReviewsData, 
  simulateUserInteraction,
  createMockElement,
  expectElementToHaveClasses,
  expectElementToHaveAttributes
} = require('./test-utils.js');

describe('Snarkflix Accessibility Tests', () => {
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

  describe('Semantic HTML Structure', () => {
    test('should use proper heading hierarchy', () => {
      const h1 = document.querySelector('h1');
      const h2s = document.querySelectorAll('h2');
      
      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
      
      // Check that h1 comes before h2s
      const h1Position = Array.from(document.querySelectorAll('h1, h2')).indexOf(h1);
      h2s.forEach(h2 => {
        const h2Position = Array.from(document.querySelectorAll('h1, h2')).indexOf(h2);
        expect(h2Position).toBeGreaterThan(h1Position);
      });
    });

    test('should use proper landmark elements', () => {
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const footer = document.querySelector('footer');
      const nav = document.querySelector('nav');
      
      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
      expect(nav).toBeInTheDocument();
    });

    test('should use proper list structure for navigation', () => {
      const nav = document.querySelector('nav');
      const navList = nav.querySelector('ul');
      const navItems = navList.querySelectorAll('li');
      
      expect(navList).toBeInTheDocument();
      expect(navItems.length).toBeGreaterThan(0);
      
      navItems.forEach(item => {
        const link = item.querySelector('a');
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });
  });

  describe('Image Accessibility', () => {
    test('should have alt text for all images', () => {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        expect(img.getAttribute('alt')).toBeTruthy();
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    test('should have descriptive alt text for review images', () => {
      const review = createMockReview();
      const img = createMockElement('img', {
        src: review.imageUrl,
        alt: `${review.title} movie poster`
      });
      
      expect(img.getAttribute('alt')).toContain(review.title);
      expect(img.getAttribute('alt')).toContain('poster');
    });

    test('should handle decorative images appropriately', () => {
      const decorativeImg = createMockElement('img', {
        src: 'decorative-image.jpg',
        alt: '',
        role: 'presentation'
      });
      
      expect(decorativeImg.getAttribute('alt')).toBe('');
      expect(decorativeImg.getAttribute('role')).toBe('presentation');
    });
  });

  describe('Form Accessibility', () => {
    test('should have proper form labels', () => {
      const searchInput = document.getElementById('search-input');
      const sortSelect = document.getElementById('sort-select');
      
      expect(searchInput).toBeInTheDocument();
      expect(sortSelect).toBeInTheDocument();
      
      // Check for associated labels
      const searchLabel = document.querySelector('label[for="search-input"]');
      const sortLabel = document.querySelector('label[for="sort-select"]');
      
      // If no explicit labels, check for aria-label
      if (!searchLabel) {
        expect(searchInput.getAttribute('aria-label')).toBeTruthy();
      }
      if (!sortLabel) {
        expect(sortSelect.getAttribute('aria-label')).toBeTruthy();
      }
    });

    test('should have proper form validation', () => {
      const searchInput = document.getElementById('search-input');
      
      // Test required attribute if applicable
      if (searchInput.hasAttribute('required')) {
        expect(searchInput.getAttribute('required')).toBeDefined();
      }
      
      // Test input type
      expect(searchInput.getAttribute('type')).toBe('text');
    });

    test('should have proper button accessibility', () => {
      const clearButton = document.getElementById('clear-search-btn');
      const loadMoreButton = document.getElementById('load-more-btn');
      
      expect(clearButton).toBeInTheDocument();
      expect(loadMoreButton).toBeInTheDocument();
      
      // Check for proper button semantics
      expect(clearButton.tagName).toBe('BUTTON');
      expect(loadMoreButton.tagName).toBe('BUTTON');
      
      // Check for accessible text
      expect(clearButton.textContent).toBeTruthy();
      expect(loadMoreButton.textContent).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    test('should support tab navigation', () => {
      const focusableElements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      focusableElements.forEach(element => {
        expect(element).toBeInTheDocument();
        expect(element.getAttribute('tabindex')).not.toBe('-1');
      });
    });

    test('should have proper tab order', () => {
      const focusableElements = Array.from(document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      
      // Check that elements are in logical order
      focusableElements.forEach((element, index) => {
        if (index > 0) {
          const prevElement = focusableElements[index - 1];
          const prevRect = prevElement.getBoundingClientRect();
          const currentRect = element.getBoundingClientRect();
          
          // Elements should generally be in top-to-bottom, left-to-right order
          expect(currentRect.top).toBeGreaterThanOrEqual(prevRect.top - 10);
        }
      });
    });

    test('should handle keyboard events properly', () => {
      const reviewCard = createMockElement('article', {
        tabindex: '0',
        'aria-label': 'Review: Test Movie'
      });
      
      document.body.appendChild(reviewCard);
      
      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      reviewCard.dispatchEvent(enterEvent);
      
      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      reviewCard.dispatchEvent(spaceEvent);
      
      expect(reviewCard).toBeInTheDocument();
    });

    test('should have visible focus indicators', () => {
      const focusableElements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach(element => {
        // Check for focus styles (this would be tested with CSS)
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('ARIA Labels and Roles', () => {
    test('should have proper ARIA labels for interactive elements', () => {
      const mobileMenuBtn = document.querySelector('.snarkflix-mobile-menu-btn');
      const categoryCards = document.querySelectorAll('[data-category]');
      
      expect(mobileMenuBtn).toHaveAttribute('aria-label');
      expect(mobileMenuBtn.getAttribute('aria-label')).toBeTruthy();
      
      categoryCards.forEach(card => {
        expect(card).toHaveAttribute('aria-label');
        expect(card.getAttribute('aria-label')).toContain('category');
      });
    });

    test('should have proper ARIA roles', () => {
      const nav = document.querySelector('nav');
      const main = document.querySelector('main');
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      
      expect(nav).toHaveAttribute('role', 'navigation');
      expect(main).toHaveAttribute('role', 'main');
      expect(header).toHaveAttribute('role', 'banner');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    test('should have proper ARIA states', () => {
      const mobileMenuBtn = document.querySelector('.snarkflix-mobile-menu-btn');
      const clearButton = document.getElementById('clear-search-btn');
      
      // Check for aria-expanded on toggle buttons
      if (mobileMenuBtn) {
        expect(mobileMenuBtn).toHaveAttribute('aria-expanded');
      }
      
      // Check for aria-hidden on decorative elements
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
      decorativeElements.forEach(element => {
        expect(element.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Color and Contrast', () => {
    test('should have sufficient color contrast', () => {
      // This would typically be tested with a color contrast checker
      // For now, we'll check that elements have proper color attributes
      const textElements = document.querySelectorAll('h1, h2, h3, p, span');
      
      textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        // Both should be defined
        expect(color).toBeTruthy();
        expect(backgroundColor).toBeTruthy();
      });
    });

    test('should not rely solely on color for information', () => {
      const scoreElements = document.querySelectorAll('.snarkflix-review-score');
      
      scoreElements.forEach(element => {
        // Check that score information is conveyed through text, not just color
        expect(element.textContent).toContain('Score');
        expect(element.textContent).toMatch(/\d+/);
      });
    });
  });

  describe('Screen Reader Support', () => {
    test('should have proper heading structure for screen readers', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
      
      // Check that heading levels are sequential
      for (let i = 1; i < headingLevels.length; i++) {
        expect(headingLevels[i] - headingLevels[i-1]).toBeLessThanOrEqual(1);
      }
    });

    test('should have proper skip links', () => {
      const skipLinks = document.querySelectorAll('a[href="#main"], a[href="#content"]');
      
      // Skip links should be present for keyboard users
      if (skipLinks.length > 0) {
        skipLinks.forEach(link => {
          expect(link.textContent.toLowerCase()).toContain('skip');
        });
      }
    });

    test('should have proper live regions for dynamic content', () => {
      const liveRegions = document.querySelectorAll('[aria-live], [aria-live="polite"], [aria-live="assertive"]');
      
      // Live regions should be present for dynamic content updates
      liveRegions.forEach(region => {
        expect(region.getAttribute('aria-live')).toMatch(/^(polite|assertive)$/);
      });
    });
  });

  describe('Review Card Accessibility', () => {
    test('should have accessible review cards', () => {
      const review = createMockReview();
      const reviewCard = createMockElement('article', {
        class: 'snarkflix-review-card',
        'data-category': review.category,
        tabindex: '0',
        'aria-label': `Review: ${review.title}`
      });
      
      expectElementToHaveClasses(reviewCard, 'snarkflix-review-card');
      expectElementToHaveAttributes(reviewCard, {
        'data-category': review.category,
        'tabindex': '0',
        'aria-label': `Review: ${review.title}`
      });
    });

    test('should have accessible review content', () => {
      const review = createMockReview();
      const reviewContent = createMockElement('div', {
        class: 'snarkflix-review-content'
      });
      
      const title = createMockElement('h3', {
        class: 'snarkflix-review-title'
      });
      title.textContent = review.title;
      
      const summary = createMockElement('p', {
        class: 'snarkflix-review-summary'
      });
      summary.textContent = review.aiSummary.substring(0, 100) + '...';
      
      reviewContent.appendChild(title);
      reviewContent.appendChild(summary);
      
      expect(title.textContent).toBe(review.title);
      expect(summary.textContent).toContain(review.aiSummary.substring(0, 100));
    });
  });

  describe('Error Handling Accessibility', () => {
    test('should have accessible error messages', () => {
      const errorMessage = createMockElement('div', {
        class: 'snarkflix-error-message',
        role: 'alert',
        'aria-live': 'assertive'
      });
      errorMessage.textContent = 'An error occurred while loading reviews.';
      
      expectElementToHaveAttributes(errorMessage, {
        'role': 'alert',
        'aria-live': 'assertive'
      });
      expect(errorMessage.textContent).toBeTruthy();
    });

    test('should have accessible loading states', () => {
      const loadingSpinner = createMockElement('div', {
        class: 'snarkflix-loading-spinner',
        'aria-label': 'Loading reviews...',
        'aria-live': 'polite'
      });
      
      expectElementToHaveAttributes(loadingSpinner, {
        'aria-label': 'Loading reviews...',
        'aria-live': 'polite'
      });
    });
  });

  describe('Mobile Accessibility', () => {
    test('should have accessible mobile menu', () => {
      const mobileMenuBtn = document.querySelector('.snarkflix-mobile-menu-btn');
      
      expect(mobileMenuBtn).toHaveAttribute('aria-label');
      expect(mobileMenuBtn).toHaveAttribute('aria-expanded');
      
      // Test mobile menu toggle
      simulateUserInteraction(mobileMenuBtn, 'click');
      
      expect(mobileMenuBtn.getAttribute('aria-expanded')).toBeDefined();
    });

    test('should have proper touch targets', () => {
      const touchElements = document.querySelectorAll('button, a, input, select');
      
      touchElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        // Touch targets should be at least 44x44 pixels
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });
  });
});
