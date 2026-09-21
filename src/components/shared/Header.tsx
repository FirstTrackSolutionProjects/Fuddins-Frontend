import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { Category, User } from '../../types';

type MenuKey = 'products' | 'partner' | 'about' | null;
type MobileMenuKey = Exclude<MenuKey, null>;

interface HeaderProps {
  currentUser: User | null;
  categories: Category[];
  isAdmin: boolean;
  isPartner: boolean;
  search: string;
  openMenu: MenuKey;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onToggleMenu: (menu: MenuKey) => void;
  onOpenCategory: (categoryId: string) => void;
  onOpenCart: () => void;
}

// Lime-accent link (Home, Refer & Earn, Log In)
const accentLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-medium text-[16px] text-lime-600 hover:text-lime-700 transition-colors ${
    isActive ? 'text-lime-700' : ''
  }`;

// Dark link (All Products, Partner, About us)
const darkLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-medium text-[16px] text-neutral-900 hover:text-lime-700 transition-colors ${
    isActive ? 'text-lime-700' : ''
  }`;

const dropdownLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block w-full px-6 py-3 text-left text-sm font-normal text-neutral-700 hover:bg-lime-50 hover:text-lime-700 ${
    isActive ? 'text-lime-700' : ''
  }`;

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const MobileRow = ({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick} aria-expanded={open} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left font-semibold transition ${open ? 'border-lime-300 bg-lime-50 text-lime-800 shadow-sm' : 'border-transparent text-neutral-800 hover:border-lime-200 hover:bg-lime-50'}`}> 
    <span>{label}</span><span className={`grid h-7 w-7 place-items-center rounded-full bg-lime-100 text-lime-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><ChevronIcon /></span>
  </button>
);

// Solid filled basket icon (matches reference screenshot)
const BasketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M7.5 2a.75.75 0 0 0-.6 1.2L9 6.5H4a1 1 0 0 0-.98 1.2l1.7 8.5A2 2 0 0 0 6.68 18h10.64a2 2 0 0 0 1.96-1.8l1.7-8.5A1 1 0 0 0 20 6.5h-5l2.1-3.3A.75.75 0 0 0 16.5 2a.75.75 0 0 0-.6.3L12.8 6.5h-1.6L8.1 2.3A.75.75 0 0 0 7.5 2Z" />
    <circle cx="8" cy="21" r="1.4" />
    <circle cx="16" cy="21" r="1.4" />
  </svg>
);

const quickCategorySets = [
  [['Baby care', 'Groceries-17-150x150.webp'], ['Sports Stuff', 'Groceries-20-150x150.webp'], ['Vegetables', 'Groceries-2-150x150 (1).webp'], ['Dairy', 'Groceries-4-150x150.webp']],
  [['Footwear', 'Groceries-15-150x150.webp'], ['Flowers', 'Groceries-18-150x150 (1).webp'], ['Mobile Accessories', 'Groceries-19-150x150.webp'], ['Ready Eatables', 'Groceries-3-150x150.webp']],
  [['Snacks', 'Groceries-5-150x150.webp'], ['Pharma', 'Groceries-10-150x150.webp'], ['Garments', 'Groceries-16-150x150.webp'], ['Groceries', 'Groceries-1-150x150.webp']],
] as const;

const Header = ({
  currentUser,
  categories,
  isAdmin,
  isPartner,
  search,
  openMenu,
  onSearchChange,
  onSearchSubmit,
  onToggleMenu,
  onOpenCategory,
  onOpenCart,
}: HeaderProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [quickSet, setQuickSet] = useState(0);
  const [resettingQuickSet, setResettingQuickSet] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState<MobileMenuKey | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setQuickSet((current) => current + 1), 4000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    // The final rendered set is a duplicate of the first. Slide to it from
    // right-to-left, then jump back to the real first set with no transition.
    if (quickSet !== quickCategorySets.length) return;
    const resetTimer = window.setTimeout(() => {
      setResettingQuickSet(true);
      setQuickSet(0);
      // Hold the reset long enough for the browser to paint the duplicated
      // final frame without a transition, preventing the wrap from flipping
      // back in from the right.
      window.setTimeout(() => setResettingQuickSet(false), 120);
    }, 720);
    return () => window.clearTimeout(resetTimer);
  }, [quickSet]);
  const openQuickCategory = (name: string) => {
    const simplify = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');
    const label = simplify(name);
    const category = categories.find((item) => { const itemName = simplify(item.name); return itemName === label || itemName.includes(label) || label.includes(itemName); });
    if (category) onOpenCategory(String(category.id));
  };
  return (
    <header className="border-b border-neutral-200 bg-white font-sans">
      <div className="mobile-site-header mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-5" style={{ width: '100%', maxWidth: '1500px', minWidth: 0 }}>
        <div className="mobile-logo-frame" style={{ width: 112, height: 56, minWidth: 0, overflow: 'hidden' }}>
          <img src="/images/cropped-fuddns.webp" alt="Fuddins" className="mobile-site-logo" style={{ display: 'block', width: '100%', height: '100%', maxWidth: '100%', objectFit: 'contain' }} />
        </div>

        <nav className="hidden flex-1 items-center justify-between pl-10 lg:flex">
          {/* left group */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className={accentLinkClass}>
              Home
            </NavLink>

            <div className="relative flex items-center gap-1">
              <NavLink to="/shop" className={darkLinkClass}>
                All Products
              </NavLink>
              <button
                type="button"
                aria-label="Open product categories"
                className="p-0 text-neutral-700"
                onClick={() => onToggleMenu(openMenu === 'products' ? null : 'products')}
              >
                <ChevronIcon />
              </button>
              {openMenu === 'products' ? (
                <div className="absolute left-0 top-8 z-50 min-w-[220px] bg-white py-2.5 shadow-xl">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className="block w-full px-6 py-3 text-left text-sm font-normal text-neutral-700 hover:bg-lime-50 hover:text-lime-700"
                      onClick={() => onOpenCategory(String(category.id))}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* right group */}
          <div className="flex items-center gap-8">
            <NavLink to="/pages/refer-earn" className={accentLinkClass}>
              Refer &amp; Earn
            </NavLink>

            <div className="relative flex items-center gap-1">
              <NavLink to="/partner" className={darkLinkClass}>
                Partner
              </NavLink>
              <button
                type="button"
                aria-label="Open partner menu"
                className="p-0 text-neutral-700"
                onClick={() => onToggleMenu(openMenu === 'partner' ? null : 'partner')}
              >
                <ChevronIcon />
              </button>
              {openMenu === 'partner' ? (
                <div className="absolute left-[-16px] top-8 z-50 min-w-[220px] bg-white py-2.5 shadow-xl">
                  <NavLink to="/partner/apply-shopping-card" className={dropdownLinkClass}>
                    Apply shopping card
                  </NavLink>
                  <NavLink to="/partner/vendor-register" className={dropdownLinkClass}>
                    Executive Login
                  </NavLink>
                  <NavLink to="/partner/menu-upload" className={dropdownLinkClass}>
                    Menu Upload
                  </NavLink>
                  <NavLink to="/partner/onboarding-enquiry" className={dropdownLinkClass}>
                    Onboarding Enquiry
                  </NavLink>
                </div>
              ) : null}
            </div>

            <div className="relative flex items-center gap-1">
              <NavLink to="/pages/about" className={darkLinkClass}>
                About us
              </NavLink>
              <button
                type="button"
                aria-label="Open About us menu"
                className="p-0 text-neutral-700"
                onClick={() => onToggleMenu(openMenu === 'about' ? null : 'about')}
              >
                <ChevronIcon />
              </button>
              {openMenu === 'about' ? (
                <div className="absolute left-[-16px] top-8 z-50 min-w-[220px] bg-white py-2.5 shadow-xl">
                  <NavLink to="/pages/about" className={dropdownLinkClass}>
                    About
                  </NavLink>
                  <NavLink to="/contact" className={dropdownLinkClass}>
                    Contact
                  </NavLink>
                  <NavLink to="/career" className={dropdownLinkClass}>
                    Career
                  </NavLink>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="Cart"
              className="flex items-center justify-center border-2 border-lime-600 p-1.5 text-lime-600"
              onClick={onOpenCart}
            >
              <BasketIcon />
            </button>

            <NavLink to="/account" className={accentLinkClass}>
              {currentUser ? 'Account' : 'Log In'}
            </NavLink>

            {isPartner && !isAdmin ? (
              <NavLink to={currentUser?.role === 'delivery' ? '/partner/delivery/dashboard' : '/partner/vendor/dashboard'} className={darkLinkClass}>
                Dashboard
              </NavLink>
            ) : null}

            {isAdmin ? (
              <NavLink to="/admin" className={darkLinkClass}>
                Admin
              </NavLink>
            ) : null}
          </div>
        </nav>
        <div className="mobile-header-actions flex items-center gap-2.5 lg:hidden" style={{ flex: '0 0 auto' }}>
          <button type="button" aria-label="Cart" className="mobile-cart-button flex items-center justify-center border-2 border-lime-600 text-lime-600" onClick={onOpenCart}><BasketIcon /></button>
          <button type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)} className="mobile-menu-button grid place-items-center bg-lime-500 text-white">
            <span className="text-4xl font-light leading-none">☰</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen ? <div className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[1px] lg:hidden"><button type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 h-full w-full cursor-default"/><nav className="relative ml-auto min-h-full w-[88%] max-w-sm bg-white px-5 pb-8 pt-20 shadow-2xl" aria-label="Mobile navigation"><button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-neutral-100 text-3xl font-light text-neutral-700 transition hover:bg-lime-100 hover:text-lime-800">×</button><div className="grid gap-2 text-base font-medium leading-tight text-neutral-800 [&>a]:rounded-xl [&>a]:px-4 [&>a]:py-3.5 [&>a]:transition [&>a:hover]:bg-lime-50 [&>a:hover]:text-lime-800"><NavLink onClick={() => setMobileMenuOpen(false)} to="/account">{currentUser ? 'My account' : 'Log In'}</NavLink><NavLink onClick={() => setMobileMenuOpen(false)} to="/">Home</NavLink><MobileRow label="All Products" open={mobileSubMenu === 'products'} onClick={() => setMobileSubMenu(mobileSubMenu === 'products' ? null : 'products')}/>{mobileSubMenu === 'products' ? <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl bg-lime-50 p-2 text-sm text-neutral-700">{categories.map((category) => <button key={category.id} onClick={() => { onOpenCategory(String(category.id)); setMobileMenuOpen(false); }} className="rounded-lg px-3 py-2 text-left transition hover:bg-white hover:text-lime-800">{category.name}</button>)}</div> : null}{currentUser?.role === 'user' ? <NavLink onClick={() => setMobileMenuOpen(false)} to="/account/orders">My Orders</NavLink> : null}<NavLink onClick={() => setMobileMenuOpen(false)} to="/pages/refer-earn">Refer &amp; Earn</NavLink><div className={`flex items-center justify-between rounded-xl border px-4 py-3.5 font-semibold transition ${mobileSubMenu === 'partner' ? 'border-lime-300 bg-lime-50 text-lime-800 shadow-sm' : 'border-transparent text-neutral-800 hover:border-lime-200 hover:bg-lime-50'}`}><NavLink to="/partner" onClick={() => setMobileMenuOpen(false)} className="flex-1">Partner</NavLink><button type="button" aria-label="Toggle Partner menu" aria-expanded={mobileSubMenu === 'partner'} onClick={() => setMobileSubMenu(mobileSubMenu === 'partner' ? null : 'partner')} className={`grid h-7 w-7 place-items-center rounded-full bg-lime-100 text-lime-700 transition-transform duration-200 ${mobileSubMenu === 'partner' ? 'rotate-180' : ''}`}><ChevronIcon /></button></div>{mobileSubMenu === 'partner' ? <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl bg-lime-50 p-2 text-sm text-neutral-700"><NavLink onClick={() => setMobileMenuOpen(false)} to="/partner/apply-shopping-card">Apply shopping card</NavLink><NavLink onClick={() => setMobileMenuOpen(false)} to="/partner/vendor-register">Executive Login</NavLink><NavLink onClick={() => setMobileMenuOpen(false)} to="/partner/menu-upload">Menu Upload</NavLink><NavLink onClick={() => setMobileMenuOpen(false)} to="/partner/onboarding-enquiry">Onboarding Enquiry</NavLink></div> : null}<MobileRow label="About us" open={mobileSubMenu === 'about'} onClick={() => setMobileSubMenu(mobileSubMenu === 'about' ? null : 'about')}/>{mobileSubMenu === 'about' ? <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl bg-lime-50 p-2 text-sm text-neutral-700"><NavLink onClick={() => setMobileMenuOpen(false)} to="/pages/about">About</NavLink><NavLink onClick={() => setMobileMenuOpen(false)} to="/contact">Contact</NavLink></div> : null}{isPartner && !isAdmin ? <NavLink onClick={() => setMobileMenuOpen(false)} to={currentUser?.role === 'delivery' ? '/partner/delivery/dashboard' : '/partner/vendor/dashboard'}>Dashboard</NavLink> : null}{isAdmin ? <NavLink onClick={() => setMobileMenuOpen(false)} to="/admin">Admin</NavLink> : null}</div></nav></div> : null}

      {isHomePage ? <><div className="mx-auto mb-7 max-w-[1100px] px-5">
        <div className="relative w-full">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lime-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSearchSubmit();
            }}
            placeholder="Search for products..."
            className="w-full rounded-full border-0 bg-neutral-100 py-4 pl-14 pr-5 text-base font-normal outline-none"
          />
        </div>
      </div>

      <div className="quick-category-carousel" aria-label="Featured product categories">
        <div className="quick-category-track" style={{ transform: `translateX(-${quickSet * 25}%)`, transition: resettingQuickSet ? 'none' : undefined }}>
          {[...quickCategorySets, quickCategorySets[0]].map((set, setIndex) => (
            <div className="quick-category-set" key={setIndex}>
              {set.map(([name, image]) => (
                <button type="button" key={name} onClick={() => openQuickCategory(name)}>
                  <img src={`/images/${image}`} alt="" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div></> : null}
    </header>
  );
};

export default Header;
