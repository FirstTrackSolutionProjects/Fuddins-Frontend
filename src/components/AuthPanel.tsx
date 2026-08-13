import { useState } from 'react';
import { loginUser, registerUser, type AuthResponse } from '../auth';
import type { User } from '../types';

interface AuthPanelProps {
  currentUser?: User | null;
  onAuthenticated?: (response: AuthResponse) => void;
  onLogout?: () => void;
}

const AuthPanel = ({ currentUser, onAuthenticated, onLogout }: AuthPanelProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = mode === 'login' ? await loginUser({ email, password }) : await registerUser({ name, email, password });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onAuthenticated?.(response);
      setName('');
      setEmail('');
      setPassword('');
      setMessage(`${mode === 'login' ? 'Login' : 'Registration'} successful`);
    } catch (error) {
      setMessage('Action failed. Please try again.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      {currentUser ? (
        <div className="mb-5 rounded-lg border border-slate-800 bg-slate-900 p-3">
          <p className="font-medium">{currentUser.name}</p>
          <p className="text-sm text-slate-400">{currentUser.email}</p>
          <p className="text-sm text-cyan-400">{currentUser.role}</p>
          <button className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-sm" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 ${mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-white'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 ${mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-white'}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950" type="submit">
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-cyan-400">{message}</p>}
    </div>
  );
};

export default AuthPanel;
