import { useEffect, useMemo, useState } from 'react';
import { API_ORIGIN } from '../../config';
import type { CartItem } from '../../types';

interface CartPanelProps {
  cartItems: CartItem[];
  onClearCart?: () => void;
  onRemoveItem?: (cartKey: string) => void;
  onUpdateQuantity?: (cartKey: string, quantity: number) => void;
  onOrderPlaced?: () => void;
}

const cartItemKey = (item: CartItem) => `${item.product.id}:${item.variation?.id || 'default'}`;
const itemPrice = (item: CartItem) => Number(item.variation?.salePrice || item.variation?.price || item.product.salePrice || item.product.price);
const variationLabel = (item: CartItem) => {
  const attributes = item.variation?.attributes || {};
  const values = Object.values(attributes).filter(Boolean);
  return values.length ? values.join(' / ') : item.variation?.title || '';
};

const paymentButtonBaseClasses = 'min-h-[42px] rounded border !border-neutral-300 px-2 text-center';
const paymentActiveClasses = '!bg-lime-600 !border-lime-600 !text-white';
const paymentInactiveClasses = '!bg-white text-neutral-600';

const CartPanel = ({ cartItems, onClearCart, onRemoveItem, onUpdateQuantity, onOrderPlaced }: CartPanelProps) => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [pendingPayment, setPendingPayment] = useState<{ orderId: number; email: string } | null>(null);
  const [message, setMessage] = useState('');

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0), [cartItems]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('fuddins-pending-payment');
      if (saved) setPendingPayment(JSON.parse(saved));
    } catch {
      sessionStorage.removeItem('fuddins-pending-payment');
    }
  }, []);

  const checkoutPayload = () => ({
    customerName,
    email,
    phone,
    billingAddress,
    shippingAddress,
    couponCode,
    items: cartItems.map((item) => ({ productId: item.product.id, variationId: item.variation?.id || null, quantity: item.quantity })),
  });

  const handleCheckout = async () => {
    if (!customerName || !email) {
      setMessage('Please enter name and email');
      return;
    }

    if (cartItems.length === 0) {
      setMessage('Cart is empty');
      return;
    }

    const endpoint = paymentMethod === 'online' ? '/payments/razorpay/payment-link' : '/orders';
    const response = await fetch(`${API_ORIGIN}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload()),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || 'Unable to place order');
      return;
    }
    if (paymentMethod === 'online') {
      const payment = { orderId: result.orderId, email };
      sessionStorage.setItem('fuddins-pending-payment', JSON.stringify(payment));
      setPendingPayment(payment);
      setMessage('Opening secure Razorpay payment page...');
      window.location.assign(result.paymentUrl);
      return;
    }
    if (response.ok) {
      setMessage('Order placed successfully');
      setCustomerName('');
      setEmail('');
      setPhone('');
      setBillingAddress('');
      setShippingAddress('');
      setCouponCode('');
      onClearCart?.();
      onOrderPlaced?.();
    }
  };

  const refreshPayment = async () => {
    if (!pendingPayment) return;
    const response = await fetch(`${API_ORIGIN}/payments/orders/${pendingPayment.orderId}/status?email=${encodeURIComponent(pendingPayment.email)}`);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || 'Unable to check payment status');
      return;
    }
    if (result.paymentStatus === 'paid') {
      sessionStorage.removeItem('fuddins-pending-payment');
      setPendingPayment(null);
      onClearCart?.();
      onOrderPlaced?.();
      setMessage('Payment successful. Your order is confirmed.');
    } else {
      setMessage('Payment status: pending. Complete payment in Razorpay, then refresh.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold">Cart & Checkout</h3>
      <div className="mt-4 space-y-3">
        {cartItems.length === 0 ? <p className="text-sm text-slate-400">Cart is empty.</p> : null}
        {cartItems.map((item) => {
          const key = cartItemKey(item);
          const optionLabel = variationLabel(item);
          return (
          <div key={key} className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
            <div className="flex items-center justify-between gap-3">
              <span>{item.product.name}</span>
              <span className="font-extrabold text-[#164e28]">Rs. {itemPrice(item) * item.quantity}</span>
            </div>
            {optionLabel ? <p className="mt-1.5 text-xs text-neutral-500">{optionLabel}</p> : null}
            <div className="mt-3 flex items-center gap-2">
              <button className="h-8 w-8 rounded-lg bg-slate-800" type="button" onClick={() => onUpdateQuantity?.(key, item.quantity - 1)}>
                -
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button className="h-8 w-8 rounded-lg bg-slate-800" type="button" onClick={() => onUpdateQuantity?.(key, item.quantity + 1)}>
                +
              </button>
              <button className="ml-auto rounded-lg bg-rose-600 px-3 py-2 text-sm" type="button" onClick={() => onRemoveItem?.(key)}>
                Remove
              </button>
            </div>
          </div>
        );
        })}
      </div>
      <div className="mt-4 space-y-3">
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Billing address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Shipping address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
        <p className="text-sm font-semibold text-slate-700">Payment method</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`${paymentButtonBaseClasses} ${paymentMethod === 'online' ? paymentActiveClasses : paymentInactiveClasses}`}
            type="button"
            onClick={() => setPaymentMethod('online')}
          >
            Online · Razorpay
          </button>
          <button
            className={`${paymentButtonBaseClasses} ${paymentMethod === 'cod' ? paymentActiveClasses : paymentInactiveClasses}`}
            type="button"
            onClick={() => setPaymentMethod('cod')}
          >
            Cash on delivery
          </button>
        </div>
        <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950" type="button" onClick={handleCheckout}>
          {paymentMethod === 'online' ? `Pay securely · Rs. ${total}` : `Place COD order · Rs. ${total}`}
        </button>
        {pendingPayment ? (
          <button
            className={`${paymentButtonBaseClasses} ${paymentInactiveClasses} w-full font-semibold`}
            type="button"
            onClick={() => void refreshPayment()}
          >
            I completed payment · Refresh status
          </button>
        ) : null}
      </div>
      {message && <p className="mt-4 text-sm text-cyan-400">{message}</p>}
    </div>
  );
};

export default CartPanel;
