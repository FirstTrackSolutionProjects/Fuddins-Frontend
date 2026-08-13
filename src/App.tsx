import { useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchProducts, fetchUsers } from './api';
import type { AuthResponse } from './auth';
import AdminPanel from './components/AdminPanel';
import AdvancedCommerceManager from './components/AdvancedCommerceManager';
import AuthPanel from './components/AuthPanel';
import CartPanel from './components/CartPanel';
import CategoryManager from './components/CategoryManager';
import ContentPage from './components/ContentPage';
import CouponManager from './components/CouponManager';
import OrdersPanel from './components/OrdersPanel';
import PageManager from './components/PageManager';
import ProductForm from './components/ProductForm';
import { resolveAssetUrl } from './config';
import type { CartItem, Category, Product, User } from './types';

const categoryImages: Record<string, string> = {
  Groceries: '/legacy-uploads/2022/10/Groceries-1-150x150.jpg',
  Vegetables: '/legacy-uploads/2022/10/Groceries-2-150x150.jpg',
  Fruits: '/legacy-uploads/2022/10/Groceries-3-150x150.jpg',
  Dairy: '/legacy-uploads/2022/10/Groceries-4-150x150.jpg',
  Desserts: '/legacy-uploads/2022/10/FAVOURITE-FOOD-150x150.jpg',
  Snacks: '/legacy-uploads/2022/10/fast-food-6974507_1920-150x150.jpg',
  'Food Items': '/legacy-uploads/2022/10/FAVOURITE-FOOD-1-150x150.jpg',
  'Baby care': '/legacy-uploads/2022/10/Groceries-5-150x150.jpg',
  'Bakery Corner': '/legacy-uploads/2022/10/Groceries-6-150x150.jpg',
  Cosmetics: '/legacy-uploads/2022/10/Groceries-8-150x150.jpg',
  Flower: '/legacy-uploads/2022/10/Groceries-9-150x150.jpg',
  Footwear: '/legacy-uploads/2022/10/Groceries-10-150x150.jpg',
  Garments: '/legacy-uploads/2022/10/Groceries-11-150x150.jpg',
};

const getStoredUser = () => {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(productData);
      setCategories(categoryData);
      setUsers(isAdmin ? await fetchUsers() : []);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = (response: AuthResponse) => {
    setCurrentUser(response.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUsers([]);
    setEditingProduct(null);
  };

  const addToCart = (product: Product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.product.id !== productId));
      return;
    }

    setCartItems((current) => current.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
    setCartItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || String(product.categoryId) === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [products, search, selectedCategory]
  );

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  return (
    <div className="storefront">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <img src={resolveAssetUrl('/legacy-uploads/2022/10/FUDDINS-1.png') || ''} alt="Fuddins" />
            <div>
              <strong>fuddins.com</strong>
              <span>Your Comfort Partner</span>
            </div>
          </div>
          <nav>
            <a href="#home">Home</a>
            <a href="#shop">Shop</a>
            <a href="#about">About</a>
            <a href="#cart">Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</a>
          </nav>
        </div>
      </header>

      <main id="home">
        <section className="search-strip">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for products" />
          <button type="button">Search</button>
        </section>

        <section className="category-row" aria-label="Product categories">
          {categories.slice(0, 10).map((category) => {
            const src = resolveAssetUrl(categoryImages[category.name] || '/legacy-uploads/2022/10/FUDDINS-1-150x150.png');
            return (
              <button key={category.id} type="button" className={selectedCategory === String(category.id) ? 'category-tile active' : 'category-tile'} onClick={() => setSelectedCategory(String(category.id))}>
                {src ? <img src={src} alt="" /> : null}
                <span>{category.name}</span>
              </button>
            );
          })}
        </section>

        <div className="shop-layout" id="shop">
          <section className="shop-main">
            <div className="shop-heading">
              <h1>Shop</h1>
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {loading ? <p className="muted">Loading products...</p> : null}
            {!loading && filteredProducts.length === 0 ? <p className="muted">No products found.</p> : null}

            <div className="product-grid">
              {filteredProducts.map((product) => {
                const imageSrc = resolveAssetUrl(product.imageUrl);
                return (
                  <article key={product.id} className="product-card">
                    <div className="product-image">{imageSrc ? <img src={imageSrc} alt={product.name} /> : <span>No image</span>}</div>
                    <p className="product-category">{product.category?.name || 'Uncategorized'}</p>
                    <h2>{product.name}</h2>
                    <p className="price">Rs. {product.price}</p>
                    <button type="button" onClick={() => addToCart(product)}>
                      Add to cart
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="shop-side" id="cart">
            <CartPanel
              cartItems={cartItems}
              onClearCart={() => setCartItems([])}
              onRemoveItem={(productId) => setCartItems((current) => current.filter((item) => item.product.id !== productId))}
              onUpdateQuantity={updateCartQuantity}
              onOrderPlaced={loadData}
            />
            <div id="about">
              <ContentPage slug="about" />
            </div>
          </aside>
        </div>

        <section className="account-section">
          <h2>Account</h2>
          <AuthPanel currentUser={currentUser} onAuthenticated={handleAuthenticated} onLogout={handleLogout} />
        </section>

        {isAdmin ? (
          <section className="admin-section">
            <div className="admin-heading">
              <h2>Admin Management</h2>
              <p>{users.length} users loaded</p>
            </div>
            <div className="admin-grid">
              <ProductForm editingProduct={editingProduct} onProductChanged={loadData} onCancel={() => setEditingProduct(null)} />
              <CategoryManager categories={categories} onCategoryChanged={loadData} />
              <CouponManager />
              <AdvancedCommerceManager />
              <PageManager />
              <OrdersPanel />
              <AdminPanel products={products} onDeleteProduct={handleDeleteProduct} onEditProduct={setEditingProduct} />
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default App;
