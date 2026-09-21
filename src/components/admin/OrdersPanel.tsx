import { useEffect, useState } from 'react';
import { ShoppingBag, FileText, Phone, Tag, ChevronDown } from 'lucide-react';
import { fetchOrders, invoicePdfUrl, updateOrderStatus } from '../../api';
import type { Order } from '../../types';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-lime-50 text-lime-700 border-lime-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

const orderStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openStatusId, setOpenStatusId] = useState<number | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders', error);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-100 text-lime-700">
            <ShoppingBag size={18} strokeWidth={2} />
          </span>
          <h3 className="text-xl font-bold text-neutral-900">Recent orders</h3>
        </div>
        <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-semibold text-lime-800">{orders.length}</span>
      </div>

      <div className="mt-5 space-y-3">
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-400">No orders yet.</p>
        ) : (
          orders.map((order) => {
            let parsedItems: unknown[] = [];
            try {
              parsedItems = JSON.parse(order.items || '[]');
            } catch {
              parsedItems = [];
            }

            const status = order.status || 'pending';
            const badgeStyle = statusStyles[status] || statusStyles.pending;

            return (
              <div key={order.id} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{order.customerName}</p>
                    <p className="text-sm text-neutral-400">{order.email}</p>
                  </div>
                  <p className="font-bold text-lime-700">Rs. {order.total}</p>
                </div>

                <p className="mt-2 text-sm text-neutral-500">Items: {parsedItems.length}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${badgeStyle}`}>
                    {status}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
                    {order.paymentMethod || 'cod'} / {order.paymentStatus || 'pending'}
                  </span>
                  {order.couponCode ? (
                    <span className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
                      <Tag size={12} />
                      {order.couponCode}
                    </span>
                  ) : null}
                  {order.phone ? (
                    <span className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
                      <Phone size={12} />
                      {order.phone}
                    </span>
                  ) : null}
                </div>

                <div className="relative mt-3">
                  <button type="button" aria-expanded={openStatusId === order.id} onClick={() => setOpenStatusId((current) => current === order.id ? null : order.id)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm text-neutral-900 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100">
                    <span>{orderStatuses.find((item) => item.value === status)?.label || 'Pending'}</span>
                    <ChevronDown size={17} className={`shrink-0 transition-transform ${openStatusId === order.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openStatusId === order.id ? <div role="listbox" className="absolute left-0 top-full z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    {orderStatuses.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === status} onClick={async () => { setOpenStatusId(null); const updated = await updateOrderStatus(order.id, option.value); setOrders((current) => current.map((item) => (item.id === order.id ? updated : item))); }} className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-lime-50 ${option.value === status ? 'bg-lime-50 font-semibold text-lime-800' : 'text-neutral-700'}`}>{option.label}</button>)}
                  </div> : null}
                </div>

                <a
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-700 hover:text-lime-800"
                  href={invoicePdfUrl(order.id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileText size={14} />
                  Open invoice PDF
                </a>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrdersPanel;
