import { useCallback, useEffect, useState } from 'react';
import { API_ORIGIN } from '../../config';

type Review = {
  id: number; productId: number; reviewerName: string; rating: number; review: string;
  status: 'pending' | 'approved' | 'rejected'; createdAt: string;
  product?: { id: number; name: string } | null;
  user?: { id: number; name: string; email: string } | null;
};

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` });

export default function ProductReviewManager() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ORIGIN}/product-reviews/admin`, { headers: auth() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load product reviews');
      setItems(data);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load product reviews'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const update = async (item: Review, action: 'approved' | 'rejected' | 'deleted') => {
    setBusyId(item.id); setMessage('');
    try {
      const response = await fetch(`${API_ORIGIN}/product-reviews/admin/${item.id}${action === 'deleted' ? '' : '/status'}`, {
        method: action === 'deleted' ? 'DELETE' : 'PUT',
        headers: { ...auth(), ...(action === 'deleted' ? {} : { 'Content-Type': 'application/json' }) },
        ...(action === 'deleted' ? {} : { body: JSON.stringify({ status: action }) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to update review');
      setItems((current) => action === 'deleted' ? current.filter((review) => review.id !== item.id) : current.map((review) => review.id === item.id ? { ...review, status: action } : review));
      setMessage(action === 'deleted' ? 'Review deleted.' : `Review ${action}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update review'); }
    finally { setBusyId(null); }
  };
  return <section className="admin-panel">
    <div className="admin-panel-heading"><div><h1>Product reviews</h1><p>Review customer feedback and approve what appears on product pages.</p></div><button type="button" onClick={() => void load()}>Refresh</button></div>
    {message ? <p role="status" className="admin-notice">{message}</p> : null}
    {loading ? <p>Loading reviews…</p> : items.length ? <div className="admin-review-list">{items.map((item) => <article className="admin-review-card" key={item.id}>
      <header><div><h2>{item.product?.name || `Product #${item.productId}`}</h2><p>{item.reviewerName}{item.user?.email ? ` · ${item.user.email}` : ''} · {new Date(item.createdAt).toLocaleDateString()}</p></div><span className={`admin-review-status status-${item.status}`}>{item.status}</span></header>
      <p className="admin-review-stars" aria-label={`${item.rating} out of 5 stars`}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p><p className="admin-review-copy">{item.review}</p>
      <footer>{item.status !== 'approved' ? <button type="button" disabled={busyId === item.id} onClick={() => void update(item, 'approved')}>Approve</button> : null}{item.status !== 'rejected' ? <button type="button" disabled={busyId === item.id} onClick={() => void update(item, 'rejected')}>Reject</button> : null}<button type="button" disabled={busyId === item.id} onClick={() => void update(item, 'deleted')}>Delete</button></footer>
    </article>)}</div> : <p>No product reviews yet.</p>}
  </section>;
}
