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

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    path: 'M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.74l-.44 2.89h-2.3v6.98A10 10 0 0 0 22 12Z',
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    path: 'M22 5.9c-.66.3-1.37.5-2.11.6a3.7 3.7 0 0 0 1.62-2.04c-.71.42-1.5.73-2.34.9A3.68 3.68 0 0 0 12.9 8.7 10.44 10.44 0 0 1 5.4 4.9a3.68 3.68 0 0 0 1.14 4.9c-.6-.02-1.16-.19-1.65-.46v.05a3.68 3.68 0 0 0 2.95 3.6c-.55.15-1.13.17-1.7.06a3.68 3.68 0 0 0 3.44 2.56A7.39 7.39 0 0 1 2 17.05a10.42 10.42 0 0 0 5.64 1.65c6.77 0 10.47-5.61 10.47-10.47l-.01-.48A7.5 7.5 0 0 0 22 5.9Z',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    path: 'M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.5.5.87 1.03 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.45.53C6.09.28 6.82.11 7.88.06 8.94.01 9.28 0 12 0Zm0 5.4A6.6 6.6 0 1 0 12 18.6 6.6 6.6 0 0 0 12 5.4Zm0 10.88a4.28 4.28 0 1 1 0-8.56 4.28 4.28 0 0 1 0 8.56Zm6.8-11.13a1.54 1.54 0 1 1-3.08 0 1.54 1.54 0 0 1 3.08 0Z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    path: 'M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 18.34V10H5.67v8.34h2.67ZM7 8.88a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1Zm11.34 9.46v-4.5c0-2.41-1.29-3.53-3-3.53a2.6 2.6 0 0 0-2.35 1.3V10h-2.66c.03.7 0 8.34 0 8.34h2.66v-4.66c0-.25.02-.5.1-.68a1.5 1.5 0 0 1 1.37-1c.96 0 1.35.73 1.35 1.8v4.54h2.53Z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    path: 'M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 4 12 4 12 4s-7.5 0-9.38.36A3.02 3.02 0 0 0 .5 6.5 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14C4.5 20 12 20 12 20s7.5 0 9.38-.36a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.4 3.6-6.4 3.6Z',
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#0a1628] text-white">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-3">
        {/* Logo & about */}
        <div className="flex flex-col gap-8">
          <img
            src="/images/cropped-fuddns.webp"
            alt="Fuddins"
            className="h-[90px] w-[180px] object-contain"
          />
          <p className="text-[15px] leading-relaxed text-neutral-300">
            A product of First Track Solution Technologies (P) Limited
          </p>
        </div>

        {/* About us links */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-2xl font-bold text-white">About Us</h3>
          <nav className="flex flex-col gap-3">
            {aboutLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[15px] text-neutral-200 transition-colors hover:text-lime-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* App download */}
        <div className="flex flex-col gap-4 md:items-end md:text-right">
          <h3 className="font-serif text-2xl font-bold text-white">Download Our Mobile App</h3>
          <p className="max-w-xs text-[15px] leading-relaxed text-neutral-300">
            Download The App &amp; Order Your Favourite Foods Online
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-md border border-neutral-500 bg-black px-4 py-2"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
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
                <span className="font-serif text-lg font-semibold text-white">Google Play</span>
              </span>
            </a>

            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 rounded-md border border-neutral-500 bg-black px-4 py-2"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.4 1c.1 1-.3 2-.9 2.7-.6.7-1.6 1.3-2.6 1.2-.1-1 .4-2 .9-2.6C14.5 1.5 15.5 1 16.4 1Zm3.6 16.6c-.3.7-.6 1.3-1 1.9-.6.9-1.2 1.9-2.2 1.9-1 0-1.3-.6-2.4-.6-1.1 0-1.5.6-2.4.6-1 0-1.7-1-2.3-1.9-1.6-2.3-2.8-6.5-1.2-9.4.8-1.4 2.2-2.3 3.7-2.3 1.1 0 2.1.7 2.7.7.6 0 1.9-.9 3.2-.8.5 0 2.1.2 3.1 1.7-.1.1-1.9 1.1-1.8 3.3 0 2.6 2.3 3.5 2.3 3.5-.1.2-.3.9-.7 1.4Z" />
              </svg>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[11px] text-neutral-300">Available on the</span>
                <span className="font-serif text-lg font-semibold text-white">App Store</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
          <p className="text-[15px] text-neutral-300">Copyright © {new Date().getFullYear()} | fuddins.com</p>

          <div className="flex items-center gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="text-white transition-opacity hover:opacity-70"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;