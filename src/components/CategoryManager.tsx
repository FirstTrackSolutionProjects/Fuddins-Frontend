import { useState } from 'react';
import { API_ORIGIN } from '../config';
import type { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onCategoryChanged?: () => void;
}

const CategoryManager = ({ categories, onCategoryChanged }: CategoryManagerProps) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setMessage('Category name is required');
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
      onCategoryChanged?.();
    } else {
      setMessage('Unable to create category');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold">Categories</h3>
      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950" type="submit">
          Add
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span key={category.id} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
            {category.name}
          </span>
        ))}
      </div>
      {message && <p className="mt-4 text-sm text-cyan-400">{message}</p>}
    </div>
  );
};

export default CategoryManager;
