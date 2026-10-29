# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.devsupport.** { *; }

# Hermes
-keep class com.facebook.react.android.hermes.** { *; }

# Expo modules
-keep class expo.modules.** { *; }
-keep class expo.modules.securestore.** { *; }
-keep class expo.modules.splashscreen.** { *; }

# React Native TurboModules / native modules
-keep class com.facebook.react.turbomodule.** { *; }

# Preserve annotated MainComponents / entry points
-keep class * extends com.facebook.react.ReactActivity { *; }
-keep class * extends com.facebook.react.ReactActivityDelegate { *; }
-keep class * extends com.facebook.react.ReactPackage { *; }

# Add any project specific keep options here:
