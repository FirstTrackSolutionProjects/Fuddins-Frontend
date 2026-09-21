import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { User } from '../../types';
import {
  LayoutGrid,
  Tag,
  ShoppingBag,
  Ticket,
  Store,
  Boxes,
  Truck,
  Inbox,
  FileText,
  Wallet,
  Menu,
  X,
} from 'lucide-react';

const adminNavigation = [
  ['/admin/products', 'Products', LayoutGrid],
  ['/admin/categories', 'Categories', Tag],
  ['/admin/orders', 'Orders', ShoppingBag],
  ['/admin/coupons', 'Coupons', Ticket],
  ['/admin/vendor-approvals', 'Vendor approvals', Store],
  ['/admin/commerce', 'Commerce', Boxes],
  ['/admin/delivery-team', 'Delivery team', Truck],
  ['/admin/delivery-withdrawals', 'Delivery withdrawals', Wallet],
  ['/admin/inbox', 'Inbox', Inbox],
  ['/admin/pages', 'Pages', FileText],
] as const;

const AdminLayout = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const initials = user.name.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase();

  return <section className="h-screen overflow-hidden bg-white text-neutral-900">
    <div className="flex h-full min-w-0">
      {navigationOpen ? <button type="button" aria-label="Close navigation" onClick={() => setNavigationOpen(false)} className="fixed inset-0 z-20 bg-black/40 lg:hidden" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-72 max-w-[86vw] flex-col border-r border-neutral-200 bg-white p-5 shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:shrink-0 lg:shadow-none ${navigationOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <button type="button" aria-label="Close navigation" onClick={() => setNavigationOpen(false)} className="absolute right-4 top-5 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"><X size={22} /></button>
        <NavLink to="/admin/products" className="mb-8 flex items-center gap-3 text-xl font-bold text-neutral-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-600 text-lg text-white">F</span>Fuddins</NavLink>
        <nav className="grid gap-1 overflow-y-auto" aria-label="Admin navigation">
          {adminNavigation.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setNavigationOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors ${
                  isActive ? 'bg-lime-100 text-lime-800' : 'text-neutral-600 hover:bg-lime-50 hover:text-lime-800'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={onLogout} className="mt-auto rounded-xl border border-lime-600 px-4 py-3 text-left font-bold text-lime-700 transition hover:bg-lime-50">Logout</button>
      </aside>
      <div className="h-screen min-w-0 flex-1 overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 flex items-center border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
          <NavLink to="/admin/products" className="flex h-10 items-center" aria-label="Fuddins admin home"><img src="/images/cropped-fuddns.webp" alt="Fuddins" className="h-10 w-auto max-w-[142px] object-contain" /></NavLink>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" aria-label="Open navigation" aria-expanded={navigationOpen} onClick={() => setNavigationOpen(true)} className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100"><Menu size={24} /></button>
            <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Open admin profile" className="grid h-9 w-9 place-items-center rounded-full bg-lime-600 text-xs font-bold text-white">{initials}</button>
          </div>
          {profileOpen ? <div className="absolute right-4 top-[calc(100%+8px)] z-20 w-64 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl"><p className="font-bold">{user.name}</p><p className="mt-1 break-all text-sm text-neutral-500">{user.email}</p><p className="mt-2 text-sm font-semibold capitalize text-lime-700">{user.role.replaceAll('_', ' ')}</p><NavLink to="/admin/account" onClick={() => setProfileOpen(false)} className="mt-4 block rounded-lg bg-lime-600 px-3 py-2 text-center text-sm font-bold text-white">My profile</NavLink></div> : null}
        </header>
        <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 lg:flex">
          <img src="/images/cropped-fuddns.webp" alt="Fuddins" className="h-16 w-auto" />
          <div className="relative shrink-0">
            <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-label="Open admin profile" className="flex items-center gap-2 rounded-full border border-lime-200 bg-white py-1.5 pl-1.5 pr-2 text-sm font-bold text-neutral-700 shadow-sm transition hover:border-lime-400 hover:ring-2 hover:ring-lime-100 focus:outline-none focus:ring-2 focus:ring-lime-300"><span className="grid h-8 w-8 place-items-center rounded-full bg-lime-600 text-xs text-white">{initials}</span><svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 text-neutral-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} aria-hidden="true"><path fillRule="evenodd" d="M5.2 7.3a.75.75 0 0 1 1.06-.1L10 10.68l3.74-3.47a.75.75 0 1 1 1.02 1.1l-4.25 3.95a.75.75 0 0 1-1.02 0L5.24 8.3a.75.75 0 0 1-.04-1Z" clipRule="evenodd" /></svg></button>
            {profileOpen ? <div className="absolute right-0 z-10 mt-3 w-64 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl"><p className="font-bold">{user.name}</p><p className="mt-1 break-all text-sm text-neutral-500">{user.email}</p><p className="mt-2 text-sm font-semibold capitalize text-lime-700">{user.role.replaceAll('_', ' ')}</p><NavLink to="/admin/account" onClick={() => setProfileOpen(false)} className="mt-4 block rounded-lg bg-lime-600 px-3 py-2 text-center text-sm font-bold text-white">My profile</NavLink></div> : null}
          </div>
        </header>
        <main className="w-full p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  </section>;
};

export default AdminLayout;
