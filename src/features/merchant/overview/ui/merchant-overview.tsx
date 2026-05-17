import { Bot, CheckCircle2, ClipboardList, PackageCheck, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Order } from '@entities/order'
import type { Product } from '@entities/product'
import { formatCurrency } from '@shared/lib'

type MerchantOverviewProps = {
  products: Product[]
  orders: Order[]
}

export function MerchantOverview({ products, orders }: MerchantOverviewProps) {
  const { t } = useTranslation()
  const activeProducts = products.filter(product => product.isAvailable).length
  const openOrders = orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length
  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

  const stats = [
    { label: t('merchant.overview.revenue'), value: formatCurrency(revenue), icon: TrendingUp },
    { label: t('merchant.overview.activeProducts'), value: String(activeProducts), icon: PackageCheck },
    { label: t('merchant.overview.openOrders'), value: String(openOrders), icon: ClipboardList },
    { label: t('merchant.overview.aiImports'), value: '0', icon: Bot },
  ]

  const actions = [
    t('merchant.overview.createShop'),
    t('merchant.overview.addProducts'),
    t('merchant.overview.reviewOrders'),
  ]

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <article key={stat.label} className="rounded-md border border-ink/10 p-4">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-market/10 text-market">
              <stat.icon size={18} aria-hidden="true" />
            </div>
            <p className="text-sm text-ink/55">{stat.label}</p>
            <strong className="mt-1 block text-2xl font-semibold text-ink">{stat.value}</strong>
          </article>
        ))}
      </div>
      <aside className="rounded-md border border-ink/10 bg-paper p-4">
        <h3 className="text-sm font-semibold uppercase text-ink/55">{t('merchant.overview.nextActions')}</h3>
        <ul className="mt-4 space-y-3">
          {actions.map(action => (
            <li key={action} className="flex items-start gap-3 text-sm text-ink/75">
              <CheckCircle2 className="mt-0.5 shrink-0 text-market" size={16} aria-hidden="true" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
