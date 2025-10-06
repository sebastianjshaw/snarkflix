# Snarkflix Code Review - TODO List

## Reviews Needing Better Endings

### 1. Wolfwalkers (2020)
- **Issue**: Ends with "The magic representation is lovely. Well worth a watch." - Very brief, no real conclusion
- **Action**: Add proper analysis and conclusion tying together observations about animation style, storytelling, and overall impact

### 2. ✅ The Man Who Killed Hitler and Then the Bigfoot (2018) - UPDATED
- **Issue**: Was too brief, ended abruptly without proper conclusion
- **Solution**: Expanded from 1-min to 4-min read with:
  - Detailed plot analysis and explanation of why it doesn't work
  - Specific examples (plague logic, government decisions, mystery box)
  - Constructive ending suggesting what would make it better (two separate films)
  - Proper conclusion assessing its "so bad it's good" potential

### 3. Black Widow (2021)
- **Issue**: Ends with "Location choices are on point though and I now really want to see David Harbour in The Boys as Vlad, but we never will because the TV version isn't fun it's 'realistic'." - Tangent that doesn't conclude the review
- **Action**: Bring the conclusion back to Black Widow itself - summarize whether it's worth watching and what it achieves/fails to achieve

### 4. ✅ The Revenant (2015) - DELETED
- Review was too brief and dismissive
- Deleted entirely rather than expanding

## Technical

### 5. ✅ Implement Cache Busting for New Content (COMPLETED)
- **Issue**: Browser aggressively caches old files/data, users don't see new reviews without hard refresh
- **Solution Implemented**: 
  - ✅ Added version query parameters to script tags (`reviews-data.js?v=timestamp`)
  - ✅ Updated Service Worker to use network-first strategy for JavaScript files
  - ✅ Created `update-version.js` script to automate version updates
  - ✅ Added `npm run update-version` and `npm run deploy` commands
- **How to Use**: Run `npm run deploy` before pushing new content - it will:
  1. Update version numbers in `index.html` and `sw.js`
  2. Regenerate review pages
  3. Stage all files for commit
  4. You just need to commit and push!

### 6. Add Performance Monitoring (Low Priority)
- **File**: `script.js`
- **Action**: Add performance tracking
```javascript
// Track page load performance
window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
});
```
