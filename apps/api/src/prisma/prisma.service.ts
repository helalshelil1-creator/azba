import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error', 'warn'],
    })
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('✅ Database connected')
    } catch (error) {
      this.logger.error('❌ Database connection failed', error as Error)
      throw error
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database disconnected')
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production')
    }
    // Order matters for FK constraints
    const models = [
      'ledger_entries', 'journal_entries', 'profit_distribution_details',
      'profit_distributions', 'wallet_transactions', 'payments', 'investments',
      'share_reservations', 'project_shares', 'project_animals', 'weight_records',
      'feed_records', 'feed_consumptions', 'feed_inventory', 'goods_receipt_items',
      'goods_receipts', 'purchase_order_items', 'purchase_orders', 'quotation_items',
      'quotations', 'sale_offers', 'sale_documents', 'sales', 'expenses',
      'risk_register', 'insurance_claims', 'insurance_policies', 'tasks',
      'work_orders', 'veterinary_reports', 'report_attachments', 'vaccinations',
      'health_records', 'animal_movements', 'animal_media', 'animals', 'pens',
      'farm_buildings', 'farm_employees', 'farms', 'kyc_records',
      'investor_profiles', 'notifications', 'support_messages', 'support_tickets',
      'audit_logs', 'approval_steps', 'approvals', 'approval_workflows',
      'wallets', 'sessions', 'login_attempts', 'role_permissions', 'users',
      'roles', 'permissions', 'feed_recipe_ingredients', 'feed_recipes',
      'feed_types', 'suppliers', 'ledger_accounts', 'projects', 'system_settings',
    ]
    for (const model of models) {
      try {
        await (this as any)[model].deleteMany({})
      } catch {
        // model may not exist
      }
    }
  }
}
