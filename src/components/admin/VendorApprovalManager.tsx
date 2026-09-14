import { useEffect, useMemo, useState } from 'react';
import { Store, Check, X, Loader2 } from 'lucide-react';
import { fetchVendors, updateVendorRegistration } from '../../api';
import type { Vendor } from '../../types';

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

const VendorApprovalManager = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);

  const loadVendors = async () => {
    setLoading(true);
    try {
      setVendors(await fetchVendors());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load vendor registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadVendors(); }, []);

  const pendingVendors = useMemo(() => vendors.filter((vendor) => vendor.status === 'pending'), [vendors]);

  const takeAction = async (vendor: Vendor, action: 'approve' | 'reject') => {
    setActingId(vendor.id);
    setMessage('');
    try {
      await updateVendorRegistration(vendor.id, action);
      setMessage(`${vendor.storeName} has been ${action === 'approve' ? 'approved' : 'rejected'}.`);
      await loadVendors();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Unable to ${action} this vendor`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lime-100 text-lime-700">
            <Store size={18} strokeWidth={2} />
          </span>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-lime-700">Partner management</p>
            <h3 className="m-0 text-2xl font-bold text-neutral-900">Vendor approvals</h3>
            <p className="mb-0 mt-1 text-neutral-500">Review registration requests before activating a vendor account.</p>
          </div>
        </div>
        <div className="rounded-full bg-amber-50 px-4 py-2 font-bold text-amber-700">{pendingVendors.length} pending</div>
      </div>

      {message ? (
        <div className="mb-4 rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 font-medium text-lime-800">{message}</div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-neutral-400">
          <Loader2 size={16} className="animate-spin" />
          Loading vendor registrations…
        </div>
      ) : null}

      {!loading && !pendingVendors.length ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-12 text-center">
          <strong className="block text-lg text-neutral-800">No pending vendor approvals</strong>
          <span className="mt-1 block text-neutral-500">New vendor applications will appear here.</span>
        </div>
      ) : null}

      <div className="grid gap-4">
        {pendingVendors.map((vendor) => (
          <article
            key={vendor.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition hover:border-lime-200 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime-600 text-sm font-bold text-white">
                  {getInitials(vendor.storeName)}
                </span>
                <div>
                  <h4 className="m-0 text-xl font-bold text-neutral-900">{vendor.storeName}</h4>
                  <p className="mb-0 mt-2 text-neutral-600">
                    {vendor.email || 'Email not provided'}
                    {vendor.phone ? ` · ${vendor.phone}` : ''}
                  </p>
                  {vendor.address ? <p className="mb-0 mt-1 text-sm text-neutral-400">{vendor.address}</p> : null}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold capitalize text-amber-700">
                Pending review
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={actingId === vendor.id}
                onClick={() => void takeAction(vendor, 'approve')}
                className="flex min-h-11 items-center gap-1.5 rounded-lg bg-lime-600 px-5 font-bold text-white transition hover:bg-lime-700 disabled:opacity-60"
              >
                {actingId === vendor.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} strokeWidth={2.5} />
                )}
                {actingId === vendor.id ? 'Please wait…' : 'Approve vendor'}
              </button>
              <button
                type="button"
                disabled={actingId === vendor.id}
                onClick={() => void takeAction(vendor, 'reject')}
                className="flex min-h-11 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-5 font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
              >
                <X size={15} strokeWidth={2.5} />
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default VendorApprovalManager;