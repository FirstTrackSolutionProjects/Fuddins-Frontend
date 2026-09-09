import { useState } from 'react';
import { API_ORIGIN } from '../config';

const VendorRegistrationForm = () => {
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profile, setProfile] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(`${API_ORIGIN}/commerce/vendors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName, email, phone, address, profile }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(result.error || 'Unable to submit vendor registration');
      return;
    }
    setStoreName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setProfile('');
    setStatus('Vendor registration submitted');
  };

  return (
    <form className="grid gap-[12px] rounded-lg border border-[#edf0f2] p-[18px]" onSubmit={handleSubmit}>
      <h3 className="mb-[4px] text-[#164e28]">Vendor Registration</h3>
      <input
        className="rounded border border-[#d1d5db] p-[12px] text-[#1f2933]"
        placeholder="Store name"
        value={storeName}
        onChange={(event) => setStoreName(event.target.value)}
      />
      <input
        className="rounded border border-[#d1d5db] p-[12px] text-[#1f2933]"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="rounded border border-[#d1d5db] p-[12px] text-[#1f2933]"
        placeholder="Phone"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />
      <textarea
        className="rounded border border-[#d1d5db] p-[12px] text-[#1f2933]"
        placeholder="Address"
        rows={3}
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
      <textarea
        className="rounded border border-[#d1d5db] p-[12px] text-[#1f2933]"
        placeholder="Store details"
        rows={3}
        value={profile}
        onChange={(event) => setProfile(event.target.value)}
      />
      <button
        className="min-h-[44px] rounded border-0 bg-[#75a843] font-bold text-white cursor-pointer"
        type="submit"
      >
        Submit Registration
      </button>
      {status ? <p className="m-0 text-[#4d7c0f]">{status}</p> : null}
    </form>
  );
};

export default VendorRegistrationForm;