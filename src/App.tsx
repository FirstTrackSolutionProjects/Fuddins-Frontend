import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, fetchPages, fetchProducts, fetchUsers } from './api';
import type { AuthResponse } from './auth';
import AdminPanel from './components/admin/AdminPanel';
import AdminLayout from './components/admin/AdminLayout';
import AdminProfile from './components/admin/AdminProfile';
import BannerManager from './components/admin/BannerManager';
import { API_ORIGIN } from './config';
import PartnerProfile from './components/shared/PartnerProfilePage';
import AdvancedCommerceManager from './components/admin/AdvancedCommerceManager';
import AccountCommercePanel from './components/customer/AccountCommercePanel';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerPortal from './components/customer/CustomerPortal';
import AuthPanel from './components/customer/AuthPanel';
import AboutPage from './pages/AboutPage';
import CategoryManager from './components/admin/CategoryManager';
import ContactForm from './pages/ContactForm';
import ContactPage from './pages/ContactPage';
import ContactInbox from './components/admin/ContactInbox';
import DeliveryTeamManager from './components/admin/DeliveryTeamManager';
import ContentPage from './pages/ContentPage';
import CouponManager from './components/admin/CouponManager';
import HomePage from './pages/HomePage';
import CareerPage from './pages/CareerPage';
import ApplyShoppingCardPage from './pages/ApplyShoppingCardPage';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import MembershipPlansPage from './pages/MembershipPlansPage';
import MenuUploadPage from './components/vendor/MenuUploadPage';
import OnboardingEnquiryPage from './pages/OnboardingEnquiryPage';
// LandingPage import removed
import OrdersPanel from './components/admin/OrdersPanel';
import PageManager from './components/admin/PageManager';
import VendorDashboard from './components/vendor/VendorDashboard';
import VendorOperations from './components/vendor/VendorOperations';
import DeliveryDashboard from './components/delivery/DeliveryDashboard';
import DeliveryHistory from './components/delivery/DeliveryHistory';
import DeliveryWallet from './components/delivery/DeliveryWallet';
import DeliveryWithdrawalsManager from './components/admin/DeliveryWithdrawalsManager';
import PartnerPage from './pages/PartnerPage';
import PartnerRegistrationPage from './components/vendor/PartnerRegistrationPage';
import ProductForm from './components/admin/ProductForm';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ShopPage from './pages/ShopPage';
import ShoppingCartDrawer from './components/customer/ShoppingCartDrawer';
import VendorRegistrationForm from './components/vendor/VendorRegistrationForm';
import VendorWelcomePage from './pages/VendorWelcomePage';
import VendorApprovalManager from './components/admin/VendorApprovalManager';
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

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [banners, setBanners] = useState<Array<{ id: number; title: string; subtitle?: string | null; imageUrl: string; linkUrl?: string | null }>>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVariations, setSelectedVariations] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [openMenu, setOpenMenu] = useState<'products' | 'partner' | 'about' | null>(null);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'admin_team';
  const isPartner = Boolean(currentUser && currentUser.role !== 'user');

  const loadData = async () => {
    setLoading(true);
    setDataError('');
    const [productResult, categoryResult, pageResult, bannerResult, userResult] = await Promise.allSettled([
      fetchProducts().then((data) => { setProducts(data); return data; }),
      fetchCategories().then((data) => { setCategories(data); return data; }),
      fetchPages().then((data) => { setPages(data); return data; }),
      fetch(`${API_ORIGIN}/banners`, { signal: AbortSignal.timeout(15_000) }).then(async (response) => {
        if (!response.ok) throw new Error('Banners are temporarily unavailable');
        return response.json();
      }),
      isAdmin ? fetchUsers() : Promise.resolve([]),
    ]);
    const failedResources: string[] = [];
    if (productResult.status !== 'fulfilled') failedResources.push('products');
    if (categoryResult.status !== 'fulfilled') failedResources.push('categories');
    if (pageResult.status !== 'fulfilled') failedResources.push('pages');
    if (bannerResult.status === 'fulfilled') setBanners(bannerResult.value);
    if (userResult.status === 'fulfilled') setUsers(userResult.value);
    if (failedResources.length) {
      const message = `Could not load ${failedResources.join(', ')}. The server may be temporarily unavailable.`;
      setDataError(message);
      console.error(message, [productResult, categoryResult, pageResult]);
    }
    setLoading(false);
  };

  const handleAuthenticated = (response: AuthResponse) => {
    setCurrentUser(response.user);
    if (response.user.role === 'admin' || response.user.role === 'admin_team') navigate('/admin/products');
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
      {location.pathname !== '/partner' && !location.pathname.startsWith('/admin') ? <Header
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
        onOpenCart={() => setIsCartOpen(true)}
      /> : null}

      {location.pathname !== '/partner' && !location.pathname.startsWith('/admin') && (loading || dataError) ? (
        <div className={`catalog-status ${dataError ? 'catalog-status-error' : ''}`} role={dataError ? 'alert' : 'status'} aria-live="polite">
          <span>{dataError || 'Loading store…'}</span>
          {dataError ? <button type="button" onClick={() => void loadData()}>Try again</button> : null}
        </div>
      ) : null}

      <main>
        <Routes>
          <Route path="/" element={<HomePage categories={categories} products={products} banners={banners} onOpenShop={() => navigate('/shop')} onCategorySelect={(categoryId) => { setSelectedCategory(categoryId); navigate('/shop'); }} onAddToCart={addToCart} />} />
          <Route path="/shop" element={<ShopPage
            categories={categories} products={products} pages={visiblePages} cartItems={cartItems}
            search={search} selectedCategory={selectedCategory} selectedVariations={selectedVariations} loading={loading}
            onSearchChange={setSearch} onCategoryChange={setSelectedCategory}
            onVariationChange={(productId, variationId) => setSelectedVariations((current) => ({ ...current, [productId]: variationId }))}
            onAddToCart={addToCart} onClearCart={() => setCartItems([])}
            onRemoveCartItem={(key) => setCartItems((current) => current.filter((item) => cartKey(item.product, item.variation) !== key))}
            onUpdateQuantity={updateCartQuantity} onOrderPlaced={loadData} onOpenPage={openPage}
          />} />
          <Route path="/product/:productId" element={<ProductDetailPage products={products} onAddToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage
            cartItems={cartItems}
            onRemoveItem={(key) => setCartItems((current) => current.filter((item) => cartKey(item.product, item.variation) !== key))}
            onUpdateQuantity={updateCartQuantity}
            couponCode={couponCode} discount={couponDiscount}
            onCouponApplied={(code, discount) => { setCouponCode(code); setCouponDiscount(discount); }}
          />} />
          <Route path="/checkout" element={<CheckoutPage cartItems={cartItems} couponCode={couponCode} discount={couponDiscount} onOrderPlaced={() => { setCartItems([]); setCouponCode(''); setCouponDiscount(0); }} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/pages/about" element={<AboutPage />} />
          <Route path="/pages/:slug" element={<ContentRoute pages={visiblePages} />} />
          <Route path="/account" element={<section className="account-section min-h-[calc(100vh-160px)] bg-[#f8f7f5] px-5 py-14 pb-28">{currentUser?.role === 'user' ? <CustomerProfile user={currentUser} onUserUpdated={setCurrentUser} onLogout={handleLogout} /> : <div className="mx-auto max-w-[900px]"><h2 className="mb-10 font-serif text-[42px] leading-tight">My account</h2><AuthPanel currentUser={currentUser} onAuthenticated={handleAuthenticated} onLogout={handleLogout} /><AccountCommercePanel user={currentUser} /></div>}</section>} />
          {(['orders', 'wishlist', 'wallet', 'downloads', 'addresses', 'refer'] as const).map((view) => <Route key={view} path={`/account/${view}`} element={currentUser?.role === 'user' ? <section className="min-h-[calc(100vh-160px)] bg-[#f8f7f5] px-5 py-14 pb-28"><CustomerPortal view={view} /></section> : <Navigate to="/account" replace />} />)}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="/partner/membership-plans" element={<Navigate to="/partner/vendor-register" replace />} />
          <Route path="/partner/register" element={<Navigate to="/partner/vendor-register" replace />} />
          <Route path="/partner/vendor-register" element={<MembershipPlansPage />} />
          <Route path="/vendor-membership" element={<PartnerRegistrationPage />} />
          <Route path="/partner/welcome" element={<VendorWelcomePage />} />
          <Route path="/partner/apply-shopping-card" element={<ApplyShoppingCardPage />} />
          <Route path="/partner/executive-login" element={<Navigate to="/partner/vendor-register" replace />} />
          <Route path="/partner/menu-upload" element={<MenuUploadPage />} />
          <Route path="/partner/onboarding-enquiry" element={<OnboardingEnquiryPage />} />
          <Route path="/partner/dashboard" element={currentUser?.role === 'vendor' ? <Navigate to="/partner/vendor/dashboard" replace /> : currentUser?.role === 'delivery' ? <Navigate to="/partner/delivery/dashboard" replace /> : <Navigate to="/account" replace />} />
          <Route path="/partner/vendor/dashboard" element={currentUser?.role === 'vendor' ? <section className="partner-section min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><VendorDashboard user={currentUser} /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/delivery/dashboard" element={currentUser?.role === 'delivery' ? <section className="partner-section min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><DeliveryDashboard user={currentUser} /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/vendor/profile" element={currentUser?.role === 'vendor' ? <section className="min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><PartnerProfile user={currentUser} role="vendor" onUserUpdated={setCurrentUser} /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/vendor/orders" element={currentUser?.role === 'vendor' ? <section className="min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><VendorOperations view="orders" /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/vendor/inventory" element={currentUser?.role === 'vendor' ? <section className="min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><VendorOperations view="inventory" /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/vendor/payouts" element={currentUser?.role === 'vendor' ? <section className="min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><VendorOperations view="payouts" /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/delivery/profile" element={currentUser?.role === 'delivery' ? <section className="min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><PartnerProfile user={currentUser} role="delivery" onUserUpdated={setCurrentUser} /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/delivery/history" element={currentUser?.role === 'delivery' ? <section className="min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><DeliveryHistory /></section> : <Navigate to="/account" replace />} />
          <Route path="/partner/delivery/wallet" element={currentUser?.role === 'delivery' ? <section className="min-h-[60vh] bg-neutral-50 px-4 py-6 pb-16"><DeliveryWallet /></section> : <Navigate to="/account" replace />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/admin" element={isAdmin ? <AdminLayout user={currentUser!} onLogout={handleLogout} /> : <Navigate to="/account" replace />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<AdminPanel products={products} onDeleteProduct={handleDeleteProduct} onEditProduct={(product) => { setEditingProduct(product); navigate('/admin/products/new'); }} />} />
            <Route path="products/new" element={<ProductForm editingProduct={editingProduct} onProductChanged={loadData} onCancel={() => setEditingProduct(null)} />} />
            <Route path="account" element={<AdminProfile user={currentUser!} onUserUpdated={setCurrentUser} onLogout={handleLogout} />} />
            <Route path="categories" element={<div className="admin-grid"><CategoryManager categories={categories} onCategoryChanged={loadData} /></div>} />
            <Route path="orders" element={<div className="admin-grid"><OrdersPanel /></div>} />
            <Route path="coupons" element={<div className="admin-grid"><CouponManager /></div>} />
            <Route path="banners" element={<BannerManager />} />
            <Route path="vendor-approvals" element={<VendorApprovalManager />} />
            <Route path="commerce" element={<div className="admin-grid"><AdvancedCommerceManager /></div>} />
            <Route path="delivery-team" element={<div className="admin-grid"><DeliveryTeamManager /></div>} />
            <Route path="delivery-withdrawals" element={<DeliveryWithdrawalsManager />} />
            <Route path="inbox" element={<div className="admin-grid"><ContactInbox /></div>} />
            <Route path="pages" element={<div className="admin-grid"><PageManager /></div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!location.pathname.startsWith('/admin') ? <Footer /> : null}
      {isCartOpen ? <ShoppingCartDrawer
        cartItems={cartItems}
        onClose={() => setIsCartOpen(false)}
        onContinueShopping={() => setIsCartOpen(false)}
        onViewCart={() => { setIsCartOpen(false); navigate('/cart'); }}
        onCheckout={() => { setIsCartOpen(false); navigate('/checkout'); }}
        onRemoveItem={(key) => setCartItems((current) => current.filter((item) => cartKey(item.product, item.variation) !== key))}
        onUpdateQuantity={updateCartQuantity}
      /> : null}
    </div>
  );
};

export default App;
