# DuroAcademy App Icon Setup Guide

## 🎯 Overview
This guide will help you set up the DuroAcademy logo as your mobile app icon that appears on the home screen before users open the app.

## ✅ What's Already Done (Android)

### Android Vector Icons
I've created vector drawable icons that will work perfectly on Android:
- `ic_duro_logo.xml` - Main logo vector
- `ic_duro_logo_foreground.xml` - Adaptive icon foreground
- `ic_launcher.xml` - Adaptive icon configuration
- `colors.xml` - Duro brand colors

### Design Specifications
- **Background Color**: Duro Red (#dc2626)
- **Foreground**: White letter "D" (#ffffff)
- **Style**: Bold, clean, centered design

## 📱 Android Setup Status: ✅ COMPLETE
Your Android app will now display the DuroAcademy icon automatically!

## 🍎 iOS Setup Required

For iOS, you need to create PNG icon files. Here's how:

### Step 1: Create Master Icon (1024x1024px)
1. Open any graphics editor (Photoshop, Canva, etc.)
2. Create a 1024x1024 canvas
3. Fill with Duro Red (#dc2626)
4. Add white letter "D" in center (bold font)
5. Save as PNG

### Step 2: Generate All Required Sizes
Use an online icon generator like:
- [AppIcon.co](https://appicon.co/)
- [MakeAppIcon.com](https://makeappicon.com/)

Upload your 1024x1024 master icon to generate:
- 20pt (20x20, 40x40, 60x60)
- 29pt (29x29, 58x58, 87x87)  
- 40pt (40x40, 80x80, 120x120)
- 60pt (60x60, 120x120, 180x180)
- 1024pt (1024x1024)

### Step 3: Replace iOS Icon Files
1. Navigate to: `ios/DuroAcademy/Images.xcassets/AppIcon.appiconset/`
2. Replace the existing PNG files with your generated icons
3. Ensure filenames match the existing ones

### Step 4: Update Contents.json (if needed)
The `Contents.json` file should already be configured correctly, but verify it references your new icon files.

## 🚀 Testing Your Icons

### Android Testing
```bash
# Build and run Android app
npm run android
```
Your DuroAcademy icon should appear on the Android home screen!

### iOS Testing
```bash
# Build and run iOS app (after adding PNG files)
npm run ios
```

## 🎨 Design Template

If you need a quick template, here's the exact design:

```
🔴 Red Circle Background
   └── 🤍 White Letter "D"
       ├── Font: Bold/Heavy weight
       ├── Color: White (#ffffff)
       ├── Position: Center
       └── Size: ~60% of circle diameter
```

## 📂 File Structure

```
android/app/src/main/res/
├── drawable/
│   ├── ic_duro_logo.xml ✅
│   └── ic_duro_logo_foreground.xml ✅
├── mipmap-anydpi-v26/
│   ├── ic_launcher.xml ✅
│   └── ic_launcher_round.xml ✅
└── values/
    └── colors.xml ✅

ios/DuroAcademy/Images.xcassets/AppIcon.appiconset/
├── Contents.json ✅
└── [PNG files needed] ⏳
```

## 🆘 Troubleshooting

### Icon Not Showing?
1. **Clean build**: Delete `build` folders and rebuild
2. **Clear cache**: Uninstall app and reinstall
3. **Check file names**: Ensure PNG files match `Contents.json` references

### Still Need Help?
- Use the logo from your splash screen as reference
- The splash screen already has the perfect design
- Copy the red circle + white "D" design exactly

## ✨ Result
Once complete, users will see the DuroAcademy logo with the red background and white "D" on their mobile home screen before opening your app!