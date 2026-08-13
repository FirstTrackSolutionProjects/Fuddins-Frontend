import { useEffect, useState } from 'react';
import { fetchOrders, invoicePdfUrl, updateOrderStatus } from '../api';
import type { Order } from '../types';

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
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recent Orders</h3>
        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">{orders.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-400">No orders yet.</p>
        ) : (
          orders.map((order) => {
            let parsedItems: unknown[] = [];
            try {
              parsedItems = JSON.parse(order.items || '[]');
            } catch {
              parsedItems = [];
            }

            return (
              <div key={order.id} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-slate-400">{order.email}</p>
                  </div>
                  <p className="text-cyan-400">Rs. {order.total}</p>
                </div>
                <p className="mt-2 text-sm text-slate-400">Items: {parsedItems.length}</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-400 md:grid-cols-2">
                  <p>Status: {order.status || 'pending'}</p>
                  <p>Payment: {order.paymentMethod || 'cod'} / {order.paymentStatus || 'pending'}</p>
                  {order.couponCode ? <p>Coupon: {order.couponCode}</p> : null}
                  {order.phone ? <p>Phone: {order.phone}</p> : null}
                </div>
                <select
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={order.status || 'pending'}
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
                <a className="mt-3 inline-block text-sm text-cyan-400" href={invoicePdfUrl(order.id)} target="_blank" rel="noreferrer">
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
