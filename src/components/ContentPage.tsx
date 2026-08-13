import { useEffect, useState } from 'react';
import { API_ORIGIN } from '../config';

interface ContentPageProps {
  slug: string;
}

const ContentPage = ({ slug }: ContentPageProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadPage = async () => {
      const response = await fetch(`${API_ORIGIN}/pages/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
      }
    };

    loadPage();
  }, [slug]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold">{title || 'Content Page'}</h3>
      <p className="mt-4 text-slate-300">{content || 'Content will appear here once the page is created.'}</p>
    </div>
  );
};

export default ContentPage;
