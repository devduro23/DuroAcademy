Place your source icon image here as `duro-app-icon.png` (recommended 1024x1024 PNG, transparent background if possible).

Once the file is saved, run these commands from the project root (Windows PowerShell):

- Generate BOTH iOS + Android icons (adaptive icon background white):
  npx react-native-make icon --path assets\app-icon\duro-app-icon.png --background "#FFFFFF"

- iOS only:
  npx react-native-make icon --path assets\app-icon\duro-app-icon.png --platform ios

- Android only (adaptive):
  npx react-native-make icon --path assets\app-icon\duro-app-icon.png --platform android --background "#FFFFFF"

Notes:
- The previous command `react-native set-icon` was incorrect; use `react-native-make icon`.
- After generating, rebuild the app (Android: `npx react-native run-android`, iOS: `npx pod-install && npx react-native run-ios`).
- If the Android icon shows a solid white box you didn't intend, remove `--background` and ensure the source PNG has transparency.
- To verify generation, check:
  - Android: `android/app/src/main/res/mipmap-*/ic_launcher.png` and `ic_launcher_foreground.png`
  - iOS: `ios/DuroAcademy/Images.xcassets/AppIcon.appiconset/` for resized assets.
