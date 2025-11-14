Place your source icon image here as `duro-app-icon.png` (recommended 1024x1024 PNG, transparent background if possible).

Once the file is saved, run these commands from the project root (Windows PowerShell):

- iOS App Icon set:
  npx react-native set-icon --path assets\app-icon\duro-app-icon.png --platform ios

- Android adaptive icon (white background):
  npx react-native set-icon --path assets\app-icon\duro-app-icon.png --platform android --background "#FFFFFF"

Notes:
- You can omit `--platform` to apply to both platforms at once:
  npx react-native set-icon --path assets\app-icon\duro-app-icon.png --background "#FFFFFF"
- After setting icons, rebuild the app.
- If the Android icon has a white box, consider using a transparent background image, or adjust `--background` to your preferred color.
