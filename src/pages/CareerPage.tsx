import { useRef, useState, type ReactNode } from 'react';
import { API_ORIGIN, resolveAssetUrl } from '../config';

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

/* ---------- UI-only helpers ---------- */

const inputClasses =
  'box-border w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';

const Ico = ({ d, className = 'h-5 w-5', stroke = 2.25 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  cap: 'M22 10 12 5 2 10l10 5 10-5z M6 12v5c3 2 9 2 12 0v-5',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  x: 'M18 6 6 18 M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Section = ({ icon, title, children }: { icon: keyof typeof ICON; title: string; children: ReactNode }) => (
  <fieldset className="m-0 min-w-0 border-0 p-0">
    <legend className="mb-4 flex w-full items-center gap-3 p-0">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-md shadow-lime-500/30">
        <Ico d={ICON[icon]} className="h-5 w-5" />
      </span>
      <span className="font-serif text-xl font-bold text-neutral-900">{title}</span>
    </legend>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

const Field = ({ label, required = false, full = false, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) => (
  <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
    <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
    {children}
  </label>
);

const CareerPage = () => {
  const [form, setForm] = useState<CareerFormState>(initialFormState);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [sideImageFailed, setSideImageFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = (field: keyof CareerFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setResume(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] || null;
    if (file) setResume(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('idle');

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (resume) payload.append('resume', resume);

      const response = await fetch(`${API_ORIGIN}/career/apply`, { method: 'POST', body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to submit application');

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

  const heroImage = resolveAssetUrl('/legacy-uploads/career-hero.jpg');

  return (
    <section className="flex flex-col overflow-x-hidden">
      {/* Hero banner */}
      <div
        className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-lime-800 bg-cover bg-center px-6 py-16 sm:min-h-[380px]"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(135deg, rgba(63,98,18,.82), rgba(26,46,5,.72)), url(${heroImage})`
            : 'linear-gradient(135deg, #65a30d, #3f6212 60%, #1a2e05)',
        }}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-white/10" />
        <div className="relative z-10 text-center">
          <h1 className="m-0 font-serif text-[clamp(34px,6vw,60px)] font-bold leading-tight text-white">Work With Us!</h1>
          <p className="mx-auto mb-0 mt-3 max-w-xl text-base text-lime-50/95 sm:text-lg">
            Want to work with us? Please feel free and contact us.
          </p>
        </div>
      </div>

      {/* Form section */}
      <div className="bg-gradient-to-b from-lime-50 via-white to-neutral-50 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
          <form
            className="grid gap-9 rounded-3xl bg-white p-6 shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-100 sm:p-10"
            onSubmit={handleSubmit}
          >
            <Section icon="user" title="Personal details">
              <Field label="First Name" required>
                <input type="text" className={inputClasses} value={form.firstName} onChange={updateField('firstName')} required />
              </Field>
              <Field label="Last Name" required>
                <input type="text" className={inputClasses} value={form.lastName} onChange={updateField('lastName')} required />
              </Field>
              <Field label="Email Address" required>
                <input type="email" className={inputClasses} value={form.email} onChange={updateField('email')} placeholder="you@example.com" required />
              </Field>
              <Field label="Contact No">
                <input type="tel" className={inputClasses} value={form.contactNo} onChange={updateField('contactNo')} placeholder="E.g. +91 98765 43210" />
              </Field>
            </Section>

            <Section icon="pin" title="Location">
              <Field label="City">
                <input type="text" placeholder="E.g. Mumbai" className={inputClasses} value={form.city} onChange={updateField('city')} />
              </Field>
              <Field label="State/Province">
                <input type="text" placeholder="E.g. Maharashtra" className={inputClasses} value={form.state} onChange={updateField('state')} />
              </Field>
              <Field label="ZIP / Postal Code" full>
                <input type="text" placeholder="E.g. 400001" className={inputClasses} value={form.zip} onChange={updateField('zip')} />
              </Field>
            </Section>

            <Section icon="cap" title="Qualification & resume">
              <Field label="Highest Qualification" full>
                <select className={inputClasses} value={form.qualification} onChange={updateField('qualification')}>
                  {qualificationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-neutral-700">Upload Resume</span>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Choose a resume file to upload"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-9 text-center outline-none transition focus-visible:ring-4 focus-visible:ring-lime-500/20 ${
                    isDragging ? 'scale-[1.01] border-lime-500 bg-lime-50' : 'border-neutral-300 bg-neutral-50 hover:border-lime-400 hover:bg-lime-50/50'
                  }`}
                >
                  {resume ? (
                    <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl bg-white p-3 text-left shadow-md ring-1 ring-lime-200">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-lime-100 text-lime-700">
                        <Ico d={ICON.file} className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-neutral-900">{resume.name}</span>
                        <span className="block text-xs text-neutral-500">{formatSize(resume.size)} · Click to change</span>
                      </span>
                      <button
                        type="button"
                        aria-label="Remove file"
                        onClick={(event) => {
                          event.stopPropagation();
                          setResume(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Ico d={ICON.x} className="h-4 w-4" stroke={2.5} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-lg shadow-lime-500/30">
                        <Ico d={ICON.upload} className="h-7 w-7" />
                      </span>
                      <p className="mb-0 mt-3 text-base font-semibold text-neutral-800">
                        Drag and Drop (or) <span className="text-lime-700 underline">Choose Files</span>
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    onClick={(event) => event.stopPropagation()}
                    hidden
                  />
                </div>
              </div>
            </Section>

            {status === 'success' ? (
              <div role="status" className="flex items-start gap-2.5 rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800 ring-1 ring-lime-200">
                <Ico d={ICON.check} className="mt-0.5 h-4 w-4 shrink-0" stroke={3} />
                <span>Application submitted successfully.</span>
              </div>
            ) : null}
            {status === 'error' ? (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                <Ico d={ICON.alert} className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Something went wrong. Please try again.</span>
              </div>
            ) : null}

            <div className="border-t border-neutral-100 pt-7">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-8 py-3.5 text-[15px] font-bold tracking-wide text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? 'Submitting...' : 'Apply Now'}
              </button>
            </div>
          </form>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-200 to-lime-400 shadow-2xl shadow-neutral-900/10 lg:sticky lg:top-6">
            {sideImageFailed ? (
              <div className="grid min-h-[320px] place-items-center p-10 text-center text-lime-900">
                <p className="m-0 font-serif text-3xl font-bold">Join the Fuddins team</p>
              </div>
            ) : (
              <img
                src="/images/pexels-karolina-grabowska-5632382-1024x1536.webp"
                alt="Working with a laptop"
                onError={() => setSideImageFailed(true)}
                className="h-full min-h-[320px] w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>

      {/* Contact section */}
      <div className="bg-neutral-50 px-4 py-14 sm:px-6 sm:py-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-10 shadow-2xl shadow-lime-700/25 sm:px-12 sm:py-12">
          <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-white/10" />
          <div className="relative flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <h2 className="m-0 font-serif text-4xl font-bold text-white">Contact Us</h2>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <a
                href="mailto:info@fuddins.com"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold tracking-wide text-lime-700 no-underline shadow-xl transition hover:-translate-y-0.5 hover:bg-lime-50 active:translate-y-0"
              >
                <Ico d={ICON.mail} className="h-4 w-4" /> E-MAIL US
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/70 bg-white/10 px-7 py-3 text-sm font-extrabold tracking-wide text-white no-underline backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0"
              >
                <Ico d={ICON.message} className="h-4 w-4" /> MESSAGE US
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerPage;