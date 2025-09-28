# Snarkflix Code Review - TODO List

## 🚨 CRITICAL ISSUES (High Priority)

### 1. Fix Duplicate Adventure Category
- **File**: `index.html`
- **Lines**: 134-140
- **Issue**: Adventure category appears twice in the categories grid
- **Action**: Remove the duplicate block
```html
<!-- REMOVE THIS DUPLICATE BLOCK -->
<a href="#adventure" class="snarkflix-category-card" data-category="adventure">
    <div class="snarkflix-category-image adventure-category">
        <img src="images/category-icons/Adventure.png" alt="Adventure" class="snarkflix-category-icon">
    </div>
    <h3>Adventure</h3>
    <span class="snarkflix-category-count">1 post</span>
</a>
```

### 2. Implement Image Lazy Loading
- **Files**: All HTML files with images
- **Issue**: All 85 images load immediately, causing performance issues
- **Action**: Add `loading="lazy"` to all images
```html
<!-- BEFORE -->
<img src="image.avif" alt="Description">

<!-- AFTER -->
<img src="image.avif" loading="lazy" alt="Description">
```

### 3. Add Resource Preloading
- **File**: `index.html`
- **Issue**: Critical assets not preloaded
- **Action**: Add preload links in `<head>`
```html
<head>
    <link rel="preload" href="images/site-assets/logo.avif" as="image">
    <link rel="preload" href="styles.css" as="style">
    <link rel="preload" href="script.js" as="script">
</head>
```

## ⚡ PERFORMANCE OPTIMIZATIONS (High Priority)

### 4. Add Service Worker for Caching
- **File**: Create `sw.js`
- **Action**: Implement service worker for image caching
```javascript
// sw.js
const CACHE_NAME = 'snarkflix-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/images/site-assets/logo.avif'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});
```

### 5. Optimize Image Compression
- **Action**: Compress existing images
- **Command**: 
```bash
# Install cwebp if not already installed
brew install webp

# Compress AVIF images to WebP for better compatibility
find images/ -name "*.avif" -exec sh -c 'cwebp "$1" -o "${1%.avif}.webp"' _ {} \;
```

### 6. Add Image Optimization Script
- **File**: Create `optimize-images.js`
- **Action**: Automated image optimization
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Script to optimize all images
// Convert AVIF to WebP with compression
// Generate responsive image sizes
```

## 📱 RESPONSIVENESS IMPROVEMENTS (Medium Priority)

### 7. Add Tablet Breakpoint
- **File**: `styles.css`
- **Action**: Add tablet-specific styles
```css
/* Add tablet breakpoint */
@media (min-width: 768px) and (max-width: 1024px) {
    .snarkflix-hero-content {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    
    .snarkflix-reviews-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### 8. Add Large Mobile Breakpoint
- **File**: `styles.css`
- **Action**: Add large mobile styles
```css
/* Add large mobile breakpoint */
@media (min-width: 481px) and (max-width: 767px) {
    .snarkflix-reviews-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .snarkflix-categories-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

### 9. Improve Hero Section Mobile Layout
- **File**: `styles.css`
- **Action**: Better mobile hero optimization
```css
@media (max-width: 480px) {
    .snarkflix-hero {
        min-height: 60vh;
        padding: 2rem 0;
    }
    
    .snarkflix-hero-logo {
        max-width: 200px;
        height: auto;
    }
}
```

## 🔍 SEO ENHANCEMENTS (Medium Priority)

### 10. Add Structured Data (JSON-LD)
- **File**: `index.html`
- **Action**: Add schema.org markup
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Snarkflix",
  "description": "Snarky movie reviews with sharp wit and adorable Bernedoodle companion",
  "url": "https://snarkflix.netlify.app",
  "author": {
    "@type": "Person",
    "name": "Snarkflix Reviewer"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Snarkflix",
    "logo": {
      "@type": "ImageObject",
      "url": "https://snarkflix.netlify.app/images/site-assets/logo.avif"
    }
  }
}
</script>
```

### 11. Create Sitemap
- **File**: Create `sitemap.xml`
- **Action**: Generate sitemap for search engines
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://snarkflix.netlify.app/</loc>
    <lastmod>2025-01-27</lastmod>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://snarkflix.netlify.app/#reviews</loc>
    <lastmod>2025-01-27</lastmod>
    <priority>0.8</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://snarkflix.netlify.app/#categories</loc>
    <lastmod>2025-01-27</lastmod>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://snarkflix.netlify.app/#about</loc>
    <lastmod>2025-01-27</lastmod>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
```

### 12. Create Robots.txt
- **File**: Create `robots.txt`
- **Action**: Add robots.txt for search engine crawling
```
User-agent: *
Allow: /
Disallow: /review/
Sitemap: https://snarkflix.netlify.app/sitemap.xml
```

### 13. Add Canonical URLs
- **File**: `index.html` and review pages
- **Action**: Add canonical meta tags
```html
<link rel="canonical" href="https://snarkflix.netlify.app/">
```

### 14. Add Breadcrumb Navigation
- **File**: `index.html`
- **Action**: Add breadcrumb for better navigation
```html
<nav aria-label="Breadcrumb" class="snarkflix-breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="#reviews">Reviews</a></li>
        <li aria-current="page">Current Review</li>
    </ol>
</nav>
```

## 🎨 UI/UX IMPROVEMENTS (Low Priority)

### 15. Add Loading States
- **File**: `script.js`
- **Action**: Add loading indicators
```javascript
// Add loading spinner for image loading
function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'snarkflix-loading-spinner';
    spinner.innerHTML = 'Loading...';
    return spinner;
}
```

### 16. Add Error Handling
- **File**: `script.js`
- **Action**: Add error handling for failed image loads
```javascript
// Add error handling for images
function handleImageError(img) {
    img.src = 'images/placeholder.jpg';
    img.alt = 'Image not available';
}
```

### 17. Add Keyboard Navigation
- **File**: `script.js`
- **Action**: Improve keyboard navigation
```javascript
// Add keyboard support for category filtering
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        closeMobileMenu();
    }
});
```

## 📊 ANALYTICS & MONITORING (Low Priority)

### 18. Add Google Analytics
- **File**: `index.html`
- **Action**: Add Google Analytics tracking
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 19. Add Performance Monitoring
- **File**: `script.js`
- **Action**: Add performance tracking
```javascript
// Track page load performance
window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
});
```

## 🧪 TESTING & QUALITY ASSURANCE (Low Priority)

### 20. Add Automated Testing
- **File**: Create `tests/`
- **Action**: Add unit tests for JavaScript functions
```javascript
// tests/script.test.js
describe('Snarkflix Functions', () => {
    test('filterReviews should filter by category', () => {
        // Test category filtering
    });
    
    test('sortReviews should sort by date', () => {
        // Test sorting functionality
    });
});
```

### 21. Add Lighthouse CI
- **File**: Create `.lighthouseci/`
- **Action**: Automated performance testing
```yaml
# .lighthouseci/config.yml
ci:
  collect:
    url: ['https://snarkflix.netlify.app/']
  assert:
    assertions:
      'categories:performance': ['error', {'minScore': 0.8}]
      'categories:accessibility': ['error', {'minScore': 0.9}]
      'categories:seo': ['error', {'minScore': 0.8}]
```

## 📝 DOCUMENTATION (Low Priority)

### 22. Add README.md
- **File**: Create `README.md`
- **Action**: Document the project
```markdown
# Snarkflix - Movie Review Blog

A snarky movie review blog built with vanilla HTML, CSS, and JavaScript.

## Features
- Responsive design
- Accessibility compliant
- SEO optimized
- Performance focused

## Setup
1. Clone repository
2. Open index.html in browser
3. Enjoy snarky reviews!
```

### 23. Add Contributing Guidelines
- **File**: Create `CONTRIBUTING.md`
- **Action**: Document contribution process
```markdown
# Contributing to Snarkflix

## Code Style
- Use semantic HTML
- Follow BEM CSS methodology
- Write accessible code
- Optimize for performance
```

## 🎯 PRIORITY SUMMARY

### Immediate (This Week)
1. Fix duplicate Adventure category
2. Implement image lazy loading
3. Add resource preloading

### Short Term (Next 2 Weeks)
4. Add service worker
5. Optimize image compression
6. Add tablet breakpoints
7. Add structured data

### Medium Term (Next Month)
8. Create sitemap and robots.txt
9. Add canonical URLs
10. Implement breadcrumb navigation

### Long Term (Future)
11. Add analytics and monitoring
12. Implement automated testing
13. Create comprehensive documentation

---

**Total Items**: 23
**Critical**: 3
**High Priority**: 3
**Medium Priority**: 8
**Low Priority**: 9

*Last Updated: January 27, 2025*
