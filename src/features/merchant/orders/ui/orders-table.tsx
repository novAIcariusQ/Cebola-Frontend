import { QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Order, OrderStatus } from '@entities/order'
import { formatCurrency } from '@shared/lib'
import { StatusPill } from '@shared/ui/status-pill'

type OrdersTableProps = {
  orders: Order[]
  onShowQr: (order: Order) => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

const orderStatuses: OrderStatus[] = ['pending', 'paid', 'ready', 'completed', 'cancelled']

export function OrdersTable({ orders, onShowQr, onStatusChange }: OrdersTableProps) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse text-sm">
        <thead className="bg-paper text-left text-ink/60">
          <tr>
            <th className="px-4 py-3 font-semibold">{t('merchant.orders.code')}</th>
            <th className="px-4 py-3 font-semibold">{t('merchant.orders.customer')}</th>
            <th className="px-4 py-3 font-semibold">{t('merchant.orders.items')}</th>
            <th className="px-4 py-3 font-semibold">{t('merchant.orders.total')}</th>
            <th className="px-4 py-3 font-semibold">{t('merchant.orders.status')}</th>
            <th className="px-4 py-3 font-semibold">{t('merchant.orders.createdAt')}</th>
            <th className="px-4 py-3 text-right font-semibold">{t('merchant.orders.qr')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-t border-ink/10">
              <td className="px-4 py-3 font-medium text-ink">{order.guestOrderId ?? order.id.slice(0, 8)}</td>
              <td className="px-4 py-3 text-ink/70">{order.customerName ?? order.customerEmail ?? '-'}</td>
              <td className="px-4 py-3 text-ink/70">{order.items.length}</td>
              <td className="px-4 py-3">{formatCurrency(order.totalAmount)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusPill tone={order.status === 'completed' ? 'success' : 'warning'}>{order.status}</StatusPill>
                  <select
                    className="rounded-md border border-ink/10 bg-white px-2 py-1 text-xs text-ink outline-none transition focus:border-market"
                    value={order.status}
                    aria-label={t('merchant.orders.updateStatus')}
                    onChange={event => onStatusChange(order.id, event.target.value as OrderStatus)}
                  >
                    {orderStatuses.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="px-4 py-3 text-ink/70">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink/70 transition hover:border-market hover:text-market disabled:opacity-30"
                    disabled={!order.qrCodeData}
                    aria-label={t('merchant.orders.qr')}
                    title={t('merchant.orders.qr')}
                    onClick={() => onShowQr(order)}
                  >
                    <QrCode size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="p-5 text-sm text-ink/60">{t('common.empty')}</p>}
    </div>
  )
}
