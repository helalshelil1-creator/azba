export declare const CURRENCIES: {
    readonly EGP: {
        readonly code: "EGP";
        readonly symbol: "ج.م";
        readonly nameAr: "جنيه مصري";
        readonly nameEn: "Egyptian Pound";
        readonly decimals: 2;
    };
    readonly USD: {
        readonly code: "USD";
        readonly symbol: "$";
        readonly nameAr: "دولار أمريكي";
        readonly nameEn: "US Dollar";
        readonly decimals: 2;
    };
    readonly SAR: {
        readonly code: "SAR";
        readonly symbol: "ر.س";
        readonly nameAr: "ريال سعودي";
        readonly nameEn: "Saudi Riyal";
        readonly decimals: 2;
    };
};
export type CurrencyCode = keyof typeof CURRENCIES;
export declare const LOCALES: {
    readonly ar: {
        readonly code: "ar";
        readonly name: "العربية";
        readonly dir: "rtl";
        readonly locale: "ar-EG";
        readonly numberLocale: "ar-EG";
    };
    readonly en: {
        readonly code: "en";
        readonly name: "English";
        readonly dir: "ltr";
        readonly locale: "en-US";
        readonly numberLocale: "en-US";
    };
};
export type LocaleCode = keyof typeof LOCALES;
export declare const ANIMAL_TYPES: {
    readonly CATTLE: {
        readonly ar: "أبقار";
        readonly en: "Cattle";
    };
    readonly BUFFALO: {
        readonly ar: "جاموس";
        readonly en: "Buffalo";
    };
    readonly SHEEP: {
        readonly ar: "أغنام";
        readonly en: "Sheep";
    };
    readonly GOAT: {
        readonly ar: "ماعز";
        readonly en: "Goat";
    };
    readonly CALF: {
        readonly ar: "عجول";
        readonly en: "Calves";
    };
    readonly FATTENING: {
        readonly ar: "تسمين";
        readonly en: "Fattening";
    };
    readonly DAIRY: {
        readonly ar: "ألبان";
        readonly en: "Dairy";
    };
    readonly BREEDING: {
        readonly ar: "تربية";
        readonly en: "Breeding";
    };
};
export type AnimalType = keyof typeof ANIMAL_TYPES;
export declare const PROJECT_PURPOSES: {
    readonly FATTENING: {
        readonly ar: "تسمين";
        readonly en: "Fattening";
    };
    readonly DAIRY: {
        readonly ar: "إنتاج ألبان";
        readonly en: "Dairy Production";
    };
    readonly BREEDING: {
        readonly ar: "تربية";
        readonly en: "Breeding";
    };
    readonly RESALE: {
        readonly ar: "تجارة";
        readonly en: "Resale";
    };
};
export declare const RISK_LEVELS: {
    readonly LOW: {
        readonly ar: "منخفض";
        readonly en: "Low";
        readonly color: "#16A34A";
    };
    readonly MEDIUM: {
        readonly ar: "متوسط";
        readonly en: "Medium";
        readonly color: "#D97706";
    };
    readonly HIGH: {
        readonly ar: "مرتفع";
        readonly en: "High";
        readonly color: "#EA580C";
    };
    readonly CRITICAL: {
        readonly ar: "حرج";
        readonly en: "Critical";
        readonly color: "#DC2626";
    };
};
export declare const PROJECT_STATUS: {
    readonly DRAFT: {
        readonly ar: "مسودة";
        readonly en: "Draft";
        readonly color: "#6B7280";
    };
    readonly PENDING_APPROVAL: {
        readonly ar: "بانتظار الموافقة";
        readonly en: "Pending Approval";
        readonly color: "#D97706";
    };
    readonly APPROVED: {
        readonly ar: "معتمد";
        readonly en: "Approved";
        readonly color: "#2563EB";
    };
    readonly FUNDING: {
        readonly ar: "قيد التمويل";
        readonly en: "Funding";
        readonly color: "#7C3AED";
    };
    readonly FUNDED: {
        readonly ar: "ممول";
        readonly en: "Funded";
        readonly color: "#16A34A";
    };
    readonly ACTIVE: {
        readonly ar: "نشط";
        readonly en: "Active";
        readonly color: "#059669";
    };
    readonly COMPLETED: {
        readonly ar: "مكتمل";
        readonly en: "Completed";
        readonly color: "#0F766E";
    };
    readonly CANCELLED: {
        readonly ar: "ملغي";
        readonly en: "Cancelled";
        readonly color: "#DC2626";
    };
    readonly ON_HOLD: {
        readonly ar: "معلق";
        readonly en: "On Hold";
        readonly color: "#6B7280";
    };
};
export declare const INVESTMENT_STATUS: {
    readonly DRAFT: {
        readonly ar: "مسودة";
        readonly en: "Draft";
        readonly color: "#6B7280";
    };
    readonly PENDING_PAYMENT: {
        readonly ar: "بانتظار الدفع";
        readonly en: "Pending Payment";
        readonly color: "#D97706";
    };
    readonly RESERVED: {
        readonly ar: "محجوز";
        readonly en: "Reserved";
        readonly color: "#2563EB";
    };
    readonly CONFIRMED: {
        readonly ar: "مؤكد";
        readonly en: "Confirmed";
        readonly color: "#16A34A";
    };
    readonly ACTIVE: {
        readonly ar: "نشط";
        readonly en: "Active";
        readonly color: "#059669";
    };
    readonly COMPLETED: {
        readonly ar: "مكتمل";
        readonly en: "Completed";
        readonly color: "#0F766E";
    };
    readonly CANCELLED: {
        readonly ar: "ملغي";
        readonly en: "Cancelled";
        readonly color: "#DC2626";
    };
    readonly REFUNDED: {
        readonly ar: "مسترد";
        readonly en: "Refunded";
        readonly color: "#6B7280";
    };
};
export declare const USER_ROLES: {
    readonly SUPER_ADMIN: {
        readonly ar: "مدير عام";
        readonly en: "Super Admin";
        readonly level: 100;
    };
    readonly ADMIN: {
        readonly ar: "مدير";
        readonly en: "Admin";
        readonly level: 90;
    };
    readonly FINANCE_MANAGER: {
        readonly ar: "مدير مالي";
        readonly en: "Finance Manager";
        readonly level: 80;
    };
    readonly ACCOUNTANT: {
        readonly ar: "محاسب";
        readonly en: "Accountant";
        readonly level: 70;
    };
    readonly INVESTMENT_MANAGER: {
        readonly ar: "مدير استثمار";
        readonly en: "Investment Manager";
        readonly level: 80;
    };
    readonly FARM_MANAGER: {
        readonly ar: "مدير مزرعة";
        readonly en: "Farm Manager";
        readonly level: 70;
    };
    readonly VETERINARIAN: {
        readonly ar: "طبيب بيطري";
        readonly en: "Veterinarian";
        readonly level: 60;
    };
    readonly FARM_EMPLOYEE: {
        readonly ar: "موظف مزرعة";
        readonly en: "Farm Employee";
        readonly level: 40;
    };
    readonly PROCUREMENT_OFFICER: {
        readonly ar: "مسؤول مشتريات";
        readonly en: "Procurement Officer";
        readonly level: 60;
    };
    readonly SALES_MANAGER: {
        readonly ar: "مدير مبيعات";
        readonly en: "Sales Manager";
        readonly level: 70;
    };
    readonly CUSTOMER_SUPPORT: {
        readonly ar: "دعم العملاء";
        readonly en: "Customer Support";
        readonly level: 50;
    };
    readonly INVESTOR: {
        readonly ar: "مستثمر";
        readonly en: "Investor";
        readonly level: 10;
    };
};
export type UserRoleKey = keyof typeof USER_ROLES;
export declare const EXPENSE_CATEGORIES: {
    readonly FEED: {
        readonly ar: "أعلاف";
        readonly en: "Feed";
    };
    readonly VETERINARY: {
        readonly ar: "بيطري";
        readonly en: "Veterinary";
    };
    readonly LABOR: {
        readonly ar: "عمالة";
        readonly en: "Labor";
    };
    readonly MAINTENANCE: {
        readonly ar: "صيانة";
        readonly en: "Maintenance";
    };
    readonly UTILITIES: {
        readonly ar: "مرافق";
        readonly en: "Utilities";
    };
    readonly TRANSPORT: {
        readonly ar: "نقل";
        readonly en: "Transport";
    };
    readonly ADMIN: {
        readonly ar: "إدارية";
        readonly en: "Admin";
    };
    readonly OTHER: {
        readonly ar: "أخرى";
        readonly en: "Other";
    };
};
export declare const NOTIFICATION_TYPES: {
    readonly INVESTMENT_CREATED: {
        readonly ar: "استثمار جديد";
        readonly en: "Investment Created";
    };
    readonly PAYMENT_CONFIRMED: {
        readonly ar: "تأكيد الدفع";
        readonly en: "Payment Confirmed";
    };
    readonly CONTRACT_ISSUED: {
        readonly ar: "إصدار عقد";
        readonly en: "Contract Issued";
    };
    readonly WEIGHT_UPDATED: {
        readonly ar: "تحديث الوزن";
        readonly en: "Weight Updated";
    };
    readonly VETERINARY_REPORT: {
        readonly ar: "تقرير بيطري";
        readonly en: "Veterinary Report";
    };
    readonly PROJECT_STATUS_CHANGED: {
        readonly ar: "تغيير حالة المشروع";
        readonly en: "Project Status Changed";
    };
    readonly SALE_APPROVED: {
        readonly ar: "موافقة على البيع";
        readonly en: "Sale Approved";
    };
    readonly DISTRIBUTION_APPROVED: {
        readonly ar: "موافقة على التوزيع";
        readonly en: "Distribution Approved";
    };
    readonly WITHDRAWAL_REQUEST: {
        readonly ar: "طلب سحب";
        readonly en: "Withdrawal Request";
    };
    readonly SYSTEM_ALERT: {
        readonly ar: "تنبيه نظام";
        readonly en: "System Alert";
    };
};
export declare const TICKET_CATEGORIES: {
    readonly TECHNICAL: {
        readonly ar: "تقني";
        readonly en: "Technical";
    };
    readonly BILLING: {
        readonly ar: "فواتير";
        readonly en: "Billing";
    };
    readonly INVESTMENT: {
        readonly ar: "استثمار";
        readonly en: "Investment";
    };
    readonly FARM: {
        readonly ar: "مزرعة";
        readonly en: "Farm";
    };
    readonly VETERINARY: {
        readonly ar: "بيطري";
        readonly en: "Veterinary";
    };
    readonly LEGAL: {
        readonly ar: "قانوني";
        readonly en: "Legal";
    };
    readonly GENERAL: {
        readonly ar: "عام";
        readonly en: "General";
    };
};
export declare const TICKET_STATUS: {
    readonly OPEN: {
        readonly ar: "مفتوح";
        readonly en: "Open";
        readonly color: "#DC2626";
    };
    readonly ASSIGNED: {
        readonly ar: "مسند";
        readonly en: "Assigned";
        readonly color: "#2563EB";
    };
    readonly IN_PROGRESS: {
        readonly ar: "قيد المعالجة";
        readonly en: "In Progress";
        readonly color: "#D97706";
    };
    readonly WAITING_USER: {
        readonly ar: "بانتظار المستخدم";
        readonly en: "Waiting User";
        readonly color: "#7C3AED";
    };
    readonly RESOLVED: {
        readonly ar: "تم الحل";
        readonly en: "Resolved";
        readonly color: "#16A34A";
    };
    readonly CLOSED: {
        readonly ar: "مغلق";
        readonly en: "Closed";
        readonly color: "#6B7280";
    };
};
