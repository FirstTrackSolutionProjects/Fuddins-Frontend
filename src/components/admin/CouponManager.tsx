import { useEffect, useState } from 'react';
import { Ticket, Trash2 } from 'lucide-react';
import { createCoupon, deleteCoupon, fetchCoupons } from '../../api';
import type { Coupon } from '../../types';

const CouponManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('fixed_cart');
  const [amount, setAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const loadCoupons = async () => {
    setCoupons(await fetchCoupons());
  };

  useEffect(() => {
    loadCoupons().catch(() => {
      setMessage('Unable to load coupons');
      setMessageType('error');
    });
  }, []);

  const handleCreate = async () => {
    try {
      await createCoupon({ code, discountType, amount: Number(amount), usageLimit: usageLimit ? Number(usageLimit) : null });
      setCode('');
      setAmount('');
      setUsageLimit('');
      setMessage('Coupon saved');
      setMessageType('success');
      await loadCoupons();
    } catch {
      setMessage('Unable to save coupon');
      setMessageType('error');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-lime-100 text-lime-700">
          <Ticket size={18} strokeWidth={2} />
        </span>
        <h3 className="text-xl font-bold text-neutral-900">Coupons</h3>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          placeholder="Code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <select
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          value={discountType}
          onChange={(event) => setDiscountType(event.target.value)}
        >
          <option value="fixed_cart">Fixed cart</option>
          <option value="percent">Percent</option>
        </select>
        <input
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <input
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
          placeholder="Usage limit"
          type="number"
          value={usageLimit}
          onChange={(event) => setUsageLimit(event.target.value)}
        />
      </div>

      <button
        className="mt-3 w-full rounded-lg bg-lime-600 px-4 py-2 font-semibold text-white transition hover:bg-lime-700"
        type="button"
        onClick={handleCreate}
      >
        Create coupon
      </button>

      <div className="mt-5 space-y-2">
        {coupons.length === 0 ? (
          <p className="text-sm text-neutral-400">No coupons yet.</p>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-lime-100 px-2 py-1 text-xs font-bold text-lime-800">{coupon.code}</span>
                <span className="text-sm text-neutral-500 capitalize">{coupon.discountType.replace('_', ' ')}</span>
                <span className="text-sm font-semibold text-neutral-700">{coupon.amount}</span>
              </div>
              <button
                className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                type="button"
                onClick={async () => {
                  await deleteCoupon(coupon.id);
                  await loadCoupons();
                }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {message ? (
        <p className={`mt-4 text-sm font-semibold ${messageType === 'success' ? 'text-lime-700' : 'text-red-600'}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
};

export default CouponManager;