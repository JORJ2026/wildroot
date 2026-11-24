# Releasing notes

The default workflow produces **unsigned** builds so it works with no accounts or paid certificates. Unsigned builds install and run, but the operating system shows a warning.

## Windows
Unsigned installers trigger SmartScreen ("Windows protected your PC"). Choose *More info, Run anyway*. To remove the warning buy a code-signing certificate and add `CSC_LINK` (base64 .pfx) and `CSC_KEY_PASSWORD` as repository secrets, then pass them in the `windows` job `env`.

## macOS
Unsigned apps are blocked by Gatekeeper. Users can right-click the app, choose *Open*, then confirm. To distribute normally you need an Apple Developer account (99 USD a year): add `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` and `APPLE_TEAM_ID`, remove `CSC_IDENTITY_AUTO_DISCOVERY`, and enable notarization in the `build.mac` section of `package.json` (`"notarize": true`).

## Linux
The AppImage needs `chmod +x Wildroot-Linux.AppImage`. The `.deb` installs with `sudo apt install ./Wildroot-Linux.deb`. No signing is needed.

## Android
With no secrets the workflow builds a **debug-signed** APK, which installs fine for sideloading (allow *Install unknown apps*). For Google Play create a keystore once:
```
keytool -genkeypair -v -keystore release.jks -alias wildroot -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.jks
```
Add the base64 text as `ANDROID_KEYSTORE_BASE64` and also `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. The workflow then builds a signed release APK. Google Play wants an App Bundle (`./gradlew bundleRelease`) and a one-time 25 USD developer fee.

## iPhone and iPad
Apple does not allow installing arbitrary apps from a download. The practical routes are:
1. **Add to Home Screen** from Safari (free, works offline, runs full screen). This is what the in-game Downloads tab explains.
2. **TestFlight or the App Store**, which needs an Apple Developer account. Run `npm run www`, then `npx cap add ios`, open `ios/App/App.xcworkspace` in Xcode, set your team, and archive. Put the TestFlight or App Store link in `<meta name="wildroot-ios" content="https://...">` in `index.html` and the Downloads tab will show a button.

The workflow's `ios` job builds an unsigned simulator app only, to prove the project compiles.

## First release checklist
- [ ] Pages workflow is green and the site loads.
- [ ] Set `wildroot-repo` in `index.html` if you use a custom domain.
- [ ] Tag `v4.18.0`, wait for the release workflow, open the release and download each file.
- [ ] Install each file once on a real machine before announcing.
