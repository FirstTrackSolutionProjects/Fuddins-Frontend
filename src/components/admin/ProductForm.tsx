// CKEditor 5's bundled build has incompatible legacy typings; runtime API is valid.
// @ts-nocheck
import { useEffect, useState, type FormEvent } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { PackagePlus, Image as ImageIcon, Tag, Boxes, FileText, ChevronDown } from 'lucide-react';
import { fetchCategories } from '../../api';
import { API_BASE_URL, API_ORIGIN } from '../../config';
import type { Category, Product } from '../../types';

interface ProductFormProps {
  editingProduct?: Product | null;
  onProductChanged?: () => void;
  onCancel?: () => void;
}

const inputClass =
  'w-full min-w-0 max-w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100';

const sectionLabelClass = 'flex items-center gap-2 text-sm font-bold text-neutral-700';

type DropdownOption = { value: string; label: string };

const ProductDropdown = ({ options, value, placeholder, open, onToggle, onChange, placement = 'down' }: { options: DropdownOption[]; value: string; placeholder: string; open: boolean; onToggle: () => void; onChange: (value: string) => void; placement?: 'up' | 'down' }) => {
  const selectedLabel = options.find((option) => option.value === value)?.label || placeholder;

  return <div className="relative min-w-0">
    <button type="button" aria-expanded={open} onClick={onToggle} className={`${inputClass} flex items-center justify-between gap-3 text-left`}>
      <span className={value ? 'truncate' : 'truncate text-neutral-400'}>{selectedLabel}</span>
      <ChevronDown size={17} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open ? <div role="listbox" className={`absolute left-0 z-30 max-h-56 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg ${placement === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
      {options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => onChange(option.value)} className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-lime-50 ${option.value === value ? 'bg-lime-50 font-semibold text-lime-800' : 'text-neutral-700'}`}>{option.label}</button>)}
    </div> : null}
  </div>;
};

const ProductForm = ({ editingProduct, onProductChanged, onCancel }: ProductFormProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockStatus, setStockStatus] = useState('instock');
  const [openDropdown, setOpenDropdown] = useState<'stock' | 'category' | null>(null);
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
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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
      setMessageType('success');
    } else {
      setMessage('Unable to upload image');
      setMessageType('error');
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
      setMessageType('success');
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
      setMessageType('error');
    }
  };

  return (
    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-100 text-lime-700">
          <PackagePlus size={18} strokeWidth={2} />
        </span>
        <h3 className="text-xl font-bold text-neutral-900">{editingProduct ? 'Edit product' : 'Create product'}</h3>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {/* Basic info */}
        <div className="space-y-3">
          <p className={sectionLabelClass}>
            <Tag size={14} className="text-lime-600" />
            Basic info
          </p>
          <input className={inputClass} placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className={inputClass} placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
            <input className={inputClass} placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-3 border-t border-neutral-100 pt-5">
          <p className={sectionLabelClass}>
            <Boxes size={14} className="text-lime-600" />
            Pricing and stock
          </p>
          <input className={inputClass} placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <div className="grid gap-3 md:grid-cols-2">
            <input className={inputClass} placeholder="Regular price" type="number" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
            <input className={inputClass} placeholder="Sale price" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input className={inputClass} placeholder="Stock quantity" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
            <ProductDropdown options={[{ value: 'instock', label: 'In stock' }, { value: 'outofstock', label: 'Out of stock' }, { value: 'onbackorder', label: 'On backorder' }]} value={stockStatus} placeholder="Select stock status" open={openDropdown === 'stock'} onToggle={() => setOpenDropdown((current) => current === 'stock' ? null : 'stock')} onChange={(value) => { setStockStatus(value); setOpenDropdown(null); }} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 border-t border-neutral-100 pt-5">
          <p className={sectionLabelClass}>
            <FileText size={14} className="text-lime-600" />
            Description
          </p>
          <label className="text-sm font-bold">Short description<CKEditor editor={ClassicEditor} data={description} onChange={(_, editor) => setDescription(editor.getData())} /></label>
          <label className="text-sm font-bold">Full description<CKEditor editor={ClassicEditor} data={fullDescription} onChange={(_, editor) => setFullDescription(editor.getData())} /></label>
        </div>

        {/* Media */}
        <div className="space-y-3 border-t border-neutral-100 pt-5">
          <p className={sectionLabelClass}>
            <ImageIcon size={14} className="text-lime-600" />
            Media
          </p>
          <label className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-lime-300 bg-lime-50 px-3 py-3 text-sm font-semibold text-lime-700 transition hover:bg-lime-100">
            {uploading ? 'Uploading...' : 'Choose an image to upload'}
            <input className="hidden" type="file" accept="image/*" onChange={handleUpload} />
          </label>
          <input className={inputClass} placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <input className={inputClass} placeholder="Gallery image URLs, comma separated" value={galleryImages} onChange={(e) => setGalleryImages(e.target.value)} />
        </div>

        {/* Attributes and category */}
        <div className="space-y-3 border-t border-neutral-100 pt-5">
          <p className={sectionLabelClass}>
            <Boxes size={14} className="text-lime-600" />
            Attributes and category
          </p>
          <textarea className={`${inputClass} min-h-[70px]`} placeholder="Attributes JSON/text" value={attributes} onChange={(e) => setAttributes(e.target.value)} />
          <textarea className={`${inputClass} min-h-[70px]`} placeholder="Variations JSON/text" value={variations} onChange={(e) => setVariations(e.target.value)} />
          <ProductDropdown options={[{ value: '', label: 'Select a category' }, ...categories.map((category) => ({ value: String(category.id), label: category.name }))]} value={categoryId} placeholder="Select a category" open={openDropdown === 'category'} onToggle={() => setOpenDropdown((current) => current === 'category' ? null : 'category')} onChange={(value) => { setCategoryId(value); setOpenDropdown(null); }} placement="up" />
        </div>

        <div className="space-y-2 pt-1">
          <button className="w-full rounded-lg bg-lime-600 px-4 py-2.5 font-semibold text-white transition hover:bg-lime-700" type="submit">
            {editingProduct ? 'Update product' : 'Create product'}
          </button>
          {editingProduct && (
            <button
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 font-semibold text-neutral-600 transition hover:bg-neutral-50"
              type="button"
              onClick={() => onCancel?.()}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {message && (
        <p className={`mt-4 text-sm font-semibold ${messageType === 'success' ? 'text-lime-700' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ProductForm;
