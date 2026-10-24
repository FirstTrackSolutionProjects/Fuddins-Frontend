import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolveAssetUrl } from '../config';
import type { CartItem, Category, Page, Product, ProductVariation } from '../types';

interface ShopPageProps {
  categories: Category[]; products: Product[]; pages: Page[]; cartItems: CartItem[]; search: string; selectedCategory: string;
  selectedVariations: Record<number, number>; loading: boolean;
  onSearchChange: (value: string) => void; onCategoryChange: (value: string) => void;
  onVariationChange: (productId: number, variationId: number) => void; onAddToCart: (product: Product) => void;
  onClearCart: () => void; onRemoveCartItem: (key: string) => void; onUpdateQuantity: (key: string, quantity: number) => void;
  onOrderPlaced: () => void; onOpenPage: (slug: string) => void;
}

const parseVariations = (product: Product): ProductVariation[] => {
  try { return product.variations ? JSON.parse(product.variations) as ProductVariation[] : []; } catch { return []; }
};
const variationName = (variation: ProductVariation) => Object.values(variation.attributes || {}).filter(Boolean).join(' / ') || variation.title || `Option #${variation.id}`;

type SortOrder = 'default' | 'popularity' | 'rating' | 'latest' | 'price-low' | 'price-high';

const isOnSale = (product: Product, variation?: ProductVariation) => {
  const regular = Number(variation?.regularPrice || product.regularPrice || 0);
  const sale = Number(variation?.salePrice || product.salePrice || 0);
  return regular > 0 && sale > 0 && sale < regular;
};

const cardPrice = (product: Product, variation?: ProductVariation) =>
  Number(variation?.salePrice || variation?.price || product.salePrice || product.price || 0);

const ratingScore = (product: Product) => Number((product as Product & { averageRating?: number }).averageRating || 0);
const popularityScore = (product: Product) => Number((product as Product & { popularity?: number; salesCount?: number }).popularity || (product as Product & { salesCount?: number }).salesCount || 0);

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  store: 'M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M9 20v-6h6v6',
  check: 'M20 6 9 17l-5-5',
  cart: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  image: 'M21 15l-5-5L5 21 M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  empty: 'M21 21l-4.3-4.3 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M8 11h6',
};

const chipClass = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-md shadow-lime-500/30'
      : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-lime-50 hover:text-lime-800 hover:ring-lime-300'
  }`;

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-neutral-100">
    <div className="aspect-square rounded-xl bg-neutral-100" />
    <div className="mt-4 h-3 w-1/3 rounded bg-neutral-100" />
    <div className="mt-3 h-4 w-5/6 rounded bg-neutral-100" />
    <div className="mt-2 h-4 w-2/3 rounded bg-neutral-100" />
    <div className="mt-4 h-5 w-1/2 rounded bg-neutral-100" />
    <div className="mt-4 h-11 rounded-xl bg-neutral-100" />
  </div>
);

interface ProductCardProps {
  product: Product;
  selectedVariationId?: number;
  isInCart: boolean;
  onOpen: () => void;
  onVariationChange: (productId: number, variationId: number) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, selectedVariationId, isInCart, onOpen, onVariationChange, onAddToCart }: ProductCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const variations = parseVariations(product);
  const selectedId = selectedVariationId || variations[0]?.id;
  const variation = variations.find((item) => item.id === selectedId);
  const currentPrice = cardPrice(product, variation);
  const regularPrice = Number(variation?.regularPrice || product.regularPrice || 0);
  const onSale = isOnSale(product, variation);
  const discount = onSale && regularPrice > 0 ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : 0;
  const imageSrc = resolveAssetUrl(product.imageUrl);
  const showImage = Boolean(imageSrc) && !imageFailed;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-700/10 hover:ring-lime-200">
      <div
        className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-neutral-50"
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => event.key === 'Enter' && onOpen()}
      >
        {onSale ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-gradient-to-r from-lime-500 to-lime-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
            {discount > 0 ? `-${discount}%` : 'Sale!'}
          </span>
        ) : null}
        {showImage ? (
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-neutral-300">
            <Ico d={ICON.image} className="h-10 w-10" stroke={1.5} />
            <span className="text-xs font-medium text-neutral-400">No image</span>
          </span>
        )}
      </div>

      <p className="m-0 mt-3 text-[11px] font-bold uppercase tracking-wide text-lime-600">{product.category?.name || 'Uncategorized'}</p>
      <h2
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => event.key === 'Enter' && onOpen()}
        className="m-0 mt-1 line-clamp-2 min-h-[2.7em] cursor-pointer text-[15px] font-bold leading-snug text-neutral-900 transition-colors hover:text-lime-700"
      >
        {product.name}
      </h2>

      <p className="m-0 mt-2 flex items-baseline gap-2">
        <strong className="text-lg font-extrabold text-neutral-900">₹{currentPrice.toFixed(2)}</strong>
        {onSale ? <s className="text-sm text-neutral-400">₹{regularPrice.toFixed(2)}</s> : null}
      </p>

      {variations.length ? (
        <div className="mt-2.5 flex max-h-[84px] flex-wrap gap-1.5 overflow-y-auto">
          {variations.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onVariationChange(product.id, item.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                item.id === selectedId ? 'bg-lime-500 text-white shadow-sm' : 'bg-neutral-100 text-neutral-700 hover:bg-lime-100 hover:text-lime-800'
              }`}
            >
              {variationName(item)}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onAddToCart(product)}
        className={`mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold tracking-wide transition active:scale-[0.98] ${
          isInCart
            ? 'border-2 border-lime-500 bg-lime-50 text-lime-700 hover:bg-lime-100'
            : 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-md shadow-lime-500/25 hover:from-lime-600 hover:to-lime-700'
        }`}
      >
        {isInCart ? <Ico d={ICON.check} className="h-4 w-4" stroke={3} /> : <Ico d={ICON.cart} className="h-4 w-4" />}
        ADD TO CART{isInCart ? ' ✓' : ''}
      </button>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <Ico d={ICON.store} className="h-3.5 w-3.5 shrink-0 text-lime-600" />
          <span className="truncate font-medium">{product.vendor?.storeName || 'Store unavailable'}</span>
        </span>
        <span className="shrink-0 text-amber-400" aria-label="5 star rating">★★★★★</span>
      </div>
    </article>
  );
};

// Marketplace-style catalog used at /shop.
const ShopPage = ({ categories, products, cartItems, search, selectedCategory, selectedVariations, loading, onSearchChange, onCategoryChange, onVariationChange, onAddToCart }: ShopPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryOrder = searchParams.get('orderby');
  const initialOrder: SortOrder = queryOrder === 'popularity' || queryOrder === 'rating' || queryOrder === 'latest' || queryOrder === 'price-low' || queryOrder === 'price-high' ? queryOrder : 'default';
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialOrder);
  const filteredProducts = useMemo(() => {
    const visible = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) && (selectedCategory === 'all' || String(product.categoryId) === selectedCategory));
    if (sortOrder === 'popularity') return [...visible].sort((a, b) => popularityScore(b) - popularityScore(a) || b.id - a.id);
    if (sortOrder === 'rating') return [...visible].sort((a, b) => ratingScore(b) - ratingScore(a) || b.id - a.id);
    if (sortOrder === 'latest') return [...visible].sort((a, b) => b.id - a.id);
    if (sortOrder === 'price-low') return [...visible].sort((a, b) => cardPrice(a) - cardPrice(b));
    if (sortOrder === 'price-high') return [...visible].sort((a, b) => cardPrice(b) - cardPrice(a));
    return visible;
  }, [products, search, selectedCategory, sortOrder]);
  const listingProducts = filteredProducts.slice(0, 100);
  const activeCategoryName = selectedCategory !== 'all' ? categories.find((category) => String(category.id) === selectedCategory)?.name || '' : '';

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
      {/* heading */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-8 shadow-xl shadow-lime-700/15 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-white/10" />
        <p className="relative m-0 text-sm font-medium text-lime-50/90">
          Home / Shop{activeCategoryName ? ` / ${activeCategoryName}` : ''}
        </p>
        <h1 className="relative m-0 mt-2 font-serif text-4xl font-bold text-white sm:text-5xl">{activeCategoryName || 'Shop'}</h1>
      </div>

      {/* category chips */}
      {categories.length ? (
        <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" aria-label="Product categories">
          <div className="flex gap-2">
            <button type="button" className={chipClass(selectedCategory === 'all')} onClick={() => onCategoryChange('all')}>
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={chipClass(selectedCategory === String(category.id))}
                onClick={() => onCategoryChange(String(category.id))}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* toolbar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-100 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="relative sm:w-[340px]">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lime-600">
            <Ico d={ICON.search} className="h-5 w-5" />
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search for products..."
            aria-label="Search products"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-4 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-lime-500 focus:bg-white focus:ring-4 focus:ring-lime-500/15"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-5">
          <p className="m-0 text-sm font-medium text-neutral-600">
            {filteredProducts.length ? `Showing 1–${Math.min(listingProducts.length, 100)} of ${filteredProducts.length} results` : '0 results'}
          </p>
          <select
            aria-label="Sort products"
            value={sortOrder}
            onChange={(event) => {
              const nextOrder = event.target.value as SortOrder;
              setSortOrder(nextOrder);
              const nextParams = new URLSearchParams(searchParams);
              if (nextOrder === 'default') nextParams.delete('orderby'); else nextParams.set('orderby', nextOrder);
              setSearchParams(nextParams);
            }}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 outline-none transition focus:border-lime-500 focus:ring-4 focus:ring-lime-500/15"
          >
            <option value="default">Default sorting</option>
            <option value="popularity">Sort by popularity</option>
            <option value="rating">Sort by average rating</option>
            <option value="latest">Sort by latest</option>
            <option value="price-low">Sort by price: low to high</option>
            <option value="price-high">Sort by price: high to low</option>
          </select>
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5" role="status" aria-label="Loading products">
          {Array.from({ length: 10 }).map((_, index) => <SkeletonCard key={index} />)}
        </div>
      ) : null}

      {!loading && !listingProducts.length ? (
        <div className="grid place-items-center rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-neutral-100">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-lime-50 text-lime-600 ring-8 ring-lime-50/60">
            <Ico d={ICON.empty} className="h-9 w-9" />
          </span>
          <p className="m-0 mt-5 font-serif text-2xl font-bold text-neutral-900">No products found.</p>
          <p className="mb-0 mt-2 text-sm text-neutral-500">Try a different search or category.</p>
          <button
            type="button"
            onClick={() => { onSearchChange(''); onCategoryChange('all'); }}
            className="mt-6 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-lime-500/25 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {!loading && listingProducts.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {listingProducts.map((product) => {
            const variations = parseVariations(product);
            const selectedId = selectedVariations[product.id] || variations[0]?.id;
            const isInCart = cartItems.some((item) => item.product.id === product.id && (variations.length === 0 || item.variation?.id === selectedId));
            return (
              <ProductCard
                key={product.id}
                product={product}
                selectedVariationId={selectedVariations[product.id]}
                isInCart={isInCart}
                onOpen={() => navigate(`/product/${product.id}`)}
                onVariationChange={onVariationChange}
                onAddToCart={onAddToCart}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default ShopPage;