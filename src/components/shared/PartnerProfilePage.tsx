// @ts-nocheck
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bike,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  ShoppingBag,
  Store,
  User as UserIcon,
  X,
  type LucideIcon,
} from 'lucide-react';
import { API_ORIGIN } from '../../config';
import type { User } from '../../types';
import PasswordInput from './PasswordInput';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const input =
  'mt-1.5 min-h-[46px] w-full min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-base font-normal text-neutral-900 placeholder:text-neutral-400 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';
const primaryButton =
  'inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 text-sm font-bold text-white shadow-md shadow-lime-600/25 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
const heroGhost =
  'inline-flex min-h-[40px] min-w-0 items-center justify-center gap-2 rounded-xl bg-white/15 px-3.5 text-sm font-semibold text-white no-underline ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' });

const getInitials = (name: string) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const getShopDescription = (profile: Record<string, unknown>) => {
  const description = profile.shopDescription;
  if (typeof description === 'string' && description.trim()) return description;

  const legacyProfile = profile.profile;
  if (typeof legacyProfile !== 'string' || !legacyProfile.trim()) return '';
  try {
    const parsed = JSON.parse(legacyProfile);
    if (parsed && typeof parsed === 'object') return '';
  } catch {
    // Older vendor profiles stored the shop description as plain text.
  }
  return legacyProfile;
};

const availabilityOptions = [
  { value: 'offline', label: 'Offline' },
  { value: 'online', label: 'Online' },
  { value: 'on_delivery', label: 'On delivery' },
];

/* ---------- small building blocks ---------- */

const Section = ({ icon: Icon, title, hint, children }: { icon: LucideIcon; title: string; hint?: string; children: ReactNode }) => (
  <section className="min-w-0 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100 sm:p-6">
    <header className="mb-5 flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime-100 text-lime-700">
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <h2 className="m-0 font-serif text-xl font-bold text-neutral-900">{title}</h2>
        {hint ? <p className="m-0 mt-0.5 text-xs text-neutral-500">{hint}</p> : null}
      </div>
    </header>
    {children}
  </section>
);

const Field = ({ label, value, onChange, type = 'text', placeholder, full = false, hint }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; full?: boolean; hint?: string }) => (
  <label className={`block min-w-0 text-sm font-semibold text-neutral-700 ${full ? 'sm:col-span-2' : ''}`}>
    {label}
    {type === 'password' ? (
      <PasswordInput className={input} value={value} onChange={(event) => onChange(event.target.value)} />
    ) : (
      <input className={input} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    )}
    {hint ? <span className="mt-1 block text-xs font-normal text-neutral-500">{hint}</span> : null}
  </label>
);

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-4 focus-visible:ring-lime-500/30 ${checked ? 'bg-lime-500' : 'bg-neutral-300'}`}
  >
    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const ImagePreview = ({ src, alt, className, fallback }: { src?: string; alt: string; className: string; fallback: ReactNode }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
};

const passwordScore = (value: string) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};
const strengthMeta = [
  { label: 'Too short', bar: 'bg-red-400', text: 'text-red-600' },
  { label: 'Weak', bar: 'bg-red-400', text: 'text-red-600' },
  { label: 'Fair', bar: 'bg-amber-400', text: 'text-amber-600' },
  { label: 'Good', bar: 'bg-lime-500', text: 'text-lime-700' },
  { label: 'Strong', bar: 'bg-emerald-600', text: 'text-emerald-700' },
];

export default function PartnerProfilePage({ user, role, onUserUpdated }: { user: User; role: 'vendor' | 'delivery'; onUserUpdated: (user: User) => void }) {
  const [profile, setProfile] = useState<Record<string, any>>({ name: user.name, phone: user.phone || '', storeName: user.name, acceptingOrders: true, vehicleType: '', vehicleNumber: '', deliveryStatus: 'offline' });
  const [notice, setNotice] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState(true);

  const notify = (text: string, tone: 'success' | 'error' = 'success') => setNotice({ text, tone });

  useEffect(() => {
    fetch(`${API_ORIGIN}/partner/${role}/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setProfile((current) => ({ ...current, ...data, vehicleType: data.deliveryVehicleType || '', vehicleNumber: data.deliveryVehicleNumber || '' })))
      .catch(() => undefined);
  }, [role]);

  useEffect(() => {
    fetch(`${API_ORIGIN}/customer/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        try {
          if (data) setNotifications(JSON.parse(data.notificationPreferences || '{}').email !== false);
        } catch {
          setNotifications(true);
        }
      })
      .catch(() => undefined);
  }, []);

  const change = (key: string, value: string | boolean) => setProfile((current) => ({ ...current, [key]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const payload = role === 'vendor' ? profile : { name: profile.name, phone: profile.phone, vehicleType: profile.vehicleType, vehicleNumber: profile.vehicleNumber, deliveryStatus: profile.deliveryStatus };
      const response = await fetch(`${API_ORIGIN}/partner/${role}/profile`, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save profile');
      const updated = { ...user, name: role === 'vendor' ? profile.storeName : profile.name, phone: profile.phone };
      localStorage.setItem('user', JSON.stringify(updated));
      onUserUpdated(updated);
      notify('Profile saved successfully.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch(`${API_ORIGIN}/customer/password`, { method: 'PATCH', headers: headers(), body: JSON.stringify(password) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to update password');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify('Password updated successfully.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to update password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async (enabled: boolean) => {
    setNotifications(enabled);
    try {
      const response = await fetch(`${API_ORIGIN}/customer/profile`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ notificationPreferences: JSON.stringify({ email: enabled }) }) });
      if (!response.ok) throw new Error('Unable to save notification preference');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to save notification preference', 'error');
    }
  };

  const displayName = role === 'vendor' ? profile.storeName || user.name : profile.name || user.name;
  const score = passwordScore(password.newPassword);
  const strength = strengthMeta[password.newPassword ? score : 0];
  const mismatch = Boolean(password.confirmPassword) && password.newPassword !== password.confirmPassword;
  const canUpdatePassword = Boolean(password.currentPassword) && password.newPassword.length >= 8 && !mismatch && Boolean(password.confirmPassword);

  const statusChip = useMemo(() => {
    if (role === 'vendor') return profile.acceptingOrders ? { text: 'Accepting orders', tone: 'bg-lime-300/30 text-white' } : { text: 'Orders paused', tone: 'bg-amber-300/30 text-white' };
    const match = availabilityOptions.find((option) => option.value === profile.deliveryStatus);
    return { text: match?.label || 'Offline', tone: profile.deliveryStatus === 'offline' ? 'bg-white/15 text-white' : 'bg-lime-300/30 text-white' };
  }, [role, profile.acceptingOrders, profile.deliveryStatus]);

  const heroAvatarFallback = (
    <span className="grid h-full w-full place-items-center bg-white text-xl font-extrabold text-lime-700">{getInitials(displayName)}</span>
  );

  return (
    <section className="mx-auto min-w-0 max-w-[1300px]">
      {/* hero */}
      <div
        className="relative overflow-hidden rounded-3xl px-5 pb-8 pt-5 shadow-xl shadow-lime-900/20 sm:px-8 sm:pb-10 sm:pt-6"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(135deg, #84cc16 0%, #4d7c0f 55%, #064e3b 100%)', backgroundSize: '20px 20px, 100% 100%' }}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative">
          <NavLink to={`/partner/${role}/dashboard`} className={heroGhost}>
            <ArrowLeft size={16} />
            Back to dashboard
          </NavLink>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-4 ring-white/30">
            {role === 'vendor' ? <ImagePreview src={profile.storeLogoUrl} alt="Store logo" className="h-full w-full object-cover" fallback={heroAvatarFallback} /> : heroAvatarFallback}
          </div>
          <div className="min-w-0">
            <h1 className="m-0 truncate font-serif text-2xl font-bold text-white sm:text-3xl">{role === 'vendor' ? 'Store setup' : 'Delivery partner profile'}</h1>
            <p className="m-0 mt-0.5 truncate text-sm text-lime-50/90">{displayName} · {user.email}</p>
            <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ring-1 ring-white/30 ${statusChip.tone}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-lime-200" />
              {statusChip.text}
            </span>
          </div>
        </div>
      </div>

      {notice ? (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`m-0 mt-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === 'error' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-lime-50 text-lime-800 ring-1 ring-lime-200'}`}
        >
          {notice.tone === 'error' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <Check size={16} className="mt-0.5 shrink-0" />}
          <span className="min-w-0 flex-1 break-words">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100">
            <X size={16} />
          </button>
        </p>
      ) : null}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        {/* main form */}
        <form onSubmit={save} className="grid min-w-0 gap-6 lg:col-span-2">
          {role === 'vendor' ? (
            <>
              <Section icon={Store} title="Store details" hint="What customers see first">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Shop name" value={profile.storeName} onChange={(value) => change('storeName', value)} />
                  <Field label="Store email" type="email" value={profile.email || ''} onChange={(value) => change('email', value)} />
                  <Field label="Store phone" value={profile.phone} onChange={(value) => change('phone', value)} />
                  <Field label="Business hours" value={profile.businessHours || ''} placeholder="e.g. 9 AM - 9 PM" onChange={(value) => change('businessHours', value)} />
                </div>
              </Section>

              <Section icon={ImageIcon} title="Branding" hint="Paste image links. The preview updates as you type.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Store logo URL" value={profile.storeLogoUrl || ''} placeholder="https://..." onChange={(value) => change('storeLogoUrl', value)} />
                  <Field label="Store banner URL" value={profile.storeBannerUrl || ''} placeholder="https://..." onChange={(value) => change('storeBannerUrl', value)} />
                </div>
              </Section>

              <Section icon={MapPin} title="Address & location" hint="Used for delivery pickup and the store page">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Store address 1" full value={profile.address1 || profile.address || ''} onChange={(value) => change('address1', value)} />
                  <Field label="Store address 2" full value={profile.address2 || ''} onChange={(value) => change('address2', value)} />
                  <Field label="City / Town" value={profile.city || ''} onChange={(value) => change('city', value)} />
                  <Field label="Postcode / ZIP" value={profile.postcode || ''} onChange={(value) => change('postcode', value)} />
                  <Field label="State" value={profile.state || ''} onChange={(value) => change('state', value)} />
                  <Field label="Country" value={profile.country || 'India'} onChange={(value) => change('country', value)} />
                  <Field label="Store location (Google Maps URL)" full value={profile.storeLocation || ''} placeholder="https://maps.google.com/..." onChange={(value) => change('storeLocation', value)} />
                </div>
                {profile.storeLocation ? (
                  <a href={profile.storeLocation} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-lime-700 no-underline hover:underline">
                    <ExternalLink size={14} /> Open in Google Maps
                  </a>
                ) : null}
              </Section>

              <Section icon={FileText} title="About your shop" hint="Tell customers what makes your store special">
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition focus-within:border-lime-500 focus-within:ring-4 focus-within:ring-lime-500/15 [&_.ck-editor__editable]:!min-h-[160px] [&_.ck-editor__editable]:!border-0 [&_.ck-editor__editable.ck-focused]:!shadow-none [&_.ck-toolbar]:!border-0 [&_.ck-toolbar]:!border-b [&_.ck-toolbar]:!bg-neutral-50">
                  <CKEditor editor={ClassicEditor} data={getShopDescription(profile)} onChange={(_, editor) => change('shopDescription', editor.getData())} />
                </div>
              </Section>

              <Section icon={ShoppingBag} title="Order settings" hint="Control how orders reach your store">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Minimum order amount (Rs.)" type="number" value={profile.minimumOrderAmount || ''} placeholder="0" onChange={(value) => change('minimumOrderAmount', value)} />
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-bold text-neutral-900">Accept new orders</p>
                      <p className="m-0 mt-0.5 text-xs text-neutral-500">{profile.acceptingOrders ? 'Your store is open for orders.' : 'Orders are paused. Customers cannot order right now.'}</p>
                    </div>
                    <Toggle checked={Boolean(profile.acceptingOrders)} onChange={(value) => change('acceptingOrders', value)} label="Accept new orders" />
                  </div>
                </div>
              </Section>
            </>
          ) : (
            <>
              <Section icon={UserIcon} title="Personal details" hint="Shown to the team when assigning deliveries">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" value={profile.name} onChange={(value) => change('name', value)} />
                  <Field label="Phone" value={profile.phone} onChange={(value) => change('phone', value)} />
                </div>
              </Section>

              <Section icon={Bike} title="Vehicle" hint="The vehicle you use for deliveries">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Vehicle type" value={profile.vehicleType} placeholder="Bike, scooter, car" onChange={(value) => change('vehicleType', value)} />
                  <Field label="Vehicle number" value={profile.vehicleNumber} onChange={(value) => change('vehicleNumber', value)} />
                </div>
              </Section>

              <Section icon={Clock} title="Availability" hint="Choose when you can receive new deliveries">
                <div className="grid grid-cols-1 gap-1.5 rounded-xl bg-neutral-100 p-1.5 sm:grid-cols-3" role="radiogroup" aria-label="Availability">
                  {availabilityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={profile.deliveryStatus === option.value}
                      onClick={() => change('deliveryStatus', option.value)}
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-lg text-sm font-bold transition ${profile.deliveryStatus === option.value ? 'bg-white text-lime-800 shadow-sm ring-1 ring-lime-200' : 'text-neutral-500 hover:text-neutral-800'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Section>
            </>
          )}

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 pl-5 shadow-xl shadow-lime-900/10 ring-1 ring-lime-200 backdrop-blur">
            <p className="m-0 text-sm font-medium text-neutral-600">Changes apply only after you save.</p>
            <button disabled={saving} className={`${primaryButton} w-full sm:w-auto`}>
              <Save size={16} />
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>

        {/* sidebar */}
        <aside className="grid min-w-0 gap-6">
          {role === 'vendor' ? (
            <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-100">
              <div className="relative h-32 bg-gradient-to-br from-lime-100 to-emerald-100">
                <ImagePreview src={profile.storeBannerUrl} alt="Store banner" className="h-full w-full object-cover" fallback={<div className="grid h-full place-items-center text-lime-400"><ImageIcon size={32} strokeWidth={1.5} /></div>} />
              </div>
              <div className="relative px-5 pb-5">
                <div className="-mt-8 h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-lg ring-4 ring-white">
                  <ImagePreview src={profile.storeLogoUrl} alt="Store logo" className="h-full w-full object-cover" fallback={<span className="grid h-full w-full place-items-center bg-lime-50 text-lg font-extrabold text-lime-700">{getInitials(displayName)}</span>} />
                </div>
                <p className="m-0 mt-3 font-serif text-lg font-bold text-neutral-900">{displayName}</p>
                <p className="m-0 mt-0.5 text-xs text-neutral-500">{[profile.city, profile.state].filter(Boolean).join(', ') || 'Add your city and state'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={`rounded-full px-2.5 py-1 ring-1 ${profile.acceptingOrders ? 'bg-lime-100 text-lime-800 ring-lime-200' : 'bg-amber-100 text-amber-800 ring-amber-200'}`}>{profile.acceptingOrders ? 'Open for orders' : 'Paused'}</span>
                  {profile.businessHours ? <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600 ring-1 ring-neutral-200">{profile.businessHours}</span> : null}
                </div>
                <p className="m-0 mt-3 text-[11px] text-neutral-400">Live preview of your store card</p>
              </div>
            </section>
          ) : null}

          <Section icon={KeyRound} title="Password & security" hint="Use at least 8 characters">
            <form onSubmit={changePassword} className="grid gap-4">
              <Field label="Current password" type="password" value={password.currentPassword} onChange={(value) => setPassword({ ...password, currentPassword: value })} />
              <Field label="New password" type="password" value={password.newPassword} onChange={(value) => setPassword({ ...password, newPassword: value })} />
              {password.newPassword ? (
                <div aria-live="polite">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <span key={step} className={`h-1.5 rounded-full ${password.newPassword && score >= step ? strength.bar : 'bg-neutral-200'}`} />
                    ))}
                  </div>
                  <p className={`m-0 mt-1.5 text-xs font-bold ${strength.text}`}>{strength.label}</p>
                </div>
              ) : null}
              <Field label="Confirm password" type="password" value={password.confirmPassword} onChange={(value) => setPassword({ ...password, confirmPassword: value })} />
              {mismatch ? (
                <p role="alert" className="m-0 -mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <AlertTriangle size={13} /> Passwords do not match
                </p>
              ) : null}
              <button disabled={saving || !canUpdatePassword} className={`${primaryButton} w-full`}>
                <ShieldCheck size={16} />
                Update password
              </button>
            </form>
          </Section>

          <Section icon={Bell} title="Notifications" hint="Email updates about your partner account">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="m-0 text-sm font-bold text-neutral-900">Partner updates</p>
                <p className="m-0 mt-0.5 text-xs text-neutral-500">Receive important partner updates.</p>
              </div>
              <Toggle checked={notifications} onChange={saveNotifications} label="Receive partner updates" />
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-lime-50/70 p-3.5 ring-1 ring-lime-100">
              <Mail size={16} className="mt-0.5 shrink-0 text-lime-700" />
              <p className="m-0 min-w-0 text-xs text-neutral-600">
                <b className="text-neutral-800">Account activity:</b> Current session active as <span className="break-all font-semibold">{user.email}</span>.
              </p>
            </div>
          </Section>
        </aside>
      </div>
    </section>
  );
}
