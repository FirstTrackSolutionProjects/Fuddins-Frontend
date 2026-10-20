import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { API_ORIGIN, resolveAssetUrl } from '../../config';

interface Banner { id: number; title: string; subtitle?: string | null; imageUrl: string; linkUrl?: string | null; active: boolean; sortOrder: number }
const emptyForm = { title: '', subtitle: '', imageUrl: '', linkUrl: '', sortOrder: '0' };
const fieldClass = 'w-full rounded-xl border border-neutral-300 px-3 py-2.5';

export default function BannerManager() {
  const [items, setItems] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token}` });
  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/banners/admin`, { headers: headers() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load banners');
      setItems(data);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load banners'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true); setMessage('Uploading image…');
    try {
      const body = new FormData(); body.append('image', file);
      const response = await fetch(`${API_ORIGIN}/uploads`, { method: 'POST', headers: headers(), body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to upload image');
      setForm((current) => ({ ...current, imageUrl: data.imageUrl })); setMessage('Image uploaded. Complete the banner details and save.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to upload image'); }
    finally { setBusy(false); }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch(`${API_ORIGIN}/banners/admin`, { method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save banner');
      setForm(emptyForm); setMessage('Banner added to the storefront.'); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save banner'); }
    finally { setBusy(false); }
  };

  const toggle = async (item: Banner) => {
    setBusy(true);
    try { const response = await fetch(`${API_ORIGIN}/banners/admin/${item.id}`, { method: 'PUT', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !item.active }) }); if (!response.ok) throw new Error('Unable to update banner'); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update banner'); }
    finally { setBusy(false); }
  };

  const remove = async (item: Banner) => {
    setBusy(true);
    try { const response = await fetch(`${API_ORIGIN}/banners/admin/${item.id}`, { method: 'DELETE', headers: headers() }); if (!response.ok) throw new Error('Unable to delete banner'); setMessage('Banner deleted.'); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to delete banner'); }
    finally { setBusy(false); }
  };

  return <section className="mx-auto max-w-5xl">
    <div className="mb-6"><h1 className="text-2xl font-bold">Homepage banners</h1><p className="mt-1 text-neutral-600">Add and arrange promotional banners shown in the web and customer app.</p></div>
    {message ? <p role="status" className="mb-4 rounded-xl bg-lime-50 px-4 py-3 text-lime-800">{message}</p> : null}
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2">
      <label className="text-sm font-semibold">Banner title<input required className={`${fieldClass} mt-1`} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label className="text-sm font-semibold">Subtitle<input className={`${fieldClass} mt-1`} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} /></label>
      <label className="text-sm font-semibold sm:col-span-2">Image URL<input required className={`${fieldClass} mt-1`} value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="Upload an image or paste a URL" /></label>
      <label className="w-fit cursor-pointer rounded-xl border border-lime-600 px-4 py-2.5 text-sm font-bold text-lime-700">{busy ? 'Working…' : 'Upload banner image'}<input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label>
      {form.imageUrl ? <img src={resolveAssetUrl(form.imageUrl) || undefined} alt="Banner preview" className="h-24 w-full rounded-xl object-cover sm:col-span-2" /> : null}
      <label className="text-sm font-semibold">Click destination URL<input className={`${fieldClass} mt-1`} value={form.linkUrl} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} placeholder="Optional" /></label>
      <label className="text-sm font-semibold">Display order<input type="number" className={`${fieldClass} mt-1`} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></label>
      <button disabled={busy} className="rounded-xl bg-lime-600 px-4 py-3 font-bold text-white disabled:opacity-60 sm:col-span-2">Add banner</button>
    </form>
    <div className="mt-6 grid gap-4">{items.map((item) => <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><img src={resolveAssetUrl(item.imageUrl) || undefined} alt="" className="h-20 w-32 rounded-lg object-cover" /><div className="min-w-40 flex-1"><b>{item.title}</b><p className="m-0 text-sm text-neutral-500">{item.subtitle || 'No subtitle'} · order {item.sortOrder}</p><span className={item.active ? 'text-sm font-semibold text-lime-700' : 'text-sm font-semibold text-neutral-500'}>{item.active ? 'Active' : 'Hidden'}</span></div><button disabled={busy} onClick={() => void toggle(item)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold">{item.active ? 'Hide' : 'Show'}</button><button disabled={busy} onClick={() => void remove(item)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Delete</button></article>)}</div>
    {!items.length ? <p className="mt-5 rounded-xl border border-dashed border-neutral-300 p-6 text-center text-neutral-500">No banners added yet.</p> : null}
  </section>;
}
