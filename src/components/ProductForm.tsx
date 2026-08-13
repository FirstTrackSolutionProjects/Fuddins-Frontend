import { useEffect, useState, type FormEvent } from 'react';
import { fetchCategories } from '../api';
import { API_BASE_URL, API_ORIGIN } from '../config';
import type { Category, Product } from '../types';

interface ProductFormProps {
  editingProduct?: Product | null;
  onProductChanged?: () => void;
  onCancel?: () => void;
}

const ProductForm = ({ editingProduct, onProductChanged, onCancel }: ProductFormProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockStatus, setStockStatus] = useState('instock');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState('');
  const [attributes, setAttributes] = useState('');
  const [variations, setVariations] = useState('');
  const [uploading, setUploading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setPrice(String(editingProduct.price ?? ''));
      setRegularPrice(String(editingProduct.regularPrice ?? ''));
      setSalePrice(String(editingProduct.salePrice ?? ''));
      setSku(editingProduct.sku || '');
      setBrand(editingProduct.brand || '');
      setStockQuantity(String(editingProduct.stockQuantity ?? ''));
      setStockStatus(editingProduct.stockStatus || 'instock');
      setDescription(editingProduct.description || '');
      setFullDescription(editingProduct.fullDescription || '');
      setImageUrl(editingProduct.imageUrl || '');
      setGalleryImages(editingProduct.galleryImages || '');
      setAttributes(editingProduct.attributes || '');
      setVariations(editingProduct.variations || '');
      setCategoryId(editingProduct.categoryId ? String(editingProduct.categoryId) : '');
    } else {
      setName('');
      setPrice('');
      setRegularPrice('');
      setSalePrice('');
      setSku('');
      setBrand('');
      setStockQuantity('');
      setStockStatus('instock');
      setDescription('');
      setFullDescription('');
      setImageUrl('');
      setGalleryImages('');
      setAttributes('');
      setVariations('');
      setCategoryId('');
    }
  }, [editingProduct]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    const response = await fetch(`${API_ORIGIN}/uploads`, {
      method: 'POST',
      headers: {
        ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setImageUrl(data.imageUrl);
      setMessage('Image uploaded successfully');
    } else {
      setMessage('Unable to upload image');
    }

    setUploading(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `${API_BASE_URL}/products/${editingProduct.id}` : `${API_BASE_URL}/products`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        regularPrice: regularPrice ? Number(regularPrice) : null,
        salePrice: salePrice ? Number(salePrice) : null,
        sku: sku || null,
        brand: brand || null,
        stockQuantity: stockQuantity ? Number(stockQuantity) : null,
        stockStatus,
        description,
        fullDescription,
        imageUrl: imageUrl || null,
        galleryImages: galleryImages || null,
        attributes: attributes || null,
        variations: variations || null,
        categoryId: categoryId ? Number(categoryId) : null,
      }),
    });

    if (response.ok) {
      setMessage(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setName('');
      setPrice('');
      setRegularPrice('');
      setSalePrice('');
      setSku('');
      setBrand('');
      setStockQuantity('');
      setStockStatus('instock');
      setDescription('');
      setFullDescription('');
      setImageUrl('');
      setGalleryImages('');
      setAttributes('');
      setVariations('');
      setCategoryId('');
      onProductChanged?.();
      onCancel?.();
    } else {
      setMessage(editingProduct ? 'Unable to update product' : 'Unable to create product');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold">{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <div className="grid gap-3 md:grid-cols-2">
          <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Regular price" type="number" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
          <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Sale price" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
          <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Stock quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
          <select className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={stockStatus} onChange={(e) => setStockStatus(e.target.value)}>
            <option value="instock">In stock</option>
            <option value="outofstock">Out of stock</option>
            <option value="onbackorder">On backorder</option>
          </select>
        </div>
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Full description" value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" type="file" accept="image/*" onChange={handleUpload} />
        {uploading ? <p className="text-sm text-slate-400">Uploading...</p> : null}
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Gallery image URLs, comma separated" value={galleryImages} onChange={(e) => setGalleryImages(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Attributes JSON/text" value={attributes} onChange={(e) => setAttributes(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Variations JSON/text" value={variations} onChange={(e) => setVariations(e.target.value)} />
        <select className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950" type="submit">
          {editingProduct ? 'Update Product' : 'Create Product'}
        </button>
        {editingProduct && (
          <button className="w-full rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-200" type="button" onClick={() => onCancel?.()}>
            Cancel Edit
          </button>
        )}
      </form>
      {message && <p className="mt-4 text-sm text-cyan-400">{message}</p>}
    </div>
  );
};

export default ProductForm;
