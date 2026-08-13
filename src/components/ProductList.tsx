import { useState } from 'react';
import { API_BASE_URL, resolveAssetUrl } from '../config';
import type { Product } from '../types';

interface ProductListProps {
  products: Product[];
  isAdmin?: boolean;
  onAddToCart?: (product: Product) => void;
  onDeleteProduct?: (productId: number) => void;
  onEditProduct?: (product: Product) => void;
}

const ProductList = ({ products, isAdmin = false, onAddToCart, onDeleteProduct, onEditProduct }: ProductListProps) => {
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
      <h3 className="text-xl font-semibold">Products Catalog</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {products.map((product) => {
          const imageSrc = resolveAssetUrl(product.imageUrl);

          return (
            <div key={product.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              {imageSrc ? (
                <div className="mb-3 overflow-hidden rounded-lg border border-slate-800">
                  <img src={imageSrc} alt={product.name} className="h-32 w-full object-cover" />
                </div>
              ) : null}
              <p className="font-semibold">{product.name}</p>
              <p className="mt-2 text-sm text-slate-400">{product.description}</p>
              <p className="mt-3 text-cyan-400">Rs. {product.price}</p>
              <p className="mt-2 text-sm text-slate-500">{product.category?.name || 'Uncategorized'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950" type="button" onClick={() => onAddToCart?.(product)}>
                  Add to cart
                </button>
                {isAdmin ? (
                  <>
                    <button className="rounded-lg bg-slate-800 px-3 py-2 text-sm" type="button" onClick={() => onEditProduct?.(product)}>
                      Edit
                    </button>
                    <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm" type="button" onClick={() => handleDelete(product)} disabled={busyId === product.id}>
                      {busyId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
