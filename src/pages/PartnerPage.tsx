// @ts-nocheck
import { Link } from 'react-router-dom';

const linkBtnClass =
  'bg-[#4d9c1f] text-white font-extrabold py-3 px-4 text-center no-underline uppercase text-xs sm:text-sm sm:py-[17px] sm:px-[22px] sm:min-w-[138px]';
const actionBtnClass =
  'inline-block w-auto !max-w-fit whitespace-nowrap text-white font-extrabold py-2 px-4 no-underline text-xs sm:text-sm sm:py-2.5 sm:px-5 text-center rounded-lg transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0';
const actionBtnPrimary =
  'bg-[#5ba324] shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:bg-[#4d9c1f] hover:shadow-[0_8px_22px_rgba(0,0,0,0.45)]';
const actionBtnSecondary =
  'bg-transparent border-2 border-white hover:bg-white/10';

const StatIcon = ({ path, viewBox = '0 0 24 24' }) => (
  <span className="flex h-14 w-14 sm:h-[60px] sm:w-[60px] shrink-0 items-center justify-center rounded-full bg-[#4d9c1f] text-white">
    <svg viewBox={viewBox} className="h-7 w-7 sm:h-8 sm:w-8" fill="currentColor">
      <path d={path} />
    </svg>
  </span>
);

const PartnerPage = () => (
  <section
    className="text-white -mx-[22px] -mb-[56px] min-h-screen px-6 py-10 sm:px-[8%] sm:py-[66px] lg:px-[12%] bg-cover bg-center"
    style={{
      backgroundImage:
        "linear-gradient(rgba(11, 16, 9, .56), rgba(11, 16, 9, .56)), url('/images/pexels-jane-doan-1132047-1536x1152.webp')",
    }}
  >
    <Link
      to="/"
      className="absolute left-4 top-4 z-10 rounded-full border border-white/70 bg-black/35 px-3 py-1.5 text-xs font-bold text-white no-underline hover:bg-black/60 sm:left-7 sm:top-6 sm:px-4 sm:py-2 sm:text-sm"
    >
      ← Back to Home
    </Link>

    <div className="max-w-[1460px] pt-12 sm:pt-0">
      <nav
        className="flex flex-wrap items-center gap-3 mb-8 sm:mb-[58px] sm:gap-7"
        aria-label="Partner actions"
      >
        <img
          src="/images/cropped-fuddns.webp"
          alt="Fuddins for Business"
          className="h-[70px] w-auto object-contain sm:h-[110px] lg:h-[150px] lg:w-[210px]"
        />
        <div className="flex flex-wrap gap-2 sm:gap-4 lg:pt-9 lg:gap-[42px]">
          <Link to="/partner/vendor-register" className={linkBtnClass}>Login</Link>
          <Link to="/partner/vendor-register" className={linkBtnClass}>Create Account</Link>
          <Link to="/partner/vendor-register" className={`${linkBtnClass} hidden sm:inline-block`}>Membership Plans</Link>
        </div>
      </nav>

      <h1 className="font-serif text-[clamp(30px,8vw,62px)] my-3 leading-tight">
        Register your store on Fuddins
      </h1>
      <p className="text-base sm:text-[21px]">and get more customers!</p>

      <div className="flex gap-3 my-6 sm:my-[30px] sm:hidden" aria-label="Download the Fuddins app">
        <a href="#google-play" className="flex-1 rounded-lg border border-white bg-black px-3 py-2 text-center text-[11px] font-bold leading-tight text-white no-underline">
          GET IT ON<br /><span className="text-base">Google Play</span>
        </a>
        <a href="#app-store" className="flex-1 rounded-lg border border-white bg-black px-3 py-2 text-center text-[11px] font-bold leading-tight text-white no-underline">
          Available on the<br /><span className="text-base">App Store</span>
        </a>
      </div>

      <div className="hidden sm:flex gap-2.5 my-[30px]" aria-label="Download the Fuddins app">
        <a href="#google-play" className="rounded-lg border border-white bg-black px-4 py-2 text-center text-[13px] font-bold leading-tight text-white no-underline">GET IT ON<br /><span className="text-xl">Google Play</span></a>
        <a href="#app-store" className="rounded-lg border border-white bg-black px-4 py-2 text-center text-[13px] font-bold leading-tight text-white no-underline">Available on the<br /><span className="text-xl">App Store</span></a>
      </div>

      <div className="flex flex-wrap items-start gap-3 sm:gap-4 my-6 sm:my-[26px]">
        <Link to="/partner/vendor-register" className={`${actionBtnClass} ${actionBtnPrimary}`}>
          Register your store
        </Link>
        <Link to="/partner/vendor-register" className={`${actionBtnClass} ${actionBtnSecondary}`}>
          Store already listed? Login now
        </Link>
      </div>

      <article className="bg-white rounded-[22px] text-[#172033] mt-3 mb-0 max-w-[835px] py-6 px-5 sm:py-[26px] sm:px-[42px]">
        <h2 className="font-serif text-2xl sm:text-[38px] text-center m-0">
          Get started with online ordering
        </h2>
        <p className="text-center text-sm sm:text-[18px] mt-2">
          Please keep these documents ready for a smooth signup
        </p>
        <img
          src="/images/logo-leaf-new.webp"
          alt=""
          className="mx-auto mb-4 sm:mb-5 h-8 sm:h-10 w-auto object-contain"
        />
        <ul className="grid grid-cols-2 gap-y-4 sm:gap-y-[15px] gap-x-4 sm:gap-x-[40px] pl-5 sm:pl-[22px] marker:text-[#69b831] marker:font-black [list-style:'✓__'] text-sm sm:text-base">
          <li>FSSAI license copy</li>
          <li>PAN card copy</li>
          <li>GSTIN (if applicable)</li>
          <li>Bank account details</li>
          <li>Your restaurant menu</li>
          <li>Aadhaar card copy</li>
        </ul>
      </article>
    </div>

    <section className="-mx-6 sm:-mx-[8%] lg:-mx-[12vw] mt-4 sm:mt-6 bg-[#fbfaf8] px-6 pt-6 pb-14 sm:px-[8%] sm:pt-8 sm:pb-[92px] lg:px-[12%] text-[#111]">
      <h2 className="m-0 text-center font-serif text-[clamp(26px,6vw,52px)]">
        Why should you partner with Fuddins?
      </h2>
      <p className="mx-auto mt-4 sm:mt-5 max-w-[1400px] text-center text-sm sm:text-[18px] leading-7 sm:leading-8">
        Fuddins enables you to get 60% more revenue, 10x new customers and boost
        your brand visibility by providing insights to improve your business.
      </p>

      <div className="mx-auto mt-10 sm:mt-16 flex flex-col items-center gap-8 sm:hidden">
        <div className="flex flex-col items-center gap-3 text-center">
          <StatIcon path="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.5 1.6 2.5 3.7 3 6H9c.5-2.3 1.5-4.4 3-6zM6.3 9a7.9 7.9 0 011.7-3 8 8 0 00-1.7 3zm-.6 2h2.4c-.1.7-.1 1.3-.1 2s0 1.3.1 2H5.7A7.9 7.9 0 015.5 13c0-.7.1-1.3.2-2zm.6 6a8 8 0 001.7 3 7.9 7.9 0 01-1.7-3zM12 20c-1.5-1.6-2.5-3.7-3-6h6c-.5 2.3-1.5 4.4-3 6zm3.7-1a8 8 0 001.7-3 7.9 7.9 0 01-1.7 3zm2.6-5h-2.4c.1-.7.1-1.3.1-2s0-1.3-.1-2h2.4c.1.7.2 1.3.2 2s-.1 1.3-.2 2zm-.9-6a7.9 7.9 0 00-1.7-3 8 8 0 011.7 3zM10 9c.4-1.7 1.1-3.2 2-4.4V9h-2zm2 6v4.4c-.9-1.2-1.6-2.7-2-4.4h2zm2 0h-2v4.4c.9-1.2 1.6-2.7 2-4.4zm0-2h2c.1-.7.1-1.3.1-2s0-1.3-.1-2h-2v4z" />
          <p className="m-0 font-serif text-2xl font-bold">500+ Cities</p>
          <p className="m-0 text-sm text-[#555]">in India</p>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <StatIcon path="M7 4a1 1 0 00-.9 1.4L7 9v9a2 2 0 002 2h6a2 2 0 002-2V9l.9-3.6A1 1 0 0017 4H7zm2 3h6l-.6 2H9.6L9 7zm0 4h6v6H9v-6z" />
          <p className="m-0 font-serif text-2xl font-bold">50000+ Stores</p>
          <p className="m-0 text-sm text-[#555]">Store Listings</p>
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <StatIcon path="M19 4h-1V3a1 1 0 10-2 0v1H8V3a1 1 0 10-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 20V9h14v11H5zm9.7-6.3l-4.2 4.2-2.2-2.2 1.4-1.4.8.8 2.8-2.8z" />
          <p className="m-0 font-serif text-2xl font-bold">1 lakh+ Orders</p>
          <p className="m-0 text-sm text-[#555]">Daily Orders</p>
        </div>
      </div>

      <div className="mx-auto mt-16 hidden max-w-[1180px] grid-cols-3 gap-10 sm:grid">
        <div className="flex items-center gap-4">
          <StatIcon path="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.5 1.6 2.5 3.7 3 6H9c.5-2.3 1.5-4.4 3-6zM6.3 9a7.9 7.9 0 011.7-3 8 8 0 00-1.7 3zm-.6 2h2.4c-.1.7-.1 1.3-.1 2s0 1.3.1 2H5.7A7.9 7.9 0 015.5 13c0-.7.1-1.3.2-2zm.6 6a8 8 0 001.7 3 7.9 7.9 0 01-1.7-3zM12 20c-1.5-1.6-2.5-3.7-3-6h6c-.5 2.3-1.5 4.4-3 6zm3.7-1a8 8 0 001.7-3 7.9 7.9 0 01-1.7 3zm2.6-5h-2.4c.1-.7.1-1.3.1-2s0-1.3-.1-2h2.4c.1.7.2 1.3.2 2s-.1 1.3-.2 2zm-.9-6a7.9 7.9 0 00-1.7-3 8 8 0 011.7 3zM10 9c.4-1.7 1.1-3.2 2-4.4V9h-2zm2 6v4.4c-.9-1.2-1.6-2.7-2-4.4h2zm2 0h-2v4.4c.9-1.2 1.6-2.7 2-4.4zm0-2h2c.1-.7.1-1.3.1-2s0-1.3-.1-2h-2v4z" />
          <p className="m-0 font-serif text-[31px] font-bold leading-8">
            500+ Cities
            <small className="mt-2 block font-sans text-[18px] font-normal">in India</small>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatIcon path="M7 4a1 1 0 00-.9 1.4L7 9v9a2 2 0 002 2h6a2 2 0 002-2V9l.9-3.6A1 1 0 0017 4H7zm2 3h6l-.6 2H9.6L9 7zm0 4h6v6H9v-6z" />
          <p className="m-0 font-serif text-[31px] font-bold leading-8">
            50000+ Stores
            <small className="mt-2 block font-sans text-[18px] font-normal">Store Listings</small>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatIcon path="M19 4h-1V3a1 1 0 10-2 0v1H8V3a1 1 0 10-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 20V9h14v11H5zm9.7-6.3l-4.2 4.2-2.2-2.2 1.4-1.4.8.8 2.8-2.8z" />
          <p className="m-0 font-serif text-[31px] font-bold leading-8">
            1 lakh+ Orders
            <small className="mt-2 block font-sans text-[18px] font-normal">Daily Orders</small>
          </p>
        </div>
      </div>
    </section>
  </section>
);

export default PartnerPage;
