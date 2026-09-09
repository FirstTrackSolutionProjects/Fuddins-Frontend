import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_ORIGIN } from '../config';

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
  const [status, setStatus] = useState('');
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get('password') !== data.get('confirmPassword')) return setStatus('Password and Confirm Password must match.');
    const response = await fetch(`${API_ORIGIN}/commerce/vendors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeName: data.get('storeName'),
        email: data.get('email'),
        phone: data.get('storePhone'),
        address: `${data.get('address1')}, ${data.get('city')}, ${data.get('state')} - ${data.get('postcode')}`,
        profile: `Plan: ${params.get('plan') || 'Free Plan'}; GST: ${data.get('gst')}; FSSAI: ${data.get('fssai')}`,
      }),
    });
    setStatus(response.ok ? 'Registration submitted successfully.' : 'Unable to submit registration. Please try again.');
  };

  const input = (label: string, name: string, required = false, type = 'text') => (
    <label className={labelClass}>
      {label}
      {required ? ' *' : ''}
      <input required={required} name={name} type={type} className={fieldClass} />
    </label>
  );

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
          Selected plan: <strong>{params.get('plan') || 'Free Plan'}</strong>
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
          <Link to="/partner/membership-plans" className={stepBtnClass}>
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