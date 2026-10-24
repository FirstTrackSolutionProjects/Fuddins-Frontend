import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const aboutLinks = [
  { label: 'About', to: '/pages/about' },
  { label: 'Career', to: '/career' },
  { label: 'Cancellation & Refund Policy', to: '/pages/cancellation-refund-policy' },
  { label: 'Shipping & Delivery Policy', to: '/pages/shipping-delivery-policy' },
  { label: 'Terms & Conditions', to: '/pages/terms-conditions' },
  { label: 'Privacy Policy', to: '/pages/privacy-policy' },
  { label: 'Contact', to: '/contact' },
];

const filled = (path: string): ReactNode => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d={path} />
  </svg>
);

const instagramIcon: ReactNode = (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <path d="M17.6 6.4h.01" />
  </svg>
);

const socialLinks: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: filled('M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.98A10 10 0 0 0 22 12Z'),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: filled('M22 5.9c-.66.3-1.37.5-2.11.6a3.7 3.7 0 0 0 1.62-2.04c-.71.42-1.5.73-2.34.9A3.68 3.68 0 0 0 12.9 8.7 10.44 10.44 0 0 1 5.4 4.9a3.68 3.68 0 0 0 1.14 4.9c-.6-.02-1.16-.19-1.65-.46v.05a3.68 3.68 0 0 0 2.95 3.6c-.55.15-1.13.17-1.7.06a3.68 3.68 0 0 0 3.44 2.56A7.39 7.39 0 0 1 2 17.05a10.42 10.42 0 0 0 5.64 1.65c6.77 0 10.47-5.61 10.47-10.47l-.01-.48A7.5 7.5 0 0 0 22 5.9Z'),
  },
  { label: 'Instagram', href: 'https://instagram.com', icon: instagramIcon },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: filled('M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V10H5.67v8.34h2.67ZM7 8.88a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.34 9.46v-4.5c0-2.41-1.29-3.53-3-3.53a2.6 2.6 0 0 0-2.35 1.3V10h-2.66c.03.7 0 8.34 0 8.34h2.66v-4.66c0-.25.02-.5.1-.68a1.5 1.5 0 0 1 1.37-1c.96 0 1.35.73 1.35 1.8v4.54h2.53Z'),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: filled('M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 4 12 4 12 4s-7.5 0-9.38.36A3.02 3.02 0 0 0 .5 6.5 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14C4.5 20 12 20 12 20s7.5 0 9.38-.36a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.4 3.6-6.4 3.6Z'),
  },
];

const badgeClass =
  'flex items-center gap-3 rounded-xl border border-white/20 bg-black/60 px-4 py-2.5 no-underline transition hover:-translate-y-0.5 hover:border-lime-400/70 hover:bg-black';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#060d1a] text-white">
      {/* accent line + soft glows */}
      <div className="h-1 w-full bg-gradient-to-r from-lime-400 via-lime-500 to-lime-700" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-lime-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-6 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.1fr] lg:gap-16">
        {/* Logo & about */}
        <div className="flex flex-col items-start gap-6">
          <div className="rounded-2xl bg-white p-3 shadow-xl shadow-black/30">
            <img src="/images/cropped-fuddns.webp" alt="Fuddins" className="h-[76px] w-auto object-contain" />
          </div>
          <p className="m-0 max-w-sm text-[15px] leading-relaxed text-neutral-300">
            A product of First Track Solution Technologies (P) Limited
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-lime-500 hover:ring-lime-400"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* About us links */}
        <div className="flex flex-col gap-5">
          <h3 className="m-0 flex items-center gap-3 font-serif text-2xl font-bold text-white">
            <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-600" />
            About Us
          </h3>
          <nav className="flex flex-col gap-1">
            {aboutLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="group flex items-center gap-2 rounded-lg py-1.5 text-[15px] text-neutral-300 no-underline transition-colors hover:text-lime-400"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 -translate-x-1 text-lime-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <span className="-ml-6 transition-transform group-hover:translate-x-6">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* App download */}
        <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-1">
          <h3 className="m-0 flex items-center gap-3 font-serif text-2xl font-bold text-white">
            <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-600" />
            Download Our Mobile App
          </h3>
          <p className="m-0 max-w-sm text-[15px] leading-relaxed text-neutral-300">
            Download The App &amp; Order Your Favourite Foods Online
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a href="https://play.google.com" target="_blank" rel="noreferrer" className={badgeClass}>
              <svg viewBox="0 0 24 24" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="playGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E3FF" />
                    <stop offset="100%" stopColor="#00A0FF" />
                  </linearGradient>
                  <linearGradient id="playGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE000" />
                    <stop offset="100%" stopColor="#FFBD00" />
                  </linearGradient>
                  <linearGradient id="playGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF3A44" />
                    <stop offset="100%" stopColor="#C31162" />
                  </linearGradient>
                  <linearGradient id="playGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#32A071" />
                    <stop offset="100%" stopColor="#00D28E" />
                  </linearGradient>
                </defs>
                <path fill="url(#playGrad1)" d="M3.6 2.3c-.4.2-.6.6-.6 1.1v17.2c0 .5.2.9.6 1.1l9.9-9.7L3.6 2.3Z" />
                <path fill="url(#playGrad2)" d="M17 8.4l-3.5-2-4-2.3 6 6 1.5-1.7Z" />
                <path fill="url(#playGrad3)" d="M13.5 15.9l4-2.3 3-1.7-6-6-1 1Z" />
                <path fill="url(#playGrad4)" d="M3.6 21.6c.3.2.8.2 1.2 0l8.7-5-3.6-3.7-6.3 8.7Z" />
              </svg>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[11px] text-neutral-300">GET IT ON</span>
                <span className="mt-1 font-serif text-lg font-semibold text-white">Google Play</span>
              </span>
            </a>

            <a href="https://apps.apple.com" target="_blank" rel="noreferrer" className={badgeClass}>
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M16.4 1c.1 1-.3 2-.9 2.7-.6.7-1.6 1.3-2.6 1.2-.1-1 .4-2 .9-2.6C14.5 1.5 15.5 1 16.4 1Zm3.6 16.6c-.3.7-.6 1.3-1 1.9-.6.9-1.2 1.9-2.2 1.9-1 0-1.3-.6-2.4-.6-1.1 0-1.5.6-2.4.6-1 0-1.7-1-2.3-1.9-1.6-2.3-2.8-6.5-1.2-9.4.8-1.4 2.2-2.3 3.7-2.3 1.1 0 2.1.7 2.7.7.6 0 1.9-.9 3.2-.8.5 0 2.1.2 3.1 1.7-.1.1-1.9 1.1-1.8 3.3 0 2.6 2.3 3.5 2.3 3.5-.1.2-.3.9-.7 1.4Z" />
              </svg>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[11px] text-neutral-300">Available on the</span>
                <span className="mt-1 font-serif text-lg font-semibold text-white">App Store</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="m-0 text-sm text-neutral-400">Copyright © {new Date().getFullYear()} | fuddins.com</p>
          <p className="m-0 text-sm text-neutral-500">Your comfort partner</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;