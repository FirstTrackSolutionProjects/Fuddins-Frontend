// @ts-nocheck
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
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

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ---------- UI-only styling helpers ---------- */

const inputClasses =
  'min-h-[46px] w-full min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-base text-neutral-900 placeholder:text-neutral-400 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';
const textareaClasses =
  'w-full min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';
const primaryButtonClasses =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-5 text-sm font-bold text-white shadow-md shadow-lime-600/25 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6';
const outlineButtonClasses =
  'inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 no-underline transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-800';
const heroGhostClasses =
  'inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white no-underline ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white';

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  package: 'M21 8 12 3 3 8l9 5 9-5Z M3 8v8l9 5 9-5V8 M12 13v8',
  cart: 'M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6',
  rupee: 'M6 3h12 M6 8h12 M6 13h4a4 4 0 0 0 0-8 M10 13l7 8',
  award: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89 7 23l5-3 5 3-1.21-9.12',
  truck: 'M1 3h15v13H1z M16 8h4l3 3v5h-7z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.4 M21 3v6h-6',
  plus: 'M12 5v14 M5 12h14',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
  tag: 'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  image: 'M21 15l-5-5L5 21 M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  edit: 'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
  code: 'm16 18 6-6-6-6 M8 6l-6 6 6 6',
  chevron: 'm6 9 6 6 6-6',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  close: 'M18 6 6 18 M6 6l12 12',
};

const statusBadgeTone = (status: string) => {
  const value = (status || '').toLowerCase();
  if (['delivered', 'completed', 'instock', 'in stock', 'active'].includes(value)) return 'bg-lime-100 text-lime-800 ring-lime-200';
  if (['pending', 'processing', 'assigned', 'picked_up', 'out_for_delivery', 'lowstock'].includes(value)) return 'bg-amber-100 text-amber-800 ring-amber-200';
  if (['cancelled', 'failed', 'outofstock', 'out of stock'].includes(value)) return 'bg-red-100 text-red-700 ring-red-200';
  return 'bg-neutral-100 text-neutral-700 ring-neutral-200';
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${statusBadgeTone(status)}`}>{status.replaceAll('_', ' ')}</span>
);

const STAT_TONES: Record<string, string> = {
  lime: 'bg-lime-100 text-lime-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  teal: 'bg-teal-100 text-teal-700',
  amber: 'bg-amber-100 text-amber-700',
};

const StatCard = ({ icon, label, value, color = 'lime', valueClass }: { icon: keyof typeof ICON; label: string; value: ReactNode; color?: string; valueClass?: string }) => (
  <div className="min-w-0 rounded-2xl bg-white p-4 shadow-lg shadow-lime-900/10 ring-1 ring-neutral-100 sm:p-5">
    <div className="flex items-center gap-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${STAT_TONES[color]}`}>
        <Ico d={ICON[icon]} className="h-5 w-5" />
      </span>
      <span className="min-w-0 text-sm font-semibold text-neutral-500">{label}</span>
    </div>
    <strong className={`mt-3 block break-words text-2xl font-extrabold leading-tight text-neutral-900 sm:text-3xl ${valueClass || ''}`}>{value}</strong>
  </div>
);

const Card = ({ icon, title, hint, action, children }: { icon: keyof typeof ICON; title: string; hint?: string; action?: ReactNode; children: ReactNode }) => (
  <section className="mt-6 min-w-0 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 sm:p-6">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-100 text-lime-700">
          <Ico d={ICON[icon]} className="h-5 w-5" />
        </span>
        <div>
          <h4 className="m-0 font-serif text-xl font-bold text-neutral-900">{title}</h4>
          {hint ? <p className="m-0 mt-0.5 text-xs text-neutral-500">{hint}</p> : null}
        </div>
      </div>
      {action}
    </header>
    {children}
  </section>
);

const FormGroup = ({ title, icon, children }: { title: string; icon: keyof typeof ICON; children: ReactNode }) => (
  <fieldset className="m-0 min-w-0 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 sm:p-5">
    <legend className="flex items-center gap-2 px-2 text-sm font-bold text-neutral-800">
      <span className="grid h-6 w-6 place-items-center rounded-lg bg-lime-100 text-lime-700">
        <Ico d={ICON[icon]} className="h-3.5 w-3.5" />
      </span>
      {title}
    </legend>
    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

const Field = ({ label, required = false, full = false, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) => (
  <div className={`min-w-0 ${full ? 'sm:col-span-2' : ''}`}>
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  </div>
);

const EmptyState = ({ icon, title, text, action }: { icon: keyof typeof ICON; title: string; text: string; action?: ReactNode }) => (
  <div className="grid place-items-center rounded-2xl border border-dashed border-lime-200 bg-gradient-to-b from-lime-50/70 to-white px-4 py-12 text-center">
    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-lime-600 shadow-md shadow-lime-600/15 ring-1 ring-lime-100">
      <Ico d={ICON[icon]} className="h-7 w-7" />
    </span>
    <p className="m-0 mt-4 text-base font-bold text-neutral-900">{title}</p>
    <p className="m-0 mt-1 max-w-sm text-sm text-neutral-500">{text}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

const isErrorMessage = (text: string) => /unable|fail|must be|could not|request failed|not be created/i.test(text);

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
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const load = async () => {
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

  // Drawer: close on Esc + lock page scroll while open
  useEffect(() => {
    if (!showAddForm) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAddForm(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [showAddForm]);

  const activeOrders = useMemo(() => orders.filter((order) => role === 'vendor' ? !['completed', 'cancelled'].includes(order.status) : !['delivered', 'failed'].includes(order.deliveryStatus)), [orders, role]);

  const openAddForm = () => {
    setFormError('');
    setShowAddForm(true);
  };

  const refresh = () => {
    setMessage('');
    load();
  };

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setFormError('');
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
      setShowAddForm(false);
      setMessage('Product created successfully.');
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Product could not be created');
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

  const firstName = (user.name || '').split(' ')[0] || 'there';
  const membershipActive = (membership.membershipStatus || '').toLowerCase() === 'active';

  const checklist = [
    { label: 'Create your partner account', done: true },
    { label: 'Activate your membership', done: membershipActive },
    { label: 'Add your first product', done: products.length > 0 },
    { label: 'Receive your first order', done: orders.length > 0 },
  ];
  const checklistDone = checklist.filter((item) => item.done).length;

  return (
    <section className="mx-auto min-w-0 max-w-[1300px]">
      {/* hero */}
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 via-lime-700 to-emerald-900 px-5 pb-16 pt-6 shadow-xl shadow-lime-900/20 sm:px-8 sm:pb-20 sm:pt-8"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(135deg, #84cc16 0%, #4d7c0f 55%, #064e3b 100%)', backgroundSize: '20px 20px, 100% 100%' }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-xl font-extrabold text-lime-700 shadow-lg ring-4 ring-white/30">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-medium text-lime-50/90">{greeting()},</p>
              <h2 className="m-0 truncate font-serif text-2xl font-bold text-white sm:text-3xl">{firstName}</h2>
              <p className="m-0 mt-0.5 truncate text-sm text-lime-50/80">{user.email}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white ring-1 ring-white/30">
                  {role === 'vendor' ? 'Vendor dashboard' : 'Delivery dashboard'}
                </span>
                {role === 'vendor' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 px-3 py-0.5 text-xs font-bold capitalize text-lime-100 ring-1 ring-white/20">
                    <Ico d={ICON.award} className="h-3 w-3" />
                    {membership.membershipStatus || 'pending'} member
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            {role === 'vendor' ? (
              <>
                <button
                  type="button"
                  onClick={openAddForm}
                  className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-lime-800 shadow-lg shadow-emerald-950/20 transition hover:bg-lime-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-lime-700 sm:col-span-1"
                >
                  <Ico d={ICON.plus} className="h-4 w-4" stroke={3} />
                  Add product
                </button>
                <NavLink to="/partner/vendor/orders" className={heroGhostClasses}><Ico d={ICON.cart} className="h-4 w-4" />Orders</NavLink>
                <NavLink to="/partner/vendor/inventory" className={heroGhostClasses}><Ico d={ICON.package} className="h-4 w-4" />Inventory</NavLink>
                <NavLink to="/partner/vendor/payouts" className={heroGhostClasses}><Ico d={ICON.rupee} className="h-4 w-4" />Payouts</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/partner/delivery/history" className={heroGhostClasses}><Ico d={ICON.clock} className="h-4 w-4" />History</NavLink>
                <NavLink to="/partner/delivery/wallet" className={heroGhostClasses}><Ico d={ICON.rupee} className="h-4 w-4" />Wallet &amp; withdrawals</NavLink>
              </>
            )}
            <NavLink to={`/partner/${role}/profile`} className={heroGhostClasses}>
              <Ico d={ICON.user} className="h-4 w-4" />My profile
            </NavLink>
            <button type="button" onClick={refresh} disabled={busy} aria-label="Refresh data" title="Refresh" className={`${heroGhostClasses} disabled:cursor-not-allowed disabled:opacity-60`}>
              <Ico d={ICON.refresh} className="h-4 w-4" />
              <span className="sm:sr-only">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* stats overlapping hero */}
      <div className="relative -mt-12 grid grid-cols-2 gap-3 px-3 sm:-mt-14 sm:gap-4 sm:px-6 lg:grid-cols-4 xl:grid-cols-5">
        {role === 'vendor' ? (
          <>
            <StatCard icon="package" label="Catalog items" value={summary.catalogItems || products.length} color="lime" />
            <StatCard icon="cart" label="Orders" value={summary.vendorOrders || orders.length} color="teal" />
            <StatCard icon="rupee" label="Sales" value={`Rs. ${summary.vendorSales || 0}`} color="emerald" valueClass="text-emerald-700" />
            <StatCard icon="award" label="Membership" value={membership.membershipStatus || 'pending'} color="amber" valueClass="capitalize text-amber-600" />
          </>
        ) : (
          <>
            <StatCard icon="truck" label="Total deliveries" value={summary.total || 0} color="lime" />
            <StatCard icon="clock" label="Active" value={summary.active || 0} color="amber" valueClass="text-amber-600" />
            <StatCard icon="check" label="Delivered" value={summary.delivered || 0} color="emerald" valueClass="text-emerald-700" />
            <StatCard icon="rupee" label="Delivery wallet" value={`Rs. ${summary.walletBalance || 0}`} color="teal" />
            <StatCard icon="rupee" label="COD to collect" value={`Rs. ${summary.codToCollect || 0}`} color="lime" />
          </>
        )}
      </div>

      {message ? (
        <p
          role="status"
          className={`m-0 mt-6 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
            isErrorMessage(message) ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-lime-50 text-lime-800 ring-1 ring-lime-200'
          }`}
        >
          <Ico d={isErrorMessage(message) ? ICON.alert : ICON.check} className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 break-words">{message}</span>
          <button type="button" onClick={() => setMessage('')} aria-label="Dismiss message" className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100">
            <Ico d={ICON.close} className="h-4 w-4" />
          </button>
        </p>
      ) : null}

      {role === 'vendor' ? (
        <>
          {/* getting started */}
          {checklistDone < checklist.length ? (
            <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-lime-50 via-white to-emerald-50 p-5 ring-1 ring-lime-100 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="m-0 font-serif text-xl font-bold text-neutral-900">Set up your store</h4>
                  <p className="m-0 mt-0.5 text-sm text-neutral-500">{checklistDone} of {checklist.length} steps done</p>
                </div>
                <div className="h-2.5 w-full max-w-[220px] overflow-hidden rounded-full bg-lime-100" role="progressbar" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={checklistDone}>
                  <div className="h-full rounded-full bg-gradient-to-r from-lime-500 to-emerald-600 transition-all duration-500" style={{ width: `${(checklistDone / checklist.length) * 100}%` }} />
                </div>
              </div>
              <ul className="m-0 mt-4 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {checklist.map((item) => (
                  <li key={item.label} className={`flex items-center gap-3 rounded-xl p-3 text-sm font-semibold ring-1 ${item.done ? 'bg-white text-neutral-500 ring-lime-100' : 'bg-white text-neutral-900 ring-neutral-200'}`}>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${item.done ? 'bg-lime-500 text-white' : 'border-2 border-dashed border-neutral-300 text-transparent'}`}>
                      <Ico d={ICON.check} className="h-3.5 w-3.5" stroke={3} />
                    </span>
                    <span className={item.done ? 'line-through decoration-neutral-300' : ''}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* products */}
          <Card
            icon="package"
            title="Products"
            hint={products.length ? `Showing ${Math.min(products.length, 12)} of ${products.length}` : undefined}
            action={
              products.length ? (
                <button type="button" onClick={openAddForm} className={primaryButtonClasses}>
                  <Ico d={ICON.plus} className="h-4 w-4" stroke={2.5} /> Add product
                </button>
              ) : null
            }
          >
            {products.length === 0 ? (
              <EmptyState
                icon="package"
                title="Your catalog is empty"
                text="Add your first product with a photo and price so customers can start ordering."
                action={
                  <button type="button" onClick={openAddForm} className={primaryButtonClasses}>
                    <Ico d={ICON.plus} className="h-4 w-4" stroke={2.5} /> Add your first product
                  </button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.slice(0, 12).map((product) => (
                    <article key={product.id} className="group min-w-0 overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200 transition hover:shadow-lg hover:shadow-lime-900/10 hover:ring-lime-300">
                      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-lime-50 to-emerald-50">
                        {product.mainImageUrl ? (
                          <img src={product.mainImageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        ) : (
                          <Ico d={ICON.image} className="h-10 w-10 text-lime-400" stroke={1.5} />
                        )}
                        <span className="absolute right-3 top-3"><StatusBadge status={product.stockStatus || 'instock'} /></span>
                      </div>
                      <div className="p-4">
                        <p className="m-0 truncate font-bold text-neutral-900">{product.name}</p>
                        <p className="m-0 mt-0.5 truncate text-xs text-neutral-500">{[product.brand, product.sku].filter(Boolean).join(' • ') || 'No brand or SKU'}</p>
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <p className="m-0 text-xl font-extrabold text-lime-700">Rs. {product.price}</p>
                          {product.stockQuantity !== undefined && product.stockQuantity !== null ? (
                            <p className="m-0 text-xs font-semibold text-neutral-500">{product.stockQuantity} in stock</p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {products.length > 12 ? (
                  <div className="mt-5 flex justify-center">
                    <NavLink to="/partner/vendor/inventory" className={outlineButtonClasses}>View all {products.length} products</NavLink>
                  </div>
                ) : null}
              </>
            )}
          </Card>

          {/* active orders */}
          <Card icon="cart" title="Active orders" hint={activeOrders.length ? `${activeOrders.length} waiting for you` : undefined}>
            {activeOrders.length === 0 ? (
              <EmptyState icon="inbox" title="No active orders" text="New orders will show up here the moment a customer places one." />
            ) : (
              <div className="grid gap-2.5">
                {activeOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100 transition hover:ring-lime-200">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-lime-600 ring-1 ring-neutral-100"><Ico d={ICON.cart} className="h-5 w-5" /></span>
                      <div>
                        <p className="m-0 font-bold text-neutral-900">Order #{order.id}</p>
                        <p className="m-0 text-sm font-semibold text-lime-700">Rs. {order.total}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
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
                ))}
              </div>
            )}
          </Card>

          {/* add product drawer */}
          {showAddForm ? (
            <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true" aria-label="Add a product">
              <button type="button" aria-label="Close add product form" onClick={() => setShowAddForm(false)} className="absolute inset-0 cursor-default bg-emerald-950/50 backdrop-blur-sm" />
              <form onSubmit={createProduct} className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                <header className="flex items-center justify-between gap-3 border-b border-neutral-100 bg-gradient-to-r from-lime-50 to-white px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-md shadow-lime-500/30">
                      <Ico d={ICON.plus} className="h-5 w-5" stroke={2.5} />
                    </span>
                    <div>
                      <h3 className="m-0 font-serif text-xl font-bold text-neutral-900">Add a product</h3>
                      <p className="m-0 text-xs text-neutral-500">Fields marked * are required</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setShowAddForm(false)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900">
                    <Ico d={ICON.close} className="h-5 w-5" />
                  </button>
                </header>

                <div className="grid flex-1 content-start gap-4 overflow-y-auto px-5 py-5 sm:px-6">
                  {formError ? (
                    <p role="alert" className="m-0 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                      <Ico d={ICON.alert} className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="min-w-0 break-words">{formError}</span>
                    </p>
                  ) : null}

                  <FormGroup title="Basic info" icon="tag">
                    <Field label="Product name" required full><input required placeholder="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClasses} /></Field>
                    <Field label="SKU"><input placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} className={inputClasses} /></Field>
                    <Field label="Brand"><input placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className={inputClasses} /></Field>
                    <Field label="Category ID" full><input type="number" placeholder="Category ID" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className={inputClasses} /></Field>
                  </FormGroup>

                  <FormGroup title="Pricing & stock" icon="rupee">
                    <Field label="Price" required><input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClasses} /></Field>
                    <Field label="Regular price"><input type="number" min="0" step="0.01" placeholder="Regular price" value={form.regularPrice} onChange={(event) => setForm({ ...form, regularPrice: event.target.value })} className={inputClasses} /></Field>
                    <Field label="Sale price"><input type="number" min="0" step="0.01" placeholder="Sale price" value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: event.target.value })} className={inputClasses} /></Field>
                    <Field label="Stock quantity"><input type="number" min="0" placeholder="Stock quantity" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} className={inputClasses} /></Field>
                    <Field label="Low-stock threshold" full><input type="number" min="0" placeholder="Low-stock threshold" value={form.lowStockThreshold} onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })} className={inputClasses} /></Field>
                  </FormGroup>

                  <FormGroup title="Images" icon="image">
                    <Field label="Main image URL" full><input placeholder="Main image URL" value={form.mainImageUrl} onChange={(event) => setForm({ ...form, mainImageUrl: event.target.value })} className={inputClasses} /></Field>
                    <Field label="Gallery image URLs (comma separated)" full><input placeholder="Gallery image URLs (comma separated)" value={form.galleryImageUrls} onChange={(event) => setForm({ ...form, galleryImageUrls: event.target.value })} className={inputClasses} /></Field>
                  </FormGroup>

                  <FormGroup title="Description" icon="edit">
                    <Field label="Short description" full><input placeholder="Short description" value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} className={inputClasses} /></Field>
                    <div className="min-w-0 sm:col-span-2">
                      <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Full description</span>
                      <div className="relative z-0 rounded-xl border border-neutral-200 bg-white transition focus-within:z-20 focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-500/15 [&_.ck-editor__editable]:!min-h-[180px] [&_.ck-editor__editable]:!rounded-b-xl [&_.ck-editor__editable]:!border-0 [&_.ck-editor__editable.ck-focused]:!shadow-none [&_.ck-toolbar]:!rounded-t-xl [&_.ck-toolbar]:!border-0 [&_.ck-toolbar]:!border-b [&_.ck-toolbar]:!bg-neutral-50">
                        <CKEditor editor={ClassicEditor} data={form.description} onChange={(_, editor) => setForm({ ...form, description: editor.getData() })} />
                      </div>
                    </div>
                  </FormGroup>

                  <details className="group rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 sm:p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-neutral-800 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-lg bg-lime-100 text-lime-700"><Ico d={ICON.code} className="h-3.5 w-3.5" /></span>
                        Advanced: attributes &amp; variations (JSON)
                      </span>
                      <span className="transition-transform duration-200 group-open:rotate-180"><Ico d={ICON.chevron} className="h-4 w-4" /></span>
                    </summary>
                    <div className="mt-4 grid gap-4">
                      <Field label="Attributes (JSON)"><textarea placeholder='Attributes (JSON, e.g. {"color":"red","size":"M"})' value={form.attributes} onChange={(event) => setForm({ ...form, attributes: event.target.value })} className={`${textareaClasses} min-h-[90px]`} /></Field>
                      <Field label="Variations (JSON array)"><textarea placeholder='Variations (JSON array, e.g. [{"sku":"P-RED-M","price":499}])' value={form.variations} onChange={(event) => setForm({ ...form, variations: event.target.value })} className={`${textareaClasses} min-h-[90px]`} /></Field>
                    </div>
                  </details>
                </div>

                <footer className="grid grid-cols-2 gap-3 border-t border-neutral-100 bg-white px-5 py-4 sm:px-6">
                  <button type="button" onClick={() => setShowAddForm(false)} className={outlineButtonClasses}>
                    Cancel
                  </button>
                  <button type="submit" disabled={busy} className={primaryButtonClasses}>
                    <Ico d={ICON.plus} className="h-4 w-4" stroke={2.5} />
                    {busy ? 'Adding…' : 'Add product'}
                  </button>
                </footer>
              </form>
            </div>
          ) : null}
        </>
      ) : (
        <Card icon="truck" title="Delivery orders" hint={orders.length ? `${activeOrders.length} active` : undefined}>
          {orders.length === 0 ? (
            <EmptyState icon="truck" title="No deliveries yet" text="Assigned deliveries will appear here with their live status." />
          ) : (
            <div className="grid gap-4">
              {orders.slice(0, 15).map((order) => {
                const next = nextDeliveryStatus(order.deliveryStatus || 'assigned');
                const currentStatus = order.deliveryStatus || 'assigned';
                const currentStep = deliverySteps.indexOf(currentStatus);
                return (
                  <div key={order.id} className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 text-lg font-bold text-neutral-900">Order #{order.id}</p>
                        <p className="m-0 mt-1 text-sm font-bold text-lime-700">Rs. {order.total}</p>
                        <p className="m-0 mt-1.5 flex items-start gap-1.5 text-sm text-neutral-500">
                          <Ico d={ICON.pin} className="mt-0.5 h-4 w-4 shrink-0 text-lime-600" />
                          <span className="min-w-0 break-words">{order.shippingAddress || 'Address not available'}</span>
                        </p>
                      </div>
                      <StatusBadge status={currentStatus} />
                    </div>

                    <ol className="m-0 mt-5 grid list-none grid-cols-4 p-0" aria-label={`Delivery status: ${deliveryStatusLabel(currentStatus)}`}>
                      {deliverySteps.map((step, index) => {
                        const done = index < currentStep;
                        const active = index === currentStep;
                        return (
                          <li key={step} className="relative flex flex-col items-center text-center">
                            {index > 0 ? <span className={`absolute left-[-50%] top-3.5 h-0.5 w-full -translate-y-1/2 ${index <= currentStep ? 'bg-lime-500' : 'bg-neutral-200'}`} /> : null}
                            <span
                              className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                                done || (active && step === 'delivered')
                                  ? 'bg-lime-500 text-white'
                                  : active
                                    ? 'border-2 border-lime-500 bg-white text-lime-700 ring-4 ring-lime-500/20'
                                    : 'bg-neutral-200 text-neutral-400'
                              }`}
                            >
                              {done || (active && step === 'delivered') ? <Ico d={ICON.check} className="h-3.5 w-3.5" stroke={3} /> : index + 1}
                            </span>
                            <span className={`mt-1.5 text-[10px] font-semibold leading-tight sm:text-xs ${index <= currentStep ? 'text-lime-800' : 'text-neutral-400'}`}>
                              {deliveryStatusLabel(step)}
                            </span>
                          </li>
                        );
                      })}
                    </ol>

                    <div className="mt-5">
                      {next ? (
                        <button type="button" disabled={busy} onClick={() => updateDeliveryOrder(order.id, next)} className={`${primaryButtonClasses} w-full sm:w-auto`}>
                          {next === 'delivered' ? 'Mark delivered' : `Mark ${next.replaceAll('_', ' ')}`}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-lime-700">
                          <Ico d={ICON.check} className="h-4 w-4" stroke={3} /> Delivery completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </section>
  );
};

export default PartnerOperationsPanel;