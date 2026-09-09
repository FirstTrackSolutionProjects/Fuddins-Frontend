import { useEffect, useState } from 'react';
import {
  createRewardTransaction,
  createVendor,
  createVendorSettlement,
  createWalletTransaction,
  fetchRewardTransactions,
  fetchVendorSettlements,
  fetchVendors,
  fetchWalletTransactions,
  invoicePdfUrl,
} from '../api';
import type { RewardTransaction, Vendor, VendorSettlement, WalletTransaction } from '../types';

const inputClasses = 'min-h-[42px] rounded border border-neutral-300 px-2.5';
const formGridClasses = 'mb-3 grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]';
const actionButtonClasses = 'min-h-[42px] rounded bg-lime-600 px-7 font-bold text-white';

const AdvancedCommerceManager = () => {
  const [wallets, setWallets] = useState<WalletTransaction[]>([]);
  const [rewards, setRewards] = useState<RewardTransaction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [settlements, setSettlements] = useState<VendorSettlement[]>([]);
  const [walletUserId, setWalletUserId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [rewardUserId, setRewardUserId] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [settlementVendorId, setSettlementVendorId] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [walletData, rewardData, vendorData, settlementData] = await Promise.all([
      fetchWalletTransactions(),
      fetchRewardTransactions(),
      fetchVendors(),
      fetchVendorSettlements(),
    ]);
    setWallets(walletData);
    setRewards(rewardData);
    setVendors(vendorData);
    setSettlements(settlementData);
  };

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load commerce modules'));
  }, []);

  const handleWallet = async () => {
    await createWalletTransaction({ userId: Number(walletUserId), amount: Number(walletAmount), description: 'Admin wallet adjustment' });
    setWalletUserId('');
    setWalletAmount('');
    await load();
  };

  const handleReward = async () => {
    await createRewardTransaction({ userId: Number(rewardUserId), points: Number(rewardPoints), description: 'Admin reward adjustment' });
    setRewardUserId('');
    setRewardPoints('');
    await load();
  };

  const handleVendor = async () => {
    await createVendor({ storeName: vendorName });
    setVendorName('');
    await load();
  };

  const handleSettlement = async () => {
    await createVendorSettlement({ vendorId: Number(settlementVendorId), netAmount: Number(settlementAmount), status: 'pending' });
    setSettlementVendorId('');
    setSettlementAmount('');
    await load();
  };

  return (
    <section className="rounded-lg border border-neutral-100 bg-white p-4.5">
      <h3 className="mt-0 text-[#164e28]">Wallet, Rewards, Vendors &amp; Invoices</h3>
      {message ? <p className="text-neutral-500">{message}</p> : null}

      <div className={formGridClasses}>
        <input value={walletUserId} onChange={(event) => setWalletUserId(event.target.value)} placeholder="Wallet user ID" className={inputClasses} />
        <input value={walletAmount} onChange={(event) => setWalletAmount(event.target.value)} placeholder="Amount (+/-)" type="number" className={inputClasses} />
        <button type="button" onClick={() => handleWallet().catch((error) => setMessage(error.message))} className={actionButtonClasses}>
          Adjust wallet
        </button>
      </div>

      <div className={formGridClasses}>
        <input value={rewardUserId} onChange={(event) => setRewardUserId(event.target.value)} placeholder="Reward user ID" className={inputClasses} />
        <input value={rewardPoints} onChange={(event) => setRewardPoints(event.target.value)} placeholder="Points (+/-)" type="number" className={inputClasses} />
        <button type="button" onClick={() => handleReward().catch((error) => setMessage(error.message))} className={actionButtonClasses}>
          Adjust rewards
        </button>
      </div>

      <div className={formGridClasses}>
        <input value={vendorName} onChange={(event) => setVendorName(event.target.value)} placeholder="New vendor store name" className={inputClasses} />
        <button type="button" onClick={() => handleVendor().catch((error) => setMessage(error.message))} className={actionButtonClasses}>
          Add vendor
        </button>
      </div>

      <div className={formGridClasses}>
        <select value={settlementVendorId} onChange={(event) => setSettlementVendorId(event.target.value)} className={inputClasses}>
          <option value="">Select vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.storeName}
            </option>
          ))}
        </select>
        <input value={settlementAmount} onChange={(event) => setSettlementAmount(event.target.value)} placeholder="Settlement amount" type="number" className={inputClasses} />
        <button type="button" onClick={() => handleSettlement().catch((error) => setMessage(error.message))} className={actionButtonClasses}>
          Add settlement
        </button>
      </div>

      <div className="my-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
          <strong className="block text-xl text-[#164e28]">{wallets.length}</strong>
          <span className="block">Wallet entries</span>
        </div>
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
          <strong className="block text-xl text-[#164e28]">{rewards.length}</strong>
          <span className="block">Reward entries</span>
        </div>
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
          <strong className="block text-xl text-[#164e28]">{vendors.length}</strong>
          <span className="block">Vendors</span>
        </div>
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
          <strong className="block text-xl text-[#164e28]">{settlements.length}</strong>
          <span className="block">Settlements</span>
        </div>
      </div>

      <div className="grid gap-2.5">
        {settlements.slice(0, 8).map((settlement) => (
          <article key={settlement.id} className="rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
            <strong className="block">{settlement.vendor?.storeName || `Vendor #${settlement.legacyVendorId || settlement.vendorId}`}</strong>
            <span className="block">
              Rs. {Number(settlement.netAmount).toFixed(2)} · {settlement.status}
            </span>
            {settlement.order?.id ? (
              <a href={invoicePdfUrl(settlement.order.id)} target="_blank" rel="noreferrer" className="mt-1.5 block text-blue-600">
                Invoice PDF
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdvancedCommerceManager;