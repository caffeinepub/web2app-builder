export interface AndroidProjectConfig {
  appName: string;
  packageName: string;
  websiteUrl: string;
  splashColor: string;
  features: {
    pullToRefresh: boolean;
    pushNotifications: boolean;
    fileUpload: boolean;
  };
  outputFormat: string;
  minSdk: number;
  iconDataUrl?: string;
}

function hexToArgb(hex: string): string {
  const c = hex.replace("#", "");
  return `FF${c.toUpperCase().padStart(6, "0")}`;
}

function toPackagePath(pkg: string) {
  return pkg.replace(/\./g, "/");
}

function genMainActivity(cfg: AndroidProjectConfig): string {
  const { packageName: pkg, features, websiteUrl } = cfg;
  const hasRefresh = features.pullToRefresh;
  const hasFileUpload = features.fileUpload;
  return `package ${pkg}

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
${hasRefresh ? "import androidx.swiperefreshlayout.widget.SwipeRefreshLayout" : ""}
${hasFileUpload ? "import android.content.Intent\nimport android.net.Uri\nimport androidx.activity.result.contract.ActivityResultContracts" : ""}

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    ${hasRefresh ? "private lateinit var swipeRefreshLayout: SwipeRefreshLayout" : ""}
    ${hasFileUpload ? "private var fileUploadCallback: ValueCallback<Array<Uri>>? = null" : ""}
${
  hasFileUpload
    ? `
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val intent = result.data
        val uris = if (result.resultCode == RESULT_OK && intent?.clipData != null) {
            Array(intent.clipData!!.itemCount) { i -> intent.clipData!!.getItemAt(i).uri }
        } else if (result.resultCode == RESULT_OK && intent?.data != null) {
            arrayOf(intent.data!!)
        } else emptyArray()
        fileUploadCallback?.onReceiveValue(uris)
        fileUploadCallback = null
    }`
    : ""
}

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webView)
        ${hasRefresh ? "swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)" : ""}
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportZoom(true)
        }
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                ${hasRefresh ? "swipeRefreshLayout.isRefreshing = false" : ""}
            }
        }
${
  hasFileUpload
    ? `        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(webView: WebView?, callback: ValueCallback<Array<Uri>>, params: FileChooserParams): Boolean {
                fileUploadCallback = callback
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE); type = "*/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                }
                fileChooserLauncher.launch(intent)
                return true
            }
        }`
    : "        webView.webChromeClient = WebChromeClient()"
}
${
  hasRefresh
    ? `        swipeRefreshLayout.setOnRefreshListener { webView.reload() }
        swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_green_light)`
    : ""
}
        webView.loadUrl("${websiteUrl}")
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack()
        else { @Suppress("DEPRECATION") super.onBackPressed() }
    }
}
`;
}

function genSplashActivity(cfg: AndroidProjectConfig): string {
  return `package ${cfg.packageName}

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }, 2000)
    }
}
`;
}

function genManifest(cfg: AndroidProjectConfig): string {
  const { packageName: pkg, features } = cfg;
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${pkg}">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    ${
      features.fileUpload
        ? `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />`
        : ""
    }
    ${features.pushNotifications ? `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` : ""}
    <application android:allowBackup="true" android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name" android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar" android:usesCleartextTraffic="true">
        <activity android:name=".SplashActivity" android:exported="true" android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <activity android:name=".MainActivity" android:exported="false"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize|keyboardHidden" />
    </application>
</manifest>
`;
}

function genActivityMainXml(cfg: AndroidProjectConfig): string {
  if (cfg.features.pullToRefresh) {
    return `<?xml version="1.0" encoding="utf-8"?>
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/swipeRefreshLayout"
    android:layout_width="match_parent" android:layout_height="match_parent">
    <WebView android:id="@+id/webView"
        android:layout_width="match_parent" android:layout_height="match_parent" />
</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
`;
  }
  return `<?xml version="1.0" encoding="utf-8"?>
<WebView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/webView"
    android:layout_width="match_parent" android:layout_height="match_parent" />
`;
}

function genActivitySplashXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent" android:layout_height="match_parent"
    android:background="@color/splash_bg">
    <ImageView android:layout_width="120dp" android:layout_height="120dp"
        android:layout_centerInParent="true" android:src="@mipmap/ic_launcher"
        android:contentDescription="App Icon" />
</RelativeLayout>
`;
}

function genStringsXml(cfg: AndroidProjectConfig): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${cfg.appName}</string>
</resources>
`;
}

function genColorsXml(cfg: AndroidProjectConfig): string {
  const argb = hexToArgb(cfg.splashColor || "#3DDC84");
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_bg">#${argb}</color>
    <color name="colorPrimary">#3DDC84</color>
    <color name="colorPrimaryDark">#2BA665</color>
    <color name="colorAccent">#3DDC84</color>
</resources>
`;
}

function genAppBuildGradle(cfg: AndroidProjectConfig): string {
  return `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}
android {
    namespace '${cfg.packageName}'
    compileSdk 34
    defaultConfig {
        applicationId "${cfg.packageName}"
        minSdk ${cfg.minSdk}
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions { jvmTarget = '1.8' }
}
dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    ${cfg.features.pullToRefresh ? "implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'" : ""}
}
`;
}

function genRootBuildGradle(): string {
  return `plugins {
    id 'com.android.application' version '8.2.2' apply false
    id 'org.jetbrains.kotlin.android' version '1.9.22' apply false
}
`;
}

function genSettingsGradle(cfg: AndroidProjectConfig): string {
  const name = cfg.appName.replace(/[^a-zA-Z0-9]/g, "");
  return `pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = "${name}"
include ':app'
`;
}

function genReadme(cfg: AndroidProjectConfig): string {
  return `# ${cfg.appName} - Android Project
Generated by Web2App Builder | Website: ${cfg.websiteUrl}

## Build
\`\`\`bash
# Debug APK
./gradlew assembleDebug
# Release APK
./gradlew assembleRelease
# AAB (Play Store)
./gradlew bundleRelease
\`\`\`

## Min SDK: API ${cfg.minSdk}
## Features: PTR=${cfg.features.pullToRefresh} | Notifications=${cfg.features.pushNotifications} | FileUpload=${cfg.features.fileUpload}
`;
}

// Minimal ZIP creator (STORE mode)
function w32(n: number, b: Uint8Array, o: number) {
  b[o] = n & 0xff;
  b[o + 1] = (n >> 8) & 0xff;
  b[o + 2] = (n >> 16) & 0xff;
  b[o + 3] = (n >> 24) & 0xff;
}
function w16(n: number, b: Uint8Array, o: number) {
  b[o] = n & 0xff;
  b[o + 1] = (n >> 8) & 0xff;
}
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++)
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const enc = new TextEncoder();
  const localMeta: {
    offset: number;
    nb: Uint8Array;
    crc: number;
    size: number;
  }[] = [];
  const parts: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const nb = enc.encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;
    const lh = new Uint8Array(30 + nb.length);
    w32(0x04034b50, lh, 0);
    w16(20, lh, 4);
    w16(0, lh, 6);
    w16(0, lh, 8);
    w16(0, lh, 10);
    w16(0, lh, 12);
    w32(crc, lh, 14);
    w32(size, lh, 18);
    w32(size, lh, 22);
    w16(nb.length, lh, 26);
    w16(0, lh, 28);
    lh.set(nb, 30);
    localMeta.push({ offset, nb, crc, size });
    parts.push(lh);
    parts.push(f.data);
    offset += lh.length + size;
  }
  const cdStart = offset;
  for (let i = 0; i < files.length; i++) {
    const { offset: lo, nb, crc, size } = localMeta[i];
    const cd = new Uint8Array(46 + nb.length);
    w32(0x02014b50, cd, 0);
    w16(20, cd, 4);
    w16(20, cd, 6);
    w16(0, cd, 8);
    w16(0, cd, 10);
    w16(0, cd, 12);
    w16(0, cd, 14);
    w32(crc, cd, 16);
    w32(size, cd, 20);
    w32(size, cd, 24);
    w16(nb.length, cd, 28);
    w16(0, cd, 30);
    w16(0, cd, 32);
    w16(0, cd, 34);
    w16(0, cd, 36);
    w32(0, cd, 38);
    w32(lo, cd, 42);
    cd.set(nb, 46);
    parts.push(cd);
    offset += cd.length;
  }
  const cdSize = offset - cdStart;
  const eocd = new Uint8Array(22);
  w32(0x06054b50, eocd, 0);
  w16(0, eocd, 4);
  w16(0, eocd, 6);
  w16(files.length, eocd, 8);
  w16(files.length, eocd, 10);
  w32(cdSize, eocd, 12);
  w32(cdStart, eocd, 16);
  w16(0, eocd, 20);
  parts.push(eocd);
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

export async function generateAndroidProject(
  cfg: AndroidProjectConfig,
): Promise<void> {
  const enc = new TextEncoder();
  const pkgPath = toPackagePath(cfg.packageName);
  const safe = cfg.appName.replace(/[^a-zA-Z0-9_]/g, "_");
  const files: { name: string; data: Uint8Array }[] = [
    {
      name: `${safe}/app/src/main/java/${pkgPath}/MainActivity.kt`,
      data: enc.encode(genMainActivity(cfg)),
    },
    {
      name: `${safe}/app/src/main/java/${pkgPath}/SplashActivity.kt`,
      data: enc.encode(genSplashActivity(cfg)),
    },
    {
      name: `${safe}/app/src/main/AndroidManifest.xml`,
      data: enc.encode(genManifest(cfg)),
    },
    {
      name: `${safe}/app/src/main/res/layout/activity_main.xml`,
      data: enc.encode(genActivityMainXml(cfg)),
    },
    {
      name: `${safe}/app/src/main/res/layout/activity_splash.xml`,
      data: enc.encode(genActivitySplashXml()),
    },
    {
      name: `${safe}/app/src/main/res/values/strings.xml`,
      data: enc.encode(genStringsXml(cfg)),
    },
    {
      name: `${safe}/app/src/main/res/values/colors.xml`,
      data: enc.encode(genColorsXml(cfg)),
    },
    {
      name: `${safe}/app/build.gradle`,
      data: enc.encode(genAppBuildGradle(cfg)),
    },
    { name: `${safe}/build.gradle`, data: enc.encode(genRootBuildGradle()) },
    {
      name: `${safe}/settings.gradle`,
      data: enc.encode(genSettingsGradle(cfg)),
    },
    {
      name: `${safe}/gradle.properties`,
      data: enc.encode(
        "org.gradle.jvmargs=-Xmx2048m\nandroid.useAndroidX=true\nkotlin.code.style=official\n",
      ),
    },
    { name: `${safe}/README.md`, data: enc.encode(genReadme(cfg)) },
  ];
  const zip = createZip(files);
  const blob = new Blob([zip.buffer as ArrayBuffer], {
    type: "application/zip",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}-android-project.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
