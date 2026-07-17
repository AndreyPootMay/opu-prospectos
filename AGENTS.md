## Android Builds (CI/CD)
**NEVER run Android builds (Gradle, APK generation) on the local machine.** The build is handled by GitHub Actions CI/CD. Only modify source code files (manifests, hooks, components, capacitor.config.json) and push — the pipeline produces the APK.

**To trigger a CI/CD build**, the commit message **MUST** contain the phrase `release apk` (case-insensitive). If you want CI/CD to build an APK after your changes, the final commit message must include `release apk`. Example: `fix: permissions release apk`.
