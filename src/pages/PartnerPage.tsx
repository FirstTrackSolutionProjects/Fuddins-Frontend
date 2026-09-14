import { Link } from 'react-router-dom';

const linkBtnClass =
  'bg-[#4d9c1f] text-white font-extrabold min-w-[138px] py-[17px] px-[22px] text-center no-underline uppercase';
const actionBtnClass =
  'bg-[#5ba324] border-0 text-white font-extrabold py-[18px] px-[28px] no-underline';

const PartnerPage = () => (
  <section
    className="text-white -mx-[22px] -mb-[56px] min-h-screen px-[12%] py-[66px] bg-cover bg-center"
    style={{
      backgroundImage:
        "linear-gradient(rgba(11, 16, 9, .56), rgba(11, 16, 9, .56)), url('/images/pexels-jane-doan-1132047-1536x1152.webp')",
    }}
  >
    <Link to="/" className="absolute left-7 top-6 z-10 rounded-full border border-white/70 bg-black/35 px-4 py-2 text-sm font-bold text-white no-underline hover:bg-black/60">← Back to Home</Link>
    <div className="max-w-[1460px]">
      <nav className="grid grid-cols-[250px_1fr_210px] items-start gap-7 mb-[58px] max-[1050px]:grid-cols-[180px_1fr]" aria-label="Partner actions">
        <img src="/images/cropped-fuddns.webp" alt="Fuddins for Business" className="h-[150px] w-[210px] object-contain object-left max-[700px]:h-[110px] max-[700px]:w-[145px]" />
        <div className="flex flex-wrap justify-center gap-[42px] pt-9 max-[1050px]:gap-4 max-[700px]:justify-start max-[700px]:pt-0">
        <Link to="/partner/vendor-register" className={linkBtnClass}>Login</Link>
        <Link to="/partner/vendor-register" className={linkBtnClass}>Create Account</Link>
        <Link to="/partner/vendor-register" className={linkBtnClass}>Membership Plans</Link>
        </div>
        <div className="grid gap-2.5 max-[1050px]:hidden" aria-label="Download the Fuddins app">
          <a href="#google-play" className="rounded-lg border border-white bg-black px-4 py-2 text-center text-[13px] font-bold leading-tight text-white no-underline">GET IT ON<br /><span className="text-xl">Google Play</span></a>
          <a href="#app-store" className="rounded-lg border border-white bg-black px-4 py-2 text-center text-[13px] font-bold leading-tight text-white no-underline">Available on the<br /><span className="text-xl">App Store</span></a>
        </div>
      </nav>

      <h1 className="font-serif text-[clamp(38px,5vw,62px)] my-[14px]">Register your store on Fuddins</h1>
      <p className="text-[21px]">and get more customers!</p>

      <div className="flex flex-wrap gap-[18px] my-[30px]">
        <Link to="/partner/vendor-register" className={actionBtnClass}>Resister your store</Link>
        <Link to="/partner/vendor-register" className={actionBtnClass}>Store already listed? Login now</Link>
      </div>

      <article className="bg-white rounded-[22px] text-[#172033] mt-[14px] mb-[94px] max-w-[835px] py-[26px] px-[42px] max-[860px]:p-[24px]">
        <h2 className="font-serif text-[38px] text-center m-0">Get started with online ordering</h2>
        <p className="text-center text-[18px]">Please keep these documents ready for a smooth signup</p>
        <img src="/images/logo-leaf-new.webp" alt="" className="mx-auto mb-5 h-10 w-auto object-contain" />
        <ul className="grid grid-cols-2 max-[860px]:grid-cols-1 gap-y-[15px] gap-x-[40px] pl-[22px] marker:text-[#69b831] marker:font-black [list-style:'✓__']">
          <li>FSSAI license copy</li>
          <li>PAN card copy</li>
          <li>GSTIN (if applicable)</li>
          <li>Bank account details</li>
          <li>Your restaurant menu</li>
          <li>Aadhaar card copy</li>
        </ul>
      </article>
    </div>
    <section className="-mx-[calc(12vw)] mt-[0] bg-[#fbfaf8] px-[12%] py-[92px] text-[#111] max-[700px]:px-6">
      <h2 className="m-0 text-center font-serif text-[clamp(34px,3.4vw,52px)]">Why should you partner with Fuddins?</h2>
      <p className="mx-auto mt-5 max-w-[1400px] text-center text-[18px] leading-8">Fuddins enables you to get 60% more revenue, 10x new customers and boost your brand visibility by providing insights to improve your business.</p>
      <div className="mx-auto mt-16 grid max-w-[1180px] grid-cols-3 gap-10 max-[800px]:grid-cols-1">
        <div className="flex items-center gap-4"><span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#4d9c1f] text-3xl text-white">●</span><p className="m-0 font-serif text-[31px] font-bold leading-8">500+ Cities<small className="mt-2 block font-sans text-[18px] font-normal">in India</small></p></div>
        <div className="flex items-center gap-4"><span className="flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-[#4d9c1f] text-3xl text-white">▥</span><p className="m-0 font-serif text-[31px] font-bold leading-8">50000+ Stores<small className="mt-2 block font-sans text-[18px] font-normal">Store Listings</small></p></div>
        <div className="flex items-center gap-4"><span className="flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-[#4d9c1f] text-3xl text-white">✓</span><p className="m-0 font-serif text-[31px] font-bold leading-8">1 lakh+ Orders<small className="mt-2 block font-sans text-[18px] font-normal">Daily Orders</small></p></div>
      </div>
    </section>
  </section>
);

export default PartnerPage;
