import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { confirmPasswordReset, loginUser, registerUser, requestEmailOtp, requestPasswordReset, verifyEmailOtp, type AuthResponse } from '../../auth';
import type { User } from '../../types';
import PasswordInput from '../shared/PasswordInput';

interface AuthPanelProps {
  currentUser?: User | null;
  allowedRoles?: string[];
  onAuthenticated?: (response: AuthResponse) => void;
  onLogout?: () => void;
}

type LoginView = 'select' | 'password' | 'otp' | 'reset';
type Mode = 'login' | 'register';

/* ---------- UI-only styling helpers ---------- */

// pr-12 leaves room for the show/hide eye inside PasswordInput
const fieldClasses =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3.5 pl-4 pr-12 text-base text-neutral-900 placeholder:text-neutral-400 transition focus:border-lime-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-500/15';

const labelClasses = 'mb-1.5 block text-sm font-semibold text-neutral-700';

const primaryButton =
  'w-full rounded-xl bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3.5 text-center text-[15px] font-bold text-white shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';

const outlineButton =
  'w-full rounded-xl border-2 border-lime-500 bg-white px-6 py-3 text-center text-[15px] font-bold text-lime-700 transition hover:bg-lime-50 active:scale-[0.98]';

const linkButton = 'text-sm font-semibold text-lime-700 transition hover:text-lime-800 hover:underline';

const Ico = ({ d, className = 'h-5 w-5', stroke = 2 }: { d: string; className?: string; stroke?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  check: 'M20 6 9 17l-5-5',
  back: 'm15 18-6-6 6-6',
  gift: 'M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  bag: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0',
  truck: 'M1 3h15v13H1z M16 8h4l3 3v5h-7z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  alert: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
  dash: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
} as const;

const isErrorText = (text: string) => /fail|unable|invalid|error|enter |wrong|expired|partner account|incorrect/i.test(text);

const MessageBox = ({ text }: { text: string }) => {
  if (!text) return null;
  const error = isErrorText(text);
  return (
    <div
      role="status"
      className={`mt-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
        error ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-lime-50 text-lime-800 ring-1 ring-lime-200'
      }`}
    >
      <Ico d={error ? ICONS.alert : ICONS.check} className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
};

const Field = ({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) => (
  <div className="mb-4">
    <label className={labelClasses}>
      {label}
      {optional ? <span className="ml-1 font-normal text-neutral-400">(optional)</span> : <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-neutral-500 transition hover:text-lime-700">
    <Ico d={ICONS.back} className="h-4 w-4" stroke={2.5} /> Back
  </button>
);

const Benefit = ({ icon, title, text }: { icon: keyof typeof ICONS; title: string; text: string }) => (
  <li className="flex items-start gap-3.5">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20 text-white ring-1 ring-white/25">
      <Ico d={ICONS[icon]} className="h-5 w-5" />
    </span>
    <span>
      <span className="block text-[15px] font-bold text-white">{title}</span>
      <span className="block text-sm text-lime-50/90">{text}</span>
    </span>
  </li>
);

const AuthPanel = ({ currentUser, allowedRoles = [], onAuthenticated, onLogout }: AuthPanelProps) => {
  const [loginView, setLoginView] = useState<LoginView>('select');
  const [otpSent, setOtpSent] = useState(false);
  const [mode, setMode] = useState<Mode>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState(() => new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase() || '');

  const [loginMessage, setLoginMessage] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  const finishAuthentication = (response: AuthResponse, successMessage: string, target: 'login' | 'register') => {
    if (allowedRoles.length && !allowedRoles.includes(response.user.role)) {
      const notice = 'This is a partner account. Please use the Fuddins Partner website.';
      target === 'login' ? setLoginMessage(notice) : setRegisterMessage(notice);
      return;
    }
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    onAuthenticated?.(response);
    setLoginEmail('');
    setLoginPassword('');
    setLoginOtp('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setOtpSent(false);
    setLoginView('select');
    target === 'login' ? setLoginMessage(successMessage) : setRegisterMessage(successMessage);
  };

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await loginUser({ email: loginEmail, password: loginPassword });
      finishAuthentication(response, 'Login successful', 'login');
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  };

  const handleOtpAction = async () => {
    try {
      if (!loginEmail.trim()) throw new Error('Enter your email address first.');
      if (!otpSent) {
        const result = await requestEmailOtp(loginEmail);
        setOtpSent(true);
        setLoginMessage(result.message);
        return;
      }
      finishAuthentication(await verifyEmailOtp(loginEmail, loginOtp), 'Login successful', 'login');
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : 'Unable to verify code');
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await registerUser({ name: regName, email: regEmail, password: regPassword, ...(regReferralCode.trim() ? { referralCode: regReferralCode.trim().toUpperCase() } : {}) });
      finishAuthentication(response, 'Registration successful', 'register');
    } catch (error) {
      setRegisterMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!loginEmail.trim()) throw new Error('Enter your email address first.');
      if (!resetCodeSent) {
        const result = await requestPasswordReset(loginEmail);
        setResetCodeSent(true); setLoginMessage(result.message); return;
      }
      if (!/^\d{6}$/.test(resetCode) || resetPassword.length < 8) throw new Error('Enter the 6-digit code and a new password of at least 8 characters.');
      finishAuthentication(await confirmPasswordReset(loginEmail, resetCode, resetPassword), 'Password reset successful. You are now logged in.', 'login');
    } catch (error) { setLoginMessage(error instanceof Error ? error.message : 'Unable to reset password'); }
  };

  /* ---------- Logged-in view ---------- */
  if (currentUser) {
    const initial = (currentUser.name || currentUser.email || '?').trim().charAt(0).toUpperCase();
    return (
      <section className="min-w-0 py-2">
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-100">
          <div className="relative bg-gradient-to-br from-lime-500 via-lime-500 to-lime-700 px-6 pb-14 pt-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <p className="relative font-serif text-2xl font-bold text-white">My account</p>
            <p className="relative mt-1 text-sm text-lime-50/90">Namaste! Good to see you again.</p>
          </div>
          <div className="relative px-6 pb-8">
            <div className="-mt-10 grid h-20 w-20 place-items-center rounded-2xl bg-white text-3xl font-bold text-lime-600 shadow-xl ring-4 ring-white">
              <span className="grid h-full w-full place-items-center rounded-2xl bg-lime-100">{initial}</span>
            </div>
            <p className="mt-4 break-words text-xl font-bold text-neutral-900">{currentUser.name}</p>
            <p className="mt-0.5 break-all text-sm text-neutral-500">{currentUser.email}</p>
            <span className="mt-3 inline-block rounded-full bg-lime-100 px-3 py-1 text-xs font-bold capitalize text-lime-800">{String(currentUser.role).replace(/_/g, ' ')}</span>

            <div className="mt-7 grid gap-3">
              {currentUser.role === 'user' ? (
                <Link to="/account/orders" className={`${outlineButton} flex items-center justify-center gap-2`}>
                  <Ico d={ICONS.bag} className="h-5 w-5" /> My Orders
                </Link>
              ) : (
                <Link
                  to={
                    currentUser.role === 'admin' || currentUser.role === 'admin_team'
                      ? '/admin'
                      : currentUser.role === 'delivery'
                        ? '/partner/delivery/dashboard'
                        : '/partner/vendor/dashboard'
                  }
                  className={`${primaryButton} flex items-center justify-center gap-2 no-underline`}
                >
                  <Ico d={ICONS.dash} className="h-5 w-5" /> Go to dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-[15px] font-bold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
              >
                <Ico d={ICONS.logout} className="h-5 w-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Login / Register ---------- */
  return (
    <section className="relative min-w-0 overflow-x-hidden bg-gradient-to-b from-lime-50 via-white to-white px-4 py-8 sm:py-14">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-lime-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-lime-300/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-100 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Brand panel (desktop) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-lime-500 via-lime-600 to-lime-800 p-10 lg:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-white/10" />
          <div className="relative">
            <h1 className="font-serif text-4xl font-bold leading-tight text-white">
              {mode === 'login' ? 'Welcome back to Fuddins' : 'Join Fuddins today'}
            </h1>
            <p className="mt-3 max-w-xs text-base text-lime-50/90">
              {mode === 'login' ? 'Log in to order food and essentials at your doorstep.' : 'Create your account in a minute and start ordering.'}
            </p>
          </div>
          <ul className="relative mt-10 grid gap-6">
            <Benefit icon="truck" title="Doorstep delivery" text="Food and essentials, brought to you." />
            <Benefit icon="bag" title="Track your orders" text="See all your orders in one place." />
            <Benefit icon="gift" title="Refer & Earn" text="Invite friends and earn rewards." />
          </ul>
        </aside>

        {/* Form side */}
        <div className="min-w-0">
          {/* Brand strip (mobile) */}
          <div className="relative overflow-hidden bg-gradient-to-br from-lime-500 to-lime-700 px-6 py-6 lg:hidden">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
            <h1 className="relative font-serif text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome back 👋' : 'Join Fuddins'}
            </h1>
            <p className="relative mt-1 text-sm text-lime-50/90">Food &amp; essentials at your doorstep</p>
          </div>

          <div className="px-5 py-7 sm:px-10 sm:py-10">
            {/* Mode switch */}
            <div className="mb-7 grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100 p-1" role="tablist">
              {(['login', 'register'] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={mode === item}
                  onClick={() => setMode(item)}
                  className={`rounded-xl py-2.5 text-[15px] font-bold transition ${
                    mode === item ? 'bg-white text-lime-700 shadow-md' : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            {mode === 'login' ? (
              <div>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 sm:text-3xl">Login</h2>
                <p className="mb-6 mt-1 text-sm text-neutral-500">Use your email to continue.</p>

                {loginView === 'select' && (
                  <div>
                    <Field label="Email">
                      <input
                        type="email"
                        className={fieldClasses}
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>
                    <div className="mt-2 grid gap-3">
                      <button type="button" className={primaryButton} onClick={() => setLoginView('otp')}>
                        Login with OTP
                      </button>
                      <button type="button" className={outlineButton} onClick={() => setLoginView('password')}>
                        Login with email &amp; password
                      </button>
                    </div>
                  </div>
                )}

                {loginView === 'password' && (
                  <form onSubmit={handlePasswordLogin}>
                    <BackButton onClick={() => { setLoginView('select'); setLoginMessage(''); }} />
                    <Field label="Phone or Email address">
                      <input
                        type="text"
                        className={fieldClasses}
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Password">
                      <PasswordInput
                        className={fieldClasses}
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        required
                      />
                    </Field>

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-neutral-300 accent-lime-600"
                          checked={rememberMe}
                          onChange={(event) => setRememberMe(event.target.checked)}
                        />
                        Remember me
                      </label>
                      <button type="button" className={linkButton} onClick={() => { setLoginView('reset'); setResetCodeSent(false); setResetCode(''); setResetPassword(''); setLoginMessage(''); }}>
                        Lost your password?
                      </button>
                    </div>

                    <button type="submit" className={primaryButton}>
                      Log In
                    </button>

                    <div className="my-5 flex items-center gap-3 text-xs font-semibold text-neutral-400">
                      <span className="h-px flex-1 bg-neutral-200" /> or <span className="h-px flex-1 bg-neutral-200" />
                    </div>

                    <button
                      type="button"
                      className={outlineButton}
                      onClick={() => {
                        setLoginView('otp');
                        setLoginMessage('');
                      }}
                    >
                      Login with OTP
                    </button>
                  </form>
                )}

                {loginView === 'reset' && (
                  <form onSubmit={handlePasswordReset}>
                    <BackButton onClick={() => { setLoginView('password'); setResetCodeSent(false); setLoginMessage(''); }} />
                    <p className="mb-5 rounded-xl bg-lime-50 px-4 py-3 text-sm text-lime-900 ring-1 ring-lime-100">
                      Enter your account email. We will send a 6-digit reset code that expires in 10 minutes.
                    </p>
                    <Field label="Email address">
                      <input type="email" className={fieldClasses} value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required />
                    </Field>
                    {resetCodeSent ? (
                      <>
                        <Field label="6-digit reset code">
                          <input inputMode="numeric" maxLength={6} className={`${fieldClasses} tracking-[0.4em]`} value={resetCode} onChange={(event) => setResetCode(event.target.value)} required />
                        </Field>
                        <Field label="New password">
                          <PasswordInput minLength={8} className={fieldClasses} value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} required />
                        </Field>
                      </>
                    ) : null}
                    <button type="submit" className={primaryButton}>{resetCodeSent ? 'Reset password' : 'Send reset code'}</button>
                  </form>
                )}

                {loginView === 'otp' && (
                  <div>
                    <BackButton onClick={() => { setLoginView('select'); setOtpSent(false); setLoginMessage(''); }} />
                    <Field label="Email">
                      <input
                        type="email"
                        className={fieldClasses}
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>

                    {otpSent && (
                      <Field label="6-digit verification code">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          className={`${fieldClasses} text-center text-xl font-bold tracking-[0.5em]`}
                          value={loginOtp}
                          onChange={(event) => setLoginOtp(event.target.value)}
                        />
                      </Field>
                    )}

                    <button type="button" className={primaryButton} onClick={handleOtpAction}>
                      {otpSent ? 'Verify Code' : 'Send OTP'}
                    </button>

                    <button
                      type="button"
                      className={`${linkButton} mt-5 block`}
                      onClick={() => {
                        setLoginView('password');
                        setOtpSent(false);
                        setLoginMessage('');
                      }}
                    >
                      Use email &amp; password instead
                    </button>
                  </div>
                )}

                <MessageBox text={loginMessage} />
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 sm:text-3xl">Register</h2>
                <p className="mb-6 mt-1 text-sm text-neutral-500">Create your Fuddins account.</p>

                <Field label="Username">
                  <input
                    type="text"
                    className={fieldClasses}
                    value={regName}
                    onChange={(event) => setRegName(event.target.value)}
                    required
                  />
                </Field>

                <Field label="Email address">
                  <input
                    type="email"
                    className={fieldClasses}
                    value={regEmail}
                    onChange={(event) => setRegEmail(event.target.value)}
                    required
                  />
                </Field>

                <Field label="Referral code" optional>
                  <input
                    type="text"
                    autoComplete="off"
                    className={`${fieldClasses} uppercase`}
                    value={regReferralCode}
                    onChange={(event) => setRegReferralCode(event.target.value.toUpperCase())}
                    placeholder="Enter a friend's code"
                  />
                </Field>

                <Field label="Password">
                  <PasswordInput
                    className={fieldClasses}
                    value={regPassword}
                    onChange={(event) => setRegPassword(event.target.value)}
                    required
                  />
                </Field>

                <p className="mb-6 text-xs leading-relaxed text-neutral-500">
                  Your personal data will be used to support your experience throughout this website, to
                  manage access to your account, and for other purposes described in our{' '}
                  <a href="/pages/privacy-policy" className="font-semibold text-lime-700 hover:underline">
                    privacy policy
                  </a>
                  .
                </p>

                <button type="submit" className={primaryButton}>
                  Register
                </button>

                <MessageBox text={registerMessage} />
              </form>
            )}

            <p className="mt-7 text-center text-sm text-neutral-500">
              {mode === 'login' ? 'New to Fuddins? ' : 'Already have an account? '}
              <button type="button" className={linkButton} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPanel;