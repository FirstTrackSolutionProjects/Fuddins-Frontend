// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_ORIGIN } from '../../config';

const countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
const indianStatesAndUTs = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'];

/* ---------- UI-only helpers ---------- */

const labelClass = 'mb-1.5 block text-sm font-semibold text-neutral-700';
const fieldClass =
  'box-border w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base text-neutral-900 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';
const fileClass =
  'box-border w-full cursor-pointer rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-2.5 text-sm text-neutral-600 transition hover:border-lime-500 hover:bg-lime-50/50 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-lime-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-lime-800 hover:file:bg-lime-200';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-7 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
const outlineBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border-2 border-lime-500 bg-white px-7 py-3 text-[15px] font-bold text-lime-700 no-underline transition hover:bg-lime-50 active:scale-[0.98]';

const Ico = ({ d, className = 'h-5 w-5', stroke = 2.25 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);
const CHECK = 'M20 6 9 17l-5-5';
const BACK = 'm11 17-5-5 5-5 M18 17l-5-5 5-5';
const ALERT = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01';

const Stepper = ({ steps, current }) => (
  <ol className="m-0 mb-8 grid list-none grid-cols-4 p-0" aria-label="Progress">
    {steps.map((label, index) => {
      const done = index < current;
      const active = index === current;
      return (
        <li key={label} className="relative flex flex-col items-center text-center">
          {index > 0 ? (
            <span className={`absolute left-[-50%] top-4 h-0.5 w-full -translate-y-1/2 ${index <= current ? 'bg-lime-500' : 'bg-neutral-200'}`} />
          ) : null}
          <span
            className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition ${
              done
                ? 'bg-lime-500 text-white'
                : active
                  ? 'border-2 border-lime-500 bg-white text-lime-700 ring-4 ring-lime-500/20'
                  : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            {done ? <Ico d={CHECK} className="h-4 w-4" stroke={3} /> : index + 1}
          </span>
          <span className={`mt-2 text-[11px] font-semibold sm:text-sm ${active ? 'text-neutral-900' : done ? 'text-lime-700' : 'text-neutral-400'}`}>
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

const Shell = ({ children, wide = false }) => (
  <section className="-mx-[22px] -mb-[56px] -mt-[28px] min-h-[70vh] overflow-x-hidden bg-gradient-to-b from-lime-50 via-white to-white px-4 py-10 sm:px-6 sm:py-14">
    <div className={`mx-auto w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'}`}>{children}</div>
  </section>
);

const Card = ({ children, className = '' }) => (
  <div className={`rounded-3xl bg-white p-6 shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-100 sm:p-10 ${className}`}>{children}</div>
);

const isErrorText = (text) => /unable|fail|must match|not created|error|invalid/i.test(text);

const StatusBox = ({ text }) =>
  text ? (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
        isErrorText(text) ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-lime-50 text-lime-800 ring-1 ring-lime-200'
      }`}
    >
      <Ico d={isErrorText(text) ? ALERT : CHECK} className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  ) : null;

const Section = ({ title, hint, children }) => (
  <fieldset className="m-0 min-w-0 border-0 p-0">
    <legend className="mb-4 flex w-full items-center gap-3 p-0">
      <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-600" />
      <span className="font-serif text-xl font-bold text-neutral-900">{title}</span>
      {hint ? <span className="text-xs font-medium text-neutral-400">{hint}</span> : null}
    </legend>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

const Field = ({ label, name, required = false, type = 'text', autoComplete, full = false, children }) => (
  <label className={`block ${full ? 'sm:col-span-2' : ''}`}>
    <span className={labelClass}>
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
    {children || <input required={required} name={name} type={type} autoComplete={autoComplete} className={fieldClass} />}
  </label>
);

const FileField = ({ label, name, required = false }) => (
  <label className="block">
    <span className={labelClass}>
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
    <input required={required} name={name} type="file" className={fileClass} />
  </label>
);

const PartnerRegistrationPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const onboardingToken = params.get('token');
  const hasOnboardingToken = Boolean(onboardingToken && onboardingToken !== 'undefined' && onboardingToken !== 'null');
  const plan = params.get('plan') || 'Free Plan';

  const paymentRequest = async () => {
    if (!hasOnboardingToken) return;
    setPaymentLoading(true); setStatus('');
    try {
      const response = await fetch(`${API_ORIGIN}/commerce/vendors/membership/payment-link`, { method: 'POST', headers: { 'x-vendor-onboarding-token': onboardingToken } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to start secure payment');
      if (result.paymentStatus === 'paid') { setPaymentComplete(true); return; }
      setPaymentUrl(result.paymentUrl);
      if (result.paymentUrl) window.open(result.paymentUrl, '_blank', 'noopener,noreferrer');
      else setStatus(result.message || 'Payment link is being prepared.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to start payment'); }
    finally { setPaymentLoading(false); }
  };

  useEffect(() => {
    if (!hasOnboardingToken || paymentComplete) return;
    const check = async () => {
      const response = await fetch(`${API_ORIGIN}/commerce/vendors/membership/status`, { headers: { 'x-vendor-onboarding-token': onboardingToken } });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.paymentStatus === 'paid' && result.membershipStatus === 'active') setPaymentComplete(true);
    };
    void check();
    const timer = window.setInterval(() => void check(), 5000);
    return () => window.clearInterval(timer);
  }, [onboardingToken, hasOnboardingToken, paymentComplete]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get('password') !== data.get('confirmPassword')) return setStatus('Password and Confirm Password must match.');
    data.set('plan', params.get('plan') || 'Free Plan');
    data.set('phone', String(data.get('storePhone') || ''));
    data.set('address', `${data.get('address1')}${data.get('address2') ? `, ${data.get('address2')}` : ''}, ${data.get('city')}, ${data.get('state')} - ${data.get('postcode')}`);
    const response = await fetch(`${API_ORIGIN}/commerce/vendors/register`, {
      method: 'POST',
      body: data,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setStatus(result.error || 'Unable to submit registration. Please try again.');
    if (!result.onboardingToken) return setStatus('Registration was saved, but the secure payment session was not created. Restart the backend and submit the form again.');
    navigate(`/vendor-membership?plan=${encodeURIComponent(plan)}&token=${encodeURIComponent(result.onboardingToken)}`, { replace: true });
  };

  /* ----- Payment session unavailable ----- */
  if (onboardingToken && !hasOnboardingToken)
    return (
      <Shell>
        <Card className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/60">
            <Ico d={ALERT} className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-3xl font-bold text-neutral-900">Payment session unavailable</h1>
          <p className="mx-auto mt-3 max-w-md text-neutral-600">
            This registration was created before the secure payment session was available. Please restart the backend, then register again with a new email address.
          </p>
          <Link to="/partner/vendor-register" className={`${primaryBtn} mt-7 no-underline`}>
            Start new registration
          </Link>
        </Card>
      </Shell>
    );

  /* ----- Subscription successful ----- */
  if (hasOnboardingToken && paymentComplete)
    return (
      <Shell>
        <Card className="text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-xl shadow-lime-500/40 ring-8 ring-lime-100">
            <Ico d={CHECK} className="h-12 w-12" stroke={3} />
          </div>
          <h1 className="mt-7 font-serif text-3xl font-bold text-[#273449] sm:text-4xl">Subscription successful!</h1>
          <p className="mt-3 text-lg text-neutral-600">Your {plan} subscription is active. Welcome to Fuddins.</p>
          <button type="button" onClick={() => navigate('/partner/welcome')} className={`${primaryBtn} mt-8`}>
            Continue to store setup
          </button>
        </Card>
      </Shell>
    );

  /* ----- Secure payment ----- */
  if (hasOnboardingToken)
    return (
      <Shell>
        <Card>
          <Stepper steps={['Plans', 'Registration', 'Payment', 'Welcome']} current={2} />
          <h1 className="m-0 font-serif text-3xl font-bold text-[#273449] sm:text-4xl">Complete secure payment</h1>
          <p className="mt-3 text-neutral-600">
            Selected plan: <span className="rounded-full bg-lime-100 px-3 py-0.5 font-bold text-lime-800">{plan}</span>
          </p>
          <p className="mt-3 text-neutral-600">
            You will be redirected to Razorpay. Your subscription activates automatically only after Razorpay confirms payment.
          </p>
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-lime-50 to-white p-5 ring-1 ring-lime-200">
            <p className="m-0 font-bold text-lime-900">Payment method: Razorpay secure checkout</p>
            <p className="mb-0 mt-1.5 text-sm text-lime-800">Cards, UPI, net banking and supported wallets are available on Razorpay.</p>
          </div>
          {status ? <div className="mt-5"><StatusBox text={status} /></div> : null}
          <button
            type="button"
            disabled={paymentLoading}
            onClick={paymentUrl ? () => window.open(paymentUrl, '_blank', 'noopener,noreferrer') : paymentRequest}
            className={`${primaryBtn} mt-7 w-full py-4`}
          >
            {paymentLoading ? 'Preparing secure payment...' : paymentUrl ? 'Open Razorpay payment' : 'Proceed to Razorpay'}
          </button>
          <p className="mt-4 text-center text-sm text-neutral-500">
            After payment, keep this page open. We check the verified payment status automatically.
          </p>
        </Card>
      </Shell>
    );

  /* ----- Registration form ----- */
  return (
    <Shell wide>
      <form onSubmit={submit}>
        <Card>
          <Stepper steps={['Plans', 'Registration', 'Confirmation', 'Thank You']} current={1} />

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="m-0 font-serif text-3xl font-bold text-neutral-900 sm:text-4xl">Register your store</h1>
              <p className="mb-0 mt-1 text-sm text-neutral-500">Fields marked * are required.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-50 px-4 py-2 text-sm text-lime-800 ring-1 ring-lime-200">
              <Ico d={CHECK} className="h-4 w-4" stroke={3} />
              Selected plan: <strong>{plan}</strong>
            </span>
          </div>

          <div className="grid gap-9">
            <Section title="Store details">
              <Field label="Store Name" name="storeName" required />
              <Field label="Store Phone" name="storePhone" type="tel" autoComplete="tel" required />
              <Field label="GST NO" name="gst" />
              <Field label="FSSAI LICENCE" name="fssai" />
            </Section>

            <Section title="Contact person">
              <Field label="Email" name="email" type="email" autoComplete="email" required />
              <Field label="Executors Name" name="executiveName" required />
              <Field label="First Name" name="firstName" />
              <Field label="Last Name" name="lastName" />
              <Field label="Mobile number" name="mobile" type="tel" autoComplete="tel" required />
            </Section>

            <Section title="Store address">
              <Field label="Address 1" name="address1" required full />
              <Field label="Address 2" name="address2" full />
              <Field label="Country" required>
                <select required name="country" defaultValue="India" className={fieldClass}>
                  {countries.map((country) => (
                    <option key={country}>{country}</option>
                  ))}
                </select>
              </Field>
              <Field label="State/County" required>
                <select required name="state" defaultValue="" className={fieldClass}>
                  <option value="" disabled>
                    Select an option...
                  </option>
                  {indianStatesAndUTs.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </Field>
              <Field label="City/Town" name="city" />
              <Field label="Postcode/Zip" name="postcode" required />
            </Section>

            <Section title="Documents">
              <FileField label="GST CERTIFICATE" name="gstCertificate" />
              <FileField label="FSSAI CERTIFICATE" name="fssaiCertificate" />
              <FileField label="Bank Passbook" name="bankPassbook" required />
              <FileField label="Any other licence" name="otherLicence" />
            </Section>

            <Section title="Create password">
              <Field label="Password" name="password" type="password" autoComplete="new-password" required />
              <Field label="Confirm Password" name="confirmPassword" type="password" autoComplete="new-password" required />
            </Section>
          </div>

          {status ? <div className="mt-7"><StatusBox text={status} /></div> : null}

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-7 sm:flex-row sm:justify-end">
            <Link to="/partner/vendor-register" className={outlineBtn}>
              <Ico d={BACK} className="h-4 w-4" /> Plans
            </Link>
            <button type="submit" className={primaryBtn}>
              Register
            </button>
          </div>
        </Card>
      </form>
    </Shell>
  );
};

export default PartnerRegistrationPage;