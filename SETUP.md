# دليل رفع المشروع إلى GitHub — خطوة بخطوة

## الخطوة 1: إنشاء مستودع على GitHub

1. اذهب إلى [github.com/new](https://github.com/new)
2. اسم المستودع: `houd11`
3. الوصف: `القرآن الكريم وتفسير السعدي — تطبيق ويب وأندرويد`
4. اختر: **Private** (خاص) أو **Public** (عام) — حسب رغبتك
5. **لا تضف** README أو .gitignore من GitHub (موجودان بالفعل)
6. انقر **Create repository**

---

## الخطوة 2: تهيئة Git محلياً ورفع الكود

افتح Terminal في مجلد المشروع ونفّذ:

```bash
cd /path/to/houd11

# تهيئة Git
git init
git branch -M main

# إضافة كل الملفات
git add .

# أول commit
git commit -m "feat: نُور v0.3.0 — القرآن وتفسير السعدي مع APK أندرويد"

# ربط بالمستودع البعيد (استبدل USERNAME باسم حسابك)
git remote add origin https://github.com/USERNAME/houd11.git

# الرفع
git push -u origin main
```

---

## الخطوة 3: إنشاء مفتاح التوقيع الدائم

```bash
keytool -genkey -v \
  -keystore noor-release.jks \
  -alias noor \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

سيطلب منك:
- كلمة مرور الـ keystore (احفظها جيداً)
- اسمك: `Samir Houd`
- دولتك: `DZ`
- باقي الحقول: اضغط Enter

**احفظ ملف `noor-release.jks` في مكان آمن خارج المستودع — لا ترفعه أبداً.**

---

## الخطوة 4: إضافة أسرار GitHub Actions

1. اذهب إلى مستودعك على GitHub
2. Settings → Secrets and variables → Actions → **New repository secret**

أضف هذه الأسرار الأربعة:

### KEYSTORE_BASE64
```bash
# شغّل هذا الأمر وانسخ الناتج كاملاً
base64 -w 0 noor-release.jks
```
الصقه كقيمة للسر `KEYSTORE_BASE64`

### KEYSTORE_PASSWORD
كلمة مرور الـ keystore التي أدخلتها عند الإنشاء

### KEY_ALIAS
```
noor
```

### KEY_PASSWORD
كلمة مرور المفتاح (نفس KEYSTORE_PASSWORD إن اخترت كلمة مرور واحدة)

---

## الخطوة 5: إطلاق أول إصدار

```bash
# إنشاء tag للإصدار الأول
git tag v0.3.0
git push origin v0.3.0
```

GitHub Actions سيبني APK تلقائياً ويرفعه كـ Release.

---

## التحقق من النجاح

- اذهب إلى مستودعك → **Actions** — ستجد workflow يعمل
- بعد اكتماله (≈15 دقيقة): اذهب إلى **Releases** — ستجد `houd11.apk`

---

## ملاحظة مهمة

ملف `noor-release.jks` **لا يُرفع إلى GitHub أبداً** — هو موجود في `.gitignore`.
احفظه في:
- USB خارجي
- أو Google Drive (مشفّر)
- أو Bitwarden / 1Password

فقدانه = عدم القدرة على تحديث التطبيق مستقبلاً.
