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

Troubleshooting:
- Error: `unknown command 'set-icon'` → You used the old syntax; the correct one is `react-native-make icon`.
- Error: `npm error could not determine executable to run` when using `npx react-native-make`:
  1. Clear npx cache: `npx clear-npx-cache` (or delete `%AppData%\npm-cache\_npx`).
  2. Try explicit package invocation:
     `npx --package react-native-make react-native-make icon --path assets\app-icon\duro-app-icon.png --platform android --background "#FFFFFF"`
  3. Ensure Node >= 20 (your `package.json` already specifies this) and run `npm ls react-native-make` to confirm installation.
  4. As a fallback install globally: `npm i -g react-native-make` then run `react-native-make icon ...` directly.
  5. Use forward slashes if backslashes fail: `assets/app-icon/duro-app-icon.png`.
  6. Run `npx react-native-make --help` to confirm CLI resolves.
- If adaptive icon background appears wrong, re-run without `--background` and supply a transparent PNG.
