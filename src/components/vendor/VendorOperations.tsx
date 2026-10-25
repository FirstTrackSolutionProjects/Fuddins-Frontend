import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock,
  History as HistoryIcon,
  IndianRupee,
  Inbox,
  Landmark,
  Mail,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  User,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { API_ORIGIN } from '../../config';

type View = 'orders' | 'inventory' | 'payouts';
type RecordValue = Record<string, any>;
type Notice = { text: string; tone: 'success' | 'error' };

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' });
const request = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_ORIGIN}${path}`, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
};

/* ---------- styling helpers ---------- */

const inputClasses =
  'min-h-[46px] w-full min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-base text-neutral-900 placeholder:text-neutral-400 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';
const primaryButtonClasses =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-5 text-sm font-bold text-white shadow-md shadow-lime-600/25 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6';
const heroGhostClasses =
  'inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white no-underline ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60';

const STAT_TONES: Record<string, string> = {
  lime: 'bg-lime-100 text-lime-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  teal: 'bg-teal-100 text-teal-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

const StatCard = ({ icon: Icon, label, value, color = 'lime', valueClass = '' }: { icon: LucideIcon; label: string; value: ReactNode; color?: string; valueClass?: string }) => (
  <div className="min-w-0 rounded-2xl bg-white p-4 shadow-lg shadow-lime-900/10 ring-1 ring-neutral-100 sm:p-5">
    <div className="flex items-center gap-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${STAT_TONES[color]}`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0 text-sm font-semibold text-neutral-500">{label}</span>
    </div>
    <strong className={`mt-3 block break-words text-2xl font-extrabold leading-tight text-neutral-900 sm:text-3xl ${valueClass}`}>{value}</strong>
  </div>
);

const statusTone = (status: string) => {
  const value = (status || '').toLowerCase();
  if (['completed', 'delivered', 'paid', 'approved', 'in stock'].includes(value)) return 'bg-lime-100 text-lime-800 ring-lime-200';
  if (['pending', 'processing', 'low stock', 'requested'].includes(value)) return 'bg-amber-100 text-amber-800 ring-amber-200';
  if (['cancelled', 'failed', 'rejected', 'out of stock'].includes(value)) return 'bg-red-100 text-red-700 ring-red-200';
  return 'bg-neutral-100 text-neutral-700 ring-neutral-200';
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${statusTone(status)}`}>{status.replaceAll('_', ' ')}</span>
);

const Panel = ({ icon: Icon, title, hint, children }: { icon: LucideIcon; title: string; hint?: string; children: ReactNode }) => (
  <section className="mt-6 min-w-0 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 sm:p-6">
    <header className="mb-5 flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-100 text-lime-700">
        <Icon size={20} />
      </span>
      <div>
        <h2 className="m-0 font-serif text-xl font-bold text-neutral-900">{title}</h2>
        {hint ? <p className="m-0 mt-0.5 text-xs text-neutral-500">{hint}</p> : null}
      </div>
    </header>
    {children}
  </section>
);

const Empty = ({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) => (
  <div className="grid place-items-center rounded-2xl border border-dashed border-lime-200 bg-gradient-to-b from-lime-50/70 to-white px-4 py-12 text-center">
    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-lime-600 shadow-md shadow-lime-600/15 ring-1 ring-lime-100">
      <Icon size={28} />
    </span>
    <p className="m-0 mt-4 text-base font-bold text-neutral-900">{title}</p>
    <p className="m-0 mt-1 max-w-sm text-sm text-neutral-500">{text}</p>
  </div>
);

const Skeleton = () => (
  <div className="grid gap-4" aria-hidden="true">
    {[0, 1, 2].map((item) => (
      <div key={item} className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
    ))}
  </div>
);

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : '');

const orderSteps = ['pending', 'processing', 'completed'];

const VIEW_META: Record<View, { title: string; subtitle: string; icon: LucideIcon }> = {
  orders: { title: 'Vendor orders', subtitle: 'Review customer orders and keep customers updated.', icon: ShoppingBag },
  inventory: { title: 'Inventory & stock history', subtitle: 'Manage current stock and review every adjustment.', icon: Package },
  payouts: { title: 'Payouts', subtitle: 'Manage payout details and request settlements.', icon: Wallet },
};

const VendorOperations = ({ view }: { view: View }) => {
  const [rows, setRows] = useState<RecordValue[]>([]);
  const [products, setProducts] = useState<RecordValue[]>([]);
  const [payments, setPayments] = useState<RecordValue>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payoutMethod, setPayoutMethod] = useState('upi');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  const notify = (text: string, tone: Notice['tone'] = 'success') => setNotice({ text, tone });

  const load = async () => {
    try {
      if (view === 'orders') setRows(await request('/partner/vendor/orders'));
      if (view === 'inventory') {
        const [productData, history] = await Promise.all([request('/partner/vendor/products'), request('/marketplace/vendor/inventory')]);
        setProducts(productData);
        setRows(history);
      }
      if (view === 'payouts') {
        const [paymentData, payouts] = await Promise.all([request('/partner/vendor/payments'), request('/partner/vendor/payout-requests')]);
        setPayments(paymentData);
        setRows(payouts);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setRows([]);
    setNotice(null);
    setOrderFilter('all');
    setProductSearch('');
    load();
  }, [view]);

  useEffect(() => {
    if (payments.payoutProfile?.method) setPayoutMethod(payments.payoutProfile.method);
  }, [payments]);

  const refresh = () => {
    setNotice(null);
    load();
  };

  const updateOrder = async (id: number, status: string) => {
    setBusy(true);
    try {
      await request(`/partner/vendor/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      notify('Order status updated.');
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to update order', 'error');
    } finally {
      setBusy(false);
    }
  };

  const adjustInventory = async (id: number, quantity: number) => {
    setBusy(true);
    try {
      await request(`/marketplace/vendor/products/${id}/inventory-adjust`, { method: 'POST', body: JSON.stringify({ quantity }) });
      notify('Stock adjusted.');
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to adjust stock', 'error');
    } finally {
      setBusy(false);
    }
  };

  const savePayment = async (form: HTMLFormElement) => {
    setBusy(true);
    try {
      const data = new FormData(form);
      await request('/partner/vendor/payment-profile', { method: 'PUT', body: JSON.stringify(Object.fromEntries(data)) });
      notify('Payout profile saved.');
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to save payout profile', 'error');
    } finally {
      setBusy(false);
    }
  };

  const requestPayout = async () => {
    setBusy(true);
    try {
      await request('/partner/vendor/payout-requests', { method: 'POST', body: JSON.stringify({ amount: Number(payoutAmount) }) });
      notify('Payout request submitted.');
      setPayoutAmount('');
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to request payout', 'error');
    } finally {
      setBusy(false);
    }
  };

  /* ---------- derived data ---------- */

  const orderCounts = useMemo(() => {
    const count = (status: string) => rows.filter((order) => (order.status || 'pending') === status).length;
    return { all: rows.length, pending: count('pending'), processing: count('processing'), completed: count('completed') };
  }, [rows]);

  const visibleOrders = useMemo(() => (orderFilter === 'all' ? rows : rows.filter((order) => (order.status || 'pending') === orderFilter)), [rows, orderFilter]);

  const stockInfo = (product: RecordValue) => {
    const quantity = Number(product.stockQuantity || 0);
    const threshold = product.lowStockThreshold !== undefined && product.lowStockThreshold !== null ? Number(product.lowStockThreshold) : 5;
    const label = quantity <= 0 ? 'out of stock' : quantity <= threshold ? 'low stock' : 'in stock';
    return { quantity, label };
  };

  const inventoryStats = useMemo(() => {
    let units = 0;
    let low = 0;
    let out = 0;
    products.forEach((product) => {
      const { quantity, label } = stockInfo(product);
      units += quantity;
      if (label === 'low stock') low += 1;
      if (label === 'out of stock') out += 1;
    });
    return { units, low, out };
  }, [products]);

  const visibleProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => `${product.name || ''} ${product.sku || ''}`.toLowerCase().includes(term));
  }, [products, productSearch]);

  const available = Number(payments.availableAmount || 0);
  const pendingPayouts = rows.filter((row) => (row.status || '').toLowerCase() === 'pending').length;

  const meta = VIEW_META[view];
  const HeroIcon = meta.icon;
  const statGridClass = view === 'payouts' ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

  return (
    <section className="mx-auto min-w-0 max-w-[1300px]">
      {/* hero */}
      <div
        className="relative overflow-hidden rounded-3xl px-5 pb-16 pt-5 shadow-xl shadow-lime-900/20 sm:px-8 sm:pb-20 sm:pt-6"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(135deg, #84cc16 0%, #4d7c0f 55%, #064e3b 100%)', backgroundSize: '20px 20px, 100% 100%' }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative">
          <NavLink to="/partner/vendor/dashboard" className={`${heroGhostClasses} min-h-[40px] px-3.5`}>
            <ArrowLeft size={16} />
            Back to dashboard
          </NavLink>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-lime-700 shadow-lg ring-4 ring-white/30">
              <HeroIcon size={26} />
            </span>
            <div className="min-w-0">
              <h1 className="m-0 font-serif text-2xl font-bold text-white sm:text-3xl">{meta.title}</h1>
              <p className="m-0 mt-1 text-sm text-lime-50/90">{meta.subtitle}</p>
            </div>
          </div>
          <button type="button" onClick={refresh} disabled={busy || loading} className={heroGhostClasses}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* stats overlapping hero */}
      <div className={`relative -mt-12 grid grid-cols-2 gap-3 px-3 sm:-mt-14 sm:gap-4 sm:px-6 ${statGridClass}`}>
        {view === 'orders' ? (
          <>
            <StatCard icon={ShoppingBag} label="Total orders" value={orderCounts.all} color="lime" />
            <StatCard icon={Clock} label="Pending" value={orderCounts.pending} color="amber" valueClass="text-amber-600" />
            <StatCard icon={TrendingUp} label="Processing" value={orderCounts.processing} color="teal" />
            <StatCard icon={Check} label="Completed" value={orderCounts.completed} color="emerald" valueClass="text-emerald-700" />
          </>
        ) : null}
        {view === 'inventory' ? (
          <>
            <StatCard icon={Package} label="Products" value={products.length} color="lime" />
            <StatCard icon={TrendingUp} label="Units in stock" value={inventoryStats.units} color="emerald" valueClass="text-emerald-700" />
            <StatCard icon={AlertTriangle} label="Low stock" value={inventoryStats.low} color="amber" valueClass="text-amber-600" />
            <StatCard icon={X} label="Out of stock" value={inventoryStats.out} color="red" valueClass="text-red-600" />
          </>
        ) : null}
        {view === 'payouts' ? (
          <>
            <div className="col-span-2 lg:col-span-1">
              <StatCard icon={Wallet} label="Available to withdraw" value={`Rs. ${payments.availableAmount || 0}`} color="emerald" valueClass="text-emerald-700" />
            </div>
            <StatCard icon={IndianRupee} label="Total earned" value={`Rs. ${payments.earnedAmount || 0}`} color="lime" />
            <StatCard icon={Clock} label="Pending requests" value={pendingPayouts} color="amber" valueClass="text-amber-600" />
          </>
        ) : null}
      </div>

      {notice ? (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`m-0 mt-6 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
            notice.tone === 'error' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-lime-50 text-lime-800 ring-1 ring-lime-200'
          }`}
        >
          {notice.tone === 'error' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <Check size={16} className="mt-0.5 shrink-0" />}
          <span className="min-w-0 flex-1 break-words">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100">
            <X size={16} />
          </button>
        </p>
      ) : null}

      {/* ---------------- ORDERS ---------------- */}
      {view === 'orders' ? (
        <Panel icon={ShoppingBag} title="Customer orders" hint={rows.length ? `${visibleOrders.length} shown` : undefined}>
          {loading ? (
            <Skeleton />
          ) : rows.length === 0 ? (
            <Empty icon={Inbox} title="No orders yet" text="When a customer orders your products, the order will appear here." />
          ) : (
            <>
              <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter orders by status">
                {(['all', 'pending', 'processing', 'completed'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={orderFilter === key}
                    onClick={() => setOrderFilter(key)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
                      orderFilter === key ? 'bg-lime-600 text-white shadow-md shadow-lime-600/25' : 'bg-neutral-100 text-neutral-600 hover:bg-lime-50 hover:text-lime-800'
                    }`}
                  >
                    {key}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${orderFilter === key ? 'bg-white/25 text-white' : 'bg-white text-neutral-500'}`}>{orderCounts[key]}</span>
                  </button>
                ))}
              </div>

              {visibleOrders.length === 0 ? (
                <Empty icon={Inbox} title={`No ${orderFilter} orders`} text="Try another filter to see your other orders." />
              ) : (
                <div className="grid gap-4">
                  {visibleOrders.map((order) => {
                    const status = order.status || 'pending';
                    const next = status === 'pending' ? 'processing' : status === 'processing' ? 'completed' : '';
                    const currentStep = orderSteps.indexOf(status);
                    let items: RecordValue[] = [];
                    try {
                      items = JSON.parse(order.items || '[]');
                    } catch {
                      /* malformed legacy data */
                    }
                    return (
                      <article key={order.id} className="min-w-0 overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200 transition hover:shadow-lg hover:shadow-lime-900/10 hover:ring-lime-300">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-gradient-to-r from-lime-50/80 to-white px-4 py-4 sm:px-5">
                          <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-lime-600 shadow-sm ring-1 ring-lime-100">
                              <ShoppingBag size={20} />
                            </span>
                            <div>
                              <h3 className="m-0 text-lg font-bold text-neutral-900">Order #{order.id}</h3>
                              {order.createdAt ? <p className="m-0 text-xs text-neutral-500">{formatDate(order.createdAt)}</p> : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <b className="text-xl font-extrabold text-lime-700">Rs. {order.total}</b>
                            <StatusBadge status={status} />
                          </div>
                        </div>

                        <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-2">
                          <div className="min-w-0 space-y-2 text-sm text-neutral-600">
                            <p className="m-0 flex items-center gap-2 font-semibold text-neutral-900"><User size={15} className="shrink-0 text-lime-600" />{order.customerName || 'Customer'}</p>
                            <p className="m-0 flex items-center gap-2 break-all"><Mail size={15} className="shrink-0 text-lime-600" />{order.email || 'No email'}</p>
                            <p className="m-0 flex items-center gap-2"><Phone size={15} className="shrink-0 text-lime-600" />{order.phone || 'No phone'}</p>
                            <p className="m-0 flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-lime-600" /><span className="min-w-0 break-words">{order.shippingAddress || order.billingAddress || 'Address not available'}</span></p>
                          </div>
                          <div className="min-w-0 rounded-xl bg-neutral-50 p-3.5 ring-1 ring-neutral-100">
                            <p className="m-0 mb-2 text-xs font-bold text-neutral-500">Items ordered</p>
                            {items.length ? (
                              <ul className="m-0 grid list-none gap-1.5 p-0 text-sm">
                                {items.map((item, index) => (
                                  <li key={index} className="flex items-center justify-between gap-3">
                                    <span className="min-w-0 truncate font-medium text-neutral-800">{item.name || 'Product'}</span>
                                    <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-lime-700 ring-1 ring-lime-100">× {item.quantity || 1}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="m-0 text-sm text-neutral-500">Order items unavailable</p>
                            )}
                          </div>
                        </div>

                        {currentStep >= 0 ? (
                          <ol className="m-0 grid list-none grid-cols-3 px-4 pb-1 sm:px-5" aria-label={`Order status: ${status}`}>
                            {orderSteps.map((step, index) => {
                              const done = index < currentStep || (index === currentStep && step === 'completed');
                              const active = index === currentStep && !done;
                              return (
                                <li key={step} className="relative flex flex-col items-center text-center">
                                  {index > 0 ? <span className={`absolute left-[-50%] top-3.5 h-0.5 w-full -translate-y-1/2 ${index <= currentStep ? 'bg-lime-500' : 'bg-neutral-200'}`} /> : null}
                                  <span
                                    className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                                      done ? 'bg-lime-500 text-white' : active ? 'border-2 border-lime-500 bg-white text-lime-700 ring-4 ring-lime-500/20' : 'bg-neutral-200 text-neutral-400'
                                    }`}
                                  >
                                    {done ? <Check size={14} strokeWidth={3} /> : index + 1}
                                  </span>
                                  <span className={`mt-1.5 text-[11px] font-semibold capitalize sm:text-xs ${index <= currentStep ? 'text-lime-800' : 'text-neutral-400'}`}>{step}</span>
                                </li>
                              );
                            })}
                          </ol>
                        ) : null}

                        <div className="flex flex-wrap items-center justify-end gap-3 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                          {next ? (
                            <button disabled={busy} type="button" className={`${primaryButtonClasses} w-full sm:w-auto`} onClick={() => updateOrder(order.id, next)}>
                              {next === 'processing' ? 'Start processing' : 'Mark completed'}
                            </button>
                          ) : status === 'completed' ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-lime-700"><Check size={16} strokeWidth={3} /> Order completed</span>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Panel>
      ) : null}

      {/* ---------------- INVENTORY ---------------- */}
      {view === 'inventory' ? (
        <>
          <Panel icon={Package} title="Current stock" hint={products.length ? `${visibleProducts.length} of ${products.length} products` : undefined}>
            {loading ? (
              <Skeleton />
            ) : products.length === 0 ? (
              <Empty icon={Package} title="No products yet" text="Add products from your dashboard and manage their stock here." />
            ) : (
              <>
                <div className="relative mb-5">
                  <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search by product name or SKU" className={`${inputClasses} pl-11`} aria-label="Search products" />
                </div>
                {visibleProducts.length === 0 ? (
                  <Empty icon={Search} title="No matching products" text="Check the spelling or try a different SKU." />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {visibleProducts.map((product) => {
                      const { quantity, label } = stockInfo(product);
                      return (
                        <article key={product.id} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-neutral-200 transition hover:shadow-lg hover:shadow-lime-900/10 hover:ring-lime-300">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl text-xl font-extrabold ${label === 'out of stock' ? 'bg-red-50 text-red-600' : label === 'low stock' ? 'bg-amber-50 text-amber-600' : 'bg-lime-50 text-lime-700'}`}>
                              {quantity}
                            </div>
                            <div className="min-w-0">
                              <h3 className="m-0 truncate font-bold text-neutral-900">{product.name}</h3>
                              <p className="m-0 mb-1 truncate text-xs text-neutral-500">{product.sku ? `SKU ${product.sku}` : 'No SKU'}</p>
                              <StatusBadge status={label} />
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button disabled={busy || quantity <= 0} onClick={() => adjustInventory(product.id, -1)} aria-label={`Decrease stock of ${product.name}`} className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40">
                              <Minus size={18} />
                            </button>
                            <button disabled={busy} onClick={() => adjustInventory(product.id, 1)} aria-label={`Increase stock of ${product.name}`} className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-lime-500 to-lime-600 text-white shadow-md shadow-lime-600/25 transition hover:from-lime-600 hover:to-lime-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
                              <Plus size={18} />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </Panel>

          <Panel icon={HistoryIcon} title="Adjustment history" hint="Every stock change, newest first as returned by the server">
            {loading ? (
              <Skeleton />
            ) : rows.length === 0 ? (
              <Empty icon={HistoryIcon} title="No adjustments yet" text="Use the + and − buttons above and the change will be logged here." />
            ) : (
              <div className="grid gap-2.5">
                {rows.map((row) => {
                  const quantity = Number(row.quantity || 0);
                  const positive = quantity >= 0;
                  return (
                    <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-3.5 ring-1 ring-neutral-100">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${positive ? 'bg-lime-100 text-lime-700' : 'bg-red-100 text-red-600'}`}>
                          {positive ? <Plus size={18} /> : <Minus size={18} />}
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 font-bold capitalize text-neutral-900">{(row.type || 'Adjustment').toString().replaceAll('_', ' ')}</p>
                          <p className="m-0 text-xs text-neutral-500">{formatDate(row.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold text-neutral-500">{row.previousStock} → <span className="text-neutral-900">{row.newStock}</span></span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${positive ? 'bg-lime-100 text-lime-800 ring-lime-200' : 'bg-red-100 text-red-700 ring-red-200'}`}>
                          {positive ? '+' : ''}{quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </>
      ) : null}

      {/* ---------------- PAYOUTS ---------------- */}
      {view === 'payouts' ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel icon={Landmark} title="Payout details" hint="Where we send your settlements">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  savePayment(event.currentTarget);
                }}
              >
                <input type="hidden" name="method" value={payoutMethod} />
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-neutral-100 p-1.5" role="radiogroup" aria-label="Payout method">
                  {[
                    { key: 'upi', label: 'UPI', icon: Smartphone },
                    { key: 'bank', label: 'Bank account', icon: Landmark },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={payoutMethod === key}
                      onClick={() => setPayoutMethod(key)}
                      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${payoutMethod === key ? 'bg-white text-lime-800 shadow-sm ring-1 ring-lime-200' : 'text-neutral-500 hover:text-neutral-800'}`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* both groups stay in the form so saving never wipes the other method's details */}
                <div className={`mt-4 grid gap-3 ${payoutMethod === 'upi' ? '' : 'hidden'}`}>
                  <label className="block text-sm font-semibold text-neutral-700">
                    UPI ID
                    <input name="upi" defaultValue={payments.payoutProfile?.upi || ''} placeholder="name@bank" className={`${inputClasses} mt-1.5`} />
                  </label>
                </div>
                <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${payoutMethod === 'bank' ? '' : 'hidden'}`}>
                  <label className="block text-sm font-semibold text-neutral-700 sm:col-span-2">
                    Account holder name
                    <input name="accountName" defaultValue={payments.payoutProfile?.accountName || ''} placeholder="Account holder name" className={`${inputClasses} mt-1.5`} />
                  </label>
                  <label className="block text-sm font-semibold text-neutral-700">
                    Account number
                    <input name="accountNumber" defaultValue={payments.payoutProfile?.accountNumber || ''} placeholder="Account number" className={`${inputClasses} mt-1.5`} />
                  </label>
                  <label className="block text-sm font-semibold text-neutral-700">
                    IFSC code
                    <input name="ifsc" defaultValue={payments.payoutProfile?.ifsc || ''} placeholder="IFSC code" className={`${inputClasses} mt-1.5`} />
                  </label>
                </div>

                <button disabled={busy} className={`${primaryButtonClasses} mt-5 w-full`}>
                  <Check size={16} strokeWidth={3} /> Save payout details
                </button>
              </form>
            </Panel>

            <Panel icon={IndianRupee} title="Request a payout" hint={`Available now: Rs. ${available}`}>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  requestPayout();
                }}
              >
                <label className="block text-sm font-semibold text-neutral-700">
                  Amount
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">Rs.</span>
                    <input required min="1" max={available > 0 ? available : undefined} name="amount" type="number" value={payoutAmount} onChange={(event) => setPayoutAmount(event.target.value)} placeholder="0" className={`${inputClasses} pl-14`} />
                  </div>
                </label>
                <button type="button" disabled={available <= 0} onClick={() => setPayoutAmount(String(available))} className="mt-2 text-sm font-bold text-lime-700 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50">
                  Withdraw full amount (Rs. {available})
                </button>
                <button disabled={busy || available <= 0} className={`${primaryButtonClasses} mt-5 w-full`}>
                  <Wallet size={16} /> Request payout
                </button>
                {available <= 0 ? <p className="m-0 mt-3 text-center text-xs text-neutral-500">You can request a payout once you have an available balance.</p> : null}
              </form>
            </Panel>
          </div>

          <Panel icon={HistoryIcon} title="Payout requests" hint={rows.length ? `${rows.length} total` : undefined}>
            {loading ? (
              <Skeleton />
            ) : rows.length === 0 ? (
              <Empty icon={Wallet} title="No payout requests yet" text="Your requests and their status will show up here." />
            ) : (
              <div className="grid gap-2.5">
                {rows.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-lime-600 ring-1 ring-neutral-100"><IndianRupee size={20} /></span>
                      <div>
                        <p className="m-0 text-lg font-extrabold text-neutral-900">Rs. {row.amount}</p>
                        <p className="m-0 text-xs text-neutral-500">{formatDate(row.createdAt)}</p>
                      </div>
                    </div>
                    <StatusBadge status={row.status || 'pending'} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      ) : null}
    </section>
  );
};

export default VendorOperations;