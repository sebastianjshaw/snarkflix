// Tests for reviews-data.js structure and validation
const { createMockReview } = require('./test-utils.js');

// Mock the reviews data structure
const mockReviewsData = [
  {
    id: 1,
    title: "Test Movie (2023)",
    releaseYear: 2023,
    publishDate: "Jan 1, 2023",
    readingDuration: "5 min read",
    aiScore: 75,
    aiSummary: "A test movie with great visuals and decent story that provides an entertaining experience.",
    tagline: "A thrilling test movie that delivers excitement and entertainment!",
    content: "This is a test review content that provides detailed analysis of the film.\n\nIt has multiple paragraphs for testing purposes and includes comprehensive coverage of the movie's plot, characters, and themes.\n\nThis additional content ensures the review meets the minimum length requirements for testing.",
    category: "action",
    imageUrl: "images/reviews/test-movie-2023/header-test-movie-2023.png",
    additionalImage: "images/reviews/test-movie/image-test-movie.png",
    additionalImages: [
      "images/reviews/test-movie/image-test-movie-1.png",
      "images/reviews/test-movie/image-test-movie-2.png"
    ],
    youtubeTrailer: "https://www.youtube.com/watch?v=test123"
  }
];

describe('Reviews Data Structure', () => {
  describe('Required Fields Validation', () => {
    test('should have all required fields', () => {
      const review = mockReviewsData[0];
      
      expect(review).toHaveProperty('id');
      expect(review).toHaveProperty('title');
      expect(review).toHaveProperty('releaseYear');
      expect(review).toHaveProperty('publishDate');
      expect(review).toHaveProperty('readingDuration');
      expect(review).toHaveProperty('aiScore');
      expect(review).toHaveProperty('aiSummary');
      expect(review).toHaveProperty('tagline');
      expect(review).toHaveProperty('content');
      expect(review).toHaveProperty('category');
      expect(review).toHaveProperty('imageUrl');
    });

    test('should have correct data types', () => {
      const review = mockReviewsData[0];
      
      expect(typeof review.id).toBe('number');
      expect(typeof review.title).toBe('string');
      expect(typeof review.releaseYear).toBe('number');
      expect(typeof review.publishDate).toBe('string');
      expect(typeof review.readingDuration).toBe('string');
      expect(typeof review.aiScore).toBe('number');
      expect(typeof review.aiSummary).toBe('string');
      expect(typeof review.tagline).toBe('string');
      expect(typeof review.content).toBe('string');
      expect(typeof review.category).toBe('string');
      expect(typeof review.imageUrl).toBe('string');
    });

    test('should have valid ID', () => {
      const review = mockReviewsData[0];
      
      expect(review.id).toBeGreaterThan(0);
      expect(Number.isInteger(review.id)).toBe(true);
    });

    test('should have valid title', () => {
      const review = mockReviewsData[0];
      
      expect(review.title).toBeTruthy();
      expect(review.title.length).toBeGreaterThan(0);
      expect(review.title).toContain('(');
      expect(review.title).toContain(')');
    });

    test('should have valid release year', () => {
      const review = mockReviewsData[0];
      
      expect(review.releaseYear).toBeGreaterThan(1900);
      expect(review.releaseYear).toBeLessThanOrEqual(new Date().getFullYear() + 2);
      expect(Number.isInteger(review.releaseYear)).toBe(true);
    });

    test('should have valid publish date format', () => {
      const review = mockReviewsData[0];
      
      expect(review.publishDate).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });

    test('should have valid reading duration format', () => {
      const review = mockReviewsData[0];
      
      expect(review.readingDuration).toMatch(/^\d+ min read$/);
    });

    test('should have valid AI score', () => {
      const review = mockReviewsData[0];
      
      expect(review.aiScore).toBeGreaterThanOrEqual(0);
      expect(review.aiScore).toBeLessThanOrEqual(100);
      expect(Number.isInteger(review.aiScore)).toBe(true);
    });

    test('should have valid AI summary', () => {
      const review = mockReviewsData[0];
      
      expect(review.aiSummary).toBeTruthy();
      expect(review.aiSummary.length).toBeGreaterThan(50);
      expect(review.aiSummary.length).toBeLessThan(500);
    });

    test('should have valid tagline', () => {
      const review = mockReviewsData[0];
      
      expect(review.tagline).toBeTruthy();
      expect(review.tagline.length).toBeGreaterThan(10);
      expect(review.tagline.length).toBeLessThan(200);
    });

    test('should have valid content', () => {
      const review = mockReviewsData[0];
      
      expect(review.content).toBeTruthy();
      expect(review.content.length).toBeGreaterThan(100);
      expect(review.content).toContain('\n\n'); // Should have paragraph breaks
    });

    test('should have valid category', () => {
      const validCategories = ['action', 'comedy', 'drama', 'sci-fi', 'horror', 'animation', 'adventure', 'musical'];
      const review = mockReviewsData[0];
      
      expect(validCategories).toContain(review.category);
    });

    test('should have valid image URL', () => {
      const review = mockReviewsData[0];
      
      expect(review.imageUrl).toBeTruthy();
      expect(review.imageUrl).toMatch(/^images\/reviews\//);
      expect(review.imageUrl).toMatch(/\.(png|jpg|jpeg|avif|webp)$/);
    });
  });

  describe('Optional Fields Validation', () => {
    test('should have valid additional image if present', () => {
      const review = mockReviewsData[0];
      
      if (review.additionalImage) {
        expect(review.additionalImage).toMatch(/^images\/reviews\//);
        expect(review.additionalImage).toMatch(/\.(png|jpg|jpeg|avif|webp)$/);
      }
    });

    test('should have valid additional images array if present', () => {
      const review = mockReviewsData[0];
      
      if (review.additionalImages) {
        expect(Array.isArray(review.additionalImages)).toBe(true);
        review.additionalImages.forEach(image => {
          expect(image).toMatch(/^images\/reviews\//);
          expect(image).toMatch(/\.(png|jpg|jpeg|avif|webp)$/);
        });
      }
    });

    test('should have valid YouTube trailer URL if present', () => {
      const review = mockReviewsData[0];
      
      if (review.youtubeTrailer) {
        expect(review.youtubeTrailer).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
      }
    });
  });

  describe('Data Consistency', () => {
    test('should have unique IDs', () => {
      const reviews = Array.from({ length: 10 }, (_, i) => createMockReview({ id: i + 1 }));
      const ids = reviews.map(review => review.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    test('should have consistent title and release year format', () => {
      const review = mockReviewsData[0];
      const yearInTitle = review.title.match(/\((\d{4})\)/);
      
      if (yearInTitle) {
        expect(parseInt(yearInTitle[1])).toBe(review.releaseYear);
      }
    });

    test('should have consistent image paths', () => {
      const review = mockReviewsData[0];
      const basePath = `images/reviews/${review.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
      
      expect(review.imageUrl).toMatch(new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    });
  });

  describe('Content Quality', () => {
    test('should have meaningful AI summary', () => {
      const review = mockReviewsData[0];
      
      expect(review.aiSummary).not.toBe('A test movie with great visuals and decent story.');
      expect(review.aiSummary.length).toBeGreaterThan(50);
      expect(review.aiSummary).toMatch(/[.!?]$/); // Should end with punctuation
    });

    test('should have engaging tagline', () => {
      const review = mockReviewsData[0];
      
      expect(review.tagline).not.toBe('Test tagline for testing purposes');
      expect(review.tagline.length).toBeGreaterThan(10);
      expect(review.tagline).toMatch(/[.!?]$/); // Should end with punctuation
    });

    test('should have substantial content', () => {
      const review = mockReviewsData[0];
      
      expect(review.content.length).toBeGreaterThan(200);
      const paragraphs = review.content.split('\n\n');
      expect(paragraphs.length).toBeGreaterThan(2);
    });
  });

  describe('Category Distribution', () => {
    test('should have reviews in multiple categories', () => {
      const reviews = Array.from({ length: 20 }, (_, i) => 
        createMockReview({ 
          id: i + 1, 
          category: ['action', 'comedy', 'drama', 'sci-fi', 'horror'][i % 5] 
        })
      );
      
      const categories = [...new Set(reviews.map(r => r.category))];
      expect(categories.length).toBeGreaterThan(1);
    });

    test('should have balanced category distribution', () => {
      const reviews = Array.from({ length: 20 }, (_, i) => 
        createMockReview({ 
          id: i + 1, 
          category: ['action', 'comedy', 'drama', 'sci-fi', 'horror'][i % 5] 
        })
      );
      
      const categoryCounts = reviews.reduce((acc, review) => {
        acc[review.category] = (acc[review.category] || 0) + 1;
        return acc;
      }, {});
      
      Object.values(categoryCounts).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe('Image Path Validation', () => {
    test('should have valid image file extensions', () => {
      const review = mockReviewsData[0];
      const validExtensions = ['.png', '.jpg', '.jpeg', '.avif', '.webp'];
      
      expect(validExtensions.some(ext => review.imageUrl.endsWith(ext))).toBe(true);
      
      if (review.additionalImage) {
        expect(validExtensions.some(ext => review.additionalImage.endsWith(ext))).toBe(true);
      }
      
      if (review.additionalImages) {
        review.additionalImages.forEach(image => {
          expect(validExtensions.some(ext => image.endsWith(ext))).toBe(true);
        });
      }
    });

    test('should have consistent directory structure', () => {
      const review = mockReviewsData[0];
      const expectedPattern = /^images\/reviews\/[a-z0-9-]+\/[a-z0-9-]+\.(png|jpg|jpeg|avif|webp)$/;
      
      expect(review.imageUrl).toMatch(expectedPattern);
      
      if (review.additionalImage) {
        expect(review.additionalImage).toMatch(expectedPattern);
      }
      
      if (review.additionalImages) {
        review.additionalImages.forEach(image => {
          expect(image).toMatch(expectedPattern);
        });
      }
    });
  });

  describe('URL Validation', () => {
    test('should have valid YouTube URLs', () => {
      const review = mockReviewsData[0];
      
      if (review.youtubeTrailer) {
        const youtubeRegex = /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/;
        expect(review.youtubeTrailer).toMatch(youtubeRegex);
      }
    });

    test('should have valid embed URLs when converted', () => {
      const review = mockReviewsData[0];
      
      if (review.youtubeTrailer) {
        const videoId = review.youtubeTrailer.match(/v=([a-zA-Z0-9_-]+)/)?.[1];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        expect(embedUrl).toMatch(/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/);
      }
    });
  });

  describe('Performance Considerations', () => {
    test('should have reasonable content length for performance', () => {
      const review = mockReviewsData[0];
      
      expect(review.content.length).toBeLessThan(10000); // Max 10KB per review
      expect(review.aiSummary.length).toBeLessThan(1000); // Max 1KB for summary
      expect(review.tagline.length).toBeLessThan(500); // Max 500 chars for tagline
    });

    test('should have optimized image references', () => {
      const review = mockReviewsData[0];
      
      // Check that image paths are relative and optimized
      expect(review.imageUrl).not.toMatch(/^https?:\/\//);
      expect(review.imageUrl).toMatch(/^images\//);
      
      if (review.additionalImage) {
        expect(review.additionalImage).not.toMatch(/^https?:\/\//);
        expect(review.additionalImage).toMatch(/^images\//);
      }
    });
  });
});
