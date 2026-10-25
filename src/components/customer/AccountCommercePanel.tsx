// @ts-nocheck
import { useEffect, useState } from 'react';
import { API_ORIGIN } from '../../config';
import type { RewardTransaction, User, WalletTransaction } from '../../types';

interface AccountCommercePanelProps {
  user: User | null;
}

/* ---------- UI-only helpers ---------- */

const Ico = ({ d, className = 'h-6 w-6', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON = {
  wallet: 'M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a2 2 0 0 0 0 4h4v-4z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  receipt: 'M4 2v20l3-2 3 2 3-2 3 2 3-2V2l-3 2-3-2-3 2-3-2z M8 8h8 M8 12h8',
};

const StatCard = ({
  icon,
  label,
  value,
  entries,
}: {
  icon: keyof typeof ICON;
  label: string;
  value: string;
  entries: number;
}) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-700/10 hover:ring-lime-200 sm:p-6">
    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime-100/70 transition duration-300 group-hover:scale-125" />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-500">{label}</span>
        <strong className="mt-2 block break-words text-3xl font-extrabold leading-none text-neutral-900 sm:text-4xl">{value}</strong>
      </div>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lime-400 to-lime-600 text-white shadow-lg shadow-lime-500/30">
        <Ico d={ICON[icon]} />
      </span>
    </div>
    <small className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-lime-50 px-3 py-1 text-xs font-bold text-lime-800 ring-1 ring-lime-100">
      <Ico d={ICON.receipt} className="h-3.5 w-3.5" />
      {entries} {entries === 1 ? 'entry' : 'entries'}
    </small>
  </div>
);

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
    <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
      <StatCard icon="wallet" label="Wallet Balance" value={`₹${walletBalance ?? 0}`} entries={wallets.length} />
      <StatCard icon="star" label="Reward Points" value={String(rewardBalance ?? 0)} entries={rewards.length} />
    </div>
  );
};

export default AccountCommercePanel;