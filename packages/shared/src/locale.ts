export const CURRENCIES = {
  EGP: { code: 'EGP', symbol: 'ج.م', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound', decimals: 2 },
  USD: { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', decimals: 2 },
  SAR: { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', decimals: 2 },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

export const LOCALES = {
  ar: {
    code: 'ar',
    name: 'العربية',
    dir: 'rtl',
    locale: 'ar-EG',
    numberLocale: 'ar-EG',
  },
  en: {
    code: 'en',
    name: 'English',
    dir: 'ltr',
    locale: 'en-US',
    numberLocale: 'en-US',
  },
} as const

export type LocaleCode = keyof typeof LOCALES

export const ANIMAL_TYPES = {
  CATTLE: { ar: 'أبقار', en: 'Cattle' },
  BUFFALO: { ar: 'جاموس', en: 'Buffalo' },
  SHEEP: { ar: 'أغنام', en: 'Sheep' },
  GOAT: { ar: 'ماعز', en: 'Goat' },
  CALF: { ar: 'عجول', en: 'Calves' },
  FATTENING: { ar: 'تسمين', en: 'Fattening' },
  DAIRY: { ar: 'ألبان', en: 'Dairy' },
  BREEDING: { ar: 'تربية', en: 'Breeding' },
} as const

export type AnimalType = keyof typeof ANIMAL_TYPES

export const PROJECT_PURPOSES = {
  FATTENING: { ar: 'تسمين', en: 'Fattening' },
  DAIRY: { ar: 'إنتاج ألبان', en: 'Dairy Production' },
  BREEDING: { ar: 'تربية', en: 'Breeding' },
  RESALE: { ar: 'تجارة', en: 'Resale' },
} as const

export const RISK_LEVELS = {
  LOW: { ar: 'منخفض', en: 'Low', color: '#16A34A' },
  MEDIUM: { ar: 'متوسط', en: 'Medium', color: '#D97706' },
  HIGH: { ar: 'مرتفع', en: 'High', color: '#EA580C' },
  CRITICAL: { ar: 'حرج', en: 'Critical', color: '#DC2626' },
} as const

export const PROJECT_STATUS = {
  DRAFT: { ar: 'مسودة', en: 'Draft', color: '#6B7280' },
  PENDING_APPROVAL: { ar: 'بانتظار الموافقة', en: 'Pending Approval', color: '#D97706' },
  APPROVED: { ar: 'معتمد', en: 'Approved', color: '#2563EB' },
  FUNDING: { ar: 'قيد التمويل', en: 'Funding', color: '#7C3AED' },
  FUNDED: { ar: 'ممول', en: 'Funded', color: '#16A34A' },
  ACTIVE: { ar: 'نشط', en: 'Active', color: '#059669' },
  COMPLETED: { ar: 'مكتمل', en: 'Completed', color: '#0F766E' },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled', color: '#DC2626' },
  ON_HOLD: { ar: 'معلق', en: 'On Hold', color: '#6B7280' },
} as const

export const INVESTMENT_STATUS = {
  DRAFT: { ar: 'مسودة', en: 'Draft', color: '#6B7280' },
  PENDING_PAYMENT: { ar: 'بانتظار الدفع', en: 'Pending Payment', color: '#D97706' },
  RESERVED: { ar: 'محجوز', en: 'Reserved', color: '#2563EB' },
  CONFIRMED: { ar: 'مؤكد', en: 'Confirmed', color: '#16A34A' },
  ACTIVE: { ar: 'نشط', en: 'Active', color: '#059669' },
  COMPLETED: { ar: 'مكتمل', en: 'Completed', color: '#0F766E' },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled', color: '#DC2626' },
  REFUNDED: { ar: 'مسترد', en: 'Refunded', color: '#6B7280' },
} as const

export const USER_ROLES = {
  SUPER_ADMIN: { ar: 'مدير عام', en: 'Super Admin', level: 100 },
  ADMIN: { ar: 'مدير', en: 'Admin', level: 90 },
  FINANCE_MANAGER: { ar: 'مدير مالي', en: 'Finance Manager', level: 80 },
  ACCOUNTANT: { ar: 'محاسب', en: 'Accountant', level: 70 },
  INVESTMENT_MANAGER: { ar: 'مدير استثمار', en: 'Investment Manager', level: 80 },
  FARM_MANAGER: { ar: 'مدير مزرعة', en: 'Farm Manager', level: 70 },
  VETERINARIAN: { ar: 'طبيب بيطري', en: 'Veterinarian', level: 60 },
  FARM_EMPLOYEE: { ar: 'موظف مزرعة', en: 'Farm Employee', level: 40 },
  PROCUREMENT_OFFICER: { ar: 'مسؤول مشتريات', en: 'Procurement Officer', level: 60 },
  SALES_MANAGER: { ar: 'مدير مبيعات', en: 'Sales Manager', level: 70 },
  CUSTOMER_SUPPORT: { ar: 'دعم العملاء', en: 'Customer Support', level: 50 },
  INVESTOR: { ar: 'مستثمر', en: 'Investor', level: 10 },
} as const

export type UserRoleKey = keyof typeof USER_ROLES

export const EXPENSE_CATEGORIES = {
  FEED: { ar: 'أعلاف', en: 'Feed' },
  VETERINARY: { ar: 'بيطري', en: 'Veterinary' },
  LABOR: { ar: 'عمالة', en: 'Labor' },
  MAINTENANCE: { ar: 'صيانة', en: 'Maintenance' },
  UTILITIES: { ar: 'مرافق', en: 'Utilities' },
  TRANSPORT: { ar: 'نقل', en: 'Transport' },
  ADMIN: { ar: 'إدارية', en: 'Admin' },
  OTHER: { ar: 'أخرى', en: 'Other' },
} as const

export const NOTIFICATION_TYPES = {
  INVESTMENT_CREATED: { ar: 'استثمار جديد', en: 'Investment Created' },
  PAYMENT_CONFIRMED: { ar: 'تأكيد الدفع', en: 'Payment Confirmed' },
  CONTRACT_ISSUED: { ar: 'إصدار عقد', en: 'Contract Issued' },
  WEIGHT_UPDATED: { ar: 'تحديث الوزن', en: 'Weight Updated' },
  VETERINARY_REPORT: { ar: 'تقرير بيطري', en: 'Veterinary Report' },
  PROJECT_STATUS_CHANGED: { ar: 'تغيير حالة المشروع', en: 'Project Status Changed' },
  SALE_APPROVED: { ar: 'موافقة على البيع', en: 'Sale Approved' },
  DISTRIBUTION_APPROVED: { ar: 'موافقة على التوزيع', en: 'Distribution Approved' },
  WITHDRAWAL_REQUEST: { ar: 'طلب سحب', en: 'Withdrawal Request' },
  SYSTEM_ALERT: { ar: 'تنبيه نظام', en: 'System Alert' },
} as const

export const TICKET_CATEGORIES = {
  TECHNICAL: { ar: 'تقني', en: 'Technical' },
  BILLING: { ar: 'فواتير', en: 'Billing' },
  INVESTMENT: { ar: 'استثمار', en: 'Investment' },
  FARM: { ar: 'مزرعة', en: 'Farm' },
  VETERINARY: { ar: 'بيطري', en: 'Veterinary' },
  LEGAL: { ar: 'قانوني', en: 'Legal' },
  GENERAL: { ar: 'عام', en: 'General' },
} as const

export const TICKET_STATUS = {
  OPEN: { ar: 'مفتوح', en: 'Open', color: '#DC2626' },
  ASSIGNED: { ar: 'مسند', en: 'Assigned', color: '#2563EB' },
  IN_PROGRESS: { ar: 'قيد المعالجة', en: 'In Progress', color: '#D97706' },
  WAITING_USER: { ar: 'بانتظار المستخدم', en: 'Waiting User', color: '#7C3AED' },
  RESOLVED: { ar: 'تم الحل', en: 'Resolved', color: '#16A34A' },
  CLOSED: { ar: 'مغلق', en: 'Closed', color: '#6B7280' },
} as const
