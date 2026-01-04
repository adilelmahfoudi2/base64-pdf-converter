# Base64 PDF Converter

تطبيق احترافي لتحويل ملفات PDF إلى Base64 والعكس.

## المميزات

- ✅ تحويل Base64 إلى PDF
- ✅ تحويل PDF إلى Base64
- ✅ حفظ ومشاركة الملفات
- ✅ سجل التحويلات
- ✅ الوضع الداكن والفاتح
- ✅ دعم اللغة العربية والإنجليزية
- ✅ إعلانات Google AdMob
- ✅ تصميم عصري وجذاب

## التثبيت

```bash
# تثبيت الحزم
npm install

# تشغيل التطبيق
npx expo start
```

## البناء

### بناء APK للاختبار
```bash
eas build --platform android --profile preview
```

### بناء AAB للنشر
```bash
eas build --platform android --profile production
```

## إعداد الإعلانات

1. أنشئ حساب في [Google AdMob](https://admob.google.com/)
2. أنشئ تطبيق جديد واحصل على App ID
3. أنشئ وحدات إعلانية (Banner, Interstitial, Rewarded)
4. استبدل معرفات الإعلانات في الملفات التالية:
   - `app.json` - استبدل `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`
   - `src/services/AdService.js` - استبدل معرفات الإعلانات

## هيكل المشروع

```
base64-pdf-converter/
├── assets/                 # الأيقونات والصور
├── src/
│   ├── components/        # المكونات القابلة لإعادة الاستخدام
│   ├── constants/         # الثوابت (الألوان، النصوص)
│   ├── context/           # Context API (Theme, Language)
│   ├── navigation/        # التنقل
│   ├── screens/           # الشاشات
│   └── services/          # الخدمات (التحويل، التخزين، الإعلانات)
├── App.js                 # نقطة الدخول
├── app.json              # إعدادات Expo
├── eas.json              # إعدادات البناء
└── package.json          # الحزم
```

## الأيقونات المطلوبة

قبل البناء، تأكد من إضافة الأيقونات التالية:

- `assets/icon.png` - 1024x1024 بكسل
- `assets/splash.png` - 1284x2778 بكسل
- `assets/adaptive-icon.png` - 1024x1024 بكسل

## متطلبات Google Play

- سياسة الخصوصية (رابط URL)
- Feature Graphic: 1024x500 بكسل
- لقطات شاشة: 2-8 صور

## الترخيص

MIT License
