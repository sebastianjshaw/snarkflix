# Contributing to Snarkflix

Thank you for your interest in contributing to Snarkflix! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Types of Contributions
- **Bug Reports**: Report issues and bugs
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit code changes and improvements
- **Documentation**: Improve or add documentation
- **Content**: Add new movie reviews
- **Design**: Improve UI/UX and visual design

## 🐛 Reporting Issues

### Before Reporting
1. Check existing issues to avoid duplicates
2. Ensure you're using the latest version
3. Test on different browsers/devices if applicable

### Issue Template
When reporting issues, please include:
- **Description**: Clear description of the problem
- **Steps to Reproduce**: Detailed steps to recreate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, device information
- **Screenshots**: If applicable, include screenshots

### Bug Report Example
```markdown
## Bug Description
The share buttons are not visible in dark mode.

## Steps to Reproduce
1. Open the site in dark mode
2. Navigate to any review page
3. Look at the share buttons

## Expected Behavior
Share buttons should be visible and accessible in dark mode.

## Actual Behavior
Share buttons are invisible or have poor contrast.

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Device: Desktop
```

## ✨ Feature Requests

### Before Requesting
1. Check if the feature already exists
2. Consider if it aligns with the project's goals
3. Think about implementation complexity

### Feature Request Template
```markdown
## Feature Description
Brief description of the requested feature.

## Use Case
Why would this feature be useful?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other approaches have you considered?

## Additional Context
Any other relevant information or context.
```

## 💻 Code Contributions

### Getting Started
1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/snarkflix.git
   cd snarkflix
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Setup
1. **Open `index.html`** in your browser for local development
2. **For static page generation**:
   ```bash
   node generate-review-pages.js
   ```
3. **For testing service worker** (recommended):
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

### Code Standards
Follow the coding standards outlined in the [README.md](README.md#-code-style):

#### HTML
- Use semantic HTML5 elements
- Include proper ARIA labels
- Ensure accessibility compliance
- Add appropriate meta tags

#### CSS
- Follow BEM methodology
- Use CSS custom properties
- Mobile-first responsive design
- Optimize for performance

#### JavaScript
- Use ES6+ features
- Write vanilla JavaScript
- Implement proper error handling
- Follow modular patterns

### Testing
Before submitting your changes:
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on different devices (desktop, tablet, mobile)
- [ ] Verify accessibility with screen readers
- [ ] Check performance impact
- [ ] Ensure dark mode compatibility
- [ ] Validate HTML and CSS

### Commit Guidelines
Use clear, descriptive commit messages:
```bash
# Good examples
git commit -m "Fix share button visibility in dark mode"
git commit -m "Add tablet breakpoint for better responsive design"
git commit -m "Update README with setup instructions"

# Avoid
git commit -m "fix stuff"
git commit -m "updates"
```

### Pull Request Process
1. **Ensure your branch is up to date**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Create a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots if applicable
   - Testing checklist

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Accessibility improvement

## Testing
- [ ] Tested on multiple browsers
- [ ] Tested on different devices
- [ ] Verified accessibility
- [ ] Checked performance impact
- [ ] Tested dark mode compatibility

## Screenshots
If applicable, add screenshots of your changes.

## Related Issues
Fixes #(issue number)
```

## 📝 Content Contributions

### Adding New Reviews
To add a new movie review:

1. **Add to `reviews-data.js`**:
   ```javascript
   {
     id: 42,
     title: "Movie Title (Year)",
     releaseYear: 2025,
     publishDate: "Jan 1, 2025",
     readingDuration: "3 min read",
     aiScore: 85,
     aiSummary: "TLDR summary...",
     tagline: "Snarky tagline",
     content: "Full review content...",
     category: "action",
     imageUrl: "images/reviews/movie-title/header-movie-title.avif",
     additionalImage: "images/reviews/movie-title/image-movie-title.avif",
     youtubeTrailer: "https://www.youtube.com/watch?v=..."
   }
   ```

2. **Follow the tone of voice** outlined in `tone-of-voice.md`
3. **Add images** to the appropriate directory
4. **Regenerate static pages**:
   ```bash
   node generate-review-pages.js
   ```

### Review Guidelines
- **Maintain snarky tone** while being constructive
- **Include specific examples** from the movie
- **Provide honest critique** with humor
- **Keep content appropriate** for general audiences
- **Follow British English** spelling conventions

## 🎨 Design Contributions

### UI/UX Improvements
- Follow the existing design system
- Maintain brand consistency
- Ensure accessibility compliance
- Test across different screen sizes
- Consider dark mode compatibility

### Visual Assets
- Use appropriate image formats (AVIF/WebP preferred)
- Optimize images for web performance
- Maintain consistent styling
- Follow accessibility guidelines for images

## 📚 Documentation Contributions

### Types of Documentation
- **Code comments**: Explain complex logic
- **README updates**: Improve setup instructions
- **API documentation**: Document JavaScript functions
- **Tutorial content**: Help users understand features

### Documentation Standards
- Use clear, concise language
- Include code examples where helpful
- Keep information up to date
- Follow markdown best practices

## 🔍 Review Process

### What We Look For
- **Code Quality**: Clean, readable, maintainable code
- **Functionality**: Changes work as intended
- **Performance**: No negative performance impact
- **Accessibility**: Maintains or improves accessibility
- **Compatibility**: Works across browsers and devices
- **Documentation**: Appropriate documentation updates

### Review Timeline
- **Initial Review**: Within 1-2 business days
- **Feedback**: Clear, constructive feedback provided
- **Iteration**: Work together to improve the contribution
- **Merge**: Once approved, changes will be merged

## 🚫 What Not to Contribute

### Inappropriate Content
- Offensive or inappropriate language
- Copyrighted material without permission
- Spam or promotional content
- Content that violates platform policies

### Technical Limitations
- Breaking changes without discussion
- Dependencies that significantly increase bundle size
- Changes that reduce accessibility
- Code that doesn't follow project standards

## 💬 Communication

### Getting Help
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Pull Request Comments**: For specific code feedback

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's values and goals

## 🎉 Recognition

### Contributors
Contributors will be recognized in:
- **README.md**: Listed as contributors
- **Release Notes**: Acknowledged in releases
- **GitHub**: Appear in the contributors list

### Types of Recognition
- **Code Contributors**: Direct code contributions
- **Content Contributors**: Review and content additions
- **Documentation Contributors**: Documentation improvements
- **Community Contributors**: Helpful feedback and support

## 📄 License

By contributing to Snarkflix, you agree that your contributions will be licensed under the same license as the project.

## 🤝 Questions?

If you have questions about contributing:
1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Reach out through GitHub discussions

Thank you for contributing to Snarkflix! Your efforts help make this project better for everyone. 🎬✨
