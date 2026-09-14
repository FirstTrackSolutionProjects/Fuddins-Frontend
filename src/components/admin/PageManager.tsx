import { useEffect, useState } from 'react';
import { FileText, Save, Trash2, Link2 } from 'lucide-react';
import { API_ORIGIN } from '../../config';

interface PageItem {
  id: number;
  slug: string;
  title: string;
  content: string;
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100';

const PageManager = () => {
  const [slug, setSlug] = useState('about');
  const [title, setTitle] = useState('About Us');
  const [content, setContent] = useState('Welcome to our store.');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [activeSlug, setActiveSlug] = useState('');

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
      setMessageType('success');
      await loadPages();
    } else {
      setMessage('Unable to save page');
      setMessageType('error');
    }
  };

  const handleSelect = (page: PageItem) => {
    setSlug(page.slug);
    setTitle(page.title);
    setContent(page.content);
    setActiveSlug(page.slug);
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
      setMessageType('success');
      await loadPages();
    } else {
      setMessage('Unable to delete page');
      setMessageType('error');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-100 text-lime-700">
          <FileText size={18} strokeWidth={2} />
        </span>
        <h3 className="text-xl font-bold text-neutral-900">CMS pages</h3>
      </div>

      <div className="mt-5 space-y-3">
        <input className={inputClass} placeholder="Page slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className={inputClass} placeholder="Page title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={`${inputClass} min-h-[120px]`} placeholder="Page content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
        <button
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-lime-600 px-4 py-2.5 font-semibold text-white transition hover:bg-lime-700"
          type="button"
          onClick={handleSave}
        >
          <Save size={16} />
          Save page
        </button>
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-5">
        <p className="text-sm font-bold text-neutral-500">Saved pages</p>
        <div className="mt-3 space-y-2">
          {pages.length === 0 ? (
            <p className="text-sm text-neutral-400">No pages saved yet.</p>
          ) : (
            pages.map((page) => {
              const isActive = page.slug === activeSlug;
              return (
                <div
                  key={page.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition ${
                    isActive ? 'border-lime-300 bg-lime-50' : 'border-neutral-200 bg-neutral-50 hover:border-lime-200'
                  }`}
                >
                  <button type="button" className="flex-1 text-left" onClick={() => handleSelect(page)}>
                    <p className="font-semibold text-neutral-900">{page.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-400">
                      <Link2 size={12} />/{page.slug}
                    </p>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    onClick={() => handleDelete(page)}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {message && (
        <p className={`mt-4 text-sm font-semibold ${messageType === 'success' ? 'text-lime-700' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default PageManager;