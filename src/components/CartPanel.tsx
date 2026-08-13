import { useMemo, useState } from 'react';
import { API_ORIGIN } from '../config';
import type { CartItem } from '../types';

interface CartPanelProps {
  cartItems: CartItem[];
  onClearCart?: () => void;
  onRemoveItem?: (productId: number) => void;
  onUpdateQuantity?: (productId: number, quantity: number) => void;
  onOrderPlaced?: () => void;
}

const CartPanel = ({ cartItems, onClearCart, onRemoveItem, onUpdateQuantity, onOrderPlaced }: CartPanelProps) => {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cartItems]);

  const handleCheckout = async () => {
    if (!customerName || !email) {
      setMessage('Please enter name and email');
      return;
    }

    if (cartItems.length === 0) {
      setMessage('Cart is empty');
      return;
    }

    const response = await fetch(`${API_ORIGIN}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        email,
        phone,
        billingAddress,
        shippingAddress,
        couponCode,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }),
    });

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
    } else {
      setMessage('Unable to place order');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold">Cart & Checkout</h3>
      <div className="mt-4 space-y-3">
        {cartItems.length === 0 ? <p className="text-sm text-slate-400">Cart is empty.</p> : null}
        {cartItems.map((item) => (
          <div key={item.product.id} className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span>{item.product.name}</span>
              <span className="text-cyan-400">Rs. {item.product.price * item.quantity}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="h-8 w-8 rounded-lg bg-slate-800" type="button" onClick={() => onUpdateQuantity?.(item.product.id, item.quantity - 1)}>
                -
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button className="h-8 w-8 rounded-lg bg-slate-800" type="button" onClick={() => onUpdateQuantity?.(item.product.id, item.quantity + 1)}>
                +
              </button>
              <button className="ml-auto rounded-lg bg-rose-600 px-3 py-2 text-sm" type="button" onClick={() => onRemoveItem?.(item.product.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Billing address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Shipping address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
        <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950" type="button" onClick={handleCheckout}>
          Checkout Rs. {total}
        </button>
      </div>
      {message && <p className="mt-4 text-sm text-cyan-400">{message}</p>}
    </div>
  );
};

export default CartPanel;
