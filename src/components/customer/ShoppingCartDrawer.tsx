import { useEffect, useState } from 'react';
import type { CartItem } from '../../types';
import { resolveAssetUrl } from '../../config';

interface ShoppingCartDrawerProps {
  cartItems: CartItem[];
  onClose: () => void;
  onContinueShopping: () => void;
  onRemoveItem: (key: string) => void;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onViewCart: () => void;
  onCheckout: () => void;
}

const itemKey = (item: CartItem) => `${item.product.id}:${item.variation?.id || 'default'}`;
const itemPrice = (item: CartItem) => Number(item.variation?.salePrice || item.variation?.price || item.product.salePrice || item.product.price);

const itemVariation = (item: CartItem) => Object.values(item.variation?.attributes || {}).filter(Boolean).join(' / ') || item.variation?.title || '';

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  x: 'M18 6 6 18 M6 6l12 12',
  trash: 'M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  store: 'M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M9 20v-6h6v6',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  image: 'M21 15l-5-5L5 21 M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  arrow: 'M5 12h14 M12 5l7 7-7 7',
};

const DrawerItem = ({ item, onRemove, onQuantity }: { item: CartItem; onRemove: () => void; onQuantity: (quantity: number) => void }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const image = resolveAssetUrl(item.product.imageUrl);
  const label = itemVariation(item);
  const price = itemPrice(item);
  return (
    <article className="relative flex gap-3.5 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-neutral-100">
      <div className="grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-100">
        {image && !imageFailed ? (
          <img src={image} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-contain p-1" />
        ) : (
          <Ico d={ICON.image} className="h-7 w-7 text-neutral-300" stroke={1.5} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="m-0 break-words pr-8 text-[15px] font-bold leading-snug text-neutral-900">
          {item.product.name}
          {label ? <span className="font-medium text-neutral-500"> - {label}</span> : null}
        </h3>
        <p className="m-0 mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
          <Ico d={ICON.store} className="h-3.5 w-3.5 shrink-0 text-lime-600" />
          <span className="truncate font-medium">{item.product.vendor?.storeName || 'Store unavailable'}</span>
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="inline-flex items-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            <button
              type="button"
              aria-label={`Decrease quantity of ${item.product.name}`}
              onClick={() => onQuantity(Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="grid h-8 w-8 place-items-center text-neutral-700 transition hover:bg-lime-100 hover:text-lime-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Ico d={ICON.minus} className="h-3.5 w-3.5" stroke={2.5} />
            </button>
            <b className="min-w-[30px] bg-white py-1 text-center text-sm text-neutral-900">{item.quantity}</b>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.product.name}`}
              onClick={() => onQuantity(item.quantity + 1)}
              className="grid h-8 w-8 place-items-center text-neutral-700 transition hover:bg-lime-100 hover:text-lime-800"
            >
              <Ico d={ICON.plus} className="h-3.5 w-3.5" stroke={2.5} />
            </button>
          </div>
          <div className="text-right leading-tight">
            <span className="block text-xs text-neutral-500">{item.quantity} × ₹{price.toFixed(2)}</span>
            <b className="text-base font-extrabold text-lime-700">₹{(price * item.quantity).toFixed(2)}</b>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Remove ${item.product.name}`}
        onClick={onRemove}
        className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Ico d={ICON.trash} className="h-4 w-4" />
      </button>
    </article>
  );
};

const ShoppingCartDrawer = ({ cartItems, onClose, onContinueShopping, onRemoveItem, onUpdateQuantity, onViewCart, onCheckout }: ShoppingCartDrawerProps) => {
  const subtotal = cartItems.reduce((sum, item) => sum + itemPrice(item) * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      <style>{`
        @keyframes fuddins-cart-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fuddins-cart-fade { from { opacity: 0; } to { opacity: 1; } }
        .fuddins-cart-in { animation: fuddins-cart-in .32s cubic-bezier(.22,1,.36,1) both; }
        .fuddins-cart-fade { animation: fuddins-cart-fade .25s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .fuddins-cart-in, .fuddins-cart-fade { animation: none; } }
      `}</style>

      <button
        className="fuddins-cart-fade absolute inset-0 h-full w-full cursor-default bg-neutral-900/55 backdrop-blur-sm"
        type="button"
        aria-label="Close shopping cart"
        onClick={onClose}
      />

      <aside className="fuddins-cart-in absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col overflow-hidden bg-neutral-50 shadow-2xl sm:rounded-l-[28px]">
        {/* header */}
        <header className="relative flex shrink-0 items-center justify-between overflow-hidden bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-5 py-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30">
              <Ico d={ICON.bag} className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <h2 className="m-0 font-serif text-2xl font-bold text-white">Shopping Cart</h2>
              {cartItems.length ? (
                <p className="m-0 mt-0.5 text-sm font-medium text-lime-50/90">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 transition hover:bg-white/30 active:scale-95"
          >
            <Ico d={ICON.x} className="h-5 w-5" stroke={2.5} />
          </button>
        </header>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!cartItems.length ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-lime-50 text-lime-600 ring-8 ring-lime-50/70">
                  <Ico d={ICON.bag} className="h-11 w-11" stroke={1.75} />
                </span>
                <p className="m-0 mt-5 font-serif text-xl font-bold text-neutral-900">No products in the cart.</p>
                <p className="mb-0 mt-1.5 text-sm text-neutral-500">Add some products to get started.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {cartItems.map((item) => {
                const key = itemKey(item);
                return (
                  <DrawerItem
                    key={key}
                    item={item}
                    onRemove={() => onRemoveItem(key)}
                    onQuantity={(quantity) => onUpdateQuantity(key, quantity)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* footer */}
        <footer className="shrink-0 border-t border-neutral-200 bg-white px-5 pb-5 pt-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]">
          {cartItems.length ? (
            <>
              <p className="m-0 mb-4 flex items-center justify-between">
                <span className="text-base font-semibold text-neutral-600">Subtotal:</span>
                <b className="text-2xl font-extrabold text-lime-700">₹{subtotal.toFixed(2)}</b>
              </p>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={onViewCart}
                  className="w-full rounded-xl border-2 border-lime-500 bg-white px-6 py-3 text-[15px] font-bold tracking-wide text-lime-700 transition hover:bg-lime-50 active:scale-[0.98]"
                >
                  VIEW CART
                </button>
                <button
                  type="button"
                  onClick={onCheckout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3.5 text-[15px] font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
                >
                  CHECKOUT <Ico d={ICON.arrow} className="h-4 w-4" stroke={2.5} />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onContinueShopping}
              className="w-full rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3.5 text-[15px] font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
            >
              CONTINUE SHOPPING
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
};

export default ShoppingCartDrawer;