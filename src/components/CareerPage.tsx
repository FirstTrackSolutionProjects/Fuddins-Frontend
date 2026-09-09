import { useState } from 'react';
import { resolveAssetUrl } from '../config';

interface CareerFormState {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  city: string;
  state: string;
  zip: string;
  qualification: string;
}

const initialFormState: CareerFormState = {
  firstName: '',
  lastName: '',
  email: '',
  contactNo: '',
  city: '',
  state: '',
  zip: '',
  qualification: '10th',
};

const qualificationOptions = ['10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Other'];

const inputClasses =
  'w-full rounded-sm border border-neutral-300 bg-neutral-100 px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-lime-500';

const labelClasses = 'flex flex-1 flex-col gap-2 text-sm font-semibold text-neutral-800';

const CareerPage = () => {
  const [form, setForm] = useState<CareerFormState>(initialFormState);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateField = (field: keyof CareerFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setResume(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    if (file) setResume(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('idle');

    try {
      // TODO: wire this up to the actual careers/apply API endpoint
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (resume) payload.append('resume', resume);

      // await api call here, e.g. await submitCareerApplication(payload);

      setStatus('success');
      setForm(initialFormState);
      setResume(null);
    } catch (error) {
      console.error('Failed to submit application', error);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col">
      {/* Hero banner */}
      <div
        className="relative flex h-[420px] items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${resolveAssetUrl('/legacy-uploads/career-hero.jpg') || ''})` }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <h1 className="relative z-10 text-center text-4xl font-bold text-white md:text-5xl">Work With Us!</h1>
      </div>

      {/* Form section */}
      <div className="bg-neutral-50 px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 md:flex-row md:items-start">
          <div className="flex-1 md:basis-3/5">
            <p className="mb-6 text-base font-semibold text-neutral-800">
              Want to work with us? Please feel free and contact us.
            </p>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-5 sm:flex-row">
                <label className={labelClasses}>
                  First Name <span className="text-red-600">*</span>
                  <input type="text" className={inputClasses} value={form.firstName} onChange={updateField('firstName')} required />
                </label>
                <label className={labelClasses}>
                  Last Name <span className="text-red-600">*</span>
                  <input type="text" className={inputClasses} value={form.lastName} onChange={updateField('lastName')} required />
                </label>
              </div>

              <label className={labelClasses}>
                Email Address <span className="text-red-600">*</span>
                <input type="email" className={inputClasses} value={form.email} onChange={updateField('email')} required />
              </label>

              <label className={labelClasses}>
                Contact No
                <input type="tel" className={inputClasses} value={form.contactNo} onChange={updateField('contactNo')} />
              </label>

              <div className="flex flex-col gap-5 sm:flex-row">
                <label className={labelClasses}>
                  City
                  <input type="text" placeholder="E.g. Sydney" className={inputClasses} value={form.city} onChange={updateField('city')} />
                </label>
                <label className={labelClasses}>
                  State/Province
                  <input
                    type="text"
                    placeholder="E.g. New South Wales"
                    className={inputClasses}
                    value={form.state}
                    onChange={updateField('state')}
                  />
                </label>
              </div>

              <label className={labelClasses}>
                ZIP / Postal Code
                <input type="text" placeholder="E.g. 2000" className={inputClasses} value={form.zip} onChange={updateField('zip')} />
              </label>

              <label className={labelClasses}>
                Highest Qualification
                <select className={inputClasses} value={form.qualification} onChange={updateField('qualification')}>
                  {qualificationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
                <span>Upload Resume</span>
                <div
                  className="rounded-md border-2 border-dashed border-neutral-300 bg-neutral-100 px-4 py-8 text-center font-normal text-neutral-600"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <span className="mb-2 block text-2xl" aria-hidden="true">⇪</span>
                  <p>
                    Drag and Drop (or){' '}
                    <label className="cursor-pointer text-blue-600 underline">
                      Choose Files
                      <input type="file" onChange={handleFileChange} hidden />
                    </label>
                  </p>
                  {resume ? <p className="mt-2 text-xs text-neutral-800">{resume.name}</p> : null}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="self-start rounded-sm bg-lime-500 px-8 py-3.5 font-bold tracking-wide text-white transition-colors hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Apply Now'}
              </button>

              {status === 'success' ? <p className="text-sm text-green-700">Application submitted successfully.</p> : null}
              {status === 'error' ? <p className="text-sm text-red-600">Something went wrong. Please try again.</p> : null}
            </form>
          </div>

          <div className="self-stretch md:basis-2/5">
            <img
              src="/images/pexels-karolina-grabowska-5632382-1024x1536.webp"
              alt="Working with a laptop"
              className="h-full min-h-[280px] w-full rounded-sm object-cover"
            />
          </div>
        </div>
      </div>

      {/* Contact section */}
      <div className="relative overflow-hidden bg-white py-20">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1920 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="#F5F3EC"
            d="M0,60 C420,220 620,-40 980,90 C1340,220 1560,40 1920,140 L1920,500 L0,500 Z"
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6 sm:flex-row sm:justify-between sm:px-16 lg:px-24">
          <h2 className="font-serif text-4xl font-bold text-neutral-900">Contact Us</h2>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="mailto:info@fuddins.com"
              className="rounded-sm bg-lime-500 px-7 py-3.5 text-sm font-bold tracking-wide text-white transition-colors hover:bg-lime-600"
            >
              E-MAIL US
            </a>
            <a
              href="/contact"
              className="rounded-sm bg-lime-500 px-7 py-3.5 text-sm font-bold tracking-wide text-white transition-colors hover:bg-lime-600"
            >
              MESSAGE US
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerPage;