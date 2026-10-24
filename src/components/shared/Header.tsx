import { useEffect, useState, type ReactNode } from 'react';
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
  onLogout?: () => void;
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

/* ---------- Mobile sidebar UI helpers (UI only) ---------- */

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  home: 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  gift: 'M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  dash: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  right: 'm9 18 6-6-6-6',
  x: 'M18 6 6 18 M6 6l12 12',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  login: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
} as const;

// Single row (link) in the sidebar
const mobileItemClass = ({ isActive }: { isActive: boolean }) =>
  `group flex items-center gap-3.5 rounded-2xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
    isActive ? 'bg-lime-50 text-lime-800' : 'text-neutral-800 hover:bg-lime-50 active:bg-lime-100'
  }`;

const mobileSubItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-lime-100 text-lime-800' : 'text-neutral-600 hover:bg-lime-50 hover:text-lime-800'
  }`;

const IconTile = ({ icon, active = false }: { icon: keyof typeof ICONS; active?: boolean }) => (
  <span
    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
      active ? 'bg-lime-500 text-white shadow-md shadow-lime-500/30' : 'bg-lime-100 text-lime-700 group-hover:bg-lime-200'
    }`}
  >
    <Ico d={ICONS[icon]} className="h-[18px] w-[18px]" />
  </span>
);

const SubDot = () => <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />;

// Expandable group (All Products / Partner / About us)
const MobileGroup = ({
  icon,
  label,
  open,
  onToggle,
  to,
  onNavigate,
  children,
}: {
  icon: keyof typeof ICONS;
  label: string;
  open: boolean;
  onToggle: () => void;
  to?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) => (
  <div className={`rounded-2xl transition-colors ${open ? 'bg-lime-50/70 ring-1 ring-lime-200' : ''}`}>
    <div className="group flex items-center">
      {to ? (
        <NavLink
          to={to}
          onClick={onNavigate}
          className="flex flex-1 items-center gap-3.5 rounded-2xl px-3 py-2.5 text-[15px] font-semibold text-neutral-800"
        >
          <IconTile icon={icon} active={open} />
          <span className={open ? 'text-lime-800' : ''}>{label}</span>
        </NavLink>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex flex-1 items-center gap-3.5 rounded-2xl px-3 py-2.5 text-left text-[15px] font-semibold text-neutral-800"
        >
          <IconTile icon={icon} active={open} />
          <span className={open ? 'text-lime-800' : ''}>{label}</span>
        </button>
      )}
      <button
        type="button"
        aria-label={`Toggle ${label} menu`}
        aria-expanded={open}
        onClick={onToggle}
        className="mr-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime-100 text-lime-700 transition hover:bg-lime-200 active:scale-95"
      >
        <span className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <ChevronIcon />
        </span>
      </button>
    </div>
    <div
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <div className="mb-3 ml-[34px] mr-3 mt-1 max-h-60 space-y-0.5 overflow-y-auto border-l-2 border-lime-200 pl-3">
          {children}
        </div>
      </div>
    </div>
  </div>
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
  onLogout,
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
  const closeMobile = () => setMobileMenuOpen(false);
  const toggleSub = (key: MobileMenuKey) => setMobileSubMenu(mobileSubMenu === key ? null : key);

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

        {/* mobile header buttons */}
        <div className="mobile-header-actions flex items-center gap-2.5 lg:hidden" style={{ flex: '0 0 auto' }}>
          <button
            type="button"
            aria-label="Cart"
            className="mobile-cart-button flex items-center justify-center rounded-xl border-2 border-lime-500 bg-white text-lime-600 shadow-sm transition active:scale-95 active:bg-lime-50"
            onClick={onOpenCart}
          >
            <BasketIcon />
          </button>
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-button grid place-items-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-md shadow-lime-500/40 transition active:scale-95"
          >
            <Ico d={ICONS.menu} className="h-6 w-6" stroke={2.5} />
          </button>
        </div>
      </div>

      {/* ---------- Mobile sidebar ---------- */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <style>{`
            @keyframes fuddins-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
            @keyframes fuddins-fade-in { from { opacity: 0; } to { opacity: 1; } }
            .fuddins-slide-in { animation: fuddins-slide-in .32s cubic-bezier(.22,1,.36,1) both; }
            .fuddins-fade-in { animation: fuddins-fade-in .25s ease-out both; }
            @media (prefers-reduced-motion: reduce) { .fuddins-slide-in, .fuddins-fade-in { animation: none; } }
          `}</style>

          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobile}
            className="fuddins-fade-in absolute inset-0 h-full w-full cursor-default bg-neutral-900/55 backdrop-blur-sm"
          />

          <aside
            aria-label="Mobile navigation"
            className="fuddins-slide-in absolute right-0 top-0 flex h-full w-[88%] max-w-[360px] flex-col overflow-hidden rounded-l-[28px] bg-white shadow-2xl"
          >
            {/* top brand band */}
            <div className="relative bg-gradient-to-br from-lime-500 via-lime-500 to-lime-700 px-5 pb-16 pt-5">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-white/10" />
              <div className="relative flex items-center justify-between">
                <div className="grid h-12 w-[104px] place-items-center rounded-2xl bg-white p-1.5 shadow-lg shadow-lime-900/20">
                  <img src="/images/cropped-fuddns.webp" alt="Fuddins" className="h-full w-full object-contain" />
                </div>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={closeMobile}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/30 active:scale-95"
                >
                  <Ico d={ICONS.x} className="h-6 w-6" stroke={2.25} />
                </button>
              </div>
              <p className="relative mt-5 text-xl font-bold leading-tight text-white">Namaste! 👋</p>
              <p className="relative mt-0.5 text-sm font-medium text-lime-50/90">Your comfort partner</p>
            </div>

            {/* account card overlapping the band */}
            <div className="relative z-10 -mt-9 px-4">
              <NavLink
                to="/account"
                onClick={closeMobile}
                className="group flex items-center gap-3.5 rounded-2xl bg-white p-3 shadow-xl shadow-neutral-900/10 ring-1 ring-neutral-100 transition active:scale-[0.99]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-100 text-lime-700">
                  <Ico d={currentUser ? ICONS.user : ICONS.login} className="h-6 w-6" />
                </span>
                <span className="flex-1 text-[15px] font-bold text-neutral-900">
                  {currentUser ? 'My account' : 'Log In'}
                  <span className="mt-0.5 block text-xs font-medium text-neutral-500">
                    {currentUser ? 'Profile, addresses & more' : 'Sign in to order faster'}
                  </span>
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-lime-500 text-white transition group-hover:translate-x-0.5">
                  <Ico d={ICONS.right} className="h-4 w-4" stroke={2.5} />
                </span>
              </NavLink>
            </div>

            {/* menu list */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6 pt-4">
              <NavLink to="/" end onClick={closeMobile} className={mobileItemClass}>
                {({ isActive }) => (
                  <>
                    <IconTile icon="home" active={isActive} />
                    <span>Home</span>
                  </>
                )}
              </NavLink>

              <MobileGroup icon="grid" label="All Products" open={mobileSubMenu === 'products'} onToggle={() => toggleSub('products')}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      onOpenCategory(String(category.id));
                      closeMobile();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-lime-50 hover:text-lime-800"
                  >
                    <SubDot />
                    {category.name}
                  </button>
                ))}
              </MobileGroup>

              {currentUser?.role === 'user' ? (
                <NavLink to="/account/orders" onClick={closeMobile} className={mobileItemClass}>
                  {({ isActive }) => (
                    <>
                      <IconTile icon="bag" active={isActive} />
                      <span>My Orders</span>
                    </>
                  )}
                </NavLink>
              ) : null}

              <NavLink to="/pages/refer-earn" onClick={closeMobile} className={mobileItemClass}>
                {({ isActive }) => (
                  <>
                    <IconTile icon="gift" active={isActive} />
                    <span className="flex-1">Refer &amp; Earn</span>
                    <span className="rounded-full bg-lime-500 px-2.5 py-0.5 text-[11px] font-bold text-white">Earn</span>
                  </>
                )}
              </NavLink>

              <MobileGroup
                icon="users"
                label="Partner"
                to="/partner"
                onNavigate={closeMobile}
                open={mobileSubMenu === 'partner'}
                onToggle={() => toggleSub('partner')}
              >
                <NavLink onClick={closeMobile} to="/partner/apply-shopping-card" className={mobileSubItemClass}>
                  <SubDot />Apply shopping card
                </NavLink>
                <NavLink onClick={closeMobile} to="/partner/vendor-register" className={mobileSubItemClass}>
                  <SubDot />Executive Login
                </NavLink>
                <NavLink onClick={closeMobile} to="/partner/menu-upload" className={mobileSubItemClass}>
                  <SubDot />Menu Upload
                </NavLink>
                <NavLink onClick={closeMobile} to="/partner/onboarding-enquiry" className={mobileSubItemClass}>
                  <SubDot />Onboarding Enquiry
                </NavLink>
              </MobileGroup>

              <MobileGroup icon="info" label="About us" open={mobileSubMenu === 'about'} onToggle={() => toggleSub('about')}>
                <NavLink onClick={closeMobile} to="/pages/about" className={mobileSubItemClass}>
                  <SubDot />About
                </NavLink>
                <NavLink onClick={closeMobile} to="/contact" className={mobileSubItemClass}>
                  <SubDot />Contact
                </NavLink>
              </MobileGroup>

              {isPartner && !isAdmin ? (
                <NavLink
                  onClick={closeMobile}
                  to={currentUser?.role === 'delivery' ? '/partner/delivery/dashboard' : '/partner/vendor/dashboard'}
                  className={mobileItemClass}
                >
                  {({ isActive }) => (
                    <>
                      <IconTile icon="dash" active={isActive} />
                      <span>Dashboard</span>
                    </>
                  )}
                </NavLink>
              ) : null}

              {isAdmin ? (
                <NavLink onClick={closeMobile} to="/admin" className={mobileItemClass}>
                  {({ isActive }) => (
                    <>
                      <IconTile icon="shield" active={isActive} />
                      <span>Admin</span>
                    </>
                  )}
                </NavLink>
              ) : null}
            </nav>

            {/* footer */}
            <div className="border-t border-neutral-100 bg-neutral-50">
              {currentUser && onLogout ? (
                <div className="px-4 pb-1 pt-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      onLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 py-3 text-[15px] font-bold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
                  >
                    <Ico d={ICONS.logout} className="h-5 w-5" />
                    Log out
                  </button>
                </div>
              ) : null}
              <p className="px-5 py-3 text-center text-xs font-medium text-neutral-500">
                Fuddins Mart · Food &amp; essentials at your doorstep
              </p>
            </div>
          </aside>
        </div>
      ) : null}

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