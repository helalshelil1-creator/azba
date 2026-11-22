/**
 * AZBA | عزبة — Database Seed Script
 * Creates roles, permissions, chart of accounts, and demo data.
 * Run: npm run db:seed
 */
import { PrismaClient, UserRole, AnimalType, Gender, ProjectStatus, RiskLevel } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'users:read', 'users:update', 'projects:read', 'projects:create', 'projects:update', 'projects:approve',
    'investments:read', 'investments:approve', 'farms:read', 'farms:create', 'farms:update',
    'animals:read', 'animals:create', 'animals:update', 'financial:read', 'financial:write',
    'reports:read', 'support:read', 'support:manage', 'notifications:send',
  ],
  FINANCE_MANAGER: [
    'financial:read', 'financial:write', 'financial:approve', 'reports:read',
    'expenses:read', 'expenses:approve', 'investments:read', 'users:read',
  ],
  ACCOUNTANT: [
    'financial:read', 'financial:write', 'expenses:read', 'expenses:create',
    'reports:read', 'ledger:read', 'ledger:write',
  ],
  INVESTMENT_MANAGER: [
    'projects:read', 'projects:create', 'projects:update', 'projects:approve',
    'investments:read', 'investments:approve', 'farms:read', 'animals:read', 'reports:read',
  ],
  FARM_MANAGER: [
    'farms:read', 'farms:update', 'animals:read', 'animals:create', 'animals:update',
    'health:read', 'health:write', 'feed:read', 'feed:write', 'expenses:read', 'expenses:create',
    'tasks:read', 'tasks:create', 'tasks:update',
  ],
  VETERINARIAN: [
    'animals:read', 'health:read', 'health:write', 'veterinary:read', 'veterinary:write', 'veterinary:approve',
  ],
  FARM_EMPLOYEE: [
    'animals:read', 'health:read', 'health:write', 'feed:read', 'feed:write', 'tasks:read', 'tasks:update',
  ],
  PROCUREMENT_OFFICER: [
    'procurement:read', 'procurement:write', 'suppliers:read', 'suppliers:write',
    'inventory:read', 'expenses:read', 'expenses:create',
  ],
  SALES_MANAGER: [
    'sales:read', 'sales:write', 'sales:approve', 'market:read', 'animals:read', 'reports:read',
  ],
  CUSTOMER_SUPPORT: [
    'support:read', 'support:manage', 'users:read', 'investments:read', 'tickets:read', 'tickets:write',
  ],
  INVESTOR: [
    'investments:read', 'investments:create', 'portfolio:read', 'wallet:read', 'wallet:withdraw',
    'projects:read', 'notifications:read', 'tickets:read', 'tickets:create',
  ],
  SUPPORT_AGENT: ['support:read', 'support:manage', 'tickets:read', 'tickets:write', 'users:read'],
  SUPPORT_MANAGER: ['support:read', 'support:manage', 'tickets:read', 'tickets:write', 'users:read', 'users:update'],
  VIEWER: ['projects:read', 'farms:read', 'animals:read', 'reports:read'],
}

const PERMISSION_RESOURCES = [
  'users', 'projects', 'investments', 'farms', 'animals', 'financial', 'expenses',
  'reports', 'support', 'tickets', 'notifications', 'health', 'veterinary', 'feed',
  'ledger', 'procurement', 'suppliers', 'inventory', 'sales', 'market', 'portfolio', 'wallet', 'tasks',
]

const PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete', 'approve', 'write', 'manage', 'send', 'withdraw']

async function seedRolesAndPermissions() {
  console.log('🌱 Seeding roles & permissions...')

  for (const resource of PERMISSION_RESOURCES) {
    for (const action of PERMISSION_ACTIONS) {
      await prisma.permission.upsert({
        where: { code: `${resource}:${action}` },
        create: { code: `${resource}:${action}`, name: `${resource}:${action}`, nameAr: `${action} ${resource}`, group: resource },
        update: {},
      })
    }
  }

  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      create: { name: roleName, displayName: roleName, description: `Role ${roleName}`, level: 0, isSystem: true },
      update: {},
    })
    const permissionRecords = perms.includes('*')
      ? await prisma.permission.findMany()
      : await prisma.permission.findMany({ where: { name: { in: perms } } })
    for (const perm of permissionRecords) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        create: { roleId: role.id, permissionId: perm.id },
        update: {},
      })
    }
  }
  console.log('✅ Roles & permissions seeded')
}

async function seedChartOfAccounts() {
  console.log('🌱 Seeding chart of accounts...')
  const accounts = [
    { code: '1000', name: 'الصندوق', nameEn: 'Cash', type: 'ASSET', subType: 'CURRENT_ASSET' },
    { code: '1100', name: 'البنك', nameEn: 'Bank', type: 'ASSET', subType: 'CURRENT_ASSET' },
    { code: '1200', name: 'الذمم المدينة', nameEn: 'Accounts Receivable', type: 'ASSET', subType: 'CURRENT_ASSET' },
    { code: '1300', name: 'مخزون الأعلاف', nameEn: 'Feed Inventory', type: 'ASSET', subType: 'CURRENT_ASSET' },
    { code: '1400', name: 'المخزون الحيواني', nameEn: 'Livestock Inventory', type: 'ASSET', subType: 'CURRENT_ASSET' },
    { code: '1500', name: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'ASSET', subType: 'FIXED_ASSET' },
    { code: '1510', name: 'المباني والإنشاءات', nameEn: 'Buildings', type: 'ASSET', subType: 'FIXED_ASSET' },
    { code: '1520', name: 'الآلات والمعدات', nameEn: 'Machinery', type: 'ASSET', subType: 'FIXED_ASSET' },
    { code: '2000', name: 'الذمم الدائنة', nameEn: 'Accounts Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
    { code: '2100', name: 'رواتب مستحقة', nameEn: 'Salaries Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
    { code: '2200', name: 'أموال المستثمرين', nameEn: 'Investor Funds', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
    { code: '3000', name: 'رأس المال', nameEn: 'Capital', type: 'EQUITY', subType: 'EQUITY' },
    { code: '3100', name: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'EQUITY', subType: 'EQUITY' },
    { code: '4000', name: 'إيرادات المبيعات', nameEn: 'Sales Revenue', type: 'REVENUE', subType: 'OPERATING_REVENUE' },
    { code: '4100', name: 'إيرادات أخرى', nameEn: 'Other Revenue', type: 'REVENUE', subType: 'OTHER_REVENUE' },
    { code: '5000', name: 'تكلفة المبيعات', nameEn: 'Cost of Sales', type: 'EXPENSE', subType: 'COGS' },
    { code: '5100', name: 'مصروفات الأعلاف', nameEn: 'Feed Expenses', type: 'EXPENSE', subType: 'OPERATING' },
    { code: '5200', name: 'مصروفات بيطرية', nameEn: 'Veterinary Expenses', type: 'EXPENSE', subType: 'OPERATING' },
    { code: '5300', name: 'مصروفات عمالة', nameEn: 'Labor Expenses', type: 'EXPENSE', subType: 'OPERATING' },
    { code: '5400', name: 'مصروفات صيانة', nameEn: 'Maintenance', type: 'EXPENSE', subType: 'OPERATING' },
    { code: '5500', name: 'مصروفات إدارية', nameEn: 'Admin Expenses', type: 'EXPENSE', subType: 'ADMIN' },
  ] as const

  for (const acc of accounts) {
    await prisma.ledgerAccount.upsert({
      where: { code: acc.code },
      create: acc as any,
      update: {},
    })
  }
  console.log('✅ Chart of accounts seeded')
}

async function seedUsers() {
  console.log('🌱 Seeding users...')
  const password = await bcrypt.hash('Admin@12345', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@azba.com' },
    create: {
      email: 'admin@azba.com',
      passwordHash: password,
      firstName: 'مدير',
      lastName: 'المنصة',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
      wallet: { create: { currency: 'EGP' } },
    },
    update: {},
  })

  const investor = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    create: {
      email: 'investor@example.com',
      passwordHash: await bcrypt.hash('Investor@12345', 12),
      firstName: 'أحمد',
      lastName: 'المستثمر',
      role: 'INVESTOR',
      status: 'ACTIVE',
      emailVerified: new Date(),
      phone: '01001234567',
      wallet: { create: { currency: 'EGP', balance: 50000 } },
      investorProfile: { create: { city: 'القاهرة', governorate: 'القاهرة', occupation: 'مهندس' } },
    },
    update: {},
  })

  const vet = await prisma.user.upsert({
    where: { email: 'vet@azba.com' },
    create: {
      email: 'vet@azba.com',
      passwordHash: await bcrypt.hash('Vet@12345', 12),
      firstName: 'د. محمود',
      lastName: 'البيطري',
      role: 'VETERINARIAN',
      status: 'ACTIVE',
      emailVerified: new Date(),
    },
    update: {},
  })

  console.log('✅ Users seeded (admin@azba.com / Admin@12345)')
  return { admin, investor, vet }
}

async function seedFarmsAndAnimals(investorId: string) {
  console.log('🌱 Seeding farms, buildings, pens, animals...')

  const farm = await prisma.farm.upsert({
    where: { code: 'FRM-DEMO-01' },
    create: {
      name: 'مزرعة المنوفية الرئيسية',
      nameEn: 'Menofia Main Farm',
      code: 'FRM-DEMO-01',
      address: 'طريق القاهرة - الإسكندرية الزراعي',
      city: 'شبين الكوم',
      governorate: 'المنوفية',
      country: 'EG',
      latitude: 30.5565,
      longitude: 31.0105,
      totalArea: 50000,
      usableArea: 42000,
      status: 'ACTIVE',
      licenseNumber: 'AGR-2024-001',
    },
    update: {},
  })

  const building = await prisma.farmBuilding.create({
    data: {
      farmId: farm.id,
      name: 'عنبر التسمين الرئيسي',
      code: 'BLD-01',
      type: 'PEN',
      area: 1200,
      capacity: 100,
    },
  })

  const pen = await prisma.pen.create({
    data: {
      farmId: farm.id,
      buildingId: building.id,
      name: 'حظيرة أ',
      code: 'PEN-01',
      type: 'FATTENING',
      capacity: 50,
      currentCount: 3,
      floorType: 'CONCRETE',
    },
  })

  const animals = await Promise.all(
    [
      { tag: 'AZB-001', type: 'DAIRY_COW', breed: 'Holstein', gender: 'MALE', weight: 420 },
      { tag: 'AZB-002', type: 'DAIRY_COW', breed: 'Friesian', gender: 'FEMALE', weight: 380 },
      { tag: 'AZB-003', type: 'BUFFALO', breed: 'Egyptian', gender: 'FEMALE', weight: 510 },
    ].map((a, i) =>
      prisma.animal.create({
        data: {
          farmId: farm.id,
          penId: pen.id,
          animalId: a.tag,
          tagNumber: a.tag,
          qrCode: `AZBA:${a.tag}:DEMO`,
          type: a.type as AnimalType,
          breed: a.breed,
          gender: a.gender as Gender,
          weight: a.weight,
          purchaseWeight: a.weight - 40,
          purchasePrice: 25000 + i * 3000,
          purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          healthStatus: 'HEALTHY',
          status: 'ACTIVE',
        },
      }),
    ),
  )

  // Weight history
  for (const animal of animals) {
    for (let w = 0; w < 6; w++) {
      await prisma.weightRecord.create({
        data: {
          animalId: animal.id,
          recordedBy: investorId,
          weight: (animal.purchaseWeight?.toNumber() || 350) + w * 12,
          recordedAt: new Date(Date.now() - (6 - w) * 14 * 24 * 60 * 60 * 1000),
          method: 'SCALE',
        },
      })
    }
  }

  console.log('✅ Farms & animals seeded')
  return { farm, pen, animals }
}

async function seedProjects(farmId: string, animalIds: string[], investorId: string) {
  console.log('🌱 Seeding projects & shares...')

  const project = await prisma.project.create({
    data: {
      farmId,
      code: 'PRJ-DEMO-001',
      name: 'مشروع تسمين البقار الهولشتاين — الدفعة الأولى',
      nameEn: 'Holstein Cattle Fattening — Batch 1',
      description: 'مشروع تسمين مكثف لأبقار الهولشتاين لمدة ٨ أشهر مع متابعة بيطرية وتغذوية يومية.',
      animalType: 'DAIRY_COW',
      breed: 'Holstein',
      breedEn: 'Holstein',
      purpose: 'FATTENING',
      status: 'FUNDING',
      startDate: new Date(),
      expectedEndDate: new Date(Date.now() + 8 * 30 * 24 * 60 * 60 * 1000),
      totalShares: 1000,
      availableShares: 850,
      sharePrice: 500,
      minSharesPerInvestor: 1,
      maxSharesPerInvestor: 100,
      targetAmount: 500000,
      totalBudget: 500000,
      fundedAmount: 75000,
      expectedReturnRate: 20,
      riskLevel: 'MEDIUM',
      riskDisclosure:
        'يحمل هذا المشروع مخاطر تشمل تقلب أسعار الأعلاف، وأسعار البيع، والأمراض، والنفوق. العائد المعروض تقديري وغير مضمون.',
      publishedAt: new Date(),
      shares: {
        create: Array.from({ length: 1000 }, (_, i) => ({
          shareNumber: String(i + 1),
          status: i < 150 ? 'SOLD' : 'AVAILABLE',
        })),
      },
      projectAnimals: { create: animalIds.map((id) => ({ animalId: id })) },
    },
  })

  console.log('✅ Projects seeded')
  return project
}

async function main() {
  console.log('\n🚀 AZBA Database Seed\n')
  try {
    await seedRolesAndPermissions()
    await seedChartOfAccounts()
    const { investor } = await seedUsers()
    const { farm, animals } = await seedFarmsAndAnimals(investor.id)
    await seedProjects(farm.id, animals.map((a) => a.id), investor.id)

    // System settings
    await prisma.systemSetting.upsert({
      where: { key: 'platform.name' },
      create: { key: 'platform.name', value: 'AZBA | عزبة', category: 'GENERAL', isPublic: true },
      update: {},
    })
    await prisma.systemSetting.upsert({
      where: { key: 'platform.currency' },
      create: { key: 'platform.currency', value: 'EGP', category: 'GENERAL', isPublic: true },
      update: {},
    })
    await prisma.systemSetting.upsert({
      where: { key: 'investment.minShares' },
      create: { key: 'investment.minShares', value: 1, category: 'INVESTMENT', isPublic: true },
      update: {},
    })
    await prisma.systemSetting.upsert({
      where: { key: 'investment.platformFeePercent' },
      create: { key: 'investment.platformFeePercent', value: 1.5, category: 'INVESTMENT', isPublic: true },
      update: {},
    })
    await prisma.systemSetting.upsert({
      where: { key: 'reservation.ttlMinutes' },
      create: { key: 'reservation.ttlMinutes', value: 30, category: 'INVESTMENT' },
      update: {},
    })

    console.log('\n🎉 Seed completed successfully!')
    console.log('\n📋 Demo credentials:')
    console.log('   Admin:    admin@azba.com / Admin@12345')
    console.log('   Investor: investor@example.com / Investor@12345')
    console.log('   Vet:      vet@azba.com / Vet@12345')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
