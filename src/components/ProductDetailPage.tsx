import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_ORIGIN, resolveAssetUrl } from '../config';
import type { Product, ProductVariation } from '../types';

const variationsOf = (product: Product): ProductVariation[] => { try { return product.variations ? JSON.parse(product.variations) as ProductVariation[] : []; } catch { return []; } };
const label = (item: ProductVariation) => Object.values(item.attributes || {}).filter(Boolean).join(' / ') || item.title || 'Option';

export default function ProductDetailPage({ products, onAddToCart }: { products: Product[]; onAddToCart: (product: Product) => void }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => String(item.id) === productId);
  const variations = product ? variationsOf(product) : [];
  const [selectedId, setSelectedId] = useState<number | null>(variations[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'offers' | 'policies' | 'inquiries'>('info');
  const [askOpen, setAskOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const selected = variations.find((item) => item.id === selectedId) || variations[0];
  const price = Number(selected?.salePrice || selected?.price || product?.salePrice || product?.price || 0);
  const regular = Number(selected?.regularPrice || product?.regularPrice || product?.price || 0);
  const related = useMemo(() => product ? products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 4) : [], [products, product]);
  useEffect(() => {
    setSelectedId(variations[0]?.id || null);
    setQuantity(1);
    setActiveTab('info');
  }, [productId]);
  if (!product) return <section className="product-detail-page"><h1>Product not found</h1><Link to="/shop">Back to shop</Link></section>;
  const add = () => { for (let count = 0; count < quantity; count += 1) onAddToCart(selected ? { ...product, variations: JSON.stringify([selected]) } : product); };
  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch(`${API_ORIGIN}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), subject: `Product inquiry: ${product.name}`, message: data.get('message'), phone: '' }) });
    setNotice(response.ok ? 'Your question has been sent to the seller.' : 'Unable to send the question. Please try again.');
    if (response.ok) { event.currentTarget.reset(); setAskOpen(false); }
  };
  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rating = data.get('rating');
    const response = await fetch(`${API_ORIGIN}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), subject: `Product review (${rating}/5): ${product.name}`, message: data.get('review'), phone: '' }) });
    setNotice(response.ok ? 'Thanks! Your review has been submitted for approval.' : 'Unable to submit the review. Please try again.');
    if (response.ok) event.currentTarget.reset();
  };
  const image = resolveAssetUrl(product.imageUrl);
  return <section className="product-detail-page">
    <nav className="product-breadcrumb"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.category?.name || 'Products'}</span></nav>
    <div className="product-detail-main">
      <div className="product-detail-image">{price < regular ? <span className="sale-badge">Sale!</span> : null}{image ? <img src={image} alt={product.name} /> : <span>No image</span>}</div>
      <div className="product-detail-info"><p className="product-category">{product.category?.name || 'Uncategorized'}</p><h1>{product.name}</h1>
        <div className="product-detail-price">{price < regular ? <s>₹{regular.toFixed(2)}</s> : null} ₹{price.toFixed(2)}</div>
        {variations.length ? <div className="detail-options">{variations.map((item) => <button key={item.id} type="button" className={item.id === selected?.id ? 'is-selected' : ''} onClick={() => setSelectedId(item.id)}>{label(item)}</button>)}</div> : null}
        <div className="detail-cart-row"><input aria-label="Quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /><button type="button" onClick={add}>ADD TO CART</button></div>
        <p className="product-meta">SKU: {selected?.sku || product.sku || 'N/A'} &nbsp;&nbsp; Category: <Link to="/shop">{product.category?.name || 'Uncategorized'}</Link></p>
        <p className="product-store">Store: 🛍️ {product.vendor?.storeName || product.brand || 'Store unavailable'}</p>
        <button type="button" className="ask-question-button" onClick={() => setAskOpen(true)}>ⓘ Ask a Question</button>{notice ? <p className="form-notice">{notice}</p> : null}
      </div>
    </div>
    <section className="product-tabs"><div className="product-tab-list">
      <button className={activeTab === 'info' ? 'is-active' : ''} onClick={() => setActiveTab('info')}>Additional information</button><button className={activeTab === 'reviews' ? 'is-active' : ''} onClick={() => setActiveTab('reviews')}>Reviews (0)</button><button className={activeTab === 'offers' ? 'is-active' : ''} onClick={() => setActiveTab('offers')}>More Offers</button><button className={activeTab === 'policies' ? 'is-active' : ''} onClick={() => setActiveTab('policies')}>Store Policies</button><button className={activeTab === 'inquiries' ? 'is-active' : ''} onClick={() => setActiveTab('inquiries')}>Inquiries</button>
    </div>
      {activeTab === 'info' ? <><h2>Additional information</h2><p>{product.fullDescription || product.description || 'Product information is available from the seller.'}</p></> : null}
      {activeTab === 'reviews' ? <><h2>Reviews</h2><p>There are no reviews yet.</p><form className="review-form" onSubmit={submitReview}><h3>Be the first to review “{product.name}”</h3><label>Your rating <select name="rating" required><option value="">Select rating</option><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>Your review<textarea name="review" required /></label><div className="review-grid"><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label></div><button>SUBMIT</button></form></> : null}
      {activeTab === 'offers' ? <><h2>More Offers</h2><p>No more offers for this product!</p></> : null}
      {activeTab === 'policies' ? <><h2>Store Policies</h2><p>Seller policies and return details will be confirmed by the store when your order is placed.</p></> : null}
      {activeTab === 'inquiries' ? <><h2>General Inquiries</h2><p>There are no inquiries yet.</p><button type="button" className="ask-question-button" onClick={() => setAskOpen(true)}>Ask a Question</button></> : null}
    </section>
    <section className="related-products"><h2>Related products</h2><div className="related-products-grid">{related.map((item) => <button type="button" key={item.id} onClick={() => navigate(`/product/${item.id}`)}><img src={resolveAssetUrl(item.imageUrl) || ''} alt={item.name} /><span>{item.category?.name || 'Products'}</span><strong>{item.name}</strong><b>₹{Number(item.salePrice || item.price).toFixed(2)}</b></button>)}</div></section>
    {askOpen ? <div className="question-modal-backdrop" onMouseDown={() => setAskOpen(false)}><section className="question-modal" onMouseDown={(event) => event.stopPropagation()}><button className="question-close" type="button" onClick={() => setAskOpen(false)}>×</button><h2>Ask a Question</h2><form onSubmit={submitInquiry}><label>Name *<input name="name" required /></label><label>Email *<input name="email" type="email" required /></label><label>Your inquiry *<textarea name="message" required /></label><button>SUBMIT</button></form></section></div> : null}
  </section>;
}
