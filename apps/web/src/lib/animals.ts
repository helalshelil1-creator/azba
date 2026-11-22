/**
 * خرائط أنواع الحيوانات: التسمية العربية والصورة الحقيقية المستخدمة في الواجهات.
 * الصور محلية داخل public/images (لقطات حقيقية لأبقار/جاموس/ماعز/خرفان/خيل).
 */
export const ANIMAL_TYPE_AR: Record<string, string> = {
  DAIRY_COW: 'أبقار حلابة',
  BEEF_CATTLE: 'أبقار لحم',
  BUFFALO: 'جاموس',
  GOAT: 'ماعز',
  SHEEP: 'أغنام',
  HORSE: 'خيل',
  CALVES: 'عجول',
  POULTRY: 'دواجن',
  FISH: 'أسماك',
  OTHER: 'أخرى',
}

const TYPE_IMAGE: Record<string, string> = {
  DAIRY_COW: '/images/dairy.jpg',
  BEEF_CATTLE: '/images/beef.jpg',
  BUFFALO: '/images/buffalo.jpg',
  GOAT: '/images/goat.jpg',
  SHEEP: '/images/sheep.jpg',
  HORSE: '/images/horse.jpg',
  CALVES: '/images/beef.jpg',
  POULTRY: '/images/poultry.jpg',
  FISH: '/images/livestock.jpg',
  OTHER: '/images/cattle.jpg',
}

/** صورة حقيقية حسب نوع الحيوان (Fallback: بقرة). */
export function animalImage(type?: string | null): string {
  if (!type) return TYPE_IMAGE.OTHER
  return TYPE_IMAGE[type] ?? TYPE_IMAGE.OTHER
}

/** اسم عربي آمن لنوع الحيوان. */
export function animalLabel(type?: string | null): string {
  if (!type) return 'أخرى'
  return ANIMAL_TYPE_AR[type] ?? type
}
