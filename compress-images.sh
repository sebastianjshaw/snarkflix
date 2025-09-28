#!/bin/bash

# Snarkflix Image Compression Script
# This script compresses images using cwebp for better performance

echo "🎬 Snarkflix Image Compression"
echo "=============================="
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp is not installed. Installing..."
    if command -v brew &> /dev/null; then
        brew install webp
    else
        echo "Please install webp manually:"
        echo "  macOS: brew install webp"
        echo "  Ubuntu: sudo apt-get install webp"
        echo "  Or visit: https://developers.google.com/speed/webp/download"
        exit 1
    fi
fi

echo "✅ cwebp is available"
echo ""

# Create backup directory
BACKUP_DIR="images-backup-$(date +%Y%m%d-%H%M%S)"
echo "📁 Creating backup in: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r images/ "$BACKUP_DIR/"
echo "✅ Backup created"
echo ""

# Function to convert AVIF to WebP
convert_avif_to_webp() {
    local file="$1"
    local base_name="${file%.avif}"
    local webp_file="${base_name}.webp"
    
    echo "🔄 Converting: $(basename "$file")"
    
    # Convert with 85% quality
    if cwebp -q 85 "$file" -o "$webp_file" 2>/dev/null; then
        local original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        local webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file" 2>/dev/null)
        local savings=$((original_size - webp_size))
        local savings_percent=$((savings * 100 / original_size))
        
        echo "  ✅ $(basename "$file") → $(basename "$webp_file")"
        echo "  📊 Size: $((original_size / 1024))KB → $((webp_size / 1024))KB ($savings_percent% smaller)"
        return 0
    else
        echo "  ❌ Failed to convert $(basename "$file")"
        return 1
    fi
}

# Function to convert PNG to WebP
convert_png_to_webp() {
    local file="$1"
    local base_name="${file%.png}"
    local webp_file="${base_name}.webp"
    
    echo "🔄 Converting: $(basename "$file")"
    
    # Convert with 85% quality
    if cwebp -q 85 "$file" -o "$webp_file" 2>/dev/null; then
        local original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        local webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file" 2>/dev/null)
        local savings=$((original_size - webp_size))
        local savings_percent=$((savings * 100 / original_size))
        
        echo "  ✅ $(basename "$file") → $(basename "$webp_file")"
        echo "  📊 Size: $((original_size / 1024))KB → $((webp_size / 1024))KB ($savings_percent% smaller)"
        return 0
    else
        echo "  ❌ Failed to convert $(basename "$file")"
        return 1
    fi
}

# Count files
avif_count=$(find images/ -name "*.avif" | wc -l)
png_count=$(find images/ -name "*.png" | wc -l)
total_files=$((avif_count + png_count))

echo "📊 Found $avif_count AVIF files and $png_count PNG files to convert"
echo ""

# Convert AVIF files
if [ $avif_count -gt 0 ]; then
    echo "🔄 Converting AVIF files to WebP..."
    avif_converted=0
    avif_failed=0
    
    while IFS= read -r -d '' file; do
        if convert_avif_to_webp "$file"; then
            ((avif_converted++))
        else
            ((avif_failed++))
        fi
    done < <(find images/ -name "*.avif" -print0)
    
    echo ""
    echo "📈 AVIF conversion results:"
    echo "  ✅ Converted: $avif_converted"
    echo "  ❌ Failed: $avif_failed"
    echo ""
fi

# Convert PNG files
if [ $png_count -gt 0 ]; then
    echo "🔄 Converting PNG files to WebP..."
    png_converted=0
    png_failed=0
    
    while IFS= read -r -d '' file; do
        if convert_png_to_webp "$file"; then
            ((png_converted++))
        else
            ((png_failed++))
        fi
    done < <(find images/ -name "*.png" -print0)
    
    echo ""
    echo "📈 PNG conversion results:"
    echo "  ✅ Converted: $png_converted"
    echo "  ❌ Failed: $png_failed"
    echo ""
fi

# Summary
total_converted=$((avif_converted + png_converted))
total_failed=$((avif_failed + png_failed))

echo "🎉 Compression Complete!"
echo "======================="
echo "📊 Total files processed: $total_files"
echo "✅ Successfully converted: $total_converted"
echo "❌ Failed conversions: $total_failed"
echo "📁 Backup created in: $BACKUP_DIR"
echo ""
echo "💡 Next steps:"
echo "  1. Test the WebP images in your browser"
echo "  2. Update HTML to use WebP with fallbacks"
echo "  3. Consider using <picture> elements for responsive images"
echo ""
echo "🔧 Example HTML update:"
echo '  <picture>'
echo '    <source srcset="image.webp" type="image/webp">'
echo '    <img src="image.png" alt="Description">'
echo '  </picture>'
