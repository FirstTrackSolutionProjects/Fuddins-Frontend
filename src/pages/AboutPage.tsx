interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Mr. Tejash Parekh',
    role: 'Founder | CEO',
    bio: 'He is the founder of First Track Solution Technologies Private Limited and well established business person, He evokes the brightest minds to be told rising technologies.',
    photo: '/images/WhatsApp-Image-2022-10-27-at-16.50.52-e1666870078922.webp',
  },
  {
    name: 'Ms. Toral Barbhaya',
    role: 'Director',
    bio: 'She is a director of the company. She drives the business initiatives, transportation the spirit of innovation and eventually guaranteeing the most effective quality of package solutions for patrons.',
    photo: '/images/WhatsApp-Image-2022-10-27-at-16.50.51.webp',
  },
  {
    name: 'Mr. Debasish Mahapatro',
    role: 'Co-Founder | CTO',
    bio: 'Technology professional, Debasish keeps up on the newest software tech-trends.He drives the technology initiatives, transferral the spirit of innovation and eventually guaranteeing the best quality of software.',
    photo: '/images/WhatsApp-Image-2022-10-27-at-17.16.46.webp',
  },
  {
    name: 'Mr. Prabhanjan Ku Pattanaik',
    role: 'Co-Founder',
    bio: 'Prabhanjan has been operating as a transformational coach and trainer supporting purchasers and corporations alike towards true property modification within the areas of general dynamics, humanist approaches, communication, creativity, address, and leadership.',
  },
  {
    name: 'Mr. Dambarudhar Meher',
    role: 'Co-Founder',
    bio: 'Specializing principally in matched sessions with team members, middle and higher management, she crafts her sessions fastidiously supported the client\u2019s specific desires.',
  },
  {
    name: 'Mr. Parmesh Panda',
    role: 'Co-Founder',
    bio: 'Parmesh is a charm, innocent and well skill business person. He is very dedicated in every challenges',
  },
];

const qualityCategories = [
  'Ready Foods',
  'Fresh fruits',
  'Groceries',
  'Fresh vegetables',
  'Snacks',
  'Dairy',
  'Beauty & Cosmetics',
  'Office Stationary',
  'Dessert & Bakery',
  'Pharma(First-Aid Items)',
  'Beverages',
  'Mitha Paan',
];

const CheckBadge = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 shrink-0 text-lime-600"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.2 2.4 2.4 4.6-4.8" />
  </svg>
);

const AboutPage = () => {
  return (
    <section className="flex flex-col">
      {/* Hero */}
      <div className="relative bg-neutral-100 px-6 py-20 text-center">
        <h1 className="font-serif text-5xl font-bold text-neutral-900">About Us</h1>
        <img
          src="/images/basil-leaf.webp"
          alt=""
          className="absolute left-1/2 top-full h-16 w-auto -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* What is Fuddins */}
      <div className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-serif text-3xl font-bold text-neutral-900">What Is Fuddins</h2>
            <p className="text-base leading-relaxed text-neutral-700">
              FUDDINS is the online home delivery services app, with the categories of food,
              groceries, vegetables, fruits, diary, beverages, snacks, deserts, house hold item,
              beauty &amp; cosmetics, baby care products, tobacco, garments, pharma, footwear,
              electronics &amp; electrical products, sports item, pc &amp; laptop &amp; many more.
            </p>
          </div>
          <div className="flex justify-center">
            <img src="/images/cropped-fuddns.webp" alt="Fuddins" className="w-72" />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#0b1f2e] px-6 py-14 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-8 text-center sm:grid-cols-4">
          <p className="text-lg font-bold sm:text-left">Our Partners</p>
          <div>
            <p className="text-4xl font-bold">5,000+</p>
            <p className="mt-1 text-sm text-neutral-300">Products</p>
          </div>
          <div>
            <p className="text-4xl font-bold">500+</p>
            <p className="mt-1 text-sm text-neutral-300">Partners</p>
          </div>
          <div>
            <p className="text-4xl font-bold">20+</p>
            <p className="mt-1 text-sm text-neutral-300">Product Categories</p>
          </div>
        </div>
      </div>

      {/* Founder card + quality categories */}
      <div className="relative overflow-hidden px-6 py-20">
        <img
          src="/images/logo-leaf-new.webp"
          alt=""
          className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 -translate-x-4 translate-y-6 rotate-90 opacity-10"
        />

        <div className="relative mx-auto grid max-w-6xl items-start gap-12 md:grid-cols-2">
          <div className="flex flex-col items-center rounded-md bg-neutral-100 p-10 text-center">
            <img
              src="/images/FTST_-_Logo-removebg-preview.webp"
              alt="First Track Solution Technologies"
              className="mb-6 h-40 w-40 rounded-full object-cover"
            />
            <h3 className="font-serif text-2xl font-bold text-neutral-900">
              First Track Solution Technologies (P)Limited
            </h3>
            <p className="mt-4 text-sm font-semibold tracking-wide text-neutral-700">
              FOUNDER OF FUDDINS.COM
            </p>
          </div>

          <div>
            <div className="mb-8 flex items-center gap-4">
              <img src="/images/download-removebg-preview.webp" alt="FSSAI Certified" className="h-14 w-auto" />
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Certified Products</h3>
                <p className="text-sm text-neutral-600">Get best and fresh products at your doorstep</p>
              </div>
            </div>

            <h3 className="mb-4 font-serif text-3xl font-bold text-neutral-900">Our Quality Categories</h3>
            <img src="/images/logo-leaf-new.webp" alt="" className="mb-6 h-8 w-auto" />

            <div className="mb-8 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
              {qualityCategories.map((category) => (
                <div key={category} className="flex items-center gap-2.5 text-neutral-800">
                  <CheckBadge />
                  <span>{category}</span>
                </div>
              ))}
            </div>

            <a
              href="/shop"
              className="inline-flex items-center gap-2 rounded-sm bg-lime-500 px-7 py-3.5 font-bold tracking-wide text-white transition-colors hover:bg-lime-600"
            >
              🛒 START SHOPPING
            </a>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-serif text-4xl font-bold text-neutral-900">Our Team</h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="overflow-hidden rounded-md bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="aspect-[4/5] w-full object-cover object-center"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full bg-neutral-100" />
                )}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-neutral-900">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-neutral-700">{member.role}</p>
                  {member.bio ? <p className="mt-4 text-sm leading-relaxed text-neutral-600">{member.bio}</p> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-md bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
            <h3 className="font-serif text-3xl font-bold text-neutral-900">Mr. Prabhanjan Ku Pattanaik</h3>
            <p className="mt-6 text-base font-semibold text-neutral-900">Co-Founder</p>
            <p className="mt-8 text-base leading-relaxed text-neutral-600">
              Prabhanjan has been operating as a transformational coach and trainer supporting purchasers and corporations alike towards true property modification within the areas of general dynamics, humanist approaches, communication, creativity, address, and leadership.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
