import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../config';
import type { Category, Product } from '../types';

/* ---------- helpers (logic unchanged) ---------- */

const parseVariations = (product: Product) => {
  try { return product.variations ? JSON.parse(product.variations) as Array<{ id: number; title?: string | null; price?: number | null; salePrice?: number | null; attributes?: Record<string, string> }> : []; } catch { return []; }
};

const variationLabel = (variation: { title?: string | null; attributes?: Record<string, string> }) => Object.values(variation.attributes || {}).filter(Boolean).join(' / ') || variation.title || 'Option';

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  arrow: 'M5 12h14 M12 5l7 7-7 7',
  cart: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  store: 'M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M9 20v-6h6v6',
  image: 'M21 15l-5-5L5 21 M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  options: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6',
};

const HomeProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart?: (product: Product) => void }) => {
  const navigate = useNavigate();
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const variations = parseVariations(product);
  const selectedVariation = variations.find((variation) => variation.id === selectedVariationId) || variations[0];
  const currentPrice = Number(selectedVariation?.salePrice || selectedVariation?.price || product.salePrice || product.price);
  const originalPrice = Number(product.regularPrice || product.price);
  const imageSrc = resolveAssetUrl(product.imageUrl);
  const onSale = currentPrice < originalPrice;
  const discount = onSale && originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const onAdd = () => onAddToCart?.(selectedVariation ? { ...product, variations: JSON.stringify([selectedVariation]) } : product);
  const openProduct = () => navigate(`/product/${product.id}`);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-700/10 hover:ring-lime-200">
      <div
        className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-neutral-50"
        role="button"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={(event) => event.key === 'Enter' && openProduct()}
      >
        {onSale ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-gradient-to-r from-lime-500 to-lime-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
            {discount > 0 ? `-${discount}%` : 'Sale!'}
          </span>
        ) : null}
        {imageSrc && !imageFailed ? (
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
      <h3
        role="button"
        tabIndex={0}
        onClick={openProduct}
        onKeyDown={(event) => event.key === 'Enter' && openProduct()}
        className="m-0 mt-1 line-clamp-2 min-h-[2.7em] cursor-pointer text-[15px] font-bold leading-snug text-neutral-900 transition-colors hover:text-lime-700"
      >
        {product.name}
      </h3>

      <p className="m-0 mt-2 flex items-baseline gap-2">
        <strong className="text-lg font-extrabold text-neutral-900">₹{currentPrice.toFixed(2)}</strong>
        {onSale ? <s className="text-sm text-neutral-400">₹{originalPrice.toFixed(2)}</s> : null}
      </p>

      {variations.length ? (
        <div className="mt-2.5 flex max-h-[84px] flex-wrap gap-1.5 overflow-y-auto">
          {variations.map((variation) => (
            <button
              key={variation.id}
              type="button"
              onClick={() => setSelectedVariationId(variation.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                variation.id === selectedVariation?.id ? 'bg-lime-500 text-white shadow-sm' : 'bg-neutral-100 text-neutral-700 hover:bg-lime-100 hover:text-lime-800'
              }`}
            >
              {variationLabel(variation)}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={variations.length ? openProduct : onAdd}
        className={`mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold tracking-wide transition active:scale-[0.98] ${
          variations.length
            ? 'border-2 border-lime-500 bg-white text-lime-700 hover:bg-lime-50'
            : 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-md shadow-lime-500/25 hover:from-lime-600 hover:to-lime-700'
        }`}
      >
        <Ico d={variations.length ? ICON.options : ICON.cart} className="h-4 w-4" />
        {variations.length ? 'SELECT OPTIONS' : 'ADD TO CART'}
      </button>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <Ico d={ICON.store} className="h-3.5 w-3.5 shrink-0 text-lime-600" />
          <span className="truncate font-medium">{product.vendor?.storeName || product.brand || 'Store unavailable'}</span>
        </span>
        <span className="shrink-0 text-amber-400" aria-label="5 star rating">★★★★★</span>
      </div>
    </article>
  );
};

const ProductSection = ({ title, products, onAddToCart, onViewAll, alwaysShow = false }: { title: string; products: Product[]; onAddToCart?: (product: Product) => void; onViewAll: (title: string) => void; alwaysShow?: boolean }) => {
  if (!alwaysShow && !products.length) return null;
  const sectionId = `home-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10" aria-labelledby={sectionId}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id={sectionId} className="m-0 flex items-center gap-3 font-serif text-2xl font-bold text-neutral-900 sm:text-4xl">
          <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-lime-400 to-lime-600 sm:h-10" />
          {title}
        </h2>
        <button
          type="button"
          onClick={() => onViewAll(title)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-lime-50 px-4 py-2 text-sm font-bold text-lime-700 ring-1 ring-lime-200 transition hover:bg-lime-100"
        >
          View all <Ico d={ICON.arrow} className="h-4 w-4" stroke={2.5} />
        </button>
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => <HomeProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)}
        </div>
      ) : (
        <p className="m-0 rounded-2xl bg-white px-6 py-10 text-center text-sm font-medium text-neutral-500 ring-1 ring-neutral-100">
          No products available yet.
        </p>
      )}
    </section>
  );
};

type BannerSlide = { id: number | string; title: string; subtitle?: string | null; imageUrl: string; linkUrl?: string | null };

const showcaseCategories = [
  ['Beauty & Cosmetic', 'Waste-management-in-beauty-can-be-improved-if-brands-add-value-and-step-up-communication-says-Certified-Sustainable.webp'], ['Garments', 'images-3.webp'], ['Baby Care', 'images-2.webp'], ['Mobile Accessories', 'download-2.webp'], ['Flower', 'download-4.webp'], ['Paan Darbar', 'default-paan-shops-9.webp'], ['Ready Eatables', 'e1dad5315972c8a9db86fb01d69c7ecb-768x707.webp'], ['Fruits', 'pexels-jane-doan-1132047-1536x1152.webp'], ['Dessert', 'pexels-igor-ovsyannykov-205961-768x512.webp'], ['Bakery & Confectionary', 'download-6.webp'], ['Dairy', 'download-5.webp'], ['Groceries', 'download-8.webp'], ['Pharma', 'download-7.webp'], ['Sports Stuff', 'bigstock-Four-Sports-a-lot-of-balls-an-50626115-1024x512-1-768x384.webp'], ['Snacks & Beverage', 'download-1-1.webp'], ['Vegetable', 'download-9.webp'],
] as const;

interface HomePageProps {
  categories: Category[];
  products?: Product[];
  onOpenShop: () => void;
  onCategorySelect: (categoryId: string) => void;
  onAddToCart?: (product: Product) => void;
  banners?: Array<{ id: number | string; title: string; subtitle?: string | null; imageUrl: string; linkUrl?: string | null }>;
}

const HomePage = ({ categories, products = [], onOpenShop, onCategorySelect, onAddToCart, banners = [] }: HomePageProps) => {
  const homepageBanners = banners.filter((banner) => !String(banner.id).startsWith('vendor-'));
  const slides: BannerSlide[] = homepageBanners;
  const count = slides.length;
  // One extra copy of the first slide sits at the end of the track. Reaching it
  // and then jumping back to the real first slide (with no transition) makes the
  // loop look endless while every visible step still slides to the left.
  const renderedSlides = count > 1 ? [...slides, { ...slides[0], id: `${slides[0].id}-loop` }] : slides;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const activeDot = count ? index % count : 0;

  // autoplay: always step forward (left)
  useEffect(() => {
    if (count < 2 || paused || index >= count) return;
    const timer = window.setTimeout(() => setIndex((current) => (current >= count ? current : current + 1)), 4500);
    return () => window.clearTimeout(timer);
  }, [index, count, paused]);

  // reached the copy of slide 1: wait for the slide to finish, then jump back silently
  useEffect(() => {
    if (count < 2 || index !== count) return;
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 720);
    return () => window.clearTimeout(timer);
  }, [index, count]);

  // re-enable the slide transition after a silent jump has been painted
  useEffect(() => {
    if (animate) return;
    const timer = window.setTimeout(() => setAnimate(true), 100);
    return () => window.clearTimeout(timer);
  }, [animate]);

  const showBanner = (target: number) => {
    if (index >= count || target === activeDot) return;
    if (target > activeDot) {
      setAnimate(true);
      setIndex(target);
      return;
    }
    // going back would slide right, so jump there without a transition
    setAnimate(false);
    setIndex(target);
  };

  const openCategory = (name: string) => {
    const simplify = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');
    const label = simplify(name);
    const target = categories.find((category) => { const categoryName = simplify(category.name); return categoryName === label || categoryName.includes(label) || label.includes(categoryName); });
    if (target) onCategorySelect(String(target.id)); else onOpenShop();
  };
  const groceryProducts = products.filter((product) => product.category?.name.toLowerCase().includes('grocer'));
  const displayedProducts = groceryProducts.length ? groceryProducts : products;
  const readyEatablesProducts = products.filter((product) => /ready\s*eatable|food\s*item/i.test(product.category?.name || ''));
  const vegetableProducts = products.filter((product) => /vegetable/i.test(product.category?.name || ''));
  const fruitProducts = products.filter((product) => /fruit/i.test(product.category?.name || ''));
  const dairyProducts = products.filter((product) => /dairy/i.test(product.category?.name || ''));
  const snackProducts = products.filter((product) => /snack|beverage/i.test(product.category?.name || ''));
  const dessertProducts = products.filter((product) => /dessert/i.test(product.category?.name || ''));
  const bakeryProducts = products.filter((product) => /bakery|confection/i.test(product.category?.name || ''));
  const pharmaProducts = products.filter((product) => /pharma/i.test(product.category?.name || ''));
  const cosmeticProducts = products.filter((product) => /cosmetic|beauty/i.test(product.category?.name || ''));
  const babyCareProducts = products.filter((product) => /baby\s*care/i.test(product.category?.name || ''));
  const flowerProducts = products.filter((product) => /flower/i.test(product.category?.name || ''));
  const garmentProducts = products.filter((product) => /garment/i.test(product.category?.name || ''));
  const footwearProducts = products.filter((product) => /footwear/i.test(product.category?.name || ''));
  const sportsProducts = products.filter((product) => /sports?/i.test(product.category?.name || ''));
  const mobileAccessoryProducts = products.filter((product) => /mobile\s*accessor/i.test(product.category?.name || ''));

  const section = (title: string, list: Product[], alwaysShow = false) => (
    <ProductSection title={title} products={list} onAddToCart={onAddToCart} onViewAll={openCategory} alwaysShow={alwaysShow} />
  );

  return (
    <div className="home-page overflow-x-hidden">
      {/* Banner slider */}
      {count ? (
        <section
          className="mx-auto w-full max-w-[1400px] px-4 pt-2 sm:px-6"
          aria-label="Featured offers"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-100">
            <div
              className="flex items-center"
              style={{
                transform: `translateX(-${index * 100}%)`,
                transition: animate ? 'transform 700ms cubic-bezier(.65,0,.35,1)' : 'none',
              }}
            >
              {renderedSlides.map((slide) => (
                <a
                  key={slide.id}
                  href={slide.linkUrl || undefined}
                  onClick={(event) => { if (!slide.linkUrl) event.preventDefault(); }}
                  aria-label={[slide.title, slide.subtitle].filter(Boolean).join(': ')}
                  className="relative block w-full shrink-0"
                >
                  <img
                    src={resolveAssetUrl(slide.imageUrl) || undefined}
                    alt=""
                    draggable={false}
                    className="block h-auto w-full select-none"
                  />
                  <span className="sr-only">
                    <b>{slide.title}</b>
                    {slide.subtitle ? <small>{slide.subtitle}</small> : null}
                  </span>
                </a>
              ))}
            </div>

            {count > 1 ? (
              <div className="flex items-center justify-center gap-2 bg-white py-3" role="tablist" aria-label="Choose offer banner">
                {slides.map((slide, dotIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-label={`Show banner ${dotIndex + 1}`}
                    aria-selected={dotIndex === activeDot}
                    onClick={() => showBanner(dotIndex)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      dotIndex === activeDot ? 'w-8 bg-lime-500' : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Explore by categories */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="categories-title">
        <div className="mb-10 text-center">
          <h1 id="categories-title" className="m-0 font-serif text-[clamp(30px,5vw,48px)] font-bold leading-tight text-neutral-900">
            Explore By Categories
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-lime-400" />
            <img className="h-8 w-auto object-contain" src="/images/logo-leaf-new.webp" alt="" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-lime-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {showcaseCategories.map(([name, image]) => (
            <button
              key={name}
              type="button"
              onClick={() => openCategory(name)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 text-left shadow-md shadow-neutral-900/10 ring-1 ring-neutral-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-700/20 sm:rounded-3xl"
            >
              <img
                src={`/images/${image}`}
                alt={name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 sm:p-4">
                <span className="text-sm font-bold leading-tight text-white drop-shadow sm:text-lg">{name}</span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime-500 text-white opacity-90 shadow-lg transition group-hover:translate-x-0.5 group-hover:opacity-100 sm:h-9 sm:w-9">
                  <Ico d={ICON.arrow} className="h-4 w-4" stroke={2.5} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Cashback banner */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pb-6 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-10 text-center shadow-2xl shadow-lime-700/25 sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-52 w-52 rounded-full bg-white/10" />
          <h2 className="relative m-0 font-serif text-[clamp(26px,4.5vw,44px)] font-bold leading-tight text-white">
            Get Guaranteed Cashbacks &amp; Coupons!
          </h2>
          <button
            type="button"
            onClick={onOpenShop}
            className="relative mt-7 inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-[15px] font-extrabold tracking-wide text-lime-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-lime-50 active:translate-y-0"
          >
            <Ico d={ICON.cart} className="h-5 w-5" />
            <span>SHOP NOW</span>
          </button>
        </div>
      </section>

      {/* Product sections */}
      {section('Groceries', displayedProducts)}
      {section('Ready Eatables', readyEatablesProducts)}
      {section('Vegetables', vegetableProducts)}
      {section('Fruits', fruitProducts)}
      {section('Dairy', dairyProducts, true)}
      {section('Snacks & Beverages', snackProducts)}
      {section('Desserts', dessertProducts)}
      {section('Bakery & Confectionary', bakeryProducts)}
      {section('Pharma', pharmaProducts)}
      {section('Beauty & Cosmetics', cosmeticProducts)}
      {section('Baby care', babyCareProducts)}
      {section('Flowers', flowerProducts)}
      {section('Garments', garmentProducts, true)}
      {section('Footwear', footwearProducts, true)}
      {section('Sports Stuff', sportsProducts, true)}
      {section('Mobile Accessories', mobileAccessoryProducts, true)}
      <div className="h-8" />
    </div>
  );
};

export default HomePage;