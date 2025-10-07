# Snarkflix Code Review - TODO List

## Content Quality Issues

### HIGH PRIORITY - Weak Reviews (Below 60 Score)
Reviews that need significant expansion and proper conclusions:

2. **The Batman (2022)** - Score: 35
   - Currently: 4 min read, stream-of-consciousness style
   - Needs: Proper structure, clear conclusion
   - Issues: Feels like live-reaction notes, no wrap-up

3. **Black Adam (2022)** - Score: 35
   - Currently: 2 min read with good observations
   - Needs: Expansion to 3-4 min with more specific examples
   - Issues: Too rushed, tonal critique needs more support, ending works but could be stronger

### MEDIUM PRIORITY - Short/Incomplete Reviews
Reviews under 3 minutes that feel rushed:

4. **Ghostbusters: Afterlife (2021)** - Score: 50
   - Currently: 1 min read with duplicate "SnarkAI's not quite sure what the ECHO-1 is" text
   - Needs: Clean up duplicates, expand analysis, add proper ending
   - Issues: Abrupt, unfinished

5. **The Suicide Squad (2021)** - Score: 80
   - Currently: 2 min read
   - Needs: Expand to 3-4 min with more plot/character analysis
   - Issues: Good observations but too brief for the score

6. **Wonder Woman 1984 (2020)** - Score: 80
   - Currently: 2 min read
   - Needs: Expand to 3-4 min, better ending
   - Issues: Good points but feels incomplete

7. **Finch (2021)** - Score: 25
   - Currently: Listed as 3 min but actually 2 min (463 words)
   - Needs: Fix reading time, complete rewrite of ending
   - Issues: **CRITICAL** - Ends with "But American Pie's a banger" which is bizarre and unexplained. Good critique until it just stops.

### LOWER PRIORITY - Good Reviews Needing Polish
Reviews that work but could be tightened:

8. **Wicked (2024)** - Score: 60
   - Currently: 5 min read, very long
   - Needs: Consider tightening, remove some bullet points
   - Issues: Meandering in places, could be more focused

9. **Pitch Perfect (2012)** - Score: 70
   - Currently: 3 min read
   - Needs: Minor polish, ending is okay but could be stronger
   - Issues: Good review overall, just needs final touch



20. **Zootopia (2016)** - Score: 

It is vital to state at the start we are not going to touch on the furry fetishism sub-communities this film has created. Never search google for this film with safesearch off.

It's a movie about prejudice and tries to teach kids that prejudice is bad, but does it work?

For a start, its' heavily Copananda. How did Fixes go from the Chaotic Good Robin Hood saving those in need to someone helping the police to keep themselves out of jail at the expense of others?

100 ticket, (monthly ticketing quotas illegal in the US) and she wants to do double, 200 tickets, by noon double quota and these will disproportionally impact low income and marginalised communities. The film portrays this as her being dilligant and going the extra mile, but it's hard not to see it as her activly makign the lives of her community around her worse.

Biological essentialism the movie. You can't escape your nature. Sloths are slow, foxes are sneaky.

The villan is someone using their minority status to manipulate and control. Trust the police citizens, they'll keep those uppity 'victims' in check.

Her reward, a militierized armoured vehicle, the sort that no non-specialized response police department in the world should have.


and a thought to take away, in this post-savagry society, what exactly are the Predator anials eating if not the prey?

## Technical

### 6. Performance Optimization (HIGH PRIORITY)
- **File**: `index.html` ✅ COMPLETED
- **Action**: Added preconnect hints and defer scripts
- **Impact**: 900ms render blocking savings

### 7. Image Optimization (CRITICAL - 11.4MB savings)
- **Files**: All header images
- **Action**: Convert PNG to WebP/AVIF, resize to display dimensions
- **Priority**: Palm Springs (3.2MB), Superman (3.1MB), Fantastic Four (2.5MB)
- **Current**: Images 3-4x larger than needed (1536px → 396px display)

### 8. Add Performance Monitoring (Low Priority)
- **File**: `script.js`
- **Action**: Add performance tracking
```javascript
// Track page load performance
window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart);
});
```

## Completed ✅
- ✅ Wolfwalkers (2020) - Expanded to 3 min, proper structure
- ✅ The Man Who Killed Hitler and Then the Bigfoot (2018) - Expanded to 4 min
- ✅ Black Widow (2021) - Expanded to 4 min, proper conclusion
- ✅ Removed: Bloodshot, Moonfall, The Revenant (too dismissive)
- ✅ Fixed: Seth Rogan line in Don't Look Up
- ✅ Fixed: "Features the most X ever" formula across multiple reviews
- ✅ Cache busting implementation
- ✅ Share URL fix (snarkflix.com)
- ✅ Toned down Snyder criticism in The Batman review
