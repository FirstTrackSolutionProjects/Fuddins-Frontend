// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_ORIGIN } from '../../config';

const countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
const indianStatesAndUTs = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'];

const labelClass = 'grid grid-cols-[34%_1fr] items-center gap-[16px] text-[17px] italic';
const fieldClass = 'box-border w-full min-h-[44px] border border-[#d1d5db] p-[10px]';
const stepBtnClass =
  'bg-[#28a90d] border-0 text-white cursor-pointer text-[16px] py-[12px] px-[18px] no-underline uppercase';

const stepSpanBase =
  "relative w-1/4 text-center after:content-[''] after:absolute after:left-[calc(50%-5px)] after:bottom-[-23px] after:h-[10px] after:w-[10px] after:rounded-full";
const stepSpanCurrent =
  "text-[#273449] after:bg-[#273449] before:content-[''] before:absolute before:left-0 before:bottom-[-21px] before:h-[5px] before:w-1/2 before:bg-[#273449]";
const stepSpanUpcoming = 'text-[#c5c9ce] after:bg-[#d1d5db]';

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

  const input = (label: string, name: string, required = false, type = 'text') => (
    <label className={labelClass}>
      {label}
      {required ? ' *' : ''}
      <input required={required} name={name} type={type} className={fieldClass} />
    </label>
  );

  if (onboardingToken && !hasOnboardingToken) return <section className="min-h-[70vh] bg-[#f8f7f5] px-5 py-16"><div className="mx-auto max-w-xl rounded-2xl bg-white p-9 text-center shadow-xl"><h1 className="font-serif text-3xl">Payment session unavailable</h1><p className="mt-4 text-neutral-600">This registration was created before the secure payment session was available. Please restart the backend, then register again with a new email address.</p><Link to="/partner/vendor-register" className="mt-6 inline-block rounded-lg bg-lime-600 px-6 py-3 font-bold text-white no-underline">Start new registration</Link></div></section>;

  if (hasOnboardingToken && paymentComplete) return <section className="min-h-[70vh] bg-[#f8f7f5] px-5 py-16"><div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-xl"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime-100 text-5xl text-lime-700">✓</div><h1 className="mt-6 font-serif text-4xl text-[#273449]">Subscription successful!</h1><p className="mt-4 text-lg text-neutral-600">Your {plan} subscription is active. Welcome to Fuddins.</p><button type="button" onClick={() => navigate('/partner/welcome')} className="mt-7 bg-lime-600 px-7 py-4 font-bold text-white">Continue to store setup</button></div></section>;

  if (hasOnboardingToken) return <section className="min-h-[70vh] bg-[#f8f7f5] px-5 py-16"><div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl"><div className="mb-9 grid grid-cols-4 text-center text-sm font-semibold"><span className="text-lime-700">Plans</span><span className="text-lime-700">Registration</span><span className="text-lime-700">Payment</span><span className="text-neutral-400">Welcome</span></div><h1 className="font-serif text-4xl text-[#273449]">Complete secure payment</h1><p className="mt-3 text-neutral-600">Selected plan: <b>{plan}</b>. You will be redirected to Razorpay. Your subscription activates automatically only after Razorpay confirms payment.</p><div className="mt-7 rounded-xl bg-lime-50 p-5"><p className="m-0 font-semibold text-lime-900">Payment method: Razorpay secure checkout</p><p className="mb-0 mt-2 text-sm text-lime-800">Cards, UPI, net banking and supported wallets are available on Razorpay.</p></div>{status ? <p className="mt-5 text-amber-700">{status}</p> : null}<button type="button" disabled={paymentLoading} onClick={paymentUrl ? () => window.open(paymentUrl, '_blank', 'noopener,noreferrer') : paymentRequest} className="mt-7 w-full rounded-lg bg-lime-600 px-6 py-4 font-bold text-white disabled:opacity-60">{paymentLoading ? 'Preparing secure payment...' : paymentUrl ? 'Open Razorpay payment' : 'Proceed to Razorpay'}</button><p className="mt-4 text-center text-sm text-neutral-500">After payment, keep this page open. We check the verified payment status automatically.</p></div></section>;

  return (
    <section className="bg-white -mx-[22px] -mt-[28px] -mb-[56px] px-[12%] py-[48px]">
      <form
        className="bg-white shadow-[0_6px_26px_rgba(15,23,42,.1)] grid gap-[19px] mx-auto max-w-[1350px] p-[28px]"
        onSubmit={submit}
      >
        <div className="flex justify-between max-w-[1420px] mx-auto mb-[14px] border-b-[5px] border-[#d1d5db] pb-[16px]">
          <span className={`${stepSpanBase} ${stepSpanCurrent}`}>Plans</span>
          <span className={`${stepSpanBase} ${stepSpanCurrent}`}>Registration</span>
          <span className={`${stepSpanBase} ${stepSpanUpcoming}`}>Confirmation</span>
          <span className={`${stepSpanBase} ${stepSpanUpcoming}`}>Thank You</span>
        </div>
        <p className="text-[#4d9c1f] text-[17px] m-0">
          Selected plan: <strong>{plan}</strong>
        </p>

        {input('Email', 'email', true, 'email')}
        {input('First Name', 'firstName')}
        {input('Last Name', 'lastName')}
        {input('Store Name', 'storeName', true)}
        {input('Address 1', 'address1', true)}
        {input('Address 2', 'address2')}

        <label className={labelClass}>
          Country *
          <select required name="country" defaultValue="India" className={fieldClass}>
            {countries.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
        {input('City/Town', 'city')}
        <label className={labelClass}>
          State/County *
          <select required name="state" defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Select an option...
            </option>
            {indianStatesAndUTs.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </label>
        {input('Postcode/Zip', 'postcode', true)}
        {input('Store Phone', 'storePhone', true, 'tel')}
        {input('GST NO', 'gst')}
        {input('FSSAI LICENCE', 'fssai')}

        <label className={labelClass}>
          GST CERTIFICATE
          <input name="gstCertificate" type="file" className={fieldClass} />
        </label>
        <label className={labelClass}>
          FSSAI CERTIFICATE
          <input name="fssaiCertificate" type="file" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Bank Passbook *
          <input required name="bankPassbook" type="file" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Any other licence
          <input name="otherLicence" type="file" className={fieldClass} />
        </label>
        {input('Executors Name', 'executiveName', true)}
        {input('Mobile number', 'mobile', true, 'tel')}
        {input('Password', 'password', true, 'password')}
        {input('Confirm Password', 'confirmPassword', true, 'password')}

        <div className="flex gap-[12px] justify-end">
          <Link to="/partner/vendor-register" className={stepBtnClass}>
            « Plans
          </Link>
          <button type="submit" className={stepBtnClass}>
            Register
          </button>
        </div>
        {status ? <p className="text-[#4d7c0f] m-0">{status}</p> : null}
      </form>
    </section>
  );
};

export default PartnerRegistrationPage;
