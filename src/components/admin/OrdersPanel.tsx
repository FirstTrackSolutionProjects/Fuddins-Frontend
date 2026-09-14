import { useEffect, useState } from 'react';
import { ShoppingBag, FileText, Phone, Tag } from 'lucide-react';
import { fetchOrders, invoicePdfUrl, updateOrderStatus } from '../../api';
import type { Order } from '../../types';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-lime-50 text-lime-700 border-lime-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);

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
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
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

                <select
                  className="mt-3 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  value={status}
                  onChange={async (event) => {
                    const updated = await updateOrderStatus(order.id, event.target.value);
                    setOrders((current) => current.map((item) => (item.id === order.id ? updated : item)));
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>

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