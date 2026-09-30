import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Release signing: put the upload keystore details in android/key.properties
// (git-ignored — see docs/RELEASE.md). Without it, any release build fails fast
// (see checkReleaseSigningKey below) instead of producing a debug-signed artifact
// that Play Console rejects and that could never be updated. Debug builds are
// unaffected.
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
val hasReleaseKey = keystorePropertiesFile.exists()
if (hasReleaseKey) {
    keystorePropertiesFile.inputStream().use { keystoreProperties.load(it) }
}

android {
    namespace = "com.taveyo.neuroquest"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        applicationId = "com.taveyo.neuroquest"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (hasReleaseKey) {
            create("release") {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

    buildTypes {
        release {
            if (hasReleaseKey) {
                signingConfig = signingConfigs.getByName("release")
            }
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

flutter {
    source = "../.."
}

// Refuse to build a release variant without the upload key. Hooked into
// preReleaseBuild so it runs only when a release APK/AAB is actually requested,
// never at configuration time or for debug builds.
val missingReleaseKey = !hasReleaseKey
val keyPropertiesPath = keystorePropertiesFile.absolutePath
val checkReleaseSigningKey = tasks.register("checkReleaseSigningKey") {
    doLast {
        if (missingReleaseKey) {
            throw GradleException(
                "Release signing key not configured: $keyPropertiesPath is missing.\n" +
                "Create it as described in docs/RELEASE.md (Google Play, steps 1-2) " +
                "before running `flutter build appbundle --release` / `flutter build apk --release`. " +
                "Use a debug build (`flutter run`, `flutter build apk --debug`) for local testing."
            )
        }
    }
}
tasks.matching { it.name == "preReleaseBuild" }.configureEach {
    dependsOn(checkReleaseSigningKey)
}
