# Care (2018) Review Images

## Setup Instructions

To generate responsive images for the Care (2018) review:

### Step 1: Add Your Source Image

Place your source image file in this directory with the name:
```
header-care-2018-source.png
```

**Image Requirements:**
- Format: PNG or JPG
- Recommended dimensions: At least 1200px wide (16:9 aspect ratio preferred)
- The image should depict the scene described: a hospital/care home hallway with a younger woman supporting an elderly woman

### Step 2: Generate Responsive Images

Run the generation script from the project root:
```bash
node generate-care-images.js
```

This will create:
- `header-care-2018.webp` (base WebP)
- `header-care-2018-400w.webp` (400px width)
- `header-care-2018-800w.webp` (800px width)
- `header-care-2018-1200w.webp` (1200px width)
- `header-care-2018.png` (PNG fallback, if source is PNG)

### Step 3: Verify

The review is already configured to use:
```
images/reviews/care-2018/header-care-2018.webp
```

The responsive image system will automatically use the appropriate size based on the user's screen size.

## Image Description Reference

The header image should capture:
- A hospital/care home hallway setting
- A younger woman (blonde, in cardigan) supporting an elderly woman
- Muted, realistic lighting
- Institutional hallway with blue handrail
- Somber, emotional atmosphere reflecting the film's themes

## Notes

- The script requires `cwebp` to be installed (install with `brew install webp`)
- All images will be optimized for web delivery
- The responsive system uses the newer naming pattern (400w, 800w, 1200w)

