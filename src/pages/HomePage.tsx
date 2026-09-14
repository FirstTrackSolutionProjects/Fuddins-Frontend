import { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../config';
import type { Category, Product } from '../types';

const parseVariations = (product: Product) => {
  try { return product.variations ? JSON.parse(product.variations) as Array<{ id: number; title?: string | null; price?: number | null; salePrice?: number | null; attributes?: Record<string, string> }> : []; } catch { return []; }
};

const variationLabel = (variation: { title?: string | null; attributes?: Record<string, string> }) => Object.values(variation.attributes || {}).filter(Boolean).join(' / ') || variation.title || 'Option';

const HomeProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart?: (product: Product) => void }) => {
  const navigate = useNavigate();
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const variations = parseVariations(product);
  const selectedVariation = variations.find((variation) => variation.id === selectedVariationId) || variations[0];
  const currentPrice = Number(selectedVariation?.salePrice || selectedVariation?.price || product.salePrice || product.price);
  const originalPrice = Number(product.regularPrice || product.price);
  const imageSrc = resolveAssetUrl(product.imageUrl);
  const onImageError = (event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.src = '/images/e1dad5315972c8a9db86fb01d69c7ecb-768x707.webp'; };
  const onAdd = () => onAddToCart?.(selectedVariation ? { ...product, variations: JSON.stringify([selectedVariation]) } : product);
  return <article className="featured-product-card">
    <div className="featured-product-image" role="button" tabIndex={0} onClick={() => navigate(`/product/${product.id}`)}>{currentPrice < originalPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} onError={onImageError} alt={product.name} /> : <span>No image</span>}</div>
    <p>{product.category?.name || 'Uncategorized'}</p><h3 role="button" tabIndex={0} onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
    <strong>{currentPrice < originalPrice ? <><s>₹{originalPrice.toFixed(2)}</s> </> : null}₹{currentPrice.toFixed(2)}</strong>
    {variations.length ? <div className="product-variation-options">{variations.map((variation) => <button key={variation.id} type="button" className={variation.id === selectedVariation?.id ? 'is-selected' : ''} onClick={() => setSelectedVariationId(variation.id)}>{variationLabel(variation)}</button>)}</div> : null}
    <button type="button" onClick={onAdd}>{variations.length ? 'SELECT OPTIONS' : 'ADD TO CART'}</button>
    <div className="product-store">Store: 🛍️ {product.vendor?.storeName || product.brand || 'Store unavailable'}</div><div className="product-stars">★★★★★</div>
  </article>;
};

const ProductSection = ({ title, products, onAddToCart, alwaysShow = false }: { title: string; products: Product[]; onAddToCart?: (product: Product) => void; alwaysShow?: boolean }) => {
  if (!alwaysShow && !products.length) return null;
  const sectionId = `home-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <section className="featured-products ready-eatables" aria-labelledby={sectionId}>
    {title !== 'Groceries' ? <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" /> : null}
    <div className="featured-products-heading"><h2 id={sectionId}>{title}</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
    {products.length ? <div className="featured-products-grid">{products.map((product) => <HomeProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)}</div> : null}
  </section>;
};

const bannerImages = [
  '/images/WhatsApp-Image-2023-03-09-at-1.34.26-PM.webp',
  '/images/WE-ARE-PROUD-TO-INTRODUCE-1-scaled.webp',
  '/images/WE-ARE-PROUD-TO-INTRODUCE-2-scaled.webp',
];

const showcaseCategories = [
  ['Beauty & Cosmetic', 'Waste-management-in-beauty-can-be-improved-if-brands-add-value-and-step-up-communication-says-Certified-Sustainable.webp'], ['Garments', 'images-3.webp'], ['Baby Care', 'images-2.webp'], ['Mobile Accessories', 'download-2.webp'], ['Flower', 'download-4.webp'], ['Paan Darbar', 'default-paan-shops-9.webp'], ['Ready Eatables', 'e1dad5315972c8a9db86fb01d69c7ecb-768x707.webp'], ['Fruits', 'pexels-jane-doan-1132047-1536x1152.webp'], ['Dessert', 'pexels-igor-ovsyannykov-205961-768x512.webp'], ['Bakery & Confectionary', 'download-6.webp'], ['Dairy', 'download-5.webp'], ['Groceries', 'download-8.webp'], ['Pharma', 'download-7.webp'], ['Sports Stuff', 'bigstock-Four-Sports-a-lot-of-balls-an-50626115-1024x512-1-768x384.webp'], ['Snacks & Beverage', 'download-1-1.webp'], ['Vegetable', 'download-9.webp'],
] as const;

interface HomePageProps {
  categories: Category[];
  products?: Product[];
  onOpenShop: () => void;
  onCategorySelect: (categoryId: string) => void;
  onAddToCart?: (product: Product) => void;
}

const HomePage = ({ categories, products = [], onOpenShop, onCategorySelect, onAddToCart }: HomePageProps) => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [exitingBanner, setExitingBanner] = useState<number | null>(null);
  const showBanner = (nextBanner: number) => {
    if (nextBanner === activeBanner) return;
    setExitingBanner(activeBanner);
    setActiveBanner(nextBanner);
    window.setTimeout(() => setExitingBanner(null), 720);
  };
  useEffect(() => {
    const timer = window.setInterval(() => showBanner((activeBanner + 1) % bannerImages.length), 4500);
    return () => window.clearInterval(timer);
  }, [activeBanner]);
  useEffect(() => {
    const useFallbackProductImage = (event: Event) => {
      const image = event.target as HTMLImageElement;
      if (!image.matches('.featured-product-image img') || image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = 'true';
      image.src = '/images/e1dad5315972c8a9db86fb01d69c7ecb-768x707.webp';
    };
    window.addEventListener('error', useFallbackProductImage, true);
    return () => window.removeEventListener('error', useFallbackProductImage, true);
  }, []);
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
  const visibleProductCards = [
    ...displayedProducts, ...readyEatablesProducts, ...vegetableProducts, ...fruitProducts, ...dairyProducts,
    ...snackProducts, ...dessertProducts, ...bakeryProducts, ...pharmaProducts, ...cosmeticProducts,
    ...babyCareProducts, ...flowerProducts, ...garmentProducts, ...footwearProducts, ...sportsProducts, ...mobileAccessoryProducts,
  ];
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.featured-product-card').forEach((card, index) => {
      const product = visibleProductCards[index];
      card.dataset.store = product?.vendor?.storeName || product?.brand || 'Store unavailable';
    });
  }, [products]);
  return <div className="home-page">
    <section className="home-banner" aria-label="Featured offers">
      {bannerImages.map((src, index) => <img key={src} src={src} alt="Fuddins offer" className={index === activeBanner ? 'is-active' : index === exitingBanner ? 'is-exiting' : ''} />)}
      <div className="banner-dots" role="tablist" aria-label="Choose offer banner">{bannerImages.map((_, index) => <button key={index} type="button" aria-label={`Show banner ${index + 1}`} aria-selected={index === activeBanner} className={index === activeBanner ? 'is-active' : ''} onClick={() => showBanner(index)} />)}</div>
    </section>
    <section className="category-showcase" aria-labelledby="categories-title">
      <div className="category-heading">
        <h1 id="categories-title">Explore By Categories</h1>
        <img className="category-sprig" src="/images/logo-leaf-new.webp" alt="" />
        <img className="category-leaf" src="/images/basil-leaf.webp" alt="" />
      </div>
      <div className="category-grid">{showcaseCategories.map(([name, image]) => <button key={name} type="button" className="category-card" onClick={() => openCategory(name)}><img src={`/images/${image}`} alt={name} /><span>{name}</span></button>)}</div>
    </section>
    <section className="cashback-banner"><h2>Get Guaranteed Cashbacks &amp; Coupons!</h2><button type="button" onClick={onOpenShop}>🛒 <span>SHOP NOW</span></button></section>
    {false ? <>
    {displayedProducts.length ? <section className="featured-products" aria-labelledby="groceries-title">
      <div className="featured-products-heading"><h2 id="groceries-title">Groceries</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">
        {displayedProducts.map((product) => {
          const imageSrc = resolveAssetUrl(product.imageUrl);
          return <article className="featured-product-card" key={product.id}>
            <div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div>
            <p>{product.category?.name || 'Groceries'}</p>
            <h3>{product.name}</h3>
            <strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong>
            <button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button>
          </article>;
        })}
      </div>
    </section> : null}
    {readyEatablesProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="ready-eatables-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="ready-eatables-title">Ready Eatables</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">
        {readyEatablesProducts.map((product) => {
          const imageSrc = resolveAssetUrl(product.imageUrl);
          return <article className="featured-product-card" key={product.id}>
            <div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div>
            <p>{product.category?.name || 'Food Items'}</p>
            <h3>{product.name}</h3>
            <strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong>
            <button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button>
          </article>;
        })}
      </div>
    </section> : null}
    {vegetableProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="vegetables-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="vegetables-title">Vegetables</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">
        {vegetableProducts.map((product) => {
          const imageSrc = resolveAssetUrl(product.imageUrl);
          return <article className="featured-product-card" key={product.id}>
            <div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div>
            <p>{product.category?.name || 'Vegetables'}</p>
            <h3>{product.name}</h3>
            <strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong>
            <button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button>
          </article>;
        })}
      </div>
    </section> : null}
    {fruitProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="fruits-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="fruits-title">Fruits</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">
        {fruitProducts.map((product) => {
          const imageSrc = resolveAssetUrl(product.imageUrl);
          return <article className="featured-product-card" key={product.id}>
            <div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div>
            <p>{product.category?.name || 'Fruits'}</p>
            <h3>{product.name}</h3>
            <strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong>
            <button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button>
          </article>;
        })}
      </div>
    </section> : null}
    <section className="featured-products ready-eatables dairy-section" aria-labelledby="dairy-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="dairy-title">Dairy</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      {dairyProducts.length ? <div className="featured-products-grid">{dairyProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Dairy'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div> : null}
    </section>
    {snackProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="snacks-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="snacks-title">Snacks &amp; Beverages</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">{snackProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Snacks & Beverages'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div>
    </section> : null}
    {dessertProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="desserts-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="desserts-title">Desserts</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">{dessertProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Desserts'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div>
    </section> : null}
    {bakeryProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="bakery-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="bakery-title">Bakery &amp; Confectionary</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">{bakeryProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Bakery Corner'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div>
    </section> : null}
    {pharmaProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="pharma-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="pharma-title">Pharma</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">{pharmaProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Pharma'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div>
    </section> : null}
    {cosmeticProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="cosmetics-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="cosmetics-title">Beauty &amp; Cosmetics</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">{cosmeticProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Cosmetics'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div>
    </section> : null}
    {babyCareProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="baby-care-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="baby-care-title">Baby care</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">{babyCareProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Baby care'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div>
    </section> : null}
    {flowerProducts.length ? <section className="featured-products ready-eatables" aria-labelledby="flowers-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="flowers-title">Flowers</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      <div className="featured-products-grid">{flowerProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{product.salePrice && product.regularPrice && product.salePrice < product.regularPrice ? <span className="sale-badge">Sale!</span> : null}{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Flower'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div>
    </section> : null}
    {[
      ['Garments', garmentProducts],
      ['Footwear', footwearProducts],
      ['Sports Stuff', sportsProducts],
    ].map(([title, sectionProducts]) => <section className="featured-products ready-eatables" aria-labelledby={`section-${title}`} key={title as string}>
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id={`section-${title}`}>{title as string}</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      {(sectionProducts as Product[]).length ? <div className="featured-products-grid">{(sectionProducts as Product[]).map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || title as string}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div> : null}
    </section>)}
    <section className="featured-products ready-eatables" aria-labelledby="mobile-accessories-title">
      <img className="ready-eatables-watermark" src="/images/basil-leaf.webp" alt="" />
      <div className="featured-products-heading"><h2 id="mobile-accessories-title">Mobile Accessories</h2><img src="/images/logo-leaf-new.webp" alt="" /></div>
      {mobileAccessoryProducts.length ? <div className="featured-products-grid">{mobileAccessoryProducts.map((product) => {
        const imageSrc = resolveAssetUrl(product.imageUrl);
        return <article className="featured-product-card" key={product.id}><div className="featured-product-image">{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div><p>{product.category?.name || 'Mobile Accessories'}</p><h3>{product.name}</h3><strong>₹{Number(product.salePrice ?? product.price).toFixed(2)}</strong><button type="button" onClick={() => onAddToCart?.(product)}>ADD TO CART</button></article>;
      })}</div> : null}
    </section>
    </> : <>
      <ProductSection title="Groceries" products={displayedProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Ready Eatables" products={readyEatablesProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Vegetables" products={vegetableProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Fruits" products={fruitProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Dairy" products={dairyProducts} onAddToCart={onAddToCart} alwaysShow />
      <ProductSection title="Snacks & Beverages" products={snackProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Desserts" products={dessertProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Bakery & Confectionary" products={bakeryProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Pharma" products={pharmaProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Beauty & Cosmetics" products={cosmeticProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Baby care" products={babyCareProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Flowers" products={flowerProducts} onAddToCart={onAddToCart} />
      <ProductSection title="Garments" products={garmentProducts} onAddToCart={onAddToCart} alwaysShow />
      <ProductSection title="Footwear" products={footwearProducts} onAddToCart={onAddToCart} alwaysShow />
      <ProductSection title="Sports Stuff" products={sportsProducts} onAddToCart={onAddToCart} alwaysShow />
      <ProductSection title="Mobile Accessories" products={mobileAccessoryProducts} onAddToCart={onAddToCart} alwaysShow />
    </>}
  </div>;
};

export default HomePage;
