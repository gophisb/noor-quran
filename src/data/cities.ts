// قاعدة بيانات الدول العربية ومدنها الرئيسية مع طريقة الحساب المعتمدة رسمياً في كل دولة
export type MethodKey =
  | "UmmAlQura"
  | "Egyptian"
  | "MuslimWorldLeague"
  | "Kuwait"
  | "Qatar"
  | "Dubai"
  | "Karachi"
  | "Tehran"
  | "Turkey"
  | "Singapore"
  | "NorthAmerica"
  | "MoonsightingCommittee"
  | "Jordan"
  | "Morocco"
  | "Algeria"
  | "Tunisia"
  | "Libya";

export const METHOD_LABELS: Record<MethodKey, string> = {
  UmmAlQura: "أم القرى (مكة المكرمة)",
  Egyptian: "الهيئة المصرية العامة للمساحة",
  MuslimWorldLeague: "رابطة العالم الإسلامي",
  Kuwait: "الكويت",
  Qatar: "قطر",
  Dubai: "الإمارات (دبي)",
  Karachi: "جامعة العلوم الإسلامية بكراتشي",
  Tehran: "معهد الجيوفيزياء بطهران",
  Turkey: "رئاسة الشؤون الدينية التركية",
  Singapore: "سنغافورة",
  NorthAmerica: "الجمعية الإسلامية لأمريكا الشمالية",
  MoonsightingCommittee: "لجنة رؤية الهلال",
  Jordan: "وزارة الأوقاف الأردنية / فلسطين (18° / 18°)",
  Morocco: "وزارة الأوقاف المغربية (19° / 17°)",
  Algeria: "وزارة الشؤون الدينية الجزائرية (18° / 17°)",
  Tunisia: "وزارة الشؤون الدينية التونسية (18° / 18°)",
  Libya: "الهيئة العامة للأوقاف الليبية (18.5° / 18.5°)",
};

export interface City {
  name: string;
  lat: number;
  lng: number;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  tz: string;
  method: MethodKey;
  cities: City[];
}

export const COUNTRIES: Country[] = [
  {
    code: "SA", name: "السعودية", flag: "🇸🇦", tz: "Asia/Riyadh", method: "UmmAlQura",
    cities: [
      { name: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
      { name: "المدينة المنورة", lat: 24.4686, lng: 39.6142 },
      { name: "الرياض", lat: 24.7136, lng: 46.6753 },
      { name: "جدة", lat: 21.5433, lng: 39.1728 },
      { name: "الدمام", lat: 26.4207, lng: 50.0888 },
      { name: "الطائف", lat: 21.2703, lng: 40.4158 },
      { name: "أبها", lat: 18.2164, lng: 42.5053 },
      { name: "تبوك", lat: 28.3838, lng: 36.5550 },
      { name: "بريدة", lat: 26.3260, lng: 43.9750 },
      { name: "حائل", lat: 27.5114, lng: 41.7208 },
    ],
  },
  {
    code: "PS", name: "فلسطين", flag: "🇵🇸", tz: "Asia/Gaza", method: "Jordan",
    cities: [
      { name: "القدس", lat: 31.7683, lng: 35.2137 },
      { name: "غزة", lat: 31.5017, lng: 34.4668 },
      { name: "رام الله", lat: 31.9038, lng: 35.2034 },
      { name: "الخليل", lat: 31.5326, lng: 35.0998 },
      { name: "نابلس", lat: 32.2211, lng: 35.2544 },
      { name: "جنين", lat: 32.4636, lng: 35.2951 },
      { name: "بيت لحم", lat: 31.7054, lng: 35.2024 },
      { name: "خان يونس", lat: 31.3462, lng: 34.3063 },
    ],
  },
  {
    code: "EG", name: "مصر", flag: "🇪🇬", tz: "Africa/Cairo", method: "Egyptian",
    cities: [
      { name: "القاهرة", lat: 30.0444, lng: 31.2357 },
      { name: "الإسكندرية", lat: 31.2001, lng: 29.9187 },
      { name: "الجيزة", lat: 30.0131, lng: 31.2089 },
      { name: "المنصورة", lat: 31.0409, lng: 31.3785 },
      { name: "طنطا", lat: 30.7865, lng: 31.0004 },
      { name: "أسيوط", lat: 27.1809, lng: 31.1837 },
      { name: "الأقصر", lat: 25.6872, lng: 32.6396 },
      { name: "أسوان", lat: 24.0889, lng: 32.8998 },
      { name: "بورسعيد", lat: 31.2653, lng: 32.3019 },
      { name: "السويس", lat: 29.9668, lng: 32.5498 },
    ],
  },
  {
    code: "AE", name: "الإمارات", flag: "🇦🇪", tz: "Asia/Dubai", method: "Dubai",
    cities: [
      { name: "أبوظبي", lat: 24.4539, lng: 54.3773 },
      { name: "دبي", lat: 25.2048, lng: 55.2708 },
      { name: "الشارقة", lat: 25.3463, lng: 55.4209 },
      { name: "العين", lat: 24.2075, lng: 55.7447 },
      { name: "عجمان", lat: 25.4052, lng: 55.5136 },
      { name: "رأس الخيمة", lat: 25.7895, lng: 55.9432 },
      { name: "الفجيرة", lat: 25.1288, lng: 56.3265 },
    ],
  },
  {
    code: "KW", name: "الكويت", flag: "🇰🇼", tz: "Asia/Kuwait", method: "Kuwait",
    cities: [
      { name: "مدينة الكويت", lat: 29.3759, lng: 47.9774 },
      { name: "الأحمدي", lat: 29.0769, lng: 48.0838 },
      { name: "حولي", lat: 29.3328, lng: 48.0286 },
      { name: "الجهراء", lat: 29.3375, lng: 47.6581 },
    ],
  },
  {
    code: "QA", name: "قطر", flag: "🇶🇦", tz: "Asia/Qatar", method: "Qatar",
    cities: [
      { name: "الدوحة", lat: 25.2854, lng: 51.5310 },
      { name: "الوكرة", lat: 25.1715, lng: 51.6034 },
      { name: "الخور", lat: 25.6804, lng: 51.4969 },
      { name: "الريان", lat: 25.2919, lng: 51.4244 },
    ],
  },
  {
    code: "BH", name: "البحرين", flag: "🇧🇭", tz: "Asia/Bahrain", method: "UmmAlQura",
    cities: [
      { name: "المنامة", lat: 26.2285, lng: 50.5860 },
      { name: "المحرق", lat: 26.2572, lng: 50.6119 },
      { name: "الرفاع", lat: 26.1300, lng: 50.5550 },
    ],
  },
  {
    code: "OM", name: "عُمان", flag: "🇴🇲", tz: "Asia/Muscat", method: "UmmAlQura",
    cities: [
      { name: "مسقط", lat: 23.5880, lng: 58.3829 },
      { name: "صلالة", lat: 17.0151, lng: 54.0924 },
      { name: "صحار", lat: 24.3643, lng: 56.7463 },
      { name: "نزوى", lat: 22.9333, lng: 57.5333 },
      { name: "صور", lat: 22.5667, lng: 59.5289 },
    ],
  },
  {
    code: "YE", name: "اليمن", flag: "🇾🇪", tz: "Asia/Aden", method: "UmmAlQura",
    cities: [
      { name: "صنعاء", lat: 15.3694, lng: 44.1910 },
      { name: "عدن", lat: 12.7855, lng: 45.0187 },
      { name: "تعز", lat: 13.5789, lng: 44.0219 },
      { name: "الحديدة", lat: 14.7978, lng: 42.9545 },
      { name: "المكلا", lat: 14.5425, lng: 49.1242 },
      { name: "إب", lat: 13.9667, lng: 44.1833 },
    ],
  },
  {
    code: "JO", name: "الأردن", flag: "🇯🇴", tz: "Asia/Amman", method: "Jordan",
    cities: [
      { name: "عمّان", lat: 31.9454, lng: 35.9284 },
      { name: "الزرقاء", lat: 32.0728, lng: 36.0880 },
      { name: "إربد", lat: 32.5556, lng: 35.8500 },
      { name: "العقبة", lat: 29.5321, lng: 35.0063 },
      { name: "السلط", lat: 32.0392, lng: 35.7272 },
      { name: "الكرك", lat: 31.1853, lng: 35.7048 },
    ],
  },
  {
    code: "SY", name: "سوريا", flag: "🇸🇾", tz: "Asia/Damascus", method: "Egyptian",
    cities: [
      { name: "دمشق", lat: 33.5138, lng: 36.2765 },
      { name: "حلب", lat: 36.2021, lng: 37.1343 },
      { name: "حمص", lat: 34.7324, lng: 36.7137 },
      { name: "حماة", lat: 35.1318, lng: 36.7578 },
      { name: "اللاذقية", lat: 35.5317, lng: 35.7915 },
      { name: "دير الزور", lat: 35.3359, lng: 40.1408 },
      { name: "إدلب", lat: 35.9306, lng: 36.6339 },
    ],
  },
  {
    code: "LB", name: "لبنان", flag: "🇱🇧", tz: "Asia/Beirut", method: "Egyptian",
    cities: [
      { name: "بيروت", lat: 33.8938, lng: 35.5018 },
      { name: "طرابلس", lat: 34.4367, lng: 35.8497 },
      { name: "صيدا", lat: 33.5571, lng: 35.3729 },
      { name: "صور", lat: 33.2705, lng: 35.2038 },
      { name: "بعلبك", lat: 34.0058, lng: 36.2181 },
    ],
  },
  {
    code: "IQ", name: "العراق", flag: "🇮🇶", tz: "Asia/Baghdad", method: "Egyptian",
    cities: [
      { name: "بغداد", lat: 33.3152, lng: 44.3661 },
      { name: "البصرة", lat: 30.5085, lng: 47.7804 },
      { name: "الموصل", lat: 36.3350, lng: 43.1189 },
      { name: "أربيل", lat: 36.1911, lng: 44.0092 },
      { name: "النجف", lat: 32.0000, lng: 44.3333 },
      { name: "كربلاء", lat: 32.6160, lng: 44.0249 },
      { name: "كركوك", lat: 35.4681, lng: 44.3922 },
      { name: "السليمانية", lat: 35.5613, lng: 45.4308 },
    ],
  },
  {
    code: "LY", name: "ليبيا", flag: "🇱🇾", tz: "Africa/Tripoli", method: "Libya",
    cities: [
      { name: "طرابلس", lat: 32.8872, lng: 13.1913 },
      { name: "بنغازي", lat: 32.1167, lng: 20.0667 },
      { name: "مصراتة", lat: 32.3754, lng: 15.0925 },
      { name: "البيضاء", lat: 32.7627, lng: 21.7551 },
      { name: "سبها", lat: 27.0377, lng: 14.4283 },
    ],
  },
  {
    code: "TN", name: "تونس", flag: "🇹🇳", tz: "Africa/Tunis", method: "Tunisia",
    cities: [
      { name: "تونس", lat: 36.8065, lng: 10.1815 },
      { name: "صفاقس", lat: 34.7406, lng: 10.7603 },
      { name: "سوسة", lat: 35.8256, lng: 10.6369 },
      { name: "القيروان", lat: 35.6781, lng: 10.0963 },
      { name: "بنزرت", lat: 37.2744, lng: 9.8739 },
      { name: "قابس", lat: 33.8815, lng: 10.0982 },
    ],
  },
  {
    code: "DZ", name: "الجزائر", flag: "🇩🇿", tz: "Africa/Algiers", method: "Algeria",
    cities: [
      { name: "الجزائر", lat: 36.7538, lng: 3.0588 },
      { name: "وهران", lat: 35.6969, lng: -0.6331 },
      { name: "قسنطينة", lat: 36.3650, lng: 6.6147 },
      { name: "عنابة", lat: 36.9000, lng: 7.7667 },
      { name: "البليدة", lat: 36.4700, lng: 2.8300 },
      { name: "سطيف", lat: 36.1900, lng: 5.4100 },
      { name: "تلمسان", lat: 34.8783, lng: -1.3150 },
      { name: "ورقلة", lat: 31.9500, lng: 5.3167 },
    ],
  },
  {
    code: "MA", name: "المغرب", flag: "🇲🇦", tz: "Africa/Casablanca", method: "Morocco",
    cities: [
      { name: "الرباط", lat: 34.0209, lng: -6.8416 },
      { name: "الدار البيضاء", lat: 33.5731, lng: -7.5898 },
      { name: "فاس", lat: 34.0181, lng: -5.0078 },
      { name: "مراكش", lat: 31.6295, lng: -7.9811 },
      { name: "طنجة", lat: 35.7595, lng: -5.8340 },
      { name: "أكادير", lat: 30.4278, lng: -9.5981 },
      { name: "مكناس", lat: 33.8935, lng: -5.5473 },
      { name: "وجدة", lat: 34.6867, lng: -1.9114 },
      { name: "تطوان", lat: 35.5889, lng: -5.3626 },
      { name: "العيون", lat: 27.1536, lng: -13.2033 },
    ],
  },
  {
    code: "MR", name: "موريتانيا", flag: "🇲🇷", tz: "Africa/Nouakchott", method: "MuslimWorldLeague",
    cities: [
      { name: "نواكشوط", lat: 18.0735, lng: -15.9582 },
      { name: "نواذيبو", lat: 20.9310, lng: -17.0347 },
      { name: "كيفة", lat: 16.6200, lng: -11.4042 },
    ],
  },
  {
    code: "SD", name: "السودان", flag: "🇸🇩", tz: "Africa/Khartoum", method: "Egyptian",
    cities: [
      { name: "الخرطوم", lat: 15.5007, lng: 32.5599 },
      { name: "أم درمان", lat: 15.6445, lng: 32.4777 },
      { name: "بورتسودان", lat: 19.6158, lng: 37.2164 },
      { name: "كسلا", lat: 15.4500, lng: 36.4000 },
      { name: "الأبيض", lat: 13.1833, lng: 30.2167 },
    ],
  },
  {
    code: "SO", name: "الصومال", flag: "🇸🇴", tz: "Africa/Mogadishu", method: "MuslimWorldLeague",
    cities: [
      { name: "مقديشو", lat: 2.0469, lng: 45.3182 },
      { name: "هرجيسا", lat: 9.5600, lng: 44.0650 },
      { name: "بوصاصو", lat: 11.2842, lng: 49.1816 },
    ],
  },
  {
    code: "DJ", name: "جيبوتي", flag: "🇩🇯", tz: "Africa/Djibouti", method: "MuslimWorldLeague",
    cities: [{ name: "جيبوتي", lat: 11.5721, lng: 43.1456 }],
  },
  {
    code: "KM", name: "جزر القمر", flag: "🇰🇲", tz: "Indian/Comoro", method: "MuslimWorldLeague",
    cities: [{ name: "موروني", lat: -11.7172, lng: 43.2473 }],
  },
];
