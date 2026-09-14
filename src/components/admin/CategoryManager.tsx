import { useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { API_ORIGIN } from '../../config';
import type { Category } from '../../types';

interface CategoryManagerProps {
  categories: Category[];
  onCategoryChanged?: () => void;
}

const CategoryManager = ({ categories, onCategoryChanged }: CategoryManagerProps) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setMessage('Category name is required');
      setMessageType('error');
      return;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_ORIGIN}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (response.ok) {
      setName('');
      setMessage('Category created successfully');
      setMessageType('success');
      onCategoryChanged?.();
    } else {
      setMessage('Unable to create category');
      setMessageType('error');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-100 text-lime-700">
            <Tag size={18} strokeWidth={2} />
          </span>
          <h3 className="text-xl font-bold text-neutral-900">Categories</h3>
        </div>
        <span className="text-sm font-semibold text-neutral-400">{categories.length} total</span>
      </div>

      <form className="mt-5 flex gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="flex items-center gap-1.5 rounded-lg bg-lime-600 px-4 py-2 font-semibold text-white transition hover:bg-lime-700"
          type="submit"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span
            key={category.id}
            className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-sm font-semibold text-lime-800 transition hover:border-lime-400 hover:bg-lime-100"
          >
            {category.name}
          </span>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-neutral-400">No categories yet. Add your first one above.</p>
        )}
      </div>

      {message && (
        <p className={`mt-4 text-sm font-semibold ${messageType === 'success' ? 'text-lime-700' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default CategoryManager;