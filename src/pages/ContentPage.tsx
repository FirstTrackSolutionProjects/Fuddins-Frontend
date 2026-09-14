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
    <div className="bg-white">
      <h3 className="mb-3 mt-0 text-[#164e28]">{title || 'Content Page'}</h3>
      <p className="m-0 leading-[1.65] text-neutral-600">{content || 'Content will appear here once the page is created.'}</p>
    </div>
  );
};

export default ContentPage;
