// @ts-nocheck
import { useEffect, useState } from 'react';
import { Inbox, Mail, Phone } from 'lucide-react';
import { API_ORIGIN } from '../../config';

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

const statusStyles: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-lime-50 text-lime-700 border-lime-200',
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-100 text-lime-700">
            <Inbox size={18} strokeWidth={2} />
          </span>
          <h3 className="text-xl font-bold text-neutral-900">Contact messages</h3>
        </div>
        <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-semibold text-lime-800">{messages.length}</span>
      </div>

      <div className="mt-5 grid gap-3">
        {messages.length === 0 ? (
          <p className="text-sm text-neutral-400">No contact messages yet.</p>
        ) : null}

        {messages.slice(0, 12).map((message) => {
          const badgeStyle = statusStyles[message.status] || statusStyles.new;
          return (
            <div key={message.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <strong className="text-base text-neutral-900">{message.subject || 'Website enquiry'}</strong>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${badgeStyle}`}>
                  {message.status}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                <span className="font-medium text-neutral-700">{message.name}</span>
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {message.email}
                </span>
                {message.phone ? (
                  <span className="flex items-center gap-1">
                    <Phone size={12} />
                    {message.phone}
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-sm text-neutral-600">{message.message}</p>

              <select
                value={message.status}
                onChange={(event) => updateStatus(message.id, event.target.value)}
                className="mt-3 min-h-[42px] rounded-lg border border-neutral-200 bg-white px-2.5 text-sm text-neutral-900 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              >
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          );
        })}
      </div>

      {status ? <p className="mt-4 text-sm font-semibold text-red-600">{status}</p> : null}
    </div>
  );
};

export default ContactInbox;
