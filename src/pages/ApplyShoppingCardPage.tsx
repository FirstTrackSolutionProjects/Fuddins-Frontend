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
    <section className="flex flex-col">
      {/* Hero promo banner */}
      <div className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <img
            src="/images/d316a61d-7399-460b-878e-ac3be35b1375.webp"
            alt="Get Shopping Card Now - Pay ₹999 only, get ₹1150 groceries"
            className="w-full rounded-sm border border-neutral-200"
          />
        </div>
      </div>

      {/* What Benefits For You */}
      <div className="bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-4xl font-bold text-neutral-900">What Benefits For you</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-neutral-600">
            Save money with shopping cards and shop for more of the things you love
          </p>

          <div className="mt-14 grid items-center gap-12 md:grid-cols-2">
            <img
              src="/images/Untitled-design-1-1536x1090.webp"
              alt="Fuddins shopping card front and back"
              className="w-full rounded-sm object-cover"
            />

            <div>
              <h3 className="mb-6 text-2xl font-bold text-neutral-900">Card benefits you should know</h3>

              <ul className="mb-8 flex flex-col gap-4">
                <li className="flex items-center gap-3 text-base text-neutral-800">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-900" />
                  Save More , Shop More
                </li>
                <li className="flex items-center gap-3 text-base text-neutral-800">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-900" />
                  One time apply card
                </li>
              </ul>

              <button type="button" onClick={handlePayNow} className="razorpay-pay-now" aria-label="Pay ₹999 securely with Razorpay">
                <span className="razorpay-mark" aria-hidden="true">↗</span>
                <span><b>Pay Now</b><small>Secured by Razorpay</small></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPayment ? <div className="shopping-card-payment-backdrop" role="dialog" aria-modal="true" aria-label="Shopping Card payment">
        <form className="shopping-card-payment-modal" onSubmit={proceedToPay}>
          <button type="button" className="shopping-card-payment-close" aria-label="Close" onClick={() => setShowPayment(false)}>×</button>
          <div className="shopping-card-payment-head"><small>User Details</small><div><span>←</span><strong>FUDDINS</strong></div></div>
          <div className="shopping-card-payment-body"><label>Email *<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Phone *<input type="tel" required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>{error ? <p className="shopping-card-payment-error">{error}</p> : null}</div>
          <footer><b>₹ 999.00</b><button type="submit" disabled={submitting}>{submitting ? 'Opening Razorpay…' : 'Proceed to Pay'}</button></footer>
        </form>
      </div> : null}
    </section>
  );
};

export default ApplyShoppingCardPage;
