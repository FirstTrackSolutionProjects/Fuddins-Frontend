import { useEffect, useState } from 'react';
import { API_ORIGIN } from '../config';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  createdAt?: string;
}

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ContactInbox = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState('');

  const loadMessages = async () => {
    const response = await fetch(`${API_ORIGIN}/contact`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Unable to load messages');
    setMessages(await response.json());
  };

  useEffect(() => {
    loadMessages().catch((error) => setStatus(error.message));
  }, []);

  const updateStatus = async (id: number, nextStatus: string) => {
    const response = await fetch(`${API_ORIGIN}/contact/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!response.ok) {
      setStatus('Unable to update message');
      return;
    }
    await loadMessages();
  };

  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-4.5">
      <h3 className="mt-0 text-[#164e28]">Contact Messages</h3>
      <div className="grid gap-2.5">
        {messages.length === 0 ? <p className="text-neutral-500">No contact messages yet.</p> : null}
        {messages.slice(0, 12).map((message) => (
          <div key={message.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
            <strong className="block">{message.subject || 'Website enquiry'}</strong>
            <span className="block">
              {message.name} - {message.email}
            </span>
            {message.phone ? <span className="block">{message.phone}</span> : null}
            <p>{message.message}</p>
            <select
              value={message.status}
              onChange={(event) => updateStatus(message.id, event.target.value)}
              className="min-h-[42px] rounded border border-neutral-300 px-2.5"
            >
              <option value="new">New</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        ))}
      </div>
      {status ? <p className="text-lime-700">{status}</p> : null}
    </div>
  );
};

export default ContactInbox;