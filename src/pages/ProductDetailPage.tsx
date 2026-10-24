import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_ORIGIN, resolveAssetUrl } from '../config';
import type { Product, ProductVariation } from '../types';

type ProductReview = { id: number; reviewerName: string; rating: number; review: string; createdAt: string };

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
  const [reviewNotice, setReviewNotice] = useState('');
  const [reviewItems, setReviewItems] = useState<ProductReview[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user') || 'null') as { name?: string } | null; } catch { return null; } });
  const selected = variations.find((item) => item.id === selectedId) || variations[0];
  const price = Number(selected?.salePrice || selected?.price || product?.salePrice || product?.price || 0);
  const regular = Number(selected?.regularPrice || product?.regularPrice || product?.price || 0);
  const related = useMemo(() => product ? products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 4) : [], [products, product]);
  useEffect(() => {
    setSelectedId(variations[0]?.id || null);
    setQuantity(1);
    setActiveTab('info');
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
  if (!product) return <section className="product-detail-page"><h1>Product not found</h1><Link to="/shop">Back to shop</Link></section>;
  const add = () => { for (let count = 0; count < quantity; count += 1) onAddToCart(selected ? { ...product, variations: JSON.stringify([selected]) } : product); };
  const addToWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/account'); return; }
    const response = await fetch(`${API_ORIGIN}/customer/wishlist/${product.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setNotice(response.ok ? 'Added to your wishlist.' : 'Unable to add this product to wishlist.');
  };
  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch(`${API_ORIGIN}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), subject: `Product inquiry: ${product.name}`, message: data.get('message'), phone: '' }) });
    setNotice(response.ok ? 'Your question has been sent to the seller.' : 'Unable to send the question. Please try again.');
    if (response.ok) { event.currentTarget.reset(); setAskOpen(false); }
  };
  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { setReviewNotice('Sign in with the account used for your paid order to submit a review.'); return; }
    const data = new FormData(event.currentTarget);
    setReviewBusy(true); setReviewNotice('');
    try {
      const response = await fetch(`${API_ORIGIN}/api/products/${product.id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating: Number(data.get('rating')), review: data.get('review') }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit the review.');
      setReviewNotice('Thanks! Your verified-purchase review is waiting for approval.');
      event.currentTarget.reset();
    } catch (error) { setReviewNotice(error instanceof Error ? error.message : 'Unable to submit the review. Please try again.'); }
    finally { setReviewBusy(false); }
  };
  const image = resolveAssetUrl(product.imageUrl);
  return <section className="product-detail-page">
    <nav className="product-breadcrumb"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.category?.name || 'Products'}</span></nav>
    <div className="product-detail-main">
      <div className="product-detail-image">{price < regular ? <span className="sale-badge">Sale!</span> : null}{image ? <img src={image} alt={product.name} /> : <span>No image</span>}</div>
      <div className="product-detail-info"><p className="product-category">{product.category?.name || 'Uncategorized'}</p><h1>{product.name}</h1>
        <div className="product-detail-price">{price < regular ? <s>₹{regular.toFixed(2)}</s> : null} ₹{price.toFixed(2)}</div>
        {variations.length ? <div className="detail-options">{variations.map((item) => <button key={item.id} type="button" className={item.id === selected?.id ? 'is-selected' : ''} onClick={() => setSelectedId(item.id)}>{label(item)}</button>)}</div> : null}
        <div className="detail-cart-row"><input aria-label="Quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /><button type="button" onClick={add}>ADD TO CART</button></div><button type="button" className="ask-question-button" onClick={() => void addToWishlist()}>♡ Add to wishlist</button>
        <p className="product-meta">SKU: {selected?.sku || product.sku || 'N/A'} &nbsp;&nbsp; Category: <Link to="/shop">{product.category?.name || 'Uncategorized'}</Link></p>
        <p className="product-store">Store: 🛍️ {product.vendor?.storeName || product.brand || 'Store unavailable'}</p>
        <button type="button" className="ask-question-button" onClick={() => setAskOpen(true)}>ⓘ Ask a Question</button>{notice ? <p className="form-notice">{notice}</p> : null}
      </div>
    </div>
    <section className="product-tabs"><div className="product-tab-list">
      <button className={activeTab === 'info' ? 'is-active' : ''} onClick={() => setActiveTab('info')}>Additional information</button><button className={activeTab === 'reviews' ? 'is-active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({reviewCount})</button><button className={activeTab === 'offers' ? 'is-active' : ''} onClick={() => setActiveTab('offers')}>More Offers</button><button className={activeTab === 'policies' ? 'is-active' : ''} onClick={() => setActiveTab('policies')}>Store Policies</button><button className={activeTab === 'inquiries' ? 'is-active' : ''} onClick={() => setActiveTab('inquiries')}>Inquiries</button>
    </div>
      {activeTab === 'info' ? <><h2>Additional information</h2><p>{product.fullDescription || product.description || 'Product information is available from the seller.'}</p></> : null}
      {activeTab === 'reviews' ? <><h2>Customer reviews</h2>{reviewCount && averageRating ? <p className="review-summary">{averageRating} out of 5 · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p> : null}{reviewsLoading ? <p>Loading reviews…</p> : reviewItems.length ? <div className="product-review-list">{reviewItems.map((item) => <article key={item.id} className="product-review"><div className="product-review-heading"><b>{item.reviewerName}</b><span aria-label={`${item.rating} out of 5 stars`}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span></div><time>{new Date(item.createdAt).toLocaleDateString()}</time><p>{item.review}</p></article>)}</div> : <p>There are no approved reviews yet.</p>}{reviewNotice ? <p role="status" className="form-notice">{reviewNotice}</p> : null}{reviewUser ? <form className="review-form" onSubmit={(event) => void submitReview(event)}><h3>Review this product</h3><p>Signed in as {reviewUser.name || 'customer'}. Reviews require a paid order and admin approval.</p><label>Your rating <select name="rating" required defaultValue=""><option value="" disabled>Select rating</option><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label>Your review<textarea name="review" required minLength={5} maxLength={4000} /></label><button disabled={reviewBusy}>{reviewBusy ? 'SUBMITTING…' : 'SUBMIT REVIEW'}</button></form> : <p><Link to="/account">Sign in with your account to review a purchased product.</Link></p>}</> : null}
      {activeTab === 'offers' ? <><h2>More Offers</h2><p>No more offers for this product!</p></> : null}
      {activeTab === 'policies' ? <><h2>Store Policies</h2><p>Seller policies and return details will be confirmed by the store when your order is placed.</p></> : null}
      {activeTab === 'inquiries' ? <><h2>General Inquiries</h2><p>There are no inquiries yet.</p><button type="button" className="ask-question-button" onClick={() => setAskOpen(true)}>Ask a Question</button></> : null}
    </section>
    <section className="related-products"><h2>Related products</h2><div className="related-products-grid">{related.map((item) => <button type="button" key={item.id} onClick={() => navigate(`/product/${item.id}`)}><img src={resolveAssetUrl(item.imageUrl) || ''} alt={item.name} /><span>{item.category?.name || 'Products'}</span><strong>{item.name}</strong><b>₹{Number(item.salePrice || item.price).toFixed(2)}</b></button>)}</div></section>
    {askOpen ? <div className="question-modal-backdrop" onMouseDown={() => setAskOpen(false)}><section className="question-modal" onMouseDown={(event) => event.stopPropagation()}><button className="question-close" type="button" onClick={() => setAskOpen(false)}>×</button><h2>Ask a Question</h2><form onSubmit={submitInquiry}><label>Name *<input name="name" required /></label><label>Email *<input name="email" type="email" required /></label><label>Your inquiry *<textarea name="message" required /></label><button>SUBMIT</button></form></section></div> : null}
  </section>;
}
