#!/bin/bash

# Snarkflix Advanced Image Compression Script
# This script compresses images using both cwebp and avifenc for optimal performance

echo "🎬 Snarkflix Advanced Image Compression"
echo "======================================="
echo ""

# Check dependencies
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if ! command -v cwebp &> /dev/null; then
        echo "❌ cwebp is not installed. Installing..."
        if command -v brew &> /dev/null; then
            brew install webp
        else
            echo "Please install webp manually"
            exit 1
        fi
    fi
    
    if ! command -v avifenc &> /dev/null; then
        echo "❌ avifenc is not installed. Installing..."
        if command -v brew &> /dev/null; then
            brew install libavif
        else
            echo "Please install libavif manually"
            exit 1
        fi
    fi
    
    echo "✅ All dependencies are available"
    echo ""
}

# Create backup
create_backup() {
    BACKUP_DIR="images-backup-$(date +%Y%m%d-%H%M%S)"
    echo "📁 Creating backup in: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    cp -r images/ "$BACKUP_DIR/"
    echo "✅ Backup created"
    echo ""
}

# Convert AVIF to WebP (for better compatibility)
convert_avif_to_webp() {
    local file="$1"
    local base_name="${file%.avif}"
    local webp_file="${base_name}.webp"
    
    echo "🔄 Converting AVIF to WebP: $(basename "$file")"
    
    # First convert AVIF to PNG using avifenc, then to WebP
    local temp_png="${base_name}_temp.png"
    
    if avifenc --yuv 420 --min 0 --max 63 --minalpha 0 --maxalpha 63 --codec aom --speed 6 --jobs 4 "$file" "$temp_png" 2>/dev/null; then
        if cwebp -q 85 "$temp_png" -o "$webp_file" 2>/dev/null; then
            local original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            local webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file" 2>/dev/null)
            local savings=$((original_size - webp_size))
            local savings_percent=$((savings * 100 / original_size))
            
            echo "  ✅ $(basename "$file") → $(basename "$webp_file")"
            echo "  📊 Size: $((original_size / 1024))KB → $((webp_size / 1024))KB ($savings_percent% smaller)"
            
            # Clean up temp file
            rm -f "$temp_png"
            return 0
        else
            echo "  ❌ Failed to convert PNG to WebP: $(basename "$file")"
            rm -f "$temp_png"
            return 1
        fi
    else
        echo "  ❌ Failed to convert AVIF to PNG: $(basename "$file")"
        return 1
    fi
}

# Convert PNG to WebP
convert_png_to_webp() {
    local file="$1"
    local base_name="${file%.png}"
    local webp_file="${base_name}.webp"
    
    echo "🔄 Converting PNG to WebP: $(basename "$file")"
    
    if cwebp -q 85 "$file" -o "$webp_file" 2>/dev/null; then
        local original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        local webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file" 2>/dev/null)
        local savings=$((original_size - webp_size))
        local savings_percent=$((savings * 100 / original_size))
        
        echo "  ✅ $(basename "$file") → $(basename "$webp_file")"
        echo "  📊 Size: $((original_size / 1024))KB → $((webp_size / 1024))KB ($savings_percent% smaller)"
        return 0
    else
        echo "  ❌ Failed to convert: $(basename "$file")"
        return 1
    fi
}

# Optimize existing AVIF files (recompress with better settings)
optimize_avif() {
    local file="$1"
    local base_name="${file%.avif}"
    local optimized_file="${base_name}_optimized.avif"
    
    echo "🔄 Optimizing AVIF: $(basename "$file")"
    
    if avifenc --yuv 420 --min 0 --max 63 --minalpha 0 --maxalpha 63 --codec aom --speed 6 --jobs 4 "$file" "$optimized_file" 2>/dev/null; then
        local original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        local optimized_size=$(stat -f%z "$optimized_file" 2>/dev/null || stat -c%s "$optimized_file" 2>/dev/null)
        
        if [ $optimized_size -lt $original_size ]; then
            local savings=$((original_size - optimized_size))
            local savings_percent=$((savings * 100 / original_size))
            
            echo "  ✅ Optimized: $(basename "$file")"
            echo "  📊 Size: $((original_size / 1024))KB → $((optimized_size / 1024))KB ($savings_percent% smaller)"
            
            # Replace original with optimized version
            mv "$optimized_file" "$file"
            return 0
        else
            echo "  ⏭️  No improvement: $(basename "$file")"
            rm -f "$optimized_file"
            return 1
        fi
    else
        echo "  ❌ Failed to optimize: $(basename "$file")"
        rm -f "$optimized_file"
        return 1
    fi
}

# Main execution
main() {
    check_dependencies
    create_backup
    
    # Count files
    avif_count=$(find images/ -name "*.avif" | wc -l)
    png_count=$(find images/ -name "*.png" | wc -l)
    total_files=$((avif_count + png_count))
    
    echo "📊 Found $avif_count AVIF files and $png_count PNG files to process"
    echo ""
    
    # Process AVIF files
    if [ $avif_count -gt 0 ]; then
        echo "🔄 Processing AVIF files..."
        echo "  📱 Converting to WebP for better compatibility..."
        
        avif_converted=0
        avif_optimized=0
        avif_failed=0
        
        while IFS= read -r -d '' file; do
            # Convert to WebP
            if convert_avif_to_webp "$file"; then
                ((avif_converted++))
            else
                ((avif_failed++))
            fi
            
            # Also try to optimize the original AVIF
            if optimize_avif "$file"; then
                ((avif_optimized++))
            fi
            
        done < <(find images/ -name "*.avif" -print0)
        
        echo ""
        echo "📈 AVIF processing results:"
        echo "  ✅ Converted to WebP: $avif_converted"
        echo "  🔧 Optimized AVIF: $avif_optimized"
        echo "  ❌ Failed: $avif_failed"
        echo ""
    fi
    
    # Process PNG files
    if [ $png_count -gt 0 ]; then
        echo "🔄 Processing PNG files..."
        echo "  📱 Converting to WebP..."
        
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
        echo "📈 PNG processing results:"
        echo "  ✅ Converted to WebP: $png_converted"
        echo "  ❌ Failed: $png_failed"
        echo ""
    fi
    
    # Summary
    total_converted=$((avif_converted + png_converted))
    total_failed=$((avif_failed + png_failed))
    
    echo "🎉 Advanced Compression Complete!"
    echo "================================="
    echo "📊 Total files processed: $total_files"
    echo "✅ Successfully converted to WebP: $total_converted"
    echo "🔧 AVIF files optimized: $avif_optimized"
    echo "❌ Failed conversions: $total_failed"
    echo "📁 Backup created in: $BACKUP_DIR"
    echo ""
    echo "💡 Next steps:"
    echo "  1. Test the WebP images in your browser"
    echo "  2. Update HTML to use WebP with AVIF/PNG fallbacks"
    echo "  3. Consider using <picture> elements for responsive images"
    echo ""
    echo "🔧 Example HTML update:"
    echo '  <picture>'
    echo '    <source srcset="image.avif" type="image/avif">'
    echo '    <source srcset="image.webp" type="image/webp">'
    echo '    <img src="image.png" alt="Description">'
    echo '  </picture>'
}

# Run the script
main
