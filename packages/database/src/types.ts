import { Prisma } from '@prisma/client'

// Type-safe helpers for common queries
export type UserWithProfile = Prisma.UserGetPayload<{
  include: { investorProfile: true; kycRecords: true }
}>

export type ProjectWithDetails = Prisma.ProjectGetPayload<{
  include: {
    farm: true
    animals: { include: { animal: true } }
    shares: true
    _count: { select: { investments: true; reservations: true } }
  }
}>

export type InvestmentWithRelations = Prisma.InvestmentGetPayload<{
  include: {
    project: { include: { farm: true } }
    user: { include: { investorProfile: true } }
    payments: true
    distributions: true
  }
}>

export type AnimalWithHealth = Prisma.AnimalGetPayload<{
  include: {
    healthRecords: { orderBy: { startDate: 'desc' }, take: 5 }
    weightRecords: { orderBy: { recordedAt: 'desc' }, take: 10 }
    vaccinations: { orderBy: { administeredAt: 'desc' }, take: 10 }
    veterinaryReports: { orderBy: { examinationDate: 'desc' }, take: 5 }
    pen: true
    farm: true
  }
}>

export type FarmWithStats = Prisma.FarmGetPayload<{
  include: {
    _count: { select: { animals: true; pens: true; buildings: true; projects: true } }
    manager: true
  }
}>

// Financial types
export type JournalEntryWithLines = Prisma.JournalEntryGetPayload<{
  include: { entries: { include: { account: true } } }
}>

export type LedgerAccountWithChildren = Prisma.LedgerAccountGetPayload<{
  include: { children: true; parent: true }
}>
