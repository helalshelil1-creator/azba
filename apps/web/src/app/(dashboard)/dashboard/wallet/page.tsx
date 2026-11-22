'use client'

import React, { useEffect, useState } from 'react'
import { Wallet, ArrowDownCircle, ArrowUpCircle, RefreshCw, Loader2 } from 'lucide-react'
import { http } from '@/lib/api'
import { cn, formatEGP } from '@/lib/utils'
import { Card } from '@azba/ui/card'

interface Tx { id: string; type: string; amount: number; balanceAfter: number; description?: string; reference?: string; createdAt: string }
const TYPE_AR: Record<string, string> = { DEPOSIT: 'إيداع', WITHDRAWAL: 'سحب', INVESTMENT: 'استثمار', PROFIT: 'ربح', REFUND: 'استرداد', FEE: 'رسوم', ADJUSTMENT: 'تسوية' }

export default function WalletPage() {
  const [balance, setBalance] = useState({ balance: 0, locked: 0 })
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const r = await http.get<{ wallet: any; transactions: Tx[] }>('/investments/wallet'); setBalance(r.wallet ?? { balance: 0, locked: 0 }); setTxs(r.transactions ?? []) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">محفظتي النقدية</h2>
        <button onClick={load} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"><RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} /></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-primary text-ivory"><div className="flex items-center gap-2 text-xs text-ivory/70"><Wallet className="h-4 w-4" /> الرصيد المتاح</div><div className="mt-2 text-3xl font-extrabold">{formatEGP(Number(balance.balance))}</div></Card>
        <Card className="bg-gold-600 text-white"><div className="flex items-center gap-2 text-xs text-white/80"><Wallet className="h-4 w-4" /> الرصيد المحجوز</div><div className="mt-2 text-3xl font-extrabold">{formatEGP(Number(balance.locked))}</div></Card>
      </div>
      <Card className="p-0">
        {loading ? <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="ml-2 h-5 w-5 animate-spin" />جارٍ التحميل...</div> : txs.length === 0 ? (
          <div className="p-16 text-center text-sm text-muted-foreground">لا توجد معاملات بعد</div>
        ) : (
          <div className="divide-y divide-border/40">
            {txs.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-4">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', ['DEPOSIT', 'PROFIT', 'REFUND'].includes(t.type) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600')}>
                  {['DEPOSIT', 'PROFIT', 'REFUND'].includes(t.type) ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-primary">{TYPE_AR[t.type] ?? t.type}</div>
                  <div className="truncate text-xs text-muted-foreground">{t.description || t.reference || '—'}</div>
                </div>
                <div className="text-left">
                  <div className={cn('font-bold', Number(t.amount) >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatEGP(Number(t.amount))}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('ar-EG')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
