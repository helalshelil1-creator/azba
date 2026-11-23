# مخطط قاعدة البيانات (DATABASE_SCHEMA)

المحرّك: PostgreSQL · ORM: Prisma · عدد النماذج: 66 · الهجرات: 4

## 1. المجموعات الوظيفية

### الهوية والصلاحيات
`User`, `Session`, `LoginAttempt`, `InvestorProfile`, `KYCRecord`,
`Role`, `Permission`, `RolePermission`

### البنية التحتية الزراعية
`Farm`, `FarmBuilding`, `Pen`, `FarmEmployee`,
`Animal`, `AnimalMedia`, `AnimalMovement`,
`HealthRecord`, `Vaccination`, `VeterinaryReport`, `ReportAttachment`, `WeightRecord`

### الأعلاف والمشتريات
`Supplier`, `FeedType`, `FeedInventory`, `FeedRecipe`, `FeedRecipeIngredient`,
`FeedRecord`, `FeedConsumption`,
`Quotation`, `QuotationItem`, `PurchaseOrder`, `PurchaseOrderItem`,
`GoodsReceipt`, `GoodsReceiptItem`

### الاستثمار والمالية
`Project`, `ProjectAnimal`, `ProjectShare`, `ShareReservation`, `Investment`,
`Wallet`, `WalletTransaction`, `Payment`,
`LedgerAccount`, `JournalEntry`, `LedgerEntry`, `Expense`,
`Sale`, `SaleOffer`, `SaleDocument`,
`ProfitDistribution`, `ProfitDistributionDetail`

### المخاطر والتأمين والعمليات
`RiskRegister`, `InsurancePolicy`, `InsuranceClaim`,
`Task`, `WorkOrder`,
`SupportTicket`, `SupportMessage`, `Notification`, `AuditLog`,
`ApprovalWorkflow`, `Approval`, `ApprovalStep`, `SystemSetting`

## 2. العلاقات الرئيسية
- `Farm 1—N FarmBuilding 1—N Pen 1—N Animal`
- `Project N—N Animal` عبر `ProjectAnimal`
- `Project 1—N ProjectShare` و`1—N ShareReservation` و`1—N Investment`
- `Wallet 1—N WalletTransaction` مرتبط بـ `User`
- `JournalEntry 1—N LedgerEntry` (مدين/دائن) على `LedgerAccount`
- `Sale 1—N SaleDocument`، `Sale N—1 Project`

## 3. الأنماط (Enums مختارة)
- `AnimalType`: DAIRY_COW, BEEF_CATTLE, BUFFALO, GOAT, SHEEP, HORSE, CALVES, POULTRY, FISH, OTHER
- `ProjectStatus`: DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, FUNDING, FUNDED, IN_PROGRESS, COMPLETED, CANCELLED, SUSPENDED
- `InvestmentStatus`: RESERVED, PENDING_PAYMENT, CONFIRMED, ACTIVE, COMPLETED, CANCELLED, REFUNDED
- `PaymentMethod`: WALLET, SANDBOX, BANK_TRANSFER, CARD, INSTAPAY, FAWRY, CASH
- `UserRole`: 15 دورًا (انظر REQUIREMENTS)

## 4. الهجرات
```
20261122162535_init
20261122172742_add_building_area_pen_floortype_settings_public
20261122211614_add_pen_area
20261122233247_add_horse_calves_types
```

## 5. حسابات التجربة (Seed)
- `admin@azba.com` / `Admin@12345` (SUPER_ADMIN)
- `investor@example.com` / `Investor@12345` (INVESTOR)
- `vet@azba.com` / `Vet@12345` (VETERINARIAN)

> هذه بيانات تجريبية محلية فقط — لا تُستخدم في الإنتاج.
