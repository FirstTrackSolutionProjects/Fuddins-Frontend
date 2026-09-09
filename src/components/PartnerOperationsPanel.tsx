import { FormEvent, useEffect, useMemo, useState } from 'react';
import { API_ORIGIN } from '../config';
import type { User } from '../types';

type PartnerRole = 'vendor' | 'delivery';
type RecordValue = Record<string, any>;

const authHeaders = () => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const nextDeliveryStatus = (status: string) => ({ assigned: 'picked_up', picked_up: 'out_for_delivery', out_for_delivery: 'delivered' } as Record<string, string>)[status];

const inputClasses = 'min-h-[42px] rounded border border-neutral-300 px-2.5';
const summaryCardClasses = 'rounded-md border border-neutral-200 bg-neutral-50 p-2.5';
const miniCardClasses = 'grid gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 p-2.5';
const primaryButtonClasses = 'min-h-[42px] rounded bg-lime-600 px-7 font-bold text-white disabled:opacity-60';

const PartnerOperationsPanel = ({ role, user }: { role: PartnerRole; user: User }) => {
  const [products, setProducts] = useState<RecordValue[]>([]);
  const [orders, setOrders] = useState<RecordValue[]>([]);
  const [settlements, setSettlements] = useState<RecordValue[]>([]);
  const [summary, setSummary] = useState<RecordValue>({});
  const [membership, setMembership] = useState<RecordValue>({});
  const [form, setForm] = useState({ name: '', price: '', stockQuantity: '', description: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setMessage('');
    try {
      if (role === 'vendor') {
        const [productData, orderData, settlementData, membershipData, report] = await Promise.all([
          request('/partner/vendor/products'),
          request('/partner/vendor/orders'),
          request('/partner/vendor/settlements'),
          request('/partner/vendor/membership'),
          request('/partner/vendor/reports'),
        ]);
        setProducts(productData);
        setOrders(orderData);
        setSettlements(settlementData);
        setMembership(membershipData);
        setSummary(report.summary || {});
      } else {
        const [orderData, deliverySummary] = await Promise.all([request('/partner/delivery/orders'), request('/partner/delivery/summary')]);
        setOrders(orderData);
        setSummary(deliverySummary);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load partner workspace');
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const activeOrders = useMemo(() => orders.filter((order) => role === 'vendor' ? !['completed', 'cancelled'].includes(order.status) : !['delivered', 'failed'].includes(order.deliveryStatus)), [orders, role]);

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await request('/partner/vendor/products', { method: 'POST', body: JSON.stringify({ name: form.name, price: Number(form.price), stockQuantity: Number(form.stockQuantity || 0), description: form.description }) });
      setForm({ name: '', price: '', stockQuantity: '', description: '' });
      setMessage('Product created successfully.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Product could not be created');
    } finally {
      setBusy(false);
    }
  };

  const updateVendorOrder = async (id: number, status: string) => {
    setBusy(true);
    try {
      await request(`/partner/vendor/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      setMessage('Order status updated.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Order update failed');
    } finally {
      setBusy(false);
    }
  };

  const updateDeliveryOrder = async (id: number, status: string) => {
    setBusy(true);
    try {
      await request(`/partner/delivery/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      setMessage('Delivery status updated.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delivery update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-lg border border-neutral-100 bg-white p-4.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mt-0 text-[#164e28]">{role === 'vendor' ? 'Vendor workspace' : 'Delivery workspace'}</h3>
          <p className="text-neutral-500">
            {user.name} · {user.email}
          </p>
        </div>
        <button type="button" onClick={load} disabled={busy} className={primaryButtonClasses}>
          Refresh
        </button>
      </div>
      {message ? (
        <p className="my-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-800">{message}</p>
      ) : null}

      <div className="my-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {role === 'vendor' ? (
          <>
            <div className={summaryCardClasses}>
              <span className="block">Catalog items</span>
              <strong className="block text-xl text-[#164e28]">{summary.catalogItems || products.length}</strong>
            </div>
            <div className={summaryCardClasses}>
              <span className="block">Orders</span>
              <strong className="block text-xl text-[#164e28]">{summary.vendorOrders || orders.length}</strong>
            </div>
            <div className={summaryCardClasses}>
              <span className="block">Sales</span>
              <strong className="block text-xl text-[#164e28]">Rs. {summary.vendorSales || 0}</strong>
            </div>
            <div className={summaryCardClasses}>
              <span className="block">Membership</span>
              <strong className="block text-xl text-[#164e28]">{membership.membershipStatus || 'pending'}</strong>
            </div>
          </>
        ) : (
          <>
            <div className={summaryCardClasses}>
              <span className="block">Total deliveries</span>
              <strong className="block text-xl text-[#164e28]">{summary.total || 0}</strong>
            </div>
            <div className={summaryCardClasses}>
              <span className="block">Active</span>
              <strong className="block text-xl text-[#164e28]">{summary.active || 0}</strong>
            </div>
            <div className={summaryCardClasses}>
              <span className="block">Delivered</span>
              <strong className="block text-xl text-[#164e28]">{summary.delivered || 0}</strong>
            </div>
            <div className={summaryCardClasses}>
              <span className="block">COD to collect</span>
              <strong className="block text-xl text-[#164e28]">Rs. {summary.codToCollect || 0}</strong>
            </div>
          </>
        )}
      </div>

      {role === 'vendor' ? (
        <>
          <form className="mb-3 mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2" onSubmit={createProduct}>
            <input required placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClasses} />
            <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClasses} />
            <input type="number" min="0" placeholder="Stock quantity" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} className={inputClasses} />
            <input placeholder="Short description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClasses} />
            <button type="submit" disabled={busy} className={`${primaryButtonClasses} sm:col-span-2`}>
              Add product
            </button>
          </form>
          <h4 className="my-4.5 text-[#164e28]">Products</h4>
          <div className="grid gap-2.5">
            {products.slice(0, 10).map((product) => (
              <div className={miniCardClasses} key={product.id}>
                <strong>{product.name}</strong>
                <span>
                  Rs. {product.price} · {product.stockStatus || 'instock'}
                </span>
              </div>
            ))}
          </div>
          <h4 className="my-4.5 text-[#164e28]">Active orders</h4>
          <div className="grid gap-2.5">
            {activeOrders.slice(0, 10).map((order) => (
              <div className={miniCardClasses} key={order.id}>
                <strong>Order #{order.id}</strong>
                <span>
                  Rs. {order.total} · {order.status || 'pending'}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => updateVendorOrder(order.id, order.status === 'pending' ? 'processing' : 'completed')}
                  className={primaryButtonClasses}
                >
                  {order.status === 'pending' ? 'Start processing' : 'Mark completed'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h4 className="my-4.5 text-[#164e28]">Assigned deliveries</h4>
          <div className="grid gap-2.5">
            {activeOrders.slice(0, 15).map((order) => {
              const next = nextDeliveryStatus(order.deliveryStatus || 'assigned');
              return (
                <div className={miniCardClasses} key={order.id}>
                  <strong>Order #{order.id}</strong>
                  <span>
                    Rs. {order.total} · {order.deliveryStatus || 'assigned'} · {order.shippingAddress || 'Address not available'}
                  </span>
                  {next ? (
                    <button type="button" disabled={busy} onClick={() => updateDeliveryOrder(order.id, next)} className={primaryButtonClasses}>
                      {next === 'delivered' ? 'Mark delivered' : `Mark ${next.replaceAll('_', ' ')}`}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

export default PartnerOperationsPanel;