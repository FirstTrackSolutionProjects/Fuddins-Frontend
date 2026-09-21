// @ts-nocheck
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NavLink } from 'react-router-dom';
import { API_ORIGIN } from '../../config';
import type { User } from '../../types';

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
const deliverySteps = ['assigned', 'picked_up', 'out_for_delivery', 'delivered'];
const deliveryStatusLabel = (status: string) => status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const inputClasses = 'min-h-[42px] w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 placeholder:text-neutral-400 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500';
const textareaClasses = 'w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500';
const statCardClasses = 'min-w-0 rounded-xl bg-neutral-50 p-3 sm:p-4';
const primaryButtonClasses = 'min-h-[42px] rounded-lg bg-lime-600 px-4 sm:px-6 font-semibold text-white transition hover:bg-lime-700 disabled:cursor-not-allowed disabled:opacity-60';
const outlineButtonClasses = 'inline-flex min-h-[42px] min-w-0 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 sm:px-4 font-semibold text-neutral-700 transition hover:bg-neutral-50';

const statusBadgeTone = (status: string) => {
  const value = (status || '').toLowerCase();
  if (['delivered', 'completed', 'instock', 'in stock'].includes(value)) return 'bg-lime-100 text-lime-800';
  if (['pending', 'processing', 'assigned', 'picked_up', 'out_for_delivery'].includes(value)) return 'bg-amber-100 text-amber-800';
  if (['cancelled', 'failed', 'outofstock', 'out of stock'].includes(value)) return 'bg-red-100 text-red-700';
  return 'bg-neutral-200 text-neutral-700';
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadgeTone(status)}`}>{status.replaceAll('_', ' ')}</span>
);

// Simple line icons — no external icon dependency
const IconPackage = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" />
  </svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" />
    <path d="M2.5 3h2l2.6 12.2A2 2 0 0 0 9 17h9a2 2 0 0 0 1.9-1.4L22 7H6" />
  </svg>
);
const IconRupee = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h12M6 8h12M6 4c4 0 6 1.5 6 4s-2 4-6 4h8M8 12l7 8" />
  </svg>
);
const IconAward = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" /><path d="m8.5 13-1.5 7 5-2.5L16 20l-1.5-7" />
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const StatCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: string }) => (
  <div className={statCardClasses}>
    <div className="flex items-center gap-1.5 text-sm text-neutral-500">
      {icon}
      {label}
    </div>
    <strong className={`mt-1.5 block break-words text-xl font-semibold sm:text-2xl ${tone || 'text-neutral-900'}`}>{value}</strong>
  </div>
);

const emptyProductForm = {
  name: '',
  sku: '',
  brand: '',
  categoryId: '',
  price: '',
  regularPrice: '',
  salePrice: '',
  stockQuantity: '',
  lowStockThreshold: '',
  mainImageUrl: '',
  galleryImageUrls: '',
  shortDescription: '',
  description: '',
  attributes: '',
  variations: '',
};

const PartnerOperationsPanel = ({ role, user }: { role: PartnerRole; user: User }) => {
  const [products, setProducts] = useState<RecordValue[]>([]);
  const [orders, setOrders] = useState<RecordValue[]>([]);
  const [settlements, setSettlements] = useState<RecordValue[]>([]);
  const [summary, setSummary] = useState<RecordValue>({});
  const [membership, setMembership] = useState<RecordValue>({});
  const [form, setForm] = useState(emptyProductForm);
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
      let attributes: RecordValue = {};
      let variations: RecordValue[] = [];
      try {
        attributes = form.attributes ? JSON.parse(form.attributes) : {};
      } catch {
        throw new Error('Attributes must be valid JSON, e.g. {"color":"red","size":"M"}');
      }
      try {
        variations = form.variations ? JSON.parse(form.variations) : [];
      } catch {
        throw new Error('Variations must be valid JSON array, e.g. [{"sku":"...","price":100}]');
      }

      await request('/partner/vendor/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          brand: form.brand,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          price: Number(form.price),
          regularPrice: form.regularPrice ? Number(form.regularPrice) : Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          stockQuantity: Number(form.stockQuantity || 0),
          lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : null,
          mainImageUrl: form.mainImageUrl,
          galleryImageUrls: form.galleryImageUrls
            ? form.galleryImageUrls.split(',').map((url) => url.trim()).filter(Boolean)
            : [],
          shortDescription: form.shortDescription,
          description: form.description,
          attributes,
          variations,
        }),
      });
      setForm(emptyProductForm);
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
    <section className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-100 text-sm font-semibold text-lime-800">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-900">{user.name}</p>
            <p className="truncate text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          {role === 'vendor' ? <><NavLink to="/partner/vendor/orders" className={outlineButtonClasses}>Orders</NavLink><NavLink to="/partner/vendor/inventory" className={outlineButtonClasses}>Inventory</NavLink><NavLink to="/partner/vendor/payouts" className={outlineButtonClasses}>Payouts</NavLink></> : <><NavLink to="/partner/delivery/history" className={outlineButtonClasses}>History</NavLink><NavLink to="/partner/delivery/wallet" className={outlineButtonClasses}>Wallet & withdrawals</NavLink></>}
          <NavLink to={`/partner/${role}/profile`} className={`${outlineButtonClasses} col-span-1`}>
            My profile
          </NavLink>
          <button type="button" onClick={load} disabled={busy} className={`${primaryButtonClasses} col-span-1`}>
            <IconRefresh />
            <span className="ml-1.5">Refresh</span>
          </button>
        </div>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-lime-50 px-4 py-2.5 text-sm font-medium text-lime-800">{message}</p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {role === 'vendor' ? (
          <>
            <StatCard icon={<IconPackage />} label="Catalog items" value={summary.catalogItems || products.length} />
            <StatCard icon={<IconCart />} label="Orders" value={summary.vendorOrders || orders.length} />
            <StatCard icon={<IconRupee />} label="Sales" value={`Rs. ${summary.vendorSales || 0}`} tone="text-lime-700" />
            <StatCard icon={<IconAward />} label="Membership" value={membership.membershipStatus || 'pending'} tone="text-amber-700 capitalize" />
          </>
        ) : (
          <>
            <StatCard icon={<IconTruck />} label="Total deliveries" value={summary.total || 0} />
            <StatCard icon={<IconTruck />} label="Active" value={summary.active || 0} tone="text-amber-700" />
            <StatCard icon={<IconPackage />} label="Delivered" value={summary.delivered || 0} tone="text-lime-700" />
            <StatCard icon={<IconRupee />} label="Delivery wallet" value={`Rs. ${summary.walletBalance || 0}`} tone="text-lime-700" />
            <StatCard icon={<IconRupee />} label="COD to collect" value={`Rs. ${summary.codToCollect || 0}`} />
          </>
        )}
      </div>

      {role === 'vendor' ? (
        <>
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-3 sm:p-5">
            <h4 className="mb-4 text-base font-semibold text-neutral-900">Add a product</h4>
            <form className="grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={createProduct}>
              <input required placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClasses} />
              <input placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} className={inputClasses} />
              <input placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className={inputClasses} />
              <input type="number" placeholder="Category ID" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className={inputClasses} />

              <input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClasses} />
              <input type="number" min="0" step="0.01" placeholder="Regular price" value={form.regularPrice} onChange={(event) => setForm({ ...form, regularPrice: event.target.value })} className={inputClasses} />
              <input type="number" min="0" step="0.01" placeholder="Sale price" value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: event.target.value })} className={inputClasses} />
              <input type="number" min="0" placeholder="Stock quantity" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} className={inputClasses} />

              <input type="number" min="0" placeholder="Low-stock threshold" value={form.lowStockThreshold} onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })} className={inputClasses} />
              <input placeholder="Main image URL" value={form.mainImageUrl} onChange={(event) => setForm({ ...form, mainImageUrl: event.target.value })} className={inputClasses} />
              <input placeholder="Gallery image URLs (comma separated)" value={form.galleryImageUrls} onChange={(event) => setForm({ ...form, galleryImageUrls: event.target.value })} className={`${inputClasses} sm:col-span-2`} />

              <input placeholder="Short description" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} className={`${inputClasses} sm:col-span-2`} />
              <label className="text-sm font-bold sm:col-span-2">Full description<CKEditor editor={ClassicEditor} data={form.description} onChange={(_, editor) => setForm({ ...form, description: editor.getData() })} /></label>

              <textarea placeholder='Attributes (JSON, e.g. {"color":"red","size":"M"})' value={form.attributes} onChange={(event) => setForm({ ...form, attributes: event.target.value })} className={`${textareaClasses} min-h-[70px] sm:col-span-2`} />
              <textarea placeholder='Variations (JSON array, e.g. [{"sku":"P-RED-M","price":499}])' value={form.variations} onChange={(event) => setForm({ ...form, variations: event.target.value })} className={`${textareaClasses} min-h-[70px] sm:col-span-2`} />

              <button type="submit" disabled={busy} className={`${primaryButtonClasses} flex items-center justify-center sm:col-span-2`}>
                <IconPlus />
                <span className="ml-1.5">Add product</span>
              </button>
            </form>
          </div>

          <h4 className="mb-3 mt-6 text-base font-semibold text-neutral-900">Products</h4>
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            {products.length === 0 ? (
              <p className="p-4 text-sm text-neutral-500">No products yet.</p>
            ) : (
              products.slice(0, 10).map((product, index) => (
                <div key={product.id} className={`flex items-center justify-between px-4 py-3 ${index !== 0 ? 'border-t border-neutral-100' : ''}`}>
                  <div>
                    <p className="font-medium text-neutral-900">{product.name}</p>
                    <p className="text-sm text-neutral-500">Rs. {product.price}</p>
                  </div>
                  <StatusBadge status={product.stockStatus || 'instock'} />
                </div>
              ))
            )}
          </div>

          <h4 className="mb-3 mt-6 text-base font-semibold text-neutral-900">Active orders</h4>
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            {activeOrders.length === 0 ? (
              <p className="p-4 text-sm text-neutral-500">No active orders right now.</p>
            ) : (
              activeOrders.slice(0, 10).map((order, index) => (
                <div key={order.id} className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${index !== 0 ? 'border-t border-neutral-100' : ''}`}>
                  <div>
                    <p className="font-medium text-neutral-900">Order #{order.id}</p>
                    <p className="text-sm text-neutral-500">Rs. {order.total}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status || 'pending'} />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => updateVendorOrder(order.id, order.status === 'pending' ? 'processing' : 'completed')}
                      className={primaryButtonClasses}
                    >
                      {order.status === 'pending' ? 'Start processing' : 'Mark completed'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <h4 className="mb-3 mt-6 text-base font-semibold text-neutral-900">Delivery orders</h4>
          <div className="grid gap-3">
            {orders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">No deliveries have been assigned yet.</p>
            ) : (
              orders.slice(0, 15).map((order) => {
                const next = nextDeliveryStatus(order.deliveryStatus || 'assigned');
                const currentStatus = order.deliveryStatus || 'assigned';
                const currentStep = deliverySteps.indexOf(currentStatus);
                return (
                  <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-900">Order #{order.id}</p>
                        <p className="text-sm text-neutral-500">Rs. {order.total} · {order.shippingAddress || 'Address not available'}</p>
                      </div>
                      <StatusBadge status={currentStatus} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label={`Delivery status: ${deliveryStatusLabel(currentStatus)}`}>
                      {deliverySteps.map((step, index) => (
                        <span
                          key={step}
                          className={`rounded-lg px-2 py-1.5 text-center text-xs font-medium ${
                            index <= currentStep ? 'bg-lime-100 text-lime-800' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {deliveryStatusLabel(step)}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3">
                      {next ? (
                        <button type="button" disabled={busy} onClick={() => updateDeliveryOrder(order.id, next)} className={primaryButtonClasses}>
                          {next === 'delivered' ? 'Mark delivered' : `Mark ${next.replaceAll('_', ' ')}`}
                        </button>
                      ) : (
                        <span className="text-sm font-semibold text-lime-700">Delivery completed</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default PartnerOperationsPanel;
