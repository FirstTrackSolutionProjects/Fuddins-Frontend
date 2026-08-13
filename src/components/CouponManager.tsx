import { useEffect, useState } from 'react';
import { createCoupon, deleteCoupon, fetchCoupons } from '../api';
import type { Coupon } from '../types';

const CouponManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('fixed_cart');
  const [amount, setAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [message, setMessage] = useState('');

  const loadCoupons = async () => {
    setCoupons(await fetchCoupons());
  };

  useEffect(() => {
    loadCoupons().catch(() => setMessage('Unable to load coupons'));
  }, []);

  const handleCreate = async () => {
    try {
      await createCoupon({ code, discountType, amount: Number(amount), usageLimit: usageLimit ? Number(usageLimit) : null });
      setCode('');
      setAmount('');
      setUsageLimit('');
      setMessage('Coupon saved');
      await loadCoupons();
    } catch {
      setMessage('Unable to save coupon');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold">Coupons</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Code" value={code} onChange={(event) => setCode(event.target.value)} />
        <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" value={discountType} onChange={(event) => setDiscountType(event.target.value)}>
          <option value="fixed_cart">Fixed cart</option>
          <option value="percent">Percent</option>
        </select>
        <input className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Amount" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
        <input className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Usage limit" type="number" value={usageLimit} onChange={(event) => setUsageLimit(event.target.value)} />
      </div>
      <button className="mt-3 w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950" type="button" onClick={handleCreate}>
        Create coupon
      </button>
      <div className="mt-4 space-y-2">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
            <span>{coupon.code} · {coupon.discountType} · {coupon.amount}</span>
            <button className="rounded-lg bg-rose-600 px-3 py-1 text-sm" type="button" onClick={async () => { await deleteCoupon(coupon.id); await loadCoupons(); }}>
              Delete
            </button>
          </div>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm text-cyan-400">{message}</p> : null}
    </div>
  );
};

export default CouponManager;
