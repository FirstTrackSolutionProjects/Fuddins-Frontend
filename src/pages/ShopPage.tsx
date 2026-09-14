import CartPanel from '../components/customer/CartPanel';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolveAssetUrl } from '../config';
import type { CartItem, Category, Page, Product, ProductVariation } from '../types';

const categoryImages: Record<string, string> = {
  Groceries: '/legacy-uploads/2022/10/Groceries-1-150x150.jpg', Vegetables: '/legacy-uploads/2022/10/Groceries-2-150x150.jpg',
  Fruits: '/legacy-uploads/2022/10/Groceries-3-150x150.jpg', Dairy: '/legacy-uploads/2022/10/Groceries-4-150x150.jpg',
  Desserts: '/legacy-uploads/2022/10/FAVOURITE-FOOD-150x150.jpg', Snacks: '/legacy-uploads/2022/10/fast-food-6974507_1920-150x150.jpg',
};

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

const LegacyShopPage = ({ categories, products, pages, cartItems, search, selectedCategory, selectedVariations, loading, onSearchChange, onCategoryChange, onVariationChange, onAddToCart, onClearCart, onRemoveCartItem, onUpdateQuantity, onOrderPlaced, onOpenPage }: ShopPageProps) => {
  const navigate = useNavigate();
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) && (selectedCategory === 'all' || String(product.categoryId) === selectedCategory));
  return <>
    <section className="mb-6 grid grid-cols-[1fr_auto] overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search for products"
        className="border-0 px-5 py-[18px] text-[17px] outline-none"
      />
      <button type="button" className="border-0 bg-lime-600 px-7 font-bold text-white">Search</button>
    </section>

    <section className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(98px,1fr))] gap-4" aria-label="Product categories">
      {categories.slice(0, 10).map((category) => {
        const src = resolveAssetUrl(categoryImages[category.name] || '/legacy-uploads/2022/10/FUDDINS-1-150x150.png');
        const isActive = selectedCategory === String(category.id);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(String(category.id))}
            className={`flex min-h-[128px] flex-col items-center gap-2.5 rounded-lg border bg-white p-3.5 text-neutral-900 ${
              isActive ? 'border-lime-600 shadow-[0_0_0_2px_rgba(117,168,67,0.18)]' : 'border-neutral-100'
            }`}
          >
            {src ? <img src={src} alt="" className="h-[70px] w-[70px] object-contain" /> : null}
            <span className="text-center text-xs font-bold">{category.name}</span>
          </button>
        );
      })}
    </section>

    <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-lg bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="m-0 text-[32px] text-[#164e28]">Shop</h1>
          <select
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="rounded border border-neutral-300 p-3"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? <p className="text-neutral-500">Loading products...</p> : null}
        {!loading && !filteredProducts.length ? <p className="text-neutral-500">No products found.</p> : null}

        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-5">
          {filteredProducts.map((product) => {
            const imageSrc = resolveAssetUrl(product.imageUrl);
            const variations = parseVariations(product);
            const selectedId = selectedVariations[product.id] || variations[0]?.id || '';
            const variation = variations.find((item) => item.id === selectedId);
            const price = variation?.salePrice || variation?.price || product.salePrice || product.price;

            return (
              <article key={product.id} className="rounded-lg border border-neutral-100 p-3.5 text-center">
                <div role="button" tabIndex={0} onClick={() => navigate(`/product/${product.id}`)} className="mb-3 flex h-[170px] cursor-pointer items-center justify-center overflow-hidden rounded-md bg-neutral-50">
                  {imageSrc ? <img src={imageSrc} alt={product.name} className="h-full w-full object-contain" /> : <span>No image</span>}
                </div>
                <p className="m-0 mb-1.5 text-xs font-bold text-lime-600">{product.category?.name || 'Uncategorized'}</p>
                <h2 role="button" tabIndex={0} onClick={() => navigate(`/product/${product.id}`)} className="m-0 min-h-[44px] cursor-pointer text-base leading-[1.35] text-neutral-900">{product.name}</h2>
                {product.brand ? <p className="mt-1.5 text-xs text-neutral-500">{product.brand}</p> : null}
                <p className="my-3 text-[17px] font-extrabold text-neutral-900">Rs. {price}</p>
                {product.regularPrice && product.salePrice ? (
                  <p className="mb-2 text-xs text-neutral-400 line-through">Rs. {product.regularPrice}</p>
                ) : null}
                {variations.length ? (
                  <select
                    value={selectedId}
                    onChange={(event) => onVariationChange(product.id, Number(event.target.value))}
                    className="my-2 min-h-[38px] w-full rounded border border-neutral-300 p-2"
                  >
                    {variations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {variationName(item)} {item.price ? `- Rs. ${item.salePrice || item.price}` : ''}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className="min-h-[42px] w-full rounded bg-lime-600 font-bold text-white"
                >
                  Add to cart
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="grid gap-5">
        <CartPanel cartItems={cartItems} onClearCart={onClearCart} onRemoveItem={onRemoveCartItem} onUpdateQuantity={onUpdateQuantity} onOrderPlaced={onOrderPlaced} />
      </aside>
    </div>

    <footer className="mt-8 rounded-lg bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <strong className="mb-3 block text-[#164e28]">Information</strong>
      <div className="flex flex-wrap gap-x-4.5 gap-y-2.5">
        {pages.map((page) => (
          <button key={page.slug} type="button" onClick={() => onOpenPage(page.slug)} className="p-0 text-left text-sm text-neutral-600">
            {page.title}
          </button>
        ))}
      </div>
    </footer>
  </>;
};

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

// Marketplace-style catalog used at /shop. The previous search/sidebar layout is
// retained above only for backwards reference; it is no longer rendered.
const ShopPage = ({ categories, products, cartItems, search, selectedCategory, selectedVariations, loading, onCategoryChange, onVariationChange, onAddToCart }: ShopPageProps) => {
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

  return <section className="shop-marketplace">
    <p className="shop-breadcrumb">Home / Shop{selectedCategory !== 'all' ? ` / ${categories.find((category) => String(category.id) === selectedCategory)?.name || ''}` : ''}</p>
    <h1>Shop</h1>
    <div className="shop-toolbar">
      <p>Showing 1–{Math.min(listingProducts.length, 100)} of {filteredProducts.length} results</p>
      <div className="shop-filter-controls">
        <select aria-label="Sort products" value={sortOrder} onChange={(event) => {
          const nextOrder = event.target.value as SortOrder;
          setSortOrder(nextOrder);
          const nextParams = new URLSearchParams(searchParams);
          if (nextOrder === 'default') nextParams.delete('orderby'); else nextParams.set('orderby', nextOrder);
          setSearchParams(nextParams);
        }}>
          <option value="default">Default sorting</option>
          <option value="popularity">Sort by popularity</option>
          <option value="rating">Sort by average rating</option>
          <option value="latest">Sort by latest</option>
          <option value="price-low">Sort by price: low to high</option>
          <option value="price-high">Sort by price: high to low</option>
        </select>
      </div>
    </div>
    {loading ? <p className="shop-message">Loading products…</p> : null}
    {!loading && !listingProducts.length ? <p className="shop-message">No products found.</p> : null}
    <div className="shop-product-grid">
      {listingProducts.map((product) => {
        const variations = parseVariations(product);
        const selectedId = selectedVariations[product.id] || variations[0]?.id;
        const variation = variations.find((item) => item.id === selectedId);
        const currentPrice = cardPrice(product, variation);
        const regularPrice = Number(variation?.regularPrice || product.regularPrice || 0);
        const imageSrc = resolveAssetUrl(product.imageUrl);
        const openProduct = () => navigate(`/product/${product.id}`);
        const isInCart = cartItems.some((item) => item.product.id === product.id && (variations.length === 0 || item.variation?.id === selectedId));
        return <article className="shop-product-card" key={product.id}>
          <div className="shop-product-image" role="button" tabIndex={0} onClick={openProduct} onKeyDown={(event) => event.key === 'Enter' && openProduct()}>
            {isOnSale(product, variation) ? <span className="sale-badge">Sale!</span> : null}
            {imageSrc ? <img src={imageSrc} alt={product.name} /> : <span className="shop-no-image">No image</span>}
          </div>
          <p className="shop-product-category">{product.category?.name || 'Uncategorized'}</p>
          <h2 role="button" tabIndex={0} onClick={openProduct} onKeyDown={(event) => event.key === 'Enter' && openProduct()}>{product.name}</h2>
          <p className="shop-price">{isOnSale(product, variation) ? <s>₹{regularPrice.toFixed(2)}</s> : null}<strong>₹{currentPrice.toFixed(2)}</strong></p>
          {variations.length ? <div className="shop-variations">{variations.map((item) => <button type="button" className={item.id === selectedId ? 'is-selected' : ''} onClick={() => onVariationChange(product.id, item.id)} key={item.id}>{variationName(item)}</button>)}</div> : null}
          <button type="button" className={`shop-cart-button ${isInCart ? 'is-added' : ''}`} onClick={() => onAddToCart(product)}>ADD TO CART{isInCart ? ' ✓' : ''}</button>
          <p className="shop-store">Store: <span>🏪 {product.vendor?.storeName || 'Store unavailable'}</span></p>
          <p className="shop-stars" aria-label="5 star rating">★★★★★</p>
        </article>;
      })}
    </div>
  </section>;
};

export default ShopPage;
