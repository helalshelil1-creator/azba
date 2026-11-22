// ============================================
// AZBA | عزبة — Brand Identity Constants
// ============================================

export const BRAND = {
  name: 'AZBA',
  nameAr: 'عزبة',
  fullName: 'AZBA | عزبة',
  taglineAr: 'استثمر في الثروة الحقيقية.',
  sloganAr: 'من المزرعة إلى محفظتك الاستثمارية.',
  visionAr: 'منصة مصرية رائدة تربط الاستثمار المنظم بالثروة الحيوانية والإدارة الزراعية والتكنولوجيا المالية.',
  taglineEn: 'Invest in real wealth.',
  sloganEn: 'From the farm to your investment portfolio.',
  visionEn: 'A leading Egyptian platform connecting organized investment with livestock, agricultural management, and financial technology.',
  markets: ['Egypt', 'Arab World'],
  primaryCurrency: 'EGP',
  languages: ['ar', 'en'],
  defaultLanguage: 'ar',
  timezone: 'Africa/Cairo',
} as const

export const COLORS = {
  royalEmerald: '#123B2A',
  luxuryGold: '#C9A45C',
  ivory: '#F5F1E8',
  naturalGreen: '#527A58',
  charcoal: '#333333',
  white: '#FFFFFF',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  info: '#2563EB',
} as const

export const COLOR_TOKENS = {
  primary: COLORS.royalEmerald,
  primaryLight: COLORS.naturalGreen,
  accent: COLORS.luxuryGold,
  background: COLORS.ivory,
  surface: COLORS.white,
  text: COLORS.charcoal,
  danger: COLORS.danger,
  success: COLORS.success,
  warning: COLORS.warning,
  info: COLORS.info,
} as const

export const FONTS = {
  arabic: ['Tajawal', 'Cairo'],
  englishHeading: ['Montserrat'],
  englishBody: ['Montserrat'],
  wordmark: ['Instrument Serif', 'Times New Roman'],
} as const

/** لوحة الشعار الذهبية/الورقية كما في أيقونة التطبيق الرسمية. */
export const LOGO_COLORS = {
  goldLight: '#FFF6B0',
  gold: '#FFD700',
  goldMid: '#DAA520',
  goldDark: '#8B6914',
  leafLight: '#8CE600',
  leaf: '#32CD32',
  leafDark: '#006400',
  ink: '#08130C',
  background: '#000000',
} as const
