const ApplyShoppingCardPage = () => {
  const handlePayNow = () => {
    // TODO: wire this up to the real Razorpay checkout once keys/order-creation API are ready.
    console.log('Razorpay checkout not yet connected.');
  };

  return (
    <section className="flex flex-col">
      {/* Hero promo banner */}
      <div className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <img
            src="/images/d316a61d-7399-460b-878e-ac3be35b1375.webp"
            alt="Get Shopping Card Now - Pay ₹999 only, get ₹1150 groceries"
            className="w-full rounded-sm border border-neutral-200"
          />
        </div>
      </div>

      {/* What Benefits For You */}
      <div className="bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-4xl font-bold text-neutral-900">What Benefits For you</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-neutral-600">
            Save money with shopping cards and shop for more of the things you love
          </p>

          <div className="mt-14 grid items-center gap-12 md:grid-cols-2">
            <img
              src="/images/Untitled-design-1-1536x1090.webp"
              alt="Fuddins shopping card front and back"
              className="w-full rounded-sm object-cover"
            />

            <div>
              <h3 className="mb-6 text-2xl font-bold text-neutral-900">Card benefits you should know</h3>

              <ul className="mb-8 flex flex-col gap-4">
                <li className="flex items-center gap-3 text-base text-neutral-800">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-900" />
                  Save More , Shop More
                </li>
                <li className="flex items-center gap-3 text-base text-neutral-800">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-900" />
                  One time apply card
                </li>
              </ul>

              <button
                type="button"
                onClick={handlePayNow}
                className="flex items-center gap-3 rounded-sm bg-[#0b2a4a] px-5 py-3 text-white transition-colors hover:bg-[#0b2a4a]/90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M20.5 3 8.6 14.9l3.3 3.3L23.8 6.3 20.5 3ZM3 10.6l7 7-3.3 3.3-7-7 3.3-3.3Z" />
                </svg>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-bold">Pay Now</span>
                  <span className="text-[11px] text-neutral-300">Secured by Razorpay</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplyShoppingCardPage;