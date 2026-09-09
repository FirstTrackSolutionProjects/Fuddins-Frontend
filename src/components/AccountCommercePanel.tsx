import { useEffect, useState } from 'react';
import { API_ORIGIN } from '../config';
import type { RewardTransaction, User, WalletTransaction } from '../types';

interface AccountCommercePanelProps {
  user: User | null;
}

const AccountCommercePanel = ({ user }: AccountCommercePanelProps) => {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [rewardBalance, setRewardBalance] = useState<number | null>(null);
  const [wallets, setWallets] = useState<WalletTransaction[]>([]);
  const [rewards, setRewards] = useState<RewardTransaction[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setWalletBalance(null);
        setRewardBalance(null);
        setWallets([]);
        setRewards([]);
        return;
      }
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [walletResponse, rewardResponse] = await Promise.all([
        fetch(`${API_ORIGIN}/commerce/wallet/users/${user.id}`, { headers }),
        fetch(`${API_ORIGIN}/commerce/rewards/users/${user.id}`, { headers }),
      ]);
      if (walletResponse.ok) {
        const data = await walletResponse.json();
        setWalletBalance(data.balance);
        setWallets(data.transactions || []);
      }
      if (rewardResponse.ok) {
        const data = await rewardResponse.json();
        setRewardBalance(data.balance);
        setRewards(data.transactions || []);
      }
    };

    load().catch(() => undefined);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3.5">
        <span className="block text-neutral-500">Wallet Balance</span>
        <strong className="my-1.5 block text-[22px] text-[#164e28]">Rs. {walletBalance ?? 0}</strong>
        <small className="block text-neutral-500">{wallets.length} entries</small>
      </div>
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3.5">
        <span className="block text-neutral-500">Reward Points</span>
        <strong className="my-1.5 block text-[22px] text-[#164e28]">{rewardBalance ?? 0}</strong>
        <small className="block text-neutral-500">{rewards.length} entries</small>
      </div>
    </div>
  );
};

export default AccountCommercePanel;