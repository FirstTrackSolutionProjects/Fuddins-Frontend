import { useState } from 'react';
import { API_ORIGIN } from '../config';

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) { resolve(true); return; }
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(Boolean(window.Razorpay));
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2.25 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  trend: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  verified: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3',
  card: 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M1 10h22',
  x: 'M18 6 6 18 M6 6l12 12',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
} as const;

const modalField =
  'box-border w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';

const PayNowButton = ({ onClick, className = '' }: { onClick: () => void; className?: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Pay ₹999 securely with Razorpay"
    className={`group inline-flex items-center justify-center gap-3.5 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-600 py-3 pl-4 pr-7 text-white shadow-xl shadow-lime-500/30 transition hover:-translate-y-0.5 hover:from-lime-600 hover:to-lime-700 active:translate-y-0 ${className}`}
  >
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30">
      <Ico d={ICON.lock} className="h-5 w-5" />
    </span>
    <span className="text-left leading-tight">
      <b className="block text-lg">Pay Now</b>
      <small className="block text-xs font-medium text-lime-50/90">Secured by Razorpay</small>
    </span>
  </button>
);

const Benefit = ({ icon, title }: { icon: keyof typeof ICON; title: string }) => (
  <li className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-lg shadow-neutral-900/5 ring-1 ring-neutral-100">
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-md shadow-lime-500/30">
      <Ico d={ICON[icon]} className="h-6 w-6" />
    </span>
    <span className="text-base font-bold text-neutral-900">{title}</span>
  </li>
);

const ApplyShoppingCardPage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePayNow = () => { setError(''); setShowPayment(true); };
  const proceedToPay = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true); setError('');
    try {
      const response = await fetch(`${API_ORIGIN}/shopping-card/checkout-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, phone }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.orderId || !result.keyId) throw new Error(result.error || 'Unable to start payment');
      if (!await loadRazorpay() || !window.Razorpay) throw new Error('Razorpay checkout could not be loaded. Please check your internet connection.');
      const razorpay = new window.Razorpay({
        key: result.keyId, amount: result.amount, currency: result.currency, name: 'FUDDINS', description: 'Shopping Card application', order_id: result.orderId,
        prefill: { email: result.email, contact: result.phone }, theme: { color: '#4d8be7' },
        method: { upi: false, card: true, netbanking: true, wallet: true, emi: true },
        handler: async (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch(`${API_ORIGIN}/shopping-card/verify-payment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payment) });
          const verified = await verify.json().catch(() => ({}));
          if (!verify.ok) { setError(verified.error || 'Payment was received but verification failed. Please contact support.'); return; }
          setShowPayment(false); setError(''); alert('Payment successful. Your Shopping Card application has been received.');
        },
        modal: { ondismiss: () => setSubmitting(false) },
      });
      razorpay.open();
      setSubmitting(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start payment');
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col overflow-x-hidden">
      {/* Hero */}
      <div className="bg-gradient-to-b from-lime-50 via-white to-white px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-1.5 text-sm font-bold text-lime-800 ring-1 ring-lime-200">
              <Ico d={ICON.card} className="h-4 w-4" /> Fuddins Shopping Card
            </span>
            <h1 className="mb-0 mt-4 font-serif text-[clamp(30px,5vw,52px)] font-bold leading-tight text-neutral-900">
              Pay ₹999, get ₹1150 groceries
            </h1>
            <p className="mx-auto mb-0 mt-3 max-w-xl text-base text-neutral-600 sm:text-lg">
              Save money with shopping cards and shop for more of the things you love
            </p>
            <div className="mt-7 flex justify-center">
              <PayNowButton onClick={handlePayNow} />
            </div>
          </div>

          <img
            src="/images/d316a61d-7399-460b-878e-ac3be35b1375.webp"
            alt="Get Shopping Card Now - Pay ₹999 only, get ₹1150 groceries"
            className="w-full rounded-3xl shadow-2xl shadow-neutral-900/15 ring-1 ring-neutral-100"
          />
        </div>
      </div>

      {/* What Benefits For You */}
      <div className="bg-neutral-50 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="m-0 text-center font-serif text-3xl font-bold text-neutral-900 sm:text-4xl">What Benefits For you</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-neutral-600">
            Save money with shopping cards and shop for more of the things you love
          </p>

          <div className="mt-12 grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <img
              src="/images/Untitled-design-1-1536x1090.webp"
              alt="Fuddins shopping card front and back"
              className="w-full rounded-3xl object-cover shadow-2xl shadow-neutral-900/15"
            />

            <div>
              <h3 className="mb-6 mt-0 font-serif text-2xl font-bold text-neutral-900 sm:text-3xl">Card benefits you should know</h3>

              <ul className="m-0 mb-8 grid list-none gap-3 p-0">
                <Benefit icon="trend" title="Save More , Shop More" />
                <Benefit icon="verified" title="One time apply card" />
              </ul>

              <PayNowButton onClick={handlePayNow} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment details modal */}
      {showPayment ? (
        <div
          className="fixed inset-0 z-[200] grid place-items-center bg-neutral-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Card payment"
        >
          <form onSubmit={proceedToPay} className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 pb-6 pt-6 text-white">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowPayment(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 transition hover:bg-white/30 active:scale-95"
              >
                <Ico d={ICON.x} className="h-5 w-5" stroke={2.5} />
              </button>
              <p className="relative m-0 text-sm font-medium text-lime-50/90">User Details</p>
              <p className="relative m-0 mt-1 font-serif text-2xl font-bold tracking-wide">FUDDINS</p>
            </div>

            <div className="grid gap-4 px-6 py-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Email <span className="text-red-500">*</span></span>
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={modalField} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Phone <span className="text-red-500">*</span></span>
                <input type="tel" required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" className={modalField} />
              </label>
              {error ? (
                <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                  <Ico d={ICON.alert} className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-words">{error}</span>
                </div>
              ) : null}
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-neutral-100 bg-neutral-50 px-6 py-4">
              <div className="leading-tight">
                <span className="block text-xs font-medium text-neutral-500">Amount</span>
                <b className="text-2xl text-neutral-900">₹ 999.00</b>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Opening Razorpay…' : 'Proceed to Pay'}
              </button>
            </footer>
          </form>
        </div>
      ) : null}
    </section>
  );
};

export default ApplyShoppingCardPage;