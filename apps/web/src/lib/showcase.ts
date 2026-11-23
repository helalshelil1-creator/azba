/**
 * بيانات العرض الاحتياطية (مشاريع ومزارع) — مطابقة لبيانات الـ seed في packages/database/prisma/seed.ts
 * (PRJ-DEMO-001 .. PRJ-DEMO-006).
 *
 * تُستخدم فقط عندما يكون الـ API غير متاح، عشان تفضل الواجهات كاملة بدون فراغات.
 * أول ما يشتغل الـ API تبدّل تلقائياً بالبيانات الحقيقية من قاعدة البيانات.
 */

const NOW = new Date().toISOString()
/** تاريخ بعد n شهر من الآن (نفس منطق الـ seed) */
const monthsFromNow = (n: number) =>
  new Date(Date.now() + n * 30 * 24 * 60 * 60 * 1000).toISOString()

export interface ShowcaseProject {
  id: string
  code: string
  name: string
  nameEn: string
  description: string
  animalType: string
  breed: string
  purpose: string
  status: string
  startDate: string
  expectedEndDate: string
  totalShares: number
  availableShares: number
  soldShares: number
  sharePrice: number
  targetAmount: number
  fundedAmount: number
  expectedReturn: number
  expectedReturnRate: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  farm: { name: string; city: string; governorate: string }
}

const FARM = { name: 'مزرعة المنوفية الرئيسية', city: 'شبين الكوم', governorate: 'المنوفية' }

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'prj-demo-001',
    code: 'PRJ-DEMO-001',
    name: 'مشروع تسمين البقار الهولشتاين — الدفعة الأولى',
    nameEn: 'Holstein Cattle Fattening — Batch 1',
    description:
      'مشروع تسمين مكثف لأبقار الهولشتاين لمدة ٨ أشهر مع متابعة بيطرية وتغذوية يومية.',
    animalType: 'DAIRY_COW',
    breed: 'Holstein',
    purpose: 'FATTENING',
    status: 'FUNDING',
    startDate: NOW,
    expectedEndDate: monthsFromNow(8),
    totalShares: 1000,
    availableShares: 850,
    soldShares: 150,
    sharePrice: 500,
    targetAmount: 500000,
    fundedAmount: 75000,
    expectedReturn: 20,
    expectedReturnRate: 20,
    riskLevel: 'MEDIUM',
    farm: FARM,
  },
  {
    id: 'prj-demo-002',
    code: 'PRJ-DEMO-002',
    name: 'مشروع تربية الخيل الأصيل — الموسم الأول',
    nameEn: 'Purebred Horse Breeding — Season 1',
    description:
      'تربية وتدريب الخيول العربية الأصيلة في مزرعة شريكة، مع متابعة بيطرية وغذائية متخصصة وبرنامج تمهيد للسباق.',
    animalType: 'HORSE',
    breed: 'Arabian',
    purpose: 'BREEDING',
    status: 'FUNDING',
    startDate: NOW,
    expectedEndDate: monthsFromNow(6),
    totalShares: 400,
    availableShares: 260,
    soldShares: 140,
    sharePrice: 1500,
    targetAmount: 600000,
    fundedAmount: 210000,
    expectedReturn: 22,
    expectedReturnRate: 22,
    riskLevel: 'MEDIUM',
    farm: FARM,
  },
  {
    id: 'prj-demo-003',
    code: 'PRJ-DEMO-003',
    name: 'مشروع تسمين الأغنام والخرفان — دفعة الشتاء',
    nameEn: 'Sheep & Lamb Fattening — Winter Batch',
    description:
      'تسمين الخرفان والأغنام الموسمية على عليقة متوازنة لمدة ٥ أشهر مع متابعة بيطرية دورية وبيع موسمي.',
    animalType: 'SHEEP',
    breed: 'Barki',
    purpose: 'FATTENING',
    status: 'FUNDING',
    startDate: NOW,
    expectedEndDate: monthsFromNow(6),
    totalShares: 800,
    availableShares: 520,
    soldShares: 280,
    sharePrice: 400,
    targetAmount: 320000,
    fundedAmount: 112000,
    expectedReturn: 19,
    expectedReturnRate: 19,
    riskLevel: 'MEDIUM',
    farm: FARM,
  },
  {
    id: 'prj-demo-004',
    code: 'PRJ-DEMO-004',
    name: 'مشروع تربية الماعز الحلاب — القطيع الأول',
    nameEn: 'Dairy Goat Herd — First Flock',
    description:
      'تربية ماعز حلاب من سلالات محسنة لإنتاج الألبان طوال العام مع تصنيع محلي للمنتجات.',
    animalType: 'GOAT',
    breed: 'Baladi',
    purpose: 'DAIRY',
    status: 'FUNDING',
    startDate: NOW,
    expectedEndDate: monthsFromNow(6),
    totalShares: 600,
    availableShares: 410,
    soldShares: 190,
    sharePrice: 450,
    targetAmount: 270000,
    fundedAmount: 85500,
    expectedReturn: 18,
    expectedReturnRate: 18,
    riskLevel: 'MEDIUM',
    farm: FARM,
  },
  {
    id: 'prj-demo-005',
    code: 'PRJ-DEMO-005',
    name: 'مشروع تسمين الجاموس البحيري — الدفعة الأولى',
    nameEn: 'Egyptian Buffalo Fattening — Batch 1',
    description:
      'تسمين الجاموس البحيري على عليقة مركزة مع متابعة بيطرية يومية وخطة بيع لمصانع الألبان واللحوم.',
    animalType: 'BUFFALO',
    breed: 'Egyptian',
    purpose: 'FATTENING',
    status: 'FUNDING',
    startDate: NOW,
    expectedEndDate: monthsFromNow(6),
    totalShares: 500,
    availableShares: 330,
    soldShares: 170,
    sharePrice: 900,
    targetAmount: 450000,
    fundedAmount: 153000,
    expectedReturn: 20,
    expectedReturnRate: 20,
    riskLevel: 'MEDIUM',
    farm: FARM,
  },
  {
    id: 'prj-demo-006',
    code: 'PRJ-DEMO-006',
    name: 'مشروع تسمين العجول الصغيرة — الدفعة الأولى',
    nameEn: 'Calf Fattening — Batch 1',
    description:
      'تسمين العجول الصغيرة (milk-fed veal) لمدة ٦ أشهر تحت إشراف بيطري مباشر وتغذية مكثفة.',
    animalType: 'CALVES',
    breed: 'Holstein',
    purpose: 'FATTENING',
    status: 'FUNDING',
    startDate: NOW,
    expectedEndDate: monthsFromNow(6),
    totalShares: 700,
    availableShares: 480,
    soldShares: 220,
    sharePrice: 600,
    targetAmount: 420000,
    fundedAmount: 132000,
    expectedReturn: 21,
    expectedReturnRate: 21,
    riskLevel: 'MEDIUM',
    farm: FARM,
  },
]

export interface ShowcaseFarm {
  id: string
  code: string
  name: string
  nameEn: string
  address: string
  city: string
  governorate: string
  totalArea: number
  usableArea: number
  status: 'ACTIVE'
  animals: number
  pens: number
}

/** مزارع العرض الاحتياطية — مطابقة لبيانات الـ seed */
export const SHOWCASE_FARMS: ShowcaseFarm[] = [
  {
    id: 'frm-demo-01',
    code: 'FRM-DEMO-01',
    name: 'مزرعة المنوفية الرئيسية',
    nameEn: 'Menofia Main Farm',
    address: 'طريق القاهرة - الإسكندرية الزراعي',
    city: 'شبين الكوم',
    governorate: 'المنوفية',
    totalArea: 50000,
    usableArea: 42000,
    status: 'ACTIVE',
    animals: 850,
    pens: 24,
  },
  {
    id: 'frm-demo-02',
    code: 'FRM-DEMO-02',
    name: 'مزرعة البحيرة للألبان',
    nameEn: 'Beheira Dairy Farm',
    address: 'طريق التحرير الزراعي',
    city: 'دمنهور',
    governorate: 'البحيرة',
    totalArea: 33000,
    usableArea: 28000,
    status: 'ACTIVE',
    animals: 420,
    pens: 18,
  },
  {
    id: 'frm-demo-03',
    code: 'FRM-DEMO-03',
    name: 'مزرعة كفر الشيخ',
    nameEn: 'Kafr El Sheikh Farm',
    address: 'الطريق السريع - كفر الشيخ',
    city: 'كفر الشيخ',
    governorate: 'كفر الشيخ',
    totalArea: 64000,
    usableArea: 55000,
    status: 'ACTIVE',
    animals: 1100,
    pens: 32,
  },
]

/** بحث مشروع عرض بالكود أو المعرف (يُستخدم كبديل عند غياب الـ API) */
export function findShowcaseProject(key?: string | null): ShowcaseProject | undefined {
  if (!key) return undefined
  return SHOWCASE_PROJECTS.find((p) => p.id === key || p.code === key)
}
