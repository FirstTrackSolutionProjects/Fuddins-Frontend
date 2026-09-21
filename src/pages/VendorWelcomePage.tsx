import { Link } from 'react-router-dom';

const VendorWelcomePage = () => (
  <section className="min-h-[70vh] bg-[#f8f7f5] px-5 py-16">
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 shadow-xl">
      <img src="/images/cropped-fuddns.webp" alt="Fuddins" className="mx-auto h-24 w-36 object-contain" />
      <h1 className="mt-5 text-center font-serif text-5xl text-[#273449]">Welcome to Fuddins!</h1>
      <p className="mt-6 text-center text-lg leading-8 text-neutral-600">Your subscription is active. The store setup wizard will help you add your business details, products and delivery preferences.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2"><Link to="/account" className="rounded-lg bg-lime-600 px-6 py-4 text-center font-bold text-white no-underline">LET'S GO!</Link><Link to="/" className="rounded-lg border border-lime-600 px-6 py-4 text-center font-bold text-lime-700 no-underline">NOT RIGHT NOW</Link></div>
    </div>
  </section>
);

export default VendorWelcomePage;
