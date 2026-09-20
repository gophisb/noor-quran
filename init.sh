#!/bin/bash
# init.sh — تهيئة المشروع بعد git clone
# شغّله مرة واحدة: bash init.sh

set -e

echo "🕌 نُور — تهيئة بيئة التطوير"
echo "================================"

# 1. تثبيت الاعتماديات
echo ""
echo "📦 تثبيت الاعتماديات..."
npm install

# 2. بناء الويب
echo ""
echo "🔨 بناء الويب..."
npm run build

# 3. إعداد مشروع Android
echo ""
echo "📱 إعداد مشروع Android..."
if [ ! -f android/gradlew ]; then
  npx cap add android
fi
node RAFEEQ/scripts/prepare-android.mjs
npx cap sync android
chmod +x android/gradlew

# 4. التحقق من الثوابت
echo ""
echo "✅ التحقق من الثوابت..."
node RAFEEQ/scripts/verify-invariants.mjs
node RAFEEQ/scripts/test-compass.mjs
node RAFEEQ/scripts/verify-prayer-times.mjs

echo ""
echo "================================"
echo "✅ جاهز! يمكنك الآن:"
echo "   npm run dev          — تشغيل بيئة التطوير"
echo "   npm run build        — بناء للإنتاج"
echo "   cd android && ./gradlew assembleRelease  — بناء APK"
