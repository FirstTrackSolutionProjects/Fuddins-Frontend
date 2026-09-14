import { useMemo, useState } from 'react';
import { resolveAssetUrl } from '../config';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../types';

interface CartPageProps {
  cartItems: CartItem[];
  onRemoveItem: (key: string) => void;
  onUpdateQuantity: (key: string, quantity: number) => void;
  couponCode: string;
  discount: number;
  onCouponApplied: (code: string, discount: number) => void;
}

const cartKey = (item: CartItem) => `${item.product.id}:${item.variation?.id || 'default'}`;
const itemPrice = (item: CartItem) => Number(item.variation?.salePrice || item.variation?.price || item.product.salePrice || item.product.price || 0);
const variationLabel = (item: CartItem) => Object.values(item.variation?.attributes || {}).filter(Boolean).join(' / ') || item.variation?.title || '';

const CartPage = ({ cartItems, onRemoveItem, onUpdateQuantity, couponCode, discount, onCouponApplied }: CartPageProps) => {
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(couponCode);
  const [couponMessage, setCouponMessage] = useState('');
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0), [cartItems]);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const total = subtotal + gst;
  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) { setCouponMessage('Enter a coupon code.'); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Coupon is not valid');
      onCouponApplied(result.code, Number(result.discount || 0));
      setCouponMessage(`Coupon ${result.code} applied — ₹${Number(result.discount || 0).toFixed(2)} saved.`);
    } catch (error) { setCouponMessage(error instanceof Error ? error.message : 'Coupon is not valid'); }
  };

  return <section className="cart-page">
    <h1>Cart</h1>
    {!cartItems.length ? <div className="cart-empty">Your cart is currently empty.</div> : <>
      <p className="cart-notice">● Products have been added to your cart. <a href="#cart-table">View Cart</a></p>
      <div className="cart-table" id="cart-table">
        <div className="cart-table-head"><span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span></div>
        {cartItems.map((item) => {
          const key = cartKey(item);
          const price = itemPrice(item);
          const image = resolveAssetUrl(item.product.imageUrl);
          const option = variationLabel(item);
          return <article className="cart-table-row" key={key}>
            <div className="cart-product-cell">
              <button type="button" className="cart-remove" aria-label={`Remove ${item.product.name}`} onClick={() => onRemoveItem(key)}>×</button>
              <div className="cart-thumb">{image ? <img src={image} alt="" /> : null}</div>
              <div><strong>{item.product.name}{option ? ` - ${option}` : ''}</strong><p>Store: <span>{item.product.vendor?.storeName || 'Store unavailable'}</span></p></div>
            </div>
            <span>₹{price.toFixed(2)}</span>
            <input aria-label={`Quantity for ${item.product.name}`} type="number" min="1" value={item.quantity} onChange={(event) => onUpdateQuantity(key, Math.max(1, Number(event.target.value) || 1))} />
            <strong>₹{(price * item.quantity).toFixed(2)}</strong>
          </article>;
        })}
        <div className="cart-coupon-row"><div><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon code" /><button type="button" onClick={() => void applyCoupon()}>APPLY COUPON</button>{couponMessage ? <small>{couponMessage}</small> : null}</div><button type="button" className="cart-update">UPDATE CART</button></div>
      </div>
      <aside className="cart-totals"><h2>Cart totals</h2><p><span>Subtotal</span><b>₹{subtotal.toFixed(2)}</b></p>{discount > 0 ? <p><span>Coupon ({couponCode})</span><b>−₹{Math.min(discount, subtotal).toFixed(2)}</b></p> : null}<p><span>GST</span><b>₹{gst.toFixed(2)}</b></p><p className="cart-total"><span>Total</span><b>₹{Math.max(0, total - discount).toFixed(2)}</b></p><button type="button" onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button></aside>
    </>}
  </section>;
};

export default CartPage;
