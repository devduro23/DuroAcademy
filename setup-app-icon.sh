#!/bin/bash

# DuroAcademy App Icon Setup Script
# This script helps you set up app icons for your React Native app

echo "🎨 DuroAcademy App Icon Setup"
echo "================================"
echo ""

echo "📱 ANDROID SETUP COMPLETED:"
echo "✅ Created adaptive icon XML files"
echo "✅ Added color resources for Duro red (#dc2626)"
echo "✅ Created vector drawable icons"
echo ""

echo "📱 iOS SETUP REQUIRED:"
echo "You need to manually create PNG icons for iOS in the following sizes:"
echo "- 20x20 (@2x: 40x40, @3x: 60x60)"
echo "- 29x29 (@2x: 58x58, @3x: 87x87)"
echo "- 40x40 (@2x: 80x80, @3x: 120x120)"
echo "- 60x60 (@2x: 120x120, @3x: 180x180)"
echo "- 1024x1024 (App Store)"
echo ""

echo "🎨 ICON DESIGN SPECIFICATIONS:"
echo "- Background: Duro Red (#dc2626)"
echo "- Letter 'D' in white (#ffffff)"
echo "- Bold, clean typography"
echo "- Centered design"
echo ""

echo "🛠️ NEXT STEPS:"
echo "1. Use an icon generator tool like:"
echo "   - https://appicon.co/"
echo "   - https://makeappicon.com/"
echo "   - Adobe Illustrator/Photoshop"
echo ""
echo "2. Create a 1024x1024 master icon with:"
echo "   - Red circle background (#dc2626)"
echo "   - White letter 'D' in the center"
echo "   - Save as PNG format"
echo ""
echo "3. Upload to an icon generator to create all required sizes"
echo ""
echo "4. For iOS: Replace files in ios/DuroAcademy/Images.xcassets/AppIcon.appiconset/"
echo ""
echo "5. For Android: The vector drawables are already set up!"
echo ""

echo "✨ Your Android app will now show the DuroAcademy icon!"
echo "📲 For iOS, complete steps 1-4 above to see the icon on iOS devices."