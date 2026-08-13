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
    <section className="panel">
      <h3>Wallet, Rewards, Vendors & Invoices</h3>
      {message ? <p className="muted">{message}</p> : null}

      <div className="form-grid">
        <input value={walletUserId} onChange={(event) => setWalletUserId(event.target.value)} placeholder="Wallet user ID" />
        <input value={walletAmount} onChange={(event) => setWalletAmount(event.target.value)} placeholder="Amount (+/-)" type="number" />
        <button type="button" onClick={() => handleWallet().catch((error) => setMessage(error.message))}>
          Adjust wallet
        </button>
      </div>

      <div className="form-grid">
        <input value={rewardUserId} onChange={(event) => setRewardUserId(event.target.value)} placeholder="Reward user ID" />
        <input value={rewardPoints} onChange={(event) => setRewardPoints(event.target.value)} placeholder="Points (+/-)" type="number" />
        <button type="button" onClick={() => handleReward().catch((error) => setMessage(error.message))}>
          Adjust rewards
        </button>
      </div>

      <div className="form-grid">
        <input value={vendorName} onChange={(event) => setVendorName(event.target.value)} placeholder="New vendor store name" />
        <button type="button" onClick={() => handleVendor().catch((error) => setMessage(error.message))}>
          Add vendor
        </button>
      </div>

      <div className="form-grid">
        <select value={settlementVendorId} onChange={(event) => setSettlementVendorId(event.target.value)}>
          <option value="">Select vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.storeName}
            </option>
          ))}
        </select>
        <input value={settlementAmount} onChange={(event) => setSettlementAmount(event.target.value)} placeholder="Settlement amount" type="number" />
        <button type="button" onClick={() => handleSettlement().catch((error) => setMessage(error.message))}>
          Add settlement
        </button>
      </div>

      <div className="summary-grid">
        <div>
          <strong>{wallets.length}</strong>
          <span>Wallet entries</span>
        </div>
        <div>
          <strong>{rewards.length}</strong>
          <span>Reward entries</span>
        </div>
        <div>
          <strong>{vendors.length}</strong>
          <span>Vendors</span>
        </div>
        <div>
          <strong>{settlements.length}</strong>
          <span>Settlements</span>
        </div>
      </div>

      <div className="stacked-list">
        {settlements.slice(0, 8).map((settlement) => (
          <article key={settlement.id} className="mini-card">
            <strong>{settlement.vendor?.storeName || `Vendor #${settlement.legacyVendorId || settlement.vendorId}`}</strong>
            <span>
              Rs. {Number(settlement.netAmount).toFixed(2)} · {settlement.status}
            </span>
            {settlement.order?.id ? (
              <a href={invoicePdfUrl(settlement.order.id)} target="_blank" rel="noreferrer">
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
