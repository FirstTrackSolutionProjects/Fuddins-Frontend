// @ts-nocheck
import { Link } from 'react-router-dom';

const Ico = ({ d, className = 'h-5 w-5', stroke = 2.25 }) => (
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

const CHECK = 'M20 6 9 17l-5-5';
const ARROW = 'M5 12h14 M12 5l7 7-7 7';
const BACK = 'm15 18-6-6 6-6';

const documents = [
  'FSSAI license copy',
  'PAN card copy',
  'GSTIN (if applicable)',
  'Bank account details',
  'Your restaurant menu',
  'Aadhaar card copy',
];

const stats = [
  {
    value: '500+ Cities',
    label: 'in India',
    path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.5 1.6 2.5 3.7 3 6H9c.5-2.3 1.5-4.4 3-6zM6.3 9a7.9 7.9 0 011.7-3 8 8 0 00-1.7 3zm-.6 2h2.4c-.1.7-.1 1.3-.1 2s0 1.3.1 2H5.7A7.9 7.9 0 015.5 13c0-.7.1-1.3.2-2zm.6 6a8 8 0 001.7 3 7.9 7.9 0 01-1.7-3zM12 20c-1.5-1.6-2.5-3.7-3-6h6c-.5 2.3-1.5 4.4-3 6zm3.7-1a8 8 0 001.7-3 7.9 7.9 0 01-1.7 3zm2.6-5h-2.4c.1-.7.1-1.3.1-2s0-1.3-.1-2h2.4c.1.7.2 1.3.2 2s-.1 1.3-.2 2zm-.9-6a7.9 7.9 0 00-1.7-3 8 8 0 011.7 3zM10 9c.4-1.7 1.1-3.2 2-4.4V9h-2zm2 6v4.4c-.9-1.2-1.6-2.7-2-4.4h2zm2 0h-2v4.4c.9-1.2 1.6-2.7 2-4.4zm0-2h2c.1-.7.1-1.3.1-2s0-1.3-.1-2h-2v4z',
  },
  {
    value: '50000+ Stores',
    label: 'Store Listings',
    path: 'M7 4a1 1 0 00-.9 1.4L7 9v9a2 2 0 002 2h6a2 2 0 002-2V9l.9-3.6A1 1 0 0017 4H7zm2 3h6l-.6 2H9.6L9 7zm0 4h6v6H9v-6z',
  },
  {
    value: '1 lakh+ Orders',
    label: 'Daily Orders',
    path: 'M19 4h-1V3a1 1 0 10-2 0v1H8V3a1 1 0 10-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 20V9h14v11H5zm9.7-6.3l-4.2 4.2-2.2-2.2 1.4-1.4.8.8 2.8-2.8z',
  },
];

const StatIcon = ({ path }) => (
  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-lg shadow-lime-500/30">
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
      <path d={path} />
    </svg>
  </span>
);

const storeBadge =
  'flex flex-1 flex-col rounded-xl border border-white/40 bg-black/70 px-4 py-2 text-left text-[11px] font-semibold leading-tight text-white no-underline backdrop-blur transition hover:border-white hover:bg-black sm:flex-none sm:min-w-[150px]';

const PartnerPage = () => (
  <div className="-mx-[22px] -mb-[56px] overflow-x-hidden">
    {/* ---------- Hero ---------- */}
    <section
      className="relative text-white"
      style={{
        backgroundImage:
          "linear-gradient(105deg, rgba(7,18,5,.93) 0%, rgba(7,18,5,.78) 48%, rgba(7,18,5,.4) 100%), url('/images/pexels-jane-doan-1132047-1536x1152.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Link
        to="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-white/40 bg-black/30 py-1.5 pl-2.5 pr-3.5 text-xs font-bold text-white no-underline backdrop-blur transition hover:bg-black/60 sm:left-8 sm:top-6 sm:text-sm"
      >
        <Ico d={BACK} className="h-4 w-4" stroke={2.5} /> Back to Home
      </Link>

      <div className="mx-auto max-w-[1280px] px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-10">
        {/* top bar */}
        <nav
          className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur-md"
          aria-label="Partner actions"
        >
          <div className="rounded-xl bg-white px-3 py-1.5 shadow-lg">
            <img
              src="/images/cropped-fuddns.webp"
              alt="Fuddins for Business"
              className="h-10 w-auto object-contain sm:h-12"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/partner/vendor-register"
              className="rounded-xl border border-white/60 px-3 py-2.5 text-[13px] font-bold text-white no-underline transition hover:bg-white/15 sm:px-5 sm:text-sm"
            >
              Login
            </Link>
            <Link
              to="/partner/vendor-register"
              className="rounded-xl bg-gradient-to-r from-lime-400 to-lime-600 px-3 py-2.5 text-[13px] font-bold text-white no-underline shadow-lg shadow-lime-600/30 transition hover:from-lime-500 hover:to-lime-700 sm:px-5 sm:text-sm"
            >
              Create Account
            </Link>
            <Link
              to="/partner/vendor-register"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-white/90 no-underline transition hover:bg-white/15 md:inline-block"
            >
              Membership Plans
            </Link>
          </div>
        </nav>

        <div className="mt-10 grid items-center gap-10 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* left: pitch */}
          <div>
            <h1 className="font-serif text-[clamp(34px,6.5vw,62px)] font-bold leading-[1.08]">
              Register your store on Fuddins
            </h1>
            <p className="mt-4 text-lg text-lime-50/90 sm:text-xl">and get more customers!</p>

            <div className="mt-7 flex gap-3" aria-label="Download the Fuddins app">
              <a href="#google-play" className={storeBadge}>
                GET IT ON
                <span className="text-lg font-bold sm:text-xl">Google Play</span>
              </a>
              <a href="#app-store" className={storeBadge}>
                Available on the
                <span className="text-lg font-bold sm:text-xl">App Store</span>
              </a>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/partner/vendor-register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-400 to-lime-600 px-6 py-3.5 text-[15px] font-extrabold text-white no-underline shadow-xl shadow-lime-600/30 transition hover:-translate-y-0.5 hover:from-lime-500 hover:to-lime-700 active:translate-y-0"
              >
                Register your store <Ico d={ARROW} className="h-5 w-5" />
              </Link>
              <Link
                to="/partner/vendor-register"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/70 bg-white/5 px-6 py-3 text-[15px] font-bold text-white no-underline backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0"
              >
                Store already listed? Login now
              </Link>
            </div>
          </div>

          {/* right: documents */}
          <article className="rounded-3xl bg-white p-6 text-[#172033] shadow-2xl shadow-black/30 sm:p-8">
            <img
              src="/images/logo-leaf-new.webp"
              alt=""
              className="mb-3 h-9 w-auto object-contain"
            />
            <h2 className="m-0 font-serif text-2xl font-bold leading-tight sm:text-[30px]">
              Get started with online ordering
            </h2>
            <p className="mb-5 mt-2 text-sm text-neutral-600 sm:text-base">
              Please keep these documents ready for a smooth signup
            </p>
            <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2">
              {documents.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl bg-lime-50 px-3 py-2.5 text-sm font-semibold text-neutral-800 ring-1 ring-lime-100"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-500 text-white">
                    <Ico d={CHECK} className="h-3.5 w-3.5" stroke={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>

    {/* ---------- Why partner ---------- */}
    <section className="bg-gradient-to-b from-lime-50 via-white to-white px-5 pb-16 pt-14 text-[#111] sm:px-8 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="m-0 text-center font-serif text-[clamp(26px,5vw,46px)] font-bold leading-tight">
          Why should you partner with Fuddins?
        </h2>
        <p className="mx-auto mt-4 max-w-[760px] text-center text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
          Fuddins enables you to get 60% more revenue, 10x new customers and boost
          your brand visibility by providing insights to improve your business.
        </p>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-lime-600/10 sm:flex-col sm:gap-3 sm:py-8 sm:text-center"
            >
              <StatIcon path={stat.path} />
              <p className="m-0 font-serif text-2xl font-bold leading-tight sm:text-[28px]">
                {stat.value}
                <small className="mt-1 block font-sans text-sm font-medium text-neutral-500 sm:text-base">
                  {stat.label}
                </small>
              </p>
            </div>
          ))}
        </div>

        {/* closing call to action */}
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-10 text-center text-white shadow-2xl shadow-lime-700/25 sm:mt-16 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/10" />
          <h3 className="relative m-0 font-serif text-2xl font-bold sm:text-[34px]">
            Register your store on Fuddins
          </h3>
          <p className="relative mx-auto mb-6 mt-2 max-w-md text-base text-lime-50/95">and get more customers!</p>
          <Link
            to="/partner/vendor-register"
            className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[15px] font-extrabold text-lime-700 no-underline shadow-xl transition hover:-translate-y-0.5 hover:bg-lime-50 active:translate-y-0"
          >
            Register your store <Ico d={ARROW} className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default PartnerPage;