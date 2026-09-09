import { useState } from 'react';
import { API_ORIGIN } from '../config';

const inputClasses = 'rounded border border-neutral-300 p-3 text-neutral-900';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(`${API_ORIGIN}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, subject, message }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(result.error || 'Unable to send message');
      return;
    }
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    setStatus('Message sent successfully');
  };

  return (
    <form className="grid gap-3 rounded-lg border border-neutral-100 p-4.5" onSubmit={handleSubmit}>
      <h3 className="m-0 mb-1 text-[#164e28]">Contact Us</h3>
      <input className={inputClasses} placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
      <input className={inputClasses} placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <input className={inputClasses} placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
      <input className={inputClasses} placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
      <textarea className={inputClasses} placeholder="Message" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
      <button type="submit" className="min-h-[44px] rounded bg-lime-600 font-bold text-white">
        Send Message
      </button>
      {status ? <p className="m-0 text-lime-700">{status}</p> : null}
    </form>
  );
};

export default ContactForm;