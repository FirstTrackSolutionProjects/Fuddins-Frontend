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

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  trash: 'M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  tag: 'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  store: 'M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M9 20v-6h6v6',
  check: 'M20 6 9 17l-5-5',
  arrow: 'M5 12h14 M12 5l7 7-7 7',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  image: 'M21 15l-5-5L5 21 M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
};

const isCouponError = (text: string) => /not valid|enter a coupon|invalid|expired|unable|error|minimum/i.test(text);

interface CartRowProps {
  item: CartItem;
  onRemove: () => void;
  onQuantity: (quantity: number) => void;
}

const CartRow = ({ item, onRemove, onQuantity }: CartRowProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const price = itemPrice(item);
  const image = resolveAssetUrl(item.product.imageUrl);
  const option = variationLabel(item);
  return (
    <article className="relative grid grid-cols-[84px_1fr] gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 transition hover:shadow-md sm:grid-cols-[96px_1fr_auto] sm:items-center sm:gap-5 sm:p-5">
      <div className="grid h-[84px] w-[84px] place-items-center overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-100 sm:h-24 sm:w-24">
        {image && !imageFailed ? (
          <img src={image} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-contain p-1" />
        ) : (
          <Ico d={ICON.image} className="h-8 w-8 text-neutral-300" stroke={1.5} />
        )}
      </div>

      <div className="min-w-0">
        <h2 className="m-0 break-words pr-8 text-base font-bold leading-snug text-neutral-900 sm:pr-0">
          {item.product.name}
          {option ? <span className="font-medium text-neutral-500"> - {option}</span> : null}
        </h2>
        <p className="m-0 mt-1.5 flex items-center gap-1.5 text-sm text-neutral-500">
          <Ico d={ICON.store} className="h-3.5 w-3.5 shrink-0 text-lime-600" />
          <span className="truncate font-medium">{item.product.vendor?.storeName || 'Store unavailable'}</span>
        </p>
        <p className="m-0 mt-2 text-sm font-semibold text-lime-700">₹{price.toFixed(2)} <span className="font-normal text-neutral-400">each</span></p>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 border-t border-neutral-100 pt-4 sm:col-span-1 sm:flex-col sm:items-end sm:gap-3 sm:border-0 sm:pt-0">
        <div className="inline-flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <button
            type="button"
            aria-label={`Decrease quantity of ${item.product.name}`}
            onClick={() => onQuantity(Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            className="grid h-10 w-10 place-items-center text-neutral-700 transition hover:bg-lime-100 hover:text-lime-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Ico d={ICON.minus} className="h-4 w-4" stroke={2.5} />
          </button>
          <input
            aria-label={`Quantity for ${item.product.name}`}
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) => onQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="h-10 w-12 border-0 bg-white text-center text-[15px] font-bold text-neutral-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label={`Increase quantity of ${item.product.name}`}
            onClick={() => onQuantity(item.quantity + 1)}
            className="grid h-10 w-10 place-items-center text-neutral-700 transition hover:bg-lime-100 hover:text-lime-800"
          >
            <Ico d={ICON.plus} className="h-4 w-4" stroke={2.5} />
          </button>
        </div>
        <strong className="text-xl font-extrabold text-neutral-900">₹{(price * item.quantity).toFixed(2)}</strong>
      </div>

      <button
        type="button"
        aria-label={`Remove ${item.product.name}`}
        onClick={onRemove}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl text-neutral-400 transition hover:bg-red-50 hover:text-red-600 sm:static sm:hidden"
      >
        <Ico d={ICON.trash} className="h-[18px] w-[18px]" />
      </button>
    </article>
  );
};

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
  const updateCart = async () => {
    if (coupon.trim()) {
      await applyCoupon();
      return;
    }
    setCouponMessage('Cart updated. Quantities and totals are current.');
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <h1 className="m-0 font-serif text-4xl font-bold text-neutral-900 sm:text-5xl">Cart</h1>
        {cartItems.length ? (
          <span className="rounded-full bg-lime-100 px-4 py-1.5 text-sm font-bold text-lime-800 ring-1 ring-lime-200">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        ) : null}
      </div>

      {!cartItems.length ? (
        <div className="grid place-items-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-neutral-100 sm:py-20">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-lime-50 text-lime-600 ring-8 ring-lime-50/60">
            <Ico d={ICON.bag} className="h-11 w-11" stroke={1.75} />
          </span>
          <p className="m-0 mt-6 font-serif text-2xl font-bold text-neutral-900">Your cart is currently empty.</p>
          <p className="mb-0 mt-2 text-sm text-neutral-500">Add some products to get started.</p>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-7 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
          >
            Continue shopping <Ico d={ICON.arrow} className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <p className="mb-6 flex items-center gap-2.5 rounded-2xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-900 ring-1 ring-lime-200">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-500 text-white">
              <Ico d={ICON.check} className="h-3.5 w-3.5" stroke={3} />
            </span>
            <span>
              Products have been added to your cart. <a href="#cart-table" className="font-bold text-lime-700 underline">View Cart</a>
            </span>
          </p>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            {/* items */}
            <div id="cart-table" className="grid gap-4">
              {cartItems.map((item) => {
                const key = cartKey(item);
                return (
                  <div key={key} className="group relative">
                    <CartRow item={item} onRemove={() => onRemoveItem(key)} onQuantity={(quantity) => onUpdateQuantity(key, quantity)} />
                    <button
                      type="button"
                      aria-label={`Remove ${item.product.name}`}
                      onClick={() => onRemoveItem(key)}
                      className="absolute right-4 top-4 hidden h-9 w-9 place-items-center rounded-xl text-neutral-400 transition hover:bg-red-50 hover:text-red-600 sm:grid"
                    >
                      <Ico d={ICON.trash} className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                );
              })}

              {/* coupon */}
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lime-600">
                      <Ico d={ICON.tag} className="h-5 w-5" />
                    </span>
                    <input
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                      placeholder="Coupon code"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-500/15"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => void applyCoupon()}
                      className="flex-1 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-lime-500/25 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] sm:flex-none"
                    >
                      APPLY COUPON
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateCart()}
                      className="flex-1 rounded-xl border-2 border-lime-500 bg-white px-5 py-2.5 text-sm font-bold text-lime-700 transition hover:bg-lime-50 active:scale-[0.98] sm:flex-none"
                    >
                      UPDATE CART
                    </button>
                  </div>
                </div>
                {couponMessage ? (
                  <small
                    role="status"
                    className={`mt-3 block rounded-lg px-3 py-2 text-sm font-medium ${
                      isCouponError(couponMessage) ? 'bg-red-50 text-red-700' : 'bg-lime-50 text-lime-800'
                    }`}
                  >
                    {couponMessage}
                  </small>
                ) : null}
              </div>
            </div>

            {/* totals */}
            <aside className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 lg:sticky lg:top-6">
              <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-5">
                <h2 className="m-0 font-serif text-2xl font-bold text-white">Cart totals</h2>
              </div>
              <div className="grid gap-3.5 px-6 py-6 text-[15px]">
                <p className="m-0 flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <b className="text-neutral-900">₹{subtotal.toFixed(2)}</b>
                </p>
                {discount > 0 ? (
                  <p className="m-0 flex items-center justify-between text-lime-700">
                    <span>Coupon ({couponCode})</span>
                    <b>−₹{Math.min(discount, subtotal).toFixed(2)}</b>
                  </p>
                ) : null}
                <p className="m-0 flex items-center justify-between text-neutral-600">
                  <span>GST</span>
                  <b className="text-neutral-900">₹{gst.toFixed(2)}</b>
                </p>
                <p className="m-0 mt-1 flex items-center justify-between border-t border-dashed border-neutral-200 pt-4 text-lg">
                  <span className="font-bold text-neutral-900">Total</span>
                  <b className="text-2xl font-extrabold text-lime-700">₹{Math.max(0, total - discount).toFixed(2)}</b>
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-4 text-[15px] font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
                >
                  PROCEED TO CHECKOUT <Ico d={ICON.arrow} className="h-4 w-4" stroke={2.5} />
                </button>
                <p className="m-0 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                  <Ico d={ICON.lock} className="h-3.5 w-3.5" /> Secure checkout
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  );
};

export default CartPage;