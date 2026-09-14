import { useState } from 'react';
import { API_ORIGIN } from '../config';

const inputClasses = 'min-h-[50px] w-full border border-neutral-400 bg-white px-3 py-3 text-lg text-neutral-900';
const labelClasses = 'grid gap-1.5 text-sm font-bold text-neutral-500';

const OnboardingEnquiryPage = () => {
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');
    const form = new FormData(event.currentTarget);
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
      setStatus(result.message || 'Your onboarding enquiry has been submitted.');
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to submit the enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="-mx-5 -mb-14 -mt-7 min-h-[calc(100vh-130px)] bg-neutral-50 px-[max(6%,50px)] pb-[70px] pt-5">
      <form className="grid max-w-[1480px] gap-5" onSubmit={submit}>
        <label className={labelClasses}>
          Shop Name *
          <input required name="storeName" placeholder="E.g. John Doe" className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Vendor Name *
          <input required name="vendorName" placeholder="E.g. John Doe" className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Vendor Phone *
          <input required name="phone" type="tel" placeholder="E.g. +1 300 400 5000" className={inputClasses} />
        </label>
        <label className={labelClasses}>
          Category
          <select name="category" className={inputClasses}>
            <option>Ready Eatables</option>
            <option>Groceries</option>
            <option>Food Items</option>
            <option>Bakery</option>
          </select>
        </label>

        <div className="grid gap-9 sm:grid-cols-2">
          <label className={labelClasses}>
            Executors Name *
            <input required name="executiveName" placeholder="E.g. John Doe" className={inputClasses} />
          </label>
          <label className={labelClasses}>
            Executive Phone *
            <input required name="executivePhone" type="tel" placeholder="E.g. +1 300 400 5000" className={inputClasses} />
          </label>
        </div>

        <div className="grid gap-9 sm:grid-cols-3">
          <div className="grid gap-5">
            <label className={labelClasses}>
              Street Address *
              <input required name="address" placeholder="E.g. 42 Wallaby Way" className={inputClasses} />
            </label>
            <label className={labelClasses}>
              ZIP / Postal Code *
              <input required name="zip" placeholder="E.g. 2000" className={inputClasses} />
            </label>
          </div>
          <label className={labelClasses}>
            Date *
            <input required name="date" type="date" className={inputClasses} />
          </label>
          <label className={labelClasses}>
            Remarks *
            <textarea required name="remarks" rows={6} placeholder="E.g. text placeholder You can add new line" className={inputClasses} />
          </label>
        </div>

        <input name="email" type="email" required placeholder="Email address" className={inputClasses} />

        <button
          type="submit"
          disabled={submitting}
          className="justify-self-start bg-sky-500 px-5 py-3.5 font-bold uppercase text-white"
        >
          {submitting ? 'Sending...' : 'Send Message'}
        </button>

        {status ? <p className={status.includes('submitted') ? 'text-lime-700' : 'text-red-600'}>{status}</p> : null}
      </form>
    </section>
  );
};

export default OnboardingEnquiryPage;
