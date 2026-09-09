import { Link } from 'react-router-dom';

const linkBtnClass =
  'bg-[#4d9c1f] text-white font-extrabold min-w-[138px] py-[17px] px-[22px] text-center no-underline uppercase';
const actionBtnClass =
  'bg-[#5ba324] border-0 text-white font-extrabold py-[18px] px-[28px] no-underline';

const PartnerPage = () => (
  <section
    className="text-white -mx-[22px] -mt-[28px] -mb-[56px] min-h-[calc(100vh-130px)] px-[12%] py-[84px] bg-cover bg-center"
    style={{
      backgroundImage:
        "linear-gradient(105deg, rgba(28, 51, 29, .88), rgba(35, 79, 29, .68)), url('/legacy-uploads/2022/10/fast-food-6974507_1920-150x150.jpg')",
    }}
  >
    <div className="max-w-[920px]">
      <nav className="flex flex-wrap gap-[18px] justify-end mb-[58px]" aria-label="Partner actions">
        <Link to="/partner/executive-login" className={linkBtnClass}>Login</Link>
        <Link to="/partner/onboarding-enquiry" className={linkBtnClass}>Create Account</Link>
        <Link to="/partner/membership-plans" className={linkBtnClass}>Membership Plans</Link>
      </nav>

      <p className="text-[#c9edaa] font-extrabold tracking-[.1em] uppercase">Fuddins for Business</p>
      <h1 className="font-serif text-[clamp(38px,5vw,62px)] my-[14px]">Register your store on Fuddins</h1>
      <p className="text-[21px]">Reach more customers and start accepting online orders.</p>

      <div className="flex flex-wrap gap-[18px] my-[30px]">
        <Link to="/partner/onboarding-enquiry" className={actionBtnClass}>Register your store</Link>
        <Link to="/partner/executive-login" className={actionBtnClass}>Store already listed? Login now</Link>
      </div>

      <article className="bg-white rounded-[18px] text-[#172033] mt-[32px] py-[30px] px-[42px] max-[860px]:p-[24px]">
        <h2 className="font-serif text-[34px] m-0">Get started with online ordering</h2>
        <p>Please keep these documents ready for a smooth signup.</p>
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
  </section>
);

export default PartnerPage;