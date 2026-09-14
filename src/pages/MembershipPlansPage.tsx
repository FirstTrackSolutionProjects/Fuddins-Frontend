import { Link } from 'react-router-dom';

const plans = [
  ['Free Plan', '₹0.00', 'No payment required'], ['Silver Insta', '₹799.00', 'for each 3 Month(s)'],
  ['Gold Insta', '₹999.00', 'for each 3 Month(s)'], ['Diamond Insta', '₹1,499.00', 'for each 3 Month(s)'],
  ['Platinum Insta', '₹1,999.00', 'for each 3 Month(s)'], ['Bronze Insta', '₹499.00', 'for each 3 Month(s)'],
];

const MembershipPlansPage = () => (
  <section className="min-h-[70vh] bg-white px-[5%] py-14">
    <header className="mb-16 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
      <img src="/images/cropped-fuddns.webp" alt="Fuddins for Business" className="h-[128px] w-[185px] object-contain" />
      <h1 className="m-0 text-center font-serif text-[clamp(32px,3.2vw,50px)]">welcome to fuddins partners app</h1>
      <Link
        to="/partner/onboarding-enquiry"
        className="bg-lime-500 px-7 py-4 font-bold uppercase text-white no-underline"
      >
        Onboarding Enquiry
      </Link>
    </header>

    <div className="mx-auto mb-[65px] flex max-w-[1420px] justify-between border-b-[5px] border-neutral-300 pb-4 sm:mb-[155px]">
      {['Plans', 'Registration', 'Confirmation', 'Thank You'].map((step, index) => (
        <span
          key={step}
          className={`relative w-1/4 text-center after:absolute after:-bottom-[23px] after:left-[calc(50%-5px)] after:h-2.5 after:w-2.5 after:rounded-full after:content-[''] ${
            index === 0
              ? "text-[#273449] after:bg-[#273449] before:absolute before:-bottom-5 before:left-0 before:h-[5px] before:w-1/2 before:bg-[#273449] before:content-['']"
              : 'text-neutral-300 after:bg-neutral-300'
          }`}
        >
          {step}
        </span>
      ))}
    </div>

    <div className="mx-auto grid max-w-[1220px] grid-cols-[repeat(6,minmax(160px,1fr))] overflow-x-auto sm:grid-cols-[repeat(6,160px)]">
      {plans.map(([name, price, note]) => (
        <article key={name} className="min-w-[160px] bg-lime-600 pb-6 text-center text-white">
          <h2 className="m-0 min-h-[66px] bg-[#2b374d] px-2 py-4.5 text-[23px] uppercase">{name}</h2>
          <div className="mx-auto my-4 flex h-[142px] w-[142px] items-center justify-center rounded-full border-2 border-white text-[28px] font-extrabold">
            {price}
          </div>
          <p className="min-h-[20px] text-sm">{note}</p>
          <div className="mt-4.5 grid gap-2 bg-white px-3 py-4 text-left text-[#182034]">
            <strong className="text-[13px] leading-[1.35]">Admin Commission</strong>
            <span className="text-[13px] leading-[1.35]">
              {name === 'Gold Insta' ? '20%' : name === 'Diamond Insta' ? '18%' : name === 'Platinum Insta' ? '15%' : name === 'Silver Insta' ? '10%' : '5%'}
            </span>
            <strong className="text-[13px] leading-[1.35]">Category</strong>
            <span className="text-[13px] leading-[1.35]">
              {name === 'Bronze Insta' ? 'Dairy' : name === 'Free Plan' ? 'All' : 'Food, grocery & essentials'}
            </span>
            <strong className="text-[13px] leading-[1.35]">Subscription Renewal</strong>
            <span className="text-[13px] leading-[1.35]">{note}</span>
          </div>
          <Link
            to={`/vendor-membership?plan=${encodeURIComponent(name)}`}
            className="mt-3 inline-block font-bold text-white underline"
          >
            Choose This Plan!
          </Link>
        </article>
      ))}
    </div>
  </section>
);

export default MembershipPlansPage;
