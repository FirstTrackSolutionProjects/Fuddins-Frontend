import { Link } from 'react-router-dom';

const plans = [
  ['Free Plan', '₹0.00', 'No payment required'], ['Silver Insta', '₹799.00', 'for each 3 Month(s)'],
  ['Gold Insta', '₹999.00', 'for each 3 Month(s)'], ['Diamond Insta', '₹1,499.00', 'for each 3 Month(s)'],
  ['Platinum Insta', '₹1,999.00', 'for each 3 Month(s)'], ['Bronze Insta', '₹499.00', 'for each 3 Month(s)'],
];

/* ---------- UI-only helpers ---------- */

const tierBand: Record<string, string> = {
  'Free Plan': 'from-lime-500 to-lime-700',
  'Silver Insta': 'from-slate-400 to-slate-600',
  'Gold Insta': 'from-amber-400 to-amber-600',
  'Diamond Insta': 'from-sky-400 to-sky-600',
  'Platinum Insta': 'from-slate-600 to-slate-800',
  'Bronze Insta': 'from-orange-500 to-orange-700',
};

const Ico = ({ d, className = 'h-5 w-5', stroke = 2.25 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  check: 'M20 6 9 17l-5-5',
  arrow: 'M5 12h14 M12 5l7 7-7 7',
  percent: 'M19 5 5 19 M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  tag: 'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5',
};

const steps = ['Plans', 'Registration', 'Confirmation', 'Thank You'];

const Stepper = ({ current }: { current: number }) => (
  <ol className="m-0 mx-auto mb-10 grid max-w-3xl list-none grid-cols-4 p-0" aria-label="Progress">
    {steps.map((label, index) => {
      const done = index < current;
      const active = index === current;
      return (
        <li key={label} className="relative flex flex-col items-center text-center">
          {index > 0 ? (
            <span className={`absolute left-[-50%] top-4 h-0.5 w-full -translate-y-1/2 ${index <= current ? 'bg-lime-500' : 'bg-neutral-200'}`} />
          ) : null}
          <span
            className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
              done
                ? 'bg-lime-500 text-white'
                : active
                  ? 'border-2 border-lime-500 bg-white text-lime-700 ring-4 ring-lime-500/20'
                  : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            {done ? <Ico d={ICON.check} className="h-4 w-4" stroke={3} /> : index + 1}
          </span>
          <span className={`mt-2 text-[11px] font-semibold sm:text-sm ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>{label}</span>
        </li>
      );
    })}
  </ol>
);

const Row = ({ icon, label, value }: { icon: keyof typeof ICON; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime-50 text-lime-700 ring-1 ring-lime-100">
      <Ico d={ICON[icon]} className="h-[18px] w-[18px]" />
    </span>
    <div className="min-w-0">
      <p className="m-0 text-xs font-semibold text-neutral-500">{label}</p>
      <p className="m-0 mt-0.5 break-words text-[15px] font-bold text-neutral-900">{value}</p>
    </div>
  </div>
);

const MembershipPlansPage = () => (
  <section className="min-h-[70vh] overflow-x-hidden bg-gradient-to-b from-lime-50 via-white to-white px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-6xl">
      {/* hero */}
      <header className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-8 shadow-2xl shadow-lime-700/20 sm:mb-14 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="shrink-0 rounded-2xl bg-white p-3 shadow-xl">
            <img src="/images/cropped-fuddns.webp" alt="Fuddins for Business" className="h-20 w-auto object-contain sm:h-24" />
          </div>
          <div className="min-w-0 flex-1 md:px-4">
            <h1 className="m-0 font-serif text-[clamp(28px,4vw,46px)] font-bold leading-tight text-white">
              Welcome to Fuddins Partners App
            </h1>
            <p className="mb-0 mt-2 text-base text-lime-50/90">Choose a plan to get started.</p>
          </div>
          <Link
            to="/partner/onboarding-enquiry"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-extrabold text-lime-700 no-underline shadow-xl transition hover:-translate-y-0.5 hover:bg-lime-50 active:translate-y-0"
          >
            Onboarding Enquiry <Ico d={ICON.arrow} className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <Stepper current={0} />

      {/* plans */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(([name, price, note]) => {
          const commission =
            name === 'Gold Insta' ? '20%' : name === 'Diamond Insta' ? '18%' : name === 'Platinum Insta' ? '15%' : name === 'Silver Insta' ? '10%' : '5%';
          const category = name === 'Bronze Insta' ? 'Dairy' : name === 'Free Plan' ? 'All' : 'Food, grocery & essentials';
          return (
            <article
              key={name}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-lime-700/15"
            >
              <div className={`bg-gradient-to-br ${tierBand[name] || tierBand['Free Plan']} px-6 pb-7 pt-6 text-center text-white`}>
                <h2 className="m-0 text-lg font-bold uppercase tracking-wide">{name}</h2>
                <p className="m-0 mt-4 text-[clamp(34px,4vw,44px)] font-extrabold leading-none">{price}</p>
                <p className="mb-0 mt-2.5 text-sm font-medium text-white/90">{note}</p>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <Row icon="percent" label="Admin Commission" value={commission} />
                <Row icon="tag" label="Category" value={category} />
                <Row icon="refresh" label="Subscription Renewal" value={note} />

                <Link
                  to={`/vendor-membership?plan=${encodeURIComponent(name)}`}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3.5 text-[15px] font-bold text-white no-underline shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98]"
                >
                  Choose This Plan <Ico d={ICON.arrow} className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default MembershipPlansPage;