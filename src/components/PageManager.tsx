import { useEffect, useState } from 'react';
import { API_ORIGIN } from '../config';

interface PageItem {
  id: number;
  slug: string;
  title: string;
  content: string;
}

const PageManager = () => {
  const [slug, setSlug] = useState('about');
  const [title, setTitle] = useState('About Us');
  const [content, setContent] = useState('Welcome to our store.');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [message, setMessage] = useState('');

  const loadPages = async () => {
    const response = await fetch(`${API_ORIGIN}/pages`);
    if (response.ok) {
      const data = await response.json();
      setPages(data);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_ORIGIN}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ slug, title, content }),
    });

    if (response.ok) {
      setMessage('Page saved successfully');
      await loadPages();
    } else {
      setMessage('Unable to save page');
    }
  };

  const handleSelect = (page: PageItem) => {
    setSlug(page.slug);
    setTitle(page.title);
    setContent(page.content);
  };

  const handleDelete = async (page: PageItem) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_ORIGIN}/pages/${page.slug}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.ok) {
      setMessage('Page deleted successfully');
      await loadPages();
    } else {
      setMessage('Unable to delete page');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold">CMS Pages</h3>
      <div className="mt-4 space-y-3">
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Page slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Page title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Page content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
        <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950" type="button" onClick={handleSave}>
          Save Page
        </button>
      </div>

      <div className="mt-4">
        <p className="text-sm text-slate-400">Saved pages</p>
        <div className="mt-2 space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
              <button type="button" className="flex-1 text-left" onClick={() => handleSelect(page)}>
                <p className="font-medium">{page.title}</p>
                <p className="text-sm text-slate-400">/{page.slug}</p>
              </button>
              <button type="button" className="rounded-lg bg-rose-600 px-3 py-2 text-sm" onClick={() => handleDelete(page)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-cyan-400">{message}</p>}
    </div>
  );
};

export default PageManager;
