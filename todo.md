# Snarkflix Code Review - TODO List

## Reviews Needing Better Endings

### 1. Wolfwalkers (2020)
- **Issue**: Ends with "The magic representation is lovely. Well worth a watch." - Very brief, no real conclusion
- **Action**: Add proper analysis and conclusion tying together observations about animation style, storytelling, and overall impact

### 2. The Man Who Killed Hitler and Then the Bigfoot (2018)
- **Issue**: Ends with "It suffers from the American adoration of the long hunter/hero and the nobility of hunting as an activity." - Just stops without tying observations together
- **Action**: Add a concluding paragraph that ties together the absurd premise, execution issues, and what the film was trying to be vs what it actually is

### 3. Black Widow (2021)
- **Issue**: Ends with "Location choices are on point though and I now really want to see David Harbour in The Boys as Vlad, but we never will because the TV version isn't fun it's 'realistic'." - Tangent that doesn't conclude the review
- **Action**: Bring the conclusion back to Black Widow itself - summarize whether it's worth watching and what it achieves/fails to achieve

### 4. The Revenant (2015)
- **Issue**: "The Revenant confuses length with quality and violence with depth. I was unsurprised to learn it had the same director as the tedious Birdman, another god-awful self-indulgent mess of a film(though for different reasons)." - Just a dismissal, no analysis
- **Action**: Expand on WHY it confuses length with quality, give specific examples, explain what's missing that would make it good

## Technical

### 5. Implement Cache Busting for New Content
- **Issue**: Browser aggressively caches old files/data, users don't see new reviews without hard refresh
- **Action**: Implement version/cache busting strategy:
  - Option A: Add version query parameter to script/data files (`reviews-data.js?v=timestamp`)
  - Option B: Use Service Worker to check for updates and prompt user
  - Option C: Add build step that generates hashed filenames
  - Option D: Use meta tags to control cache duration more precisely

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
