import { useState } from 'react';
import { API_BASE_URL } from '../config';
import type { Product } from '../types';

interface AdminPanelProps {
  products: Product[];
  onDeleteProduct?: (productId: number) => void;
  onEditProduct?: (product: Product) => void;
}

const AdminPanel = ({ products, onDeleteProduct, onEditProduct }: AdminPanelProps) => {
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleDelete = async (product: Product) => {
    setBusyId(product.id);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.ok) {
      onDeleteProduct?.(product.id);
    }

    setBusyId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Admin Management</h3>
        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">{products.length} items</span>
      </div>
      <div className="mt-4 space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-slate-400">₹{product.price}</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-slate-800 px-3 py-2 text-sm" type="button" onClick={() => onEditProduct?.(product)}>
                Edit
              </button>
              <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm" type="button" onClick={() => handleDelete(product)} disabled={busyId === product.id}>
                {busyId === product.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
