import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_ORIGIN } from '../config';

type Referral = { id: number; name: string; createdAt: string; rewarded: boolean };
type ReferralData = { referralCode: string; totalInvited: number; earnedCount: number; earnedPoints: number; referrals: Referral[] };

const card = 'rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm';

export default function ReferEarnPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')));
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem('token');
  const incomingCode = useMemo(() => new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase() || '', []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${API_ORIGIN}/customer/referrals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not load your referral details.');
        if (!cancelled) setData(result);
      })
      .catch((error: unknown) => { if (!cancelled) setMessage(error instanceof Error ? error.message : 'Could not load your referral details.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const inviteUrl = data ? `${window.location.origin}/account?ref=${encodeURIComponent(data.referralCode)}` : '';
  const inviteText = data ? `Join Fuddins with my referral code ${data.referralCode}. We both get reward points after your first successful order: ${inviteUrl}` : '';

  const copyInvite = async () => {
    if (!inviteText) return;
    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setMessage('Referral invite copied. Share it with your friends.');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setMessage(`Copy this invite: ${inviteText}`);
    }
  };

  const shareInvite = async () => {
    if (!inviteText || !data) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join Fuddins', text: inviteText }); } catch { /* share sheet dismissed */ }
    } else {
      await copyInvite();
    }
  };

  return <main className="min-h-[55vh] bg-[#f8f7f5] px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-5xl">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-lime-600 via-lime-500 to-green-700 p-6 text-white shadow-lg sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-100">Fuddins friends</p>
        <h1 className="mt-3 max-w-2xl font-serif text-3xl font-bold sm:text-5xl">Invite friends. Earn reward points together.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">Share your personal invite code. When a friend signs up with it and completes their first successful order, you get 100 points and they get 50 points.</p>
      </section>

      {message ? <p role="status" className="mt-5 break-words rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900">{message}</p> : null}

      {loading ? <div className={`${card} mt-6 text-neutral-600`} role="status">Loading your referral account…</div> : data ? <>
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className={card}><p className="text-sm text-neutral-500">Friends invited</p><b className="mt-2 block text-3xl text-lime-700">{data.totalInvited}</b></div>
          <div className={card}><p className="text-sm text-neutral-500">Successful referrals</p><b className="mt-2 block text-3xl text-lime-700">{data.earnedCount}</b></div>
          <div className={card}><p className="text-sm text-neutral-500">Referral points earned</p><b className="mt-2 block text-3xl text-lime-700">{data.earnedPoints}</b></div>
        </section>
        <section className={`${card} mt-5`}>
          <p className="text-sm font-semibold text-neutral-500">Your referral code</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-lime-50 p-4">
            <b className="break-all text-2xl tracking-widest text-lime-900">{data.referralCode}</b>
            <button type="button" onClick={() => void copyInvite()} className="rounded-lg bg-white px-4 py-2 font-bold text-lime-800 shadow-sm ring-1 ring-lime-200">{copied ? 'Copied' : 'Copy invite'}</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => void shareInvite()} className="rounded-lg bg-lime-600 px-5 py-3 font-bold text-white hover:bg-lime-700">Share invite</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(inviteText)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-green-600 px-5 py-3 font-bold text-green-700 hover:bg-green-50">Share on WhatsApp</a>
          </div>
        </section>
        <section className={`${card} mt-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold text-neutral-900">Your invited friends</h2><span className="text-sm text-neutral-500">{data.totalInvited} joined</span></div>
          {data.referrals.length ? <ul className="mt-3 divide-y divide-neutral-100">{data.referrals.map((referral) => <li key={referral.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><span className="font-medium text-neutral-800">{referral.name || 'Fuddins member'}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${referral.rewarded ? 'bg-lime-100 text-lime-800' : 'bg-neutral-100 text-neutral-600'}`}>{referral.rewarded ? 'Reward earned' : 'Joined'}</span></li>)}</ul> : <p className="mt-3 text-sm text-neutral-500">No friends have joined with your code yet. Share your invite to get started.</p>}
          {data.totalInvited > data.referrals.length ? <p className="mt-3 text-xs text-neutral-500">Showing the latest {data.referrals.length} referrals.</p> : null}
        </section>
      </> : <section className={`${card} mt-6`}>
        <h2 className="text-xl font-bold text-neutral-900">Start inviting friends</h2>
        <p className="mt-2 leading-7 text-neutral-600">Create a Fuddins account to get your personal referral code and track friends who join. Your friend can enter your code during registration.</p>
        {incomingCode ? <p className="mt-4 rounded-lg bg-lime-50 p-3 text-sm text-lime-900">Invite code <b>{incomingCode}</b> will be added automatically when you register.</p> : null}
        <Link to={incomingCode ? `/account?ref=${encodeURIComponent(incomingCode)}` : '/account'} className="mt-5 inline-flex rounded-lg bg-lime-600 px-5 py-3 font-bold text-white hover:bg-lime-700">Create account / Log in</Link>
      </section>}

      <p className="mt-5 text-center text-xs leading-5 text-neutral-500">Referral points are credited after the invited friend completes their first successful order. Points can be used under the Fuddins rewards terms.</p>
      {data ? <Link to="/account/refer" className="mt-4 inline-block text-sm font-semibold text-lime-800 underline">Open referral details in My Account</Link> : null}
    </div>
  </main>;
}
