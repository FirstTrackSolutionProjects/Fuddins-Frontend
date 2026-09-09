import { useState } from 'react';
import { loginUser, registerUser, requestEmailOtp, verifyEmailOtp, type AuthResponse } from '../auth';
import type { User } from '../types';

interface AuthPanelProps {
  currentUser?: User | null;
  allowedRoles?: string[];
  onAuthenticated?: (response: AuthResponse) => void;
  onLogout?: () => void;
}

type LoginView = 'select' | 'password' | 'otp';

const fieldClasses =
  'w-full rounded-sm border border-neutral-300 bg-white px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-lime-500';

const labelClasses = 'mb-2 block text-sm font-semibold text-neutral-800';

const greenButtonClasses =
  'w-full rounded-sm bg-lime-500 px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-60';

const AuthPanel = ({ currentUser, allowedRoles = [], onAuthenticated, onLogout }: AuthPanelProps) => {
  const [loginView, setLoginView] = useState<LoginView>('select');
  const [otpSent, setOtpSent] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

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
      const response = await registerUser({ name: regName, email: regEmail, password: regPassword });
      finishAuthentication(response, 'Registration successful', 'register');
    } catch (error) {
      setRegisterMessage(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  };

  if (currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-1 font-serif text-3xl font-bold text-neutral-900">My account</h1>
        <div className="mt-8 rounded-sm border border-neutral-300 bg-white p-8">
          <p className="text-lg font-semibold text-neutral-900">{currentUser.name}</p>
          <p className="mt-1 text-sm text-neutral-600">{currentUser.email}</p>
          <p className="mt-1 text-sm font-medium text-lime-700">{currentUser.role}</p>
          <button type="button" onClick={onLogout} className="mt-6 rounded-sm bg-neutral-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-neutral-800">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-14 md:grid-cols-2">
        {/* Login column */}
        <div>
          <h1 className="mb-1 font-serif text-3xl font-bold text-neutral-900">My account</h1>
          <h2 className="mb-8 font-serif text-3xl font-bold text-neutral-900">Login</h2>

          {loginView === 'select' && (
            <div className="max-w-md">
              <label className={labelClasses}>
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                className={`${fieldClasses} mb-5`}
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" className={greenButtonClasses} onClick={() => setLoginView('otp')}>
                  Login With OTP
                </button>
                <button type="button" className={greenButtonClasses} onClick={() => setLoginView('password')}>
                  Login With Email &amp; Password
                </button>
              </div>
            </div>
          )}

          {loginView === 'password' && (
            <form className="max-w-md" onSubmit={handlePasswordLogin}>
              <label className={labelClasses}>
                Phone or Email address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                className={`${fieldClasses} mb-5`}
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />

              <label className={labelClasses}>
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                className={`${fieldClasses} mb-4`}
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />

              <label className="mb-5 flex items-center gap-2 text-sm text-neutral-800">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                Remember me
              </label>

              <button type="submit" className={greenButtonClasses}>
                Log In
              </button>

              <button type="button" className="mt-4 block text-sm text-lime-700 hover:underline">
                Lost your password?
              </button>

              <button
                type="button"
                className={`${greenButtonClasses} mt-6`}
                onClick={() => {
                  setLoginView('otp');
                  setLoginMessage('');
                }}
              >
                Login With OTP
              </button>
            </form>
          )}

          {loginView === 'otp' && (
            <div className="max-w-md">
              <label className={labelClasses}>
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                className={`${fieldClasses} mb-5`}
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />

              {otpSent && (
                <>
                  <label className={labelClasses}>6-digit verification code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={`${fieldClasses} mb-5`}
                    value={loginOtp}
                    onChange={(event) => setLoginOtp(event.target.value)}
                  />
                </>
              )}

              <button type="button" className={greenButtonClasses} onClick={handleOtpAction}>
                {otpSent ? 'Verify Code' : 'Send OTP'}
              </button>

              <button
                type="button"
                className="mt-4 block text-sm text-lime-700 hover:underline"
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

          {loginMessage && <p className="mt-5 text-sm font-medium text-neutral-800">{loginMessage}</p>}
        </div>

        {/* Register column */}
        <div>
          <div className="mb-1 font-serif text-3xl font-bold text-transparent" aria-hidden="true">
            &nbsp;
          </div>
          <h2 className="mb-8 font-serif text-3xl font-bold text-neutral-900">Register</h2>

          <form className="rounded-sm border border-neutral-300 bg-white p-8" onSubmit={handleRegister}>
            <label className={labelClasses}>
              Username <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className={`${fieldClasses} mb-5`}
              value={regName}
              onChange={(event) => setRegName(event.target.value)}
              required
            />

            <label className={labelClasses}>
              Email address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              className={`${fieldClasses} mb-5`}
              value={regEmail}
              onChange={(event) => setRegEmail(event.target.value)}
              required
            />

            <label className={labelClasses}>
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              className={`${fieldClasses} mb-5`}
              value={regPassword}
              onChange={(event) => setRegPassword(event.target.value)}
              required
            />

            <p className="mb-6 text-xs leading-relaxed text-neutral-500">
              Your personal data will be used to support your experience throughout this website, to
              manage access to your account, and for other purposes described in our{' '}
              <a href="/pages/privacy-policy" className="text-lime-700 hover:underline">
                privacy policy
              </a>
              .
            </p>

            <button type="submit" className={greenButtonClasses}>
              Register
            </button>

            {registerMessage && <p className="mt-5 text-sm font-medium text-neutral-800">{registerMessage}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;