---
name: mod-apk
description: Reverse engineering & mod APK/XAPK all-in-one — decompile, patch smali/dex/native, bypass anti-tamper, mod online/offline game, repack & sign.
---

# mod-apk — Super VIP Hacker Knowledge

## Toolchain

| Tool | Công dụng | Install |
|------|-----------|---------|
| `apktool` | Decompile/rebuild APK → smali + resources | `winget install apktool` |
| `jadx-gui` | Decompile DEX → Java readable, search tree | `winget install jadx` |
| `uber-apk-signer` | Ký + zipalign APK tự động | `npm i -g uber-apk-signer` |
| `apk-editor-studio` | Edit AndroidManifest, resources GUI | Portable |
| `Il2CppDumper` | Dump Unity il2cpp metadata + offsets | GitHub |
| `Frida` | Dynamic hook runtime, bypass mọi runtime check | `pip install frida-tools` |
| ` objection ` | Frida GUI, bypass SSL pinning 1 click | `pip install objection` |
| `GDA` | DEX decompiler không cần Java (chạy mượt) | Portable |
| `MT Manager` | Android app: decompile + patch trực tiếp trên phone | APK |
| `NP Manager` | Android app: patch smali nhanh, multi dex | APK |
| `010 Editor` | Binary template cho smali/dex/lib | Portable |
| `apk-sign` | Sign tool nhẹ cho split APK | `pip install apk-sign` |
| `ZipSigner` | Sign APK với custom key | Android app |
| `adb` | Install, logcat, push/pull | Android SDK |

---

## MỤC LỤC

1. [Mod Offline — Game đơn giản (boolean/const/resource)](#1-mod-offline)
2. [Mod Online — Bypass server check & anti-tamper](#2-mod-online)
3. [Anti-Tamper Matrix — Các dạng bảo vệ & cách bypass](#3-anti-tamper-matrix)
4. [Unity Games (il2cpp / mono) — Universal mod](#4-unity-games)
5. [Cocos2d-x / Cocos Creator — JS + native](#5-cocos2d-x--cocos-creator)
6. [Flutter Apps — reverse libapp.so](#6-flutter-apps)
7. [Mod Menu — Floating overlay toggle từng tính năng](#7-mod-menu)
8. [Split APK / App Bundle / APKM / XAPK](#8-split-apk--app-bundle--apkm--xapk)
9. [Frida Scripts — Bypass runtime không cần rebuild](#9-frida-scripts)
10. [Vibe Code Smali — Pattern cheatsheet nâng cao](#10-vibe-code-smali)
11. [Debug — Crash analyzer & fix](#11-debug--crash-analyzer--fix)

---

## 1. Mod Offline

### 1a. Boolean patch — cơ bản nhất
```smali
# Tìm trong smali:
const/4 v0, 0x0
# Sửa → const/4 v0, 0x1

# Nếu là isPurchased() check:
const/4 v1, 0x0
iput-boolean v1, p0, Lcom/.../User;->isPurchased:Z
# → 0x0 → 0x1
```

### 1b. Integer patch — coin, diamond, level
```smali
# Tìm const-wide cho số lớn:
const-wide v0, 0x3FF0000000000000L  # 1.0 double
# hoặc:
const/high16 v0, 0x447a0000         # 1000f float
# Sửa thành giá trị mong muốn (ví dụ 999999)

# Integer thường:
const/16 v0, 0x64  # 100
# const v0, 0xF423F  # 999999
```

### 1c. String patch — hiển thị
```smali
const-string v0, "TRIAL"
# Sửa → "PREMIUM UNLOCKED"
```

### 1d. Resource patch — thay file
```bash
# Giải nén xong, vào res/ thay file PNG thủ công
# Hoặc dùng APK Editor Studio để browse resource tree
```

### 1e. SQLite patch — save data
```bash
# Game offline save SQLite trong /data/data/<package>/databases/
adb shell
run-as <package>
sqlite3 databases/game.db
# UPDATE stats SET coins=99999 WHERE id=1;
```

---

## 2. Mod Online

> **Nguyên tắc vàng**: Game online = server kiểm tra. Patch smali chỉ thay đổi phía client.
> Server vẫn từ chối nếu request không hợp lệ.
> **Cần bypass cả: client check + server request + anti-tamper.**

### 2a. Phân loại game online

| Loại | Cách hoạt động | Chiến thuật mod |
|------|---------------|-----------------|
| **Client trust** | Server gửi dữ liệu, client tự quyết định thắng/thua | Patch smali boolean, return true |
| **Server trust** | Mọi quyết định trên server, client chỉ hiển thị | KHÔNG THỂ mod số (coin/diamond) — chỉ mod visual/hack map/wallhack |
| **Hybrid** | Số dư server, hành vi client | Patch logic client (auto-aim, no recoil, map hack), không mod được số |
| **P2P** | Peer-to-peer, host quyết định | Mod host client → ảnh hưởng all players |

### 2b. Patch network check — bypass server verify

**Cách 1: Sửa URL → localhost (chặn gọi server)**
```smali
const-string v0, "https://api.game.com/license/check"
# → sửa thành:
const-string v0, "http://127.0.0.1:9999/"
```
→ Server không gọi được → fallback về local return true (nếu code có handle lỗi)

**Cách 2: Skip toàn bộ method gọi server**
```smali
# Nếu có:
invoke-static {p0}, Lcom/game/LicenseManager;->checkLicense()Z
move-result v0
if-eqz v0, :cond_fail
# → Xoá 3 dòng, thay bằng:
const/4 v0, 0x1
```

**Cách 3: Patch response handler — sửa chỗ xử lý kết quả trả về**
```smali
# Tìm method onLicenseResponse(boolean success, JSONObject data)
# Patch: luôn gọi callback với success=true
const/4 v0, 0x1
# nhảy thẳng đến label xử lý success
goto :cond_success
```

**Cách 4: Bypass SSL pinning (nếu server dùng HTTPS + pinning)**
Xem mục [Frida Scripts — SSL pinning bypass](#9-frida-scripts)

### 2c. Fake purchase — bypass Google Play / App Store verify

**Google Play IAP (In-App Purchase) pattern:**
```smali
# Tìm class chứa: Purchase, BillingClient, BillingResult
# Method phổ biến:
.onPurchaseFinished(Lcom/android/billing/api/BillingResult;Ljava/util/List;)V
# → patch: gọi onPurchasesUpdated với purchase hợp lệ

# Hoặc tìm:
.method public isPurchased(Ljava/lang/String;)Z
# → return const/4 v0, 0x1
```

**Signature verification bypass:**
```smali
# Tìm:
invoke-static {v0}, Lcom/game/Security;->verifySignature(Ljava/lang/String;)Z
# → xoá, return true

# Hoặc tìm method verifyPurchase trong PurchaseValidator
.method public verifyPurchase(Ljava/lang/String;Ljava/lang/String;)Z
# → return true
```

### 2d. Bypass server-side flag

Một số game server gửi flags `{"premium": false, "banned": false}` → client check flag này.
```smali
# Tìm nơi parse response JSON:
const-string v1, "premium"
invoke-virtual {v0, v1}, Lorg/json/JSONObject;->optBoolean(Ljava/lang/String;)Z
move-result v2
# → xoá move-result, set v2=1
# hoặc:
const/4 v2, 0x1
```

---

## 3. Anti-Tamper Matrix

> Đây là kiến thức VIP nhất. Game nào cũng có ít nhất 1 trong các lớp bảo vệ này.

### 3a. Signature verification

App tự kiểm tra chữ ký APK có khớp với chữ ký gốc không.

```smali
# Method thường gặp:
Landroid/content/pm/PackageManager;->getPackageInfo(Ljava/lang/String;I)Landroid/content/pm/PackageInfo;
# Sau đó so sánh signatures[0] với hardcoded hash

# Bypass:
# C1: Tìm nơi so sánh signature → return true
# C2: Patch getPackageInfo → return fake PackageInfo
# C3: Dùng Frida hook getPackageInfo → trả signature gốc
```

**Frida hook:**
```javascript
Java.perform(function() {
    var PackageManager = Java.use('android.content.pm.PackageManager');
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
        var info = this.getPackageInfo(pkg, flags);
        // Trả về signature gốc, không phải signature đã sign
        return info;
    };
});
```

### 3b. Checksum / Integrity check

App hash toàn bộ file DEX/so và so sánh với giá trị hardcoded.

```smali
# Tìm: MessageDigest, SHA-256, MD5
# Thường thấy ở method checkIntegrity() hoặc onCreate()

# Bypass:
# C1: Tìm return value của checkIntegrity → return true
# C2: Patch hash compare — sửa kết quả so sánh
```

**Smali patch:**
```smali
# Thường thấy dạng:
invoke-static {}, Lcom/game/IntegrityChecker;->check()Z
move-result v0
if-eqz v0, :cond_pass
# → sửa move-result v0 thành const/4 v0, 0x1
```

### 3c. Root detection

App kiểm tra thiết bị có root → từ chối chạy.

```smali
# Tìm class chứa: RootBeer, RootCheck, detectRoot, isRooted
# Tìm su executables check: /system/bin/su, /system/xbin/su, /sbin/su

# Bypass: return false cho isRooted()/detectRoot()
```

### 3d. Emulator detection

App kiểm tra đang chạy trên emulator → từ chối.

```smali
# Tìm: Build.FINGERPRINT, Build.MODEL, Build.MANUFACTURER
# Thường check: "generic", "sdk_google", "emulator"

# Bypass: patch method isEmulator() → return false
```

### 3e. Debug detection

App kiểm tra debugger có đang attach không → crash/tự thoát.

```smali
# Tìm: isDebuggerConnected, Debug.isDebuggerConnected()
# android.os.Debug.waitForDebugger()

# Bypass: patch method → return false
```

### 3f. DexGuard / Obfuscation

Code bị obfuscate, class/method name là `a.a.a`, `b.b()`.

```smali
# Đọc logic bằng tracing, không dựa vào tên method
# Dùng jadx-gui để decompile dù obfuscated
# Tìm string hardcoded trong code — ko thể obfuscate string hoàn toàn

# String search là vũ khí số 1:
# "premium", "buy", "purchase", "ad", "coin", "diamond"...
# Dù obfuscate class name, string gốc vẫn còn nguyên trong DEX
```

### 3g. Native integrity check (lib/.so)

Game Unity hoặc game có native code tự checksum `libil2cpp.so`, `libunity.so`.

```bash
# Bypass:
# C1: Patch native lib với IDA Pro / Ghidra
# C2: LD_PRELOAD hook hàm check
# C3: Frida hook native function
```

---

## 4. Unity Games

### 4a. Xác định loại

| File trong APK | Loại | Cách mod |
|---------------|------|---------|
| `assets/bin/Data/Managed/Assembly-CSharp.dll` | Mono | Decompile DLL bằng dnSpy/IlSpy → patch C# → recompile |
| `lib/arm64-v8a/libil2cpp.so` | il2cpp | Cần dump metadata + offset → patch native lib |
| `assets/bin/Data/Managed/` có Metadata | il2cpp mixed | Dùng Il2CppDumper → patch offset |

### 4b. Mod Unity Mono (Assembly-CSharp.dll)

```bash
# Decompile
# Copy Assembly-CSharp.dll ra
# Mở bằng dnSpy hoặc IlSpy
# Tìm method: Update, Start, Awake, GetDamage, TakeDamage, Heal, AddCoin, BuyItem
# Edit method → recompile module
# Copy lại vào APK → rebuild
```

### 4c. Mod Unity il2cpp (phổ biến nhất)

```bash
# Bước 1: Dump
Il2CppDumper libil2cpp.so global-metadata.dat output/

# Bước 2: Xem output
# - dump.cs: tất cả class + method + offset
# - script.json: method addresses

# Bước 3: Tìm offset của method cần patch
# Ví dụ: muốn patch get_Damage() → tìm trong dump.cs:

# Bước 4: Patch binary
# Dùng hex editor: tìm offset → patch assembly instruction
# ARM64 common patches:
# - MOV X0, #1 (return 1)
# - RET (early return)
```

### 4d. ARM64 hex patch cheatsheet

| Instruction | Bytes (ARM64 little-endian) | Ý nghĩa |
|------------|---------------------------|---------|
| `MOV X0, #1; RET` | `20 00 80 D2 C0 03 5F D6` | Return true / return 1 |
| `MOV X0, #0; RET` | `00 00 80 D2 C0 03 5F D6` | Return false / return 0 |
| `MOV W0, #1; RET` | `20 00 80 52 C0 03 5F D6` | Return int 1 (32-bit) |
| `MOV W0, #9999; RET` | `10 27 80 52 C0 03 5F D6` | Return int 9999 |
| `RET` (early return) | `C0 03 5F D6` | Skip function body |
| `NOP` | `1F 20 03 D5` | No-op (xoá lệnh) |

### 4e. Tìm offset bằng pattern search trong IDA/Ghidra
```bash
# Trong dump.cs tìm:
# public int get_Damage() { ... }
# Ghi offset → nhảy đến trong IDA → patch bytes
```

---

## 5. Cocos2d-x / Cocos Creator

| File | Cách mod |
|------|---------|
| `assets/script.zip` | Giải nén, edit .js/.lua, zip lại |
| `assets/src/` | JS source trực tiếp, edit rồi rebuild |
| `lib/armeabi-v7a/libcocos2djs.so` | Native JS engine — khó hơn, cần dump JS |
| `lib/armeabi-v7a/libcocos2dlua.so` | Lua engine — dump .lua từ memory |

**Mod JS game (Cocos Creator):**
```bash
# Tìm file .js trong assets/
# Decompile nếu minified/obfuscated với js-beautify
# Tìm biến liên quan: isPaid, gold, diamond, level
# Patch trực tiếp → rebuild
```

---

## 6. Flutter Apps

Flutter = `libapp.so` hoặc `libflutter.so` chứa Dart AOT compiled.

```bash
# C1: Dùng ReFlutter (https://github.com/Impact-I/reFlutter)
# C2: Dump Dart snapshot → patch
# C3: Patch native lib hook Dart functions

# Flutter thường không có class name string → khó hơn Smali
# Cần dùng Frida + reFlutter để bypass
```

---

## 7. Mod Menu

Thêm floating overlay để bật/tắt từng tính năng mod.

### Smali injection pattern

```smali
# Trong smali, thêm invoke để gọi mod menu:
# Tại class chính (UnityPlayerActivity, MainActivity, v.v.):
# Thêm onCreate: khởi tạo mod menu thread

# File cần tạo:
# smali/com/mod/ModMenu.smali
# smali/com/mod/ModService.smali

# Mod menu thường có:
# - Toggle God Mode
# - Toggle One Hit Kill
# - Toggle Unlimited Ammo
# - Slider speed hack
```

---

## 8. Split APK / App Bundle / APKM / XAPK

### 8a. Split APK (.apks / .apkm)

```bash
# Giải nén .apks như zip → thấy nhiều .apk:
# base.apk, split_config.armeabi_v7a.apk, split_config.en.apk, ...

# Cách mod:
# 1. Chỉ mod base.apk (chứa code chính)
# 2. apktool d base.apk → patch → rebuild → sign
# 3. Repack: bỏ base.apk đã mod vào lại file .apks
# 4. Cài bằng: adb install-multiple base.apk split_config.*.apk
```

**Cài split APK đã mod:**
```bash
# Giải nén .apks
# Mod base.apk
# Gỡ app cũ trước
adb uninstall <package>
# Cài tất cả split
adb install-multiple base.apk split_config.armeabi_v7a.apk split_config.en.apk ...
```

### 8b. XAPK (có obb)

```bash
# XAPK = zip chứa .apk + .obb
# 1. Giải nén .xapk
# 2. apktool d com.example.apk → patch → rebuild
# 3. Sign APK
# 4. Cài APK
# 5. Copy obb vào Android/obb/<package>/main.<version>.com.example.obb
```

### 8c. Android App Bundle (.aab)

AAB không thể apktool trực tiếp. Cần chuyển:

```bash
# Dùng bundletool:
java -jar bundletool.jar build-apks --bundle=bundle.aab --output=app.apks --ks=key.jks
# Sau đó giải nén .apks như split APK
```

---

## 9. Frida Scripts

### 9a. SSL Pinning bypass — objection (1 click)
```bash
objection -g com.game.package explore
# Trong objection console:
android sslpinning disable
```

### 9b. Bypass root detection
```javascript
Java.perform(function() {
    var RootBeer = Java.use('com.scottyab.rootbeer.RootBeer');
    RootBeer.isRooted.implementation = function() {
        return false;
    };
});
```

### 9c. Bypass signature check
```javascript
Java.perform(function() {
    var PackageManager = Java.use('android.content.pm.PackageManager');
    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
        var info = this.getPackageInfo(pkg, flags);
        info.signatures.value = [Java.array('byte', [/* original signature bytes here */])];
        return info;
    };
});
```

### 9d. Hook return value
```javascript
Java.perform(function() {
    var TargetClass = Java.use('com.game.premium.User');
    TargetClass.isPremium.implementation = function() {
        console.log('isPremium called - returning true');
        return true;
    };
    TargetClass.getCoin.implementation = function() {
        return 99999;
    };
});
```

### 9e. Trace method calls
```javascript
Java.perform(function() {
    var Target = Java.use('com.game.LicenseManager');
    var methods = ['checkLicense', 'verifyPurchase', 'isLicensed'];
    methods.forEach(function(m) {
        if (Target[m]) {
            Target[m].overloads.forEach(function(overload) {
                overload.implementation = function() {
                    console.log(`Called ${m}: ` + JSON.stringify(arguments));
                    return overload.apply(this, arguments);
                };
            });
        }
    });
});
```

---

## 10. Vibe Code Smali

### 10a. Sửa locals — quan trọng nhất

Luôn kiểm tra và sửa `.locals` khi thay đổi số register dùng:

```smali
# Nếu method cũ:
.method public test()V
    .locals 3
    # dùng v0, v1, v2

# Sau patch, nếu chỉ dùng 1 register:
.method public test()V
    .locals 1
    const/4 v0, 0x1
    return-void
.end method
```

### 10b. Patch goto — bypass block

```smali
# Original:
    if-eqz v0, :cond_block
    # code chạy khi premium (cần đến)
    return-void
:cond_block
    # code chạy khi không premium
    return-void

# Patch: bỏ if, goto thẳng premium code
    goto :cond_premium
    # (xoá if-eqz)
:nop
    # ...
:cond_premium
    # code chạy khi premium
    return-void
```

### 10c. Patch constructor — init với giá trị custom

```smali
# Trong constructor <init>:
# Tìm nơi gán giá trị mặc định:
const/4 v0, 0x0
iput v0, p0, Lcom/game/Player;->coins:I
# → sửa 0x0 → 0xF423F (999999)
```

### 10d. Smali inject — thêm code vào method

```smali
# Thêm invoke vào cuối onCreate:
    invoke-static {}, Lcom/mod/ModMenu;->init()V

# Cần tạo class ModMenu.smali tương ứng
```

### 10e. Multi-dex handling

Nếu có classes2.dex, classes3.dex:

```bash
# apktool tự động tách các thư mục:
# smali/ — classes.dex
# smali_classes2/ — classes2.dex
# smali_classes3/ — classes3.dex

# Khi tìm class: check all smali* folders
```

---

## 11. Debug — Crash Analyzer

### 11a. Logcat — đọc stack trace
```bash
# Lọc crash
adb logcat -s AndroidRuntime:* *:S
# Hoặc filter exception
adb logcat | grep -E "FATAL|Exception|at "
```

### 11b. Crash pattern & fix

| Stack trace | Nguyên nhân | Fix |
|-------------|-------------|-----|
| `Verification failed` | Smali syntax sai register | Kiểm tra `.locals` ≥ số register dùng |
| `ClassNotFoundException` | Class bị xoá hoặc apktool không include | Check `apktool.yml` — có thể bị exclude |
| `NoSuchMethodError` | Method signature sai | Xoá cache, rebuild lại |
| `UnsatisfiedLinkError` | Native lib thiếu/không load được | Giữ nguyên `lib/` gốc |
| `SecurityException` | Signature mismatch | Sign lại hoặc patch signature check |
| `IllegalStateException` | State flow sai | Patch method không để game state inconsistent |
| `NullPointerException` | Return null khi cần object | Không return null — return object rỗng |

### 11c. Debug smali — thêm log

Inject log để trace:

```smali
# Thêm vào method:
const-string v0, "MOD_DEBUG"
const-string v1, "isPremium called, returning true"
invoke-static {v0, v1}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I
```

### 11d. Test an toàn

```bash
# Trước khi rebuild, verify smali syntax:
# Dùng GDA hoặc MT Manager check syntax nhanh
# Kiểm tra file smali có .locals ≥ số register dùng
# Kiểm tra label không bị duplicate
```

---

## 12. Quy tắc vàng — Không lỗi

1. **Backup gốc**: Luôn giữ APK gốc + folder decompiled gốc
2. **Patch tối thiểu**: Chỉ sửa đúng dòng cần sửa, không xoá file
3. **Kiểm tra `.locals`**: Sai locals = crash 100%
4. **Giữ nguyên `lib/`**: Không xoá thư mục native lib
5. **Sign đúng cách**: Luôn sign bằng uber-apk-signer, không dùng debug key
6. **Test từng bước**: Mod 1 tính năng → test → mod tiếp
7. **XAPK/Split**: Cài obb/split config đúng cách
8. **Online game**: Chấp nhận giới hạn — không thể mod số nếu server trust
9. **String search**: Dùng jadx-gui search string là cách nhanh nhất để tìm class
10. **Logcat**: Khi crash, đọc stack trace từ dưới lên
