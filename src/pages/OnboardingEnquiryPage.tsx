import { useState, type ReactNode } from 'react';
import { API_ORIGIN } from '../config';

/* ---------- UI-only helpers ---------- */

const inputClasses =
  'box-border w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';
const labelClasses = 'mb-1.5 block text-sm font-semibold text-neutral-700';

const Ico = ({ d, className = 'h-5 w-5', stroke = 2.25 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  store: 'M3 9l1-5h16l1 5 M3 9v11h18V9 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M9 20v-6h6v6',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  send: 'M22 2 11 13 M22 2l-7 20-4-9-9-4z',
  check: 'M20 6 9 17l-5-5',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
} as const;

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
    <span className={labelClasses}>
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
    {children}
  </label>
);

const OnboardingEnquiryPage = () => {
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Keep a reference: event.currentTarget becomes null after the first await.
    const formElement = event.currentTarget;
    setSubmitting(true);
    setStatus('');
    const form = new FormData(formElement);
    try {
      const response = await fetch(`${API_ORIGIN}/onboarding-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: form.get('storeName'),
          vendorName: form.get('vendorName'),
          vendorPhone: form.get('phone'),
          category: form.get('category'),
          executiveName: form.get('executiveName'),
          executivePhone: form.get('executivePhone'),
          address: form.get('address'),
          zip: form.get('zip'),
          enquiryDate: form.get('date'),
          remarks: form.get('remarks'),
          email: form.get('email'),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to submit the enquiry. Please try again.');
      setStatusOk(true);
      setStatus(result.message || 'Your onboarding enquiry has been submitted.');
      formElement.reset();
    } catch (error) {
      setStatusOk(false);
      setStatus(error instanceof Error ? error.message : 'Unable to submit the enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="-mx-5 -mb-14 -mt-7 min-h-[calc(100vh-130px)] overflow-x-hidden bg-gradient-to-b from-lime-50 via-white to-white px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-100">
        {/* header band */}
        <div className="relative overflow-hidden bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/10" />
          <h1 className="relative m-0 font-serif text-3xl font-bold text-white sm:text-4xl">Onboarding Enquiry</h1>
          <p className="relative mb-0 mt-2 max-w-xl text-base text-lime-50/95">
            Fill in the store and executive details and we will get back to you.
          </p>
        </div>

        <form className="grid gap-9 p-6 sm:p-10" onSubmit={submit}>
          <Section icon="store" title="Store details">
            <Field label="Shop Name" required>
              <input required name="storeName" placeholder="E.g. Sharma Sweets" className={inputClasses} />
            </Field>
            <Field label="Category">
              <select name="category" className={inputClasses}>
                <option>Ready Eatables</option>
                <option>Groceries</option>
                <option>Food Items</option>
                <option>Bakery</option>
              </select>
            </Field>
            <Field label="Street Address" required>
              <input required name="address" placeholder="E.g. 42 MG Road" className={inputClasses} />
            </Field>
            <Field label="ZIP / Postal Code" required>
              <input required name="zip" placeholder="E.g. 400001" className={inputClasses} />
            </Field>
          </Section>

          <Section icon="user" title="Vendor details">
            <Field label="Vendor Name" required>
              <input required name="vendorName" placeholder="E.g. Rahul Sharma" className={inputClasses} />
            </Field>
            <Field label="Vendor Phone" required>
              <input required name="phone" type="tel" placeholder="E.g. +91 98765 43210" className={inputClasses} />
            </Field>
            <Field label="Email address" required full>
              <input name="email" type="email" required placeholder="you@example.com" className={inputClasses} />
            </Field>
          </Section>

          <Section icon="users" title="Executive details">
            <Field label="Executors Name" required>
              <input required name="executiveName" placeholder="E.g. Amit Verma" className={inputClasses} />
            </Field>
            <Field label="Executive Phone" required>
              <input required name="executivePhone" type="tel" placeholder="E.g. +91 98765 43210" className={inputClasses} />
            </Field>
            <Field label="Date" required>
              <input required name="date" type="date" className={inputClasses} />
            </Field>
          </Section>

          <Section icon="message" title="Remarks">
            <Field label="Remarks" required full>
              <textarea required name="remarks" rows={5} placeholder="Add any details about the store" className={`${inputClasses} resize-y`} />
            </Field>
          </Section>

          {status ? (
            <div
              role="status"
              className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
                statusOk ? 'bg-lime-50 text-lime-800 ring-1 ring-lime-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'
              }`}
            >
              <Ico d={statusOk ? ICON.check : ICON.alert} className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">{status}</span>
            </div>
          ) : null}

          <div className="border-t border-neutral-100 pt-7">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? 'Sending...' : 'Send Message'}
              {submitting ? null : <Ico d={ICON.send} className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default OnboardingEnquiryPage;