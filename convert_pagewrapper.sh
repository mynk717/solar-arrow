#!/bin/bash

# PageWrapper Conversion Script for Solar Arrow
# This script will help you check and convert pages one by one

echo "🚀 Solar Arrow - PageWrapper Conversion Helper"
echo "=============================================="
echo ""

# Pages that need PageWrapper (in priority order)
PAGES=(
    "leads"
    "prospects"
    "enquiries"
    "kanban"
    "quotation"
    "survey"
    "registration"
    "payments"
    "subsidy"
    "liaison"
    "dispatch"
    "installation"
    "wcr"
)

echo "📊 Status Check:"
echo "✅ bom/page.tsx - Already has PageWrapper"
echo ""
echo "🔧 Need to convert: ${#PAGES[@]} pages"
echo ""

# Function to check if page has PageWrapper
check_page() {
    local page=$1
    if grep -q "PageWrapper" "src/app/$page/page.tsx" 2>/dev/null; then
        echo "✅ $page - Already converted"
        return 0
    else
        echo "❌ $page - Needs conversion"
        return 1
    fi
}

echo "Checking all pages..."
echo "-----------------------------------"
for page in "${PAGES[@]}"; do
    check_page "$page"
done

echo ""
echo "=============================================="
echo "📝 To convert a page, use:"
echo "   cat src/app/PAGENAME/page.tsx"
echo ""
echo "Then I'll provide the converted version!"
echo "=============================================="
