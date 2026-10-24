import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_ORIGIN, resolveAssetUrl } from '../config';
import type { Product, ProductVariation } from '../types';

type ProductReview = { id: number; reviewerName: string; rating: number; review: string; createdAt: string };

const variationsOf = (product: Product): ProductVariation[] => { try { return product.variations ? JSON.parse(product.variations) as ProductVariation[] : []; } catch { return []; } };
const label = (item: ProductVariation) => Object.values(item.attributes || {}).filter(Boolean).join(' / ') || item.title || 'Option';

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01',
  store: 'M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M9 20v-6h6v6',
  tag: 'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  barcode: 'M3 5v14 M7 5v14 M11 5v14 M15 5v14 M19 5v14 M21 5v14',
  cart: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
  x: 'M18 6 6 18 M6 6l12 12',
  image: 'M21 15l-5-5L5 21 M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  right: 'm9 18 6-6-6-6',
};

const inputClass =
  'box-border w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-500/15';

const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-lime-500 bg-white px-5 py-3 text-sm font-bold text-lime-700 transition hover:bg-lime-50 active:scale-[0.98]';

const Notice = ({ text, error = false }: { text: string; error?: boolean }) =>
  text ? (
    <p
      role="status"
      className={`m-0 mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
        error ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-lime-50 text-lime-800 ring-1 ring-lime-200'
      }`}
    >
      <Ico d={error ? ICON.alert : ICON.check} className="mt-0.5 h-4 w-4 shrink-0" stroke={error ? 2 : 3} />
      <span className="min-w-0 break-words">{text}</span>
    </p>
  ) : null;

const isErrorText = (text: string) => /unable|fail|sign in with|error/i.test(text);

const Stars = ({ value, className = '' }: { value: number; className?: string }) => (
  <span className={`tracking-wider text-amber-400 ${className}`} aria-label={`${value} out of 5 stars`}>
    {'★'.repeat(Math.round(value))}
    <span className="text-neutral-300">{'★'.repeat(5 - Math.round(value))}</span>
  </span>
);

const MetaRow = ({ icon, name, children }: { icon: keyof typeof ICON; name: string; children: ReactNode }) => (
  <div className="flex items-center gap-3 py-2.5">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime-50 text-lime-700 ring-1 ring-lime-100">
      <Ico d={ICON[icon]} className="h-[18px] w-[18px]" />
    </span>
    <span className="text-sm text-neutral-500">{name}</span>
    <span className="min-w-0 break-words text-sm font-semibold text-neutral-900">{children}</span>
  </div>
);

const RelatedCard = ({ item, onOpen }: { item: Product; onOpen: () => void }) => {
  const [failed, setFailed] = useState(false);
  const src = resolveAssetUrl(item.imageUrl);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-neutral-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-700/10 hover:ring-lime-200"
    >
      <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
        {src && !failed ? (
          <img src={src} alt={item.name} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105" />
        ) : (
          <Ico d={ICON.image} className="h-10 w-10 text-neutral-300" stroke={1.5} />
        )}
      </span>
      <span className="mt-3 text-[11px] font-bold uppercase tracking-wide text-lime-600">{item.category?.name || 'Products'}</span>
      <strong className="mt-1 line-clamp-2 min-h-[2.7em] text-[15px] font-bold leading-snug text-neutral-900 group-hover:text-lime-700">{item.name}</strong>
      <b className="mt-2 text-lg font-extrabold text-neutral-900">₹{Number(item.salePrice || item.price).toFixed(2)}</b>
    </button>
  );
};

type TabKey = 'info' | 'reviews' | 'offers' | 'policies' | 'inquiries';

export default function ProductDetailPage({ products, onAddToCart }: { products: Product[]; onAddToCart: (product: Product) => void }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => String(item.id) === productId);
  const variations = product ? variationsOf(product) : [];
  const [selectedId, setSelectedId] = useState<number | null>(variations[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [askOpen, setAskOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');
  const [reviewItems, setReviewItems] = useState<ProductReview[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [reviewUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user') || 'null') as { name?: string } | null; } catch { return null; } });
  const selected = variations.find((item) => item.id === selectedId) || variations[0];
  const price = Number(selected?.salePrice || selected?.price || product?.salePrice || product?.price || 0);
  const regular = Number(selected?.regularPrice || product?.regularPrice || product?.price || 0);
  const related = useMemo(() => product ? products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 4) : [], [products, product]);
  useEffect(() => {
    setSelectedId(variations[0]?.id || null);
    setQuantity(1);
    setActiveTab('info');
    setImageFailed(false);
  }, [productId]);
  useEffect(() => {
    let active = true;
    setReviewsLoading(true);
    fetch(`${API_ORIGIN}/api/products/${productId}/reviews`)
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to load reviews'); return data; })
      .then((data) => { if (active) { setReviewItems(data.reviews || []); setReviewCount(Number(data.total) || 0); setAverageRating(Number(data.averageRating) || 0); } })
      .catch(() => { if (active) { setReviewItems([]); setReviewCount(0); setAverageRating(0); } })
      .finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [productId]);
  useEffect(() => {
    if (!askOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setAskOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [askOpen]);

  if (!product) {
    return (
      <section className="mx-auto grid w-full max-w-xl place-items-center px-4 py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-lime-50 text-lime-600 ring-8 ring-lime-50/60">
          <Ico d={ICON.alert} className="h-9 w-9" />
        </span>
        <h1 className="m-0 mt-5 font-serif text-3xl font-bold text-neutral-900">Product not found</h1>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700">
          Back to shop
        </Link>
      </section>
    );
  }

  const add = () => { for (let count = 0; count < quantity; count += 1) onAddToCart(selected ? { ...product, variations: JSON.stringify([selected]) } : product); };
  const addToWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/account'); return; }
    const response = await fetch(`${API_ORIGIN}/customer/wishlist/${product.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setNotice(response.ok ? 'Added to your wishlist.' : 'Unable to add this product to wishlist.');
  };
  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // event.currentTarget is null after the first await, so keep the form element.
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const response = await fetch(`${API_ORIGIN}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), subject: `Product inquiry: ${product.name}`, message: data.get('message'), phone: '' }) });
    setNotice(response.ok ? 'Your question has been sent to the seller.' : 'Unable to send the question. Please try again.');
    if (response.ok) { formElement.reset(); setAskOpen(false); }
  };
  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const token = localStorage.getItem('token');
    if (!token) { setReviewNotice('Sign in with the account used for your paid order to submit a review.'); return; }
    const data = new FormData(formElement);
    setReviewBusy(true); setReviewNotice('');
    try {
      const response = await fetch(`${API_ORIGIN}/api/products/${product.id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating: Number(data.get('rating')), review: data.get('review') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit the review.');
      setReviewNotice('Thanks! Your verified-purchase review is waiting for approval.');
      formElement.reset();
    } catch (error) { setReviewNotice(error instanceof Error ? error.message : 'Unable to submit the review. Please try again.'); }
    finally { setReviewBusy(false); }
  };
  const image = resolveAssetUrl(product.imageUrl);
  const onSale = price < regular;
  const discount = onSale && regular > 0 ? Math.round(((regular - price) / regular) * 100) : 0;
  const tabs: Array<[TabKey, string]> = [
    ['info', 'Additional information'],
    ['reviews', `Reviews (${reviewCount})`],
    ['offers', 'More Offers'],
    ['policies', 'Store Policies'],
    ['inquiries', 'Inquiries'],
  ];

  return (
    <section className="mx-auto w-full max-w-[1300px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
      {/* breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-neutral-500" aria-label="Breadcrumb">
        <Link to="/" className="font-medium text-lime-700 no-underline hover:underline">Home</Link>
        <Ico d={ICON.right} className="h-3.5 w-3.5" />
        <Link to="/shop" className="font-medium text-lime-700 no-underline hover:underline">Shop</Link>
        <Ico d={ICON.right} className="h-3.5 w-3.5" />
        <span className="font-semibold text-neutral-800">{product.category?.name || 'Products'}</span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        {/* image */}
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white p-4 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 lg:sticky lg:top-6">
          {onSale ? (
            <span className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-lime-500 to-lime-600 px-4 py-1.5 text-sm font-extrabold text-white shadow-lg">
              {discount > 0 ? `-${discount}%` : 'Sale!'}
            </span>
          ) : null}
          {image && !imageFailed ? (
            <img src={image} alt={product.name} onError={() => setImageFailed(true)} className="h-full w-full object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-neutral-300">
              <Ico d={ICON.image} className="h-16 w-16" stroke={1.5} />
              <span className="text-sm font-medium text-neutral-400">No image</span>
            </span>
          )}
        </div>

        {/* info */}
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 sm:p-8">
          <span className="inline-block rounded-full bg-lime-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-lime-700 ring-1 ring-lime-200">
            {product.category?.name || 'Uncategorized'}
          </span>
          <h1 className="m-0 mt-3 font-serif text-[clamp(30px,4vw,44px)] font-bold leading-tight text-neutral-900">{product.name}</h1>

          {reviewCount && averageRating ? (
            <p className="m-0 mt-2 flex items-center gap-2 text-sm text-neutral-500">
              <Stars value={averageRating} className="text-lg" />
              <span>{averageRating} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-extrabold text-neutral-900">₹{price.toFixed(2)}</span>
            {onSale ? <s className="text-xl text-neutral-400">₹{regular.toFixed(2)}</s> : null}
            {onSale && discount > 0 ? <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-bold text-lime-800">Save {discount}%</span> : null}
          </div>

          {variations.length ? (
            <div className="mt-6 border-t border-neutral-100 pt-5">
              <p className="m-0 mb-3 text-sm font-semibold text-neutral-700">Choose option</p>
              <div className="flex flex-wrap gap-2.5">
                {variations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                      item.id === selected?.id
                        ? 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-md shadow-lime-500/30'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-lime-100 hover:text-lime-800'
                    }`}
                  >
                    {label(item)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* quantity + add */}
          <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row">
            <div className="inline-flex items-center self-start overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 sm:self-auto">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                className="grid h-14 w-12 place-items-center text-neutral-700 transition hover:bg-lime-100 hover:text-lime-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Ico d={ICON.minus} className="h-4 w-4" stroke={2.5} />
              </button>
              <input
                aria-label="Quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="h-14 w-14 border-0 bg-white text-center text-lg font-bold text-neutral-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => current + 1)}
                className="grid h-14 w-12 place-items-center text-neutral-700 transition hover:bg-lime-100 hover:text-lime-800"
              >
                <Ico d={ICON.plus} className="h-4 w-4" stroke={2.5} />
              </button>
            </div>
            <button
              type="button"
              onClick={add}
              className="inline-flex h-14 flex-1 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-8 text-[15px] font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
            >
              <Ico d={ICON.cart} className="h-5 w-5" /> ADD TO CART
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button type="button" className={secondaryButton} onClick={() => void addToWishlist()}>
              <Ico d={ICON.heart} className="h-4 w-4" /> Add to wishlist
            </button>
            <button type="button" className={secondaryButton} onClick={() => setAskOpen(true)}>
              <Ico d={ICON.help} className="h-4 w-4" /> Ask a Question
            </button>
          </div>
          {notice ? <Notice text={notice} error={isErrorText(notice)} /> : null}

          {/* meta */}
          <div className="mt-6 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 px-4 ring-1 ring-neutral-100">
            <MetaRow icon="barcode" name="SKU:">{selected?.sku || product.sku || 'N/A'}</MetaRow>
            <MetaRow icon="tag" name="Category:">
              <Link to="/shop" className="font-semibold text-lime-700 no-underline hover:underline">{product.category?.name || 'Uncategorized'}</Link>
            </MetaRow>
            <MetaRow icon="store" name="Store:">{product.vendor?.storeName || product.brand || 'Store unavailable'}</MetaRow>
          </div>
        </div>
      </div>

      {/* tabs */}
      <section className="mt-10 overflow-hidden rounded-3xl bg-white shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 sm:mt-14">
        <div className="flex overflow-x-auto border-b border-neutral-100 bg-neutral-50 px-2 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden" role="tablist">
          {tabs.map(([key, text]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`relative shrink-0 whitespace-nowrap px-4 py-4 text-sm font-bold transition sm:px-6 ${
                activeTab === key ? 'text-lime-700' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {text}
              <span className={`absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-lime-500 transition-opacity ${activeTab === key ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'info' ? (
            <>
              <h2 className="m-0 font-serif text-2xl font-bold text-neutral-900">Additional information</h2>
              <p className="mb-0 mt-3 text-base leading-relaxed text-neutral-700">
                {product.fullDescription || product.description || 'Product information is available from the seller.'}
              </p>
            </>
          ) : null}

          {activeTab === 'reviews' ? (
            <>
              <h2 className="m-0 font-serif text-2xl font-bold text-neutral-900">Customer reviews</h2>
              {reviewCount && averageRating ? (
                <p className="mb-0 mt-2 flex items-center gap-2 text-sm text-neutral-600">
                  <Stars value={averageRating} className="text-lg" />
                  <span>{averageRating} out of 5 · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
                </p>
              ) : null}

              {reviewsLoading ? (
                <p className="mt-4 text-neutral-500">Loading reviews…</p>
              ) : reviewItems.length ? (
                <div className="mt-5 grid gap-4">
                  {reviewItems.map((item) => (
                    <article key={item.id} className="rounded-2xl bg-neutral-50 p-5 ring-1 ring-neutral-100">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <b className="text-neutral-900">{item.reviewerName}</b>
                        <span className="text-amber-400" aria-label={`${item.rating} out of 5 stars`}>
                          {'★'.repeat(item.rating)}<span className="text-neutral-300">{'★'.repeat(5 - item.rating)}</span>
                        </span>
                      </div>
                      <time className="mt-1 block text-xs text-neutral-400">{new Date(item.createdAt).toLocaleDateString()}</time>
                      <p className="mb-0 mt-3 text-neutral-700">{item.review}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-neutral-50 px-5 py-6 text-center text-neutral-500 ring-1 ring-neutral-100">There are no approved reviews yet.</p>
              )}

              {reviewNotice ? <Notice text={reviewNotice} error={isErrorText(reviewNotice)} /> : null}

              {reviewUser ? (
                <form className="mt-6 grid gap-4 rounded-2xl bg-lime-50/50 p-5 ring-1 ring-lime-100 sm:p-6" onSubmit={(event) => void submitReview(event)}>
                  <h3 className="m-0 font-serif text-xl font-bold text-neutral-900">Review this product</h3>
                  <p className="m-0 text-sm text-neutral-600">Signed in as {reviewUser.name || 'customer'}. Reviews require a paid order and admin approval.</p>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Your rating</span>
                    <select name="rating" required defaultValue="" className={inputClass}>
                      <option value="" disabled>Select rating</option>
                      <option value="5">★★★★★</option>
                      <option value="4">★★★★</option>
                      <option value="3">★★★</option>
                      <option value="2">★★</option>
                      <option value="1">★</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Your review</span>
                    <textarea name="review" required minLength={5} maxLength={4000} rows={4} className={`${inputClass} resize-y`} />
                  </label>
                  <button
                    disabled={reviewBusy}
                    className="justify-self-start rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-7 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reviewBusy ? 'SUBMITTING…' : 'SUBMIT REVIEW'}
                  </button>
                </form>
              ) : (
                <p className="mb-0 mt-5">
                  <Link to="/account" className="font-semibold text-lime-700 hover:underline">Sign in with your account to review a purchased product.</Link>
                </p>
              )}
            </>
          ) : null}

          {activeTab === 'offers' ? (
            <>
              <h2 className="m-0 font-serif text-2xl font-bold text-neutral-900">More Offers</h2>
              <p className="mb-0 mt-3 text-neutral-700">No more offers for this product!</p>
            </>
          ) : null}

          {activeTab === 'policies' ? (
            <>
              <h2 className="m-0 font-serif text-2xl font-bold text-neutral-900">Store Policies</h2>
              <p className="mb-0 mt-3 text-neutral-700">Seller policies and return details will be confirmed by the store when your order is placed.</p>
            </>
          ) : null}

          {activeTab === 'inquiries' ? (
            <>
              <h2 className="m-0 font-serif text-2xl font-bold text-neutral-900">General Inquiries</h2>
              <p className="mb-0 mt-3 text-neutral-700">There are no inquiries yet.</p>
              <button type="button" className={`${secondaryButton} mt-5`} onClick={() => setAskOpen(true)}>
                <Ico d={ICON.help} className="h-4 w-4" /> Ask a Question
              </button>
            </>
          ) : null}
        </div>
      </section>

      {/* related */}
      {related.length ? (
        <section className="mt-12 sm:mt-16">
          <h2 className="m-0 mb-6 flex items-center gap-3 font-serif text-2xl font-bold text-neutral-900 sm:text-4xl">
            <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-600 sm:h-10" />
            Related products
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => <RelatedCard key={item.id} item={item} onOpen={() => navigate(`/product/${item.id}`)} />)}
          </div>
        </section>
      ) : null}

      {/* ask a question modal */}
      {askOpen ? (
        <div
          className="fixed inset-0 z-[300] grid place-items-center bg-neutral-900/60 p-4 backdrop-blur-sm"
          onMouseDown={() => setAskOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Ask a Question"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-5">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
              <h2 className="relative m-0 font-serif text-2xl font-bold text-white">Ask a Question</h2>
              <p className="relative mb-0 mt-1 line-clamp-1 text-sm text-lime-50/90">{product.name}</p>
              <button
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/20 text-white ring-1 ring-white/30 transition hover:bg-white/30 active:scale-95"
                type="button"
                aria-label="Close"
                onClick={() => setAskOpen(false)}
              >
                <Ico d={ICON.x} className="h-5 w-5" stroke={2.5} />
              </button>
            </div>
            <form onSubmit={submitInquiry} className="grid gap-4 p-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Name <span className="text-red-500">*</span></span>
                <input name="name" required className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Email <span className="text-red-500">*</span></span>
                <input name="email" type="email" required className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Your inquiry <span className="text-red-500">*</span></span>
                <textarea name="message" required rows={4} className={`${inputClass} resize-y`} />
              </label>
              <button className="rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3.5 text-[15px] font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]">
                SUBMIT
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}