# Snarkflix - Movie Review Blog

A snarky movie review blog built with vanilla HTML, CSS, and JavaScript. Featuring sharp wit, honest critiques, and an adorable Bernedoodle sidekick.

## 🎬 About

Snarkflix is a movie review blog that takes a lighthearted and entertaining approach to critiquing films. Our small but mighty team consists of one reviewer, one Robot programmed with nothing but snark and sarcasm, and our goofy Bernedoodle sidekick.

## ✨ Features

- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Accessibility Compliant** - WCAG guidelines followed for inclusive design
- **SEO Optimized** - Structured data, meta tags, and sitemap included
- **Performance Focused** - Lazy loading, service worker, and optimized images
- **Dark Mode Support** - Automatic theme switching based on user preference
- **Social Sharing** - Share reviews on Twitter, Facebook, and copy links
- **Search & Filter** - Find reviews by category, search terms, or sorting options
- **Static Site Generation** - Individual HTML pages for each review

## 🚀 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Icons**: Inline SVG icons
- **Analytics**: Google Analytics (gtag.js)
- **Deployment**: Netlify
- **Images**: AVIF/WebP format for optimal performance

## 📁 Project Structure

```
snarkflix/
├── index.html              # Main homepage
├── styles.css              # All CSS styles
├── script.js               # Main JavaScript functionality
├── reviews-data.js         # Review content data
├── generate-review-pages.js # Static site generator
├── sw.js                   # Service worker for caching
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── netlify.toml            # Netlify configuration
├── images/                 # All images
│   ├── site-assets/        # Logo, background, etc.
│   ├── category-icons/     # Category images
│   └── reviews/           # Review images
└── review/                 # Generated static pages
    ├── 1.html
    ├── 2.html
    └── ...
```

## 🛠️ Setup & Development

### Prerequisites
- Modern web browser
- Node.js (for generating static pages)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sebastianjshaw/snarkflix.git
   cd snarkflix
   ```

2. Open `index.html` in your browser for local development

3. For static page generation:
   ```bash
   node generate-review-pages.js
   ```

### Local Development Server
For testing service worker and proper analytics:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## 📊 Performance Features

- **Image Optimization**: AVIF/WebP formats with lazy loading
- **Service Worker**: Caching for offline functionality
- **Resource Preloading**: Critical assets loaded first
- **Minimal JavaScript**: Vanilla JS for fast execution
- **CSS Optimization**: Custom properties and efficient selectors

## 🎨 Design System

### Colors
- Primary: `#ff6b35` (Orange)
- Secondary: `#004e89` (Blue)
- Accent: `#ffd23f` (Yellow)
- Dark: `#1a1a1a`
- Light: `#f8f9fa`

### Typography
- Font Family: Inter (Google Fonts)
- Responsive font sizes using CSS custom properties
- Proper line heights and spacing

### Components
- Responsive grid layouts
- Accessible form controls
- Consistent button styles
- Card-based content layout

## 📱 Responsive Breakpoints

- **Small Mobile**: ≤ 480px (1 column)
- **Large Mobile**: 481px - 767px (2 columns)
- **Tablet**: 768px - 1024px (3-4 columns)
- **Desktop**: > 1024px (Full layout)

## 🔍 SEO Features

- **Structured Data**: JSON-LD schema markup
- **Meta Tags**: Open Graph and Twitter Cards
- **Canonical URLs**: Prevent duplicate content
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Crawling directives
- **Breadcrumb Navigation**: Clear site hierarchy

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliant
- **Focus Management**: Visible focus indicators
- **Alt Text**: Descriptive image alternatives

## 📈 Analytics

Google Analytics (G-8SV8W7XL64) tracks:
- Page views and user sessions
- Traffic sources and referrals
- User behavior and engagement
- Device and browser information
- Geographic visitor data

## 🚀 Deployment

The site is deployed on Netlify with:
- Automatic builds from GitHub
- Custom domain support
- HTTPS enabled
- CDN distribution
- Form handling capabilities

## 📝 Content Management

Reviews are managed in `reviews-data.js` with the following structure:
```javascript
{
  id: 1,
  title: "Movie Title (Year)",
  releaseYear: 2025,
  publishDate: "Jan 1, 2025",
  readingDuration: "3 min read",
  aiScore: 85,
  aiSummary: "TLDR summary...",
  tagline: "Snarky tagline",
  content: "Full review content...",
  category: "action",
  imageUrl: "path/to/header.jpg",
  additionalImage: "path/to/content.jpg",
  youtubeTrailer: "YouTube URL"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] Comment system
- [ ] User ratings
- [ ] Newsletter signup
- [ ] Advanced search filters
- [ ] Review comparison tool
- [ ] Mobile app (PWA)

## 📞 Contact

- Website: [snarkflix.netlify.app](https://snarkflix.netlify.app)
- GitHub: [sebastianjshaw/snarkflix](https://github.com/sebastianjshaw/snarkflix)

---

*Built with ❤️ and a healthy dose of snark*