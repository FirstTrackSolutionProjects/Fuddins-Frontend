import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, fetchPages, fetchProducts, fetchUsers } from './api';
import type { AuthResponse } from './auth';
import AdminPanel from './components/AdminPanel';
import AdvancedCommerceManager from './components/AdvancedCommerceManager';
import AccountCommercePanel from './components/AccountCommercePanel';
import AuthPanel from './components/AuthPanel';
import AboutPage from './components/AboutPage';
import CategoryManager from './components/CategoryManager';
import ContactForm from './components/ContactForm';
import ContactInbox from './components/ContactInbox';
import ContentPage from './components/ContentPage';
import CouponManager from './components/CouponManager';
import HomePage from './components/HomePage';
import CareerPage from './components/CareerPage';
import ApplyShoppingCardPage from './components/ApplyShoppingCardPage';
import Header from './components/Header';
import Footer from './components/Footer';
import MembershipPlansPage from './components/MembershipPlansPage';
import MenuUploadPage from './components/MenuUploadPage';
import OnboardingEnquiryPage from './components/OnboardingEnquiryPage';
// LandingPage import removed
import OrdersPanel from './components/OrdersPanel';
import PageManager from './components/PageManager';
import PartnerOperationsPanel from './components/PartnerOperationsPanel';
import PartnerPage from './components/PartnerPage';
import PartnerRegistrationPage from './components/PartnerRegistrationPage';
import ProductForm from './components/ProductForm';
import ShopPage from './components/ShopPage';
import VendorRegistrationForm from './components/VendorRegistrationForm';
import type { CartItem, Category, Page, Product, ProductVariation, User } from './types';

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

const preferredPageOrder = ['about', 'contact', 'refer-earn', 'privacy-policy', 'terms-conditions', 'shipping-delivery-policy', 'cancellation-refund-policy'];

const parseVariations = (product: Product): ProductVariation[] => {
  if (!product.variations) {
    return [];
  }

  try {
    const variations = JSON.parse(product.variations) as ProductVariation[];
    return Array.isArray(variations) ? variations : [];
  } catch {
    return [];
  }
};

const cartKey = (product: Product, variation?: ProductVariation | null) => `${product.id}:${variation?.id || 'default'}`;

// Handles all dynamic content pages EXCEPT "about", which has its own dedicated route/component below.
const ContentRoute = ({ pages }: { pages: Page[] }) => {
  const { slug = 'contact' } = useParams();
  const pageExists = pages.some((page) => page.slug === slug);
  if (!pageExists) return <Navigate to="/" replace />;
  return <section className="content-view">
    <div className="page-tabs">
      {pages.map((page) => <NavLink key={page.slug} className={({ isActive }) => isActive ? 'active' : ''} to={`/pages/${page.slug}`}>{page.title}</NavLink>)}
    </div>
    <ContentPage slug={slug} />
  </section>;
};

const AdminLayout = () => <section className="admin-section">
  <div className="admin-heading">
    <h2>Admin & operations</h2>
    <p>Manage store operations from separate workspaces.</p>
  </div>
  <nav className="admin-nav" aria-label="Admin sections">
    <NavLink to="/admin/products">Products</NavLink>
    <NavLink to="/admin/categories">Categories</NavLink>
    <NavLink to="/admin/orders">Orders</NavLink>
    <NavLink to="/admin/coupons">Coupons</NavLink>
    <NavLink to="/admin/commerce">Commerce</NavLink>
    <NavLink to="/admin/inbox">Inbox</NavLink>
    <NavLink to="/admin/pages">Pages</NavLink>
  </nav>
  <Outlet />
</section>;

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVariations, setSelectedVariations] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [openMenu, setOpenMenu] = useState<'products' | 'partner' | 'about' | null>(null);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'admin_team';
  const isPartner = Boolean(currentUser && currentUser.role !== 'user');

  const loadData = async () => {
    setLoading(true);
    try {
      const [productData, categoryData, pageData] = await Promise.all([fetchProducts(), fetchCategories(), fetchPages()]);
      setProducts(productData);
      setCategories(categoryData);
      setPages(pageData);
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
    navigate('/');
  };

  const openPage = (slug: string) => {
    setOpenMenu(null);
    navigate(`/pages/${slug}`);
  };

  const openCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setOpenMenu(null);
    navigate('/shop');
  };

  const addToCart = (product: Product) => {
    const variations = parseVariations(product);
    const selectedVariationId = selectedVariations[product.id];
    const variation = variations.find((item) => item.id === selectedVariationId) || variations[0] || null;
    const key = cartKey(product, variation);
    setCartItems((current) => {
      const existing = current.find((item) => cartKey(item.product, item.variation) === key);
      if (existing) {
        return current.map((item) => (cartKey(item.product, item.variation) === key ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...current, { product, variation, quantity: 1 }];
    });
  };

  const updateCartQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => cartKey(item.product, item.variation) !== key));
      return;
    }

    setCartItems((current) => current.map((item) => (cartKey(item.product, item.variation) === key ? { ...item, quantity } : item)));
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
    setCartItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const visiblePages = useMemo(
    () =>
      [...pages]
        .filter((page) => page.slug !== 'home')
        .sort((a, b) => {
          const aIndex = preferredPageOrder.indexOf(a.slug);
          const bIndex = preferredPageOrder.indexOf(b.slug);
          if (aIndex !== -1 || bIndex !== -1) {
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
          }
          return a.title.localeCompare(b.title);
        }),
    [pages]
  );

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  return (
    <div className="storefront">
      <Header
        currentUser={currentUser}
        categories={categories}
        isAdmin={isAdmin}
        isPartner={isPartner}
        search={search}
        openMenu={openMenu}
        onSearchChange={setSearch}
        onSearchSubmit={() => navigate('/shop')}
        onToggleMenu={setOpenMenu}
        onOpenCategory={openCategory}
      />

      <main>
        <Routes>
          <Route path="/" element={<HomePage categories={categories} products={products} onOpenShop={() => navigate('/shop')} onCategorySelect={(categoryId) => { setSelectedCategory(categoryId); navigate('/shop'); }} onAddToCart={addToCart} />} />
          <Route path="/shop" element={<ShopPage
            categories={categories} products={products} pages={visiblePages} cartItems={cartItems}
            search={search} selectedCategory={selectedCategory} selectedVariations={selectedVariations} loading={loading}
            onSearchChange={setSearch} onCategoryChange={setSelectedCategory}
            onVariationChange={(productId, variationId) => setSelectedVariations((current) => ({ ...current, [productId]: variationId }))}
            onAddToCart={addToCart} onClearCart={() => setCartItems([])}
            onRemoveCartItem={(key) => setCartItems((current) => current.filter((item) => cartKey(item.product, item.variation) !== key))}
            onUpdateQuantity={updateCartQuantity} onOrderPlaced={loadData} onOpenPage={openPage}
          />} />
          <Route path="/pages/about" element={<AboutPage />} />
          <Route path="/pages/:slug" element={<ContentRoute pages={visiblePages} />} />
          <Route path="/account" element={<section className="account-section"><h2>Account</h2><AuthPanel currentUser={currentUser} onAuthenticated={handleAuthenticated} onLogout={handleLogout} /><AccountCommercePanel user={currentUser} /></section>} />
          <Route path="/contact" element={<section className="form-section"><ContactForm />{!currentUser || currentUser.role === 'user' ? <VendorRegistrationForm /> : null}</section>} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="/partner/membership-plans" element={<MembershipPlansPage />} />
          <Route path="/partner/register" element={<PartnerRegistrationPage />} />
          <Route path="/partner/apply-shopping-card" element={<ApplyShoppingCardPage />} />
          <Route path="/partner/executive-login" element={<Navigate to="/account" replace />} />
          <Route path="/partner/menu-upload" element={<MenuUploadPage />} />
          <Route path="/partner/onboarding-enquiry" element={<OnboardingEnquiryPage />} />
          <Route path="/partner/dashboard" element={isPartner && !isAdmin ? <section className="partner-section"><PartnerOperationsPanel role={currentUser?.role === 'delivery' ? 'delivery' : 'vendor'} user={currentUser!} /></section> : <Navigate to="/account" replace />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/account" replace />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<div className="admin-grid"><ProductForm editingProduct={editingProduct} onProductChanged={loadData} onCancel={() => setEditingProduct(null)} /><AdminPanel products={products} onDeleteProduct={handleDeleteProduct} onEditProduct={setEditingProduct} /></div>} />
            <Route path="categories" element={<div className="admin-grid"><CategoryManager categories={categories} onCategoryChanged={loadData} /></div>} />
            <Route path="orders" element={<div className="admin-grid"><OrdersPanel /></div>} />
            <Route path="coupons" element={<div className="admin-grid"><CouponManager /></div>} />
            <Route path="commerce" element={<div className="admin-grid"><AdvancedCommerceManager /></div>} />
            <Route path="inbox" element={<div className="admin-grid"><ContactInbox /></div>} />
            <Route path="pages" element={<div className="admin-grid"><PageManager /></div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;