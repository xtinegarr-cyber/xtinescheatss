import { useState } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { login, signup, type AuthUser } from './auth';

// ─── Login Modal ──────────────────────────────────────────────────────────────

export function LoginModal({
  onSuccess,
  onClose,
  onSwitchToSignup,
}: {
  onSuccess: (user: AuthUser) => void;
  onClose: () => void;
  onSwitchToSignup: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = login(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      onSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Xtine account" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <AuthField label="Username">
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            className="auth-input"
            required
          />
        </AuthField>
        <AuthField label="Password">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="auth-input pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a72] hover:text-white transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </AuthField>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#6C5CE7] py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-[13px] text-[#5a5a72]">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-[#8B7CF8] hover:text-white transition-colors"
          >
            Sign up
          </button>
        </p>
      </form>
    </AuthShell>
  );
}

// ─── Signup Modal ─────────────────────────────────────────────────────────────

export function SignupModal({
  onSuccess,
  onClose,
  onSwitchToLogin,
}: {
  onSuccess: (user: AuthUser) => void;
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = signup(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      onSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Join Xtine — it's free" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <AuthField label="Username">
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="auth-input"
            required
          />
        </AuthField>
        <AuthField label="Password">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="auth-input pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a72] hover:text-white transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </AuthField>
        <AuthField label="Confirm Password">
          <input
            type={showPw ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className="auth-input"
            required
          />
        </AuthField>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password || !confirm}
          className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#6C5CE7] py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-[13px] text-[#5a5a72]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#8B7CF8] hover:text-white transition-colors"
          >
            Sign in
          </button>
        </p>
      </form>
    </AuthShell>
  );
}

// ─── Order History Modal ──────────────────────────────────────────────────────

import type { Order } from './auth';
import { Clock3, Package, ShoppingBag } from 'lucide-react';

export function OrderHistoryModal({
  orders,
  username,
  onClose,
}: {
  orders: Order[];
  username: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#09090f]/90 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="relative max-h-[88dvh] w-full max-w-[640px] overflow-hidden rounded-t-3xl border border-[#1e1e2e] bg-[#0f0f18] shadow-2xl sm:rounded-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-[#1e1e2e] px-7 py-5 shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] mb-0.5">
              {username}
            </p>
            <h2 className="text-[20px] font-extrabold text-white tracking-tight">Order History</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#a0a0b8] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#5a5a72]">
                <ShoppingBag size={26} />
              </div>
              <h3 className="text-[17px] font-bold text-white mb-2">No orders yet</h3>
              <p className="text-[13px] text-[#5a5a72] max-w-[260px] leading-relaxed">
                Your purchases will appear here after checkout.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-[#1e1e2e] bg-[#13131e] overflow-hidden"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e]/60 bg-[#0f0f18]">
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-[#6C5CE7]" />
                      <span className="text-[12px] font-bold text-white font-mono">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.status === 'Confirmed'
                            ? 'bg-[#00d4aa]/15 text-[#00d4aa]'
                            : 'bg-[#6C5CE7]/15 text-[#8B7CF8]'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#5a5a72]">
                        <Clock3 size={11} />
                        {new Date(order.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="divide-y divide-[#1e1e2e]/40">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-[13px] font-semibold text-white">{item.productName}</p>
                          <p className="text-[11px] text-[#6C5CE7] font-bold mt-0.5">{item.duration}</p>
                        </div>
                        <p className="text-[13px] font-bold text-[#8B7CF8]">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div className="flex items-center justify-between border-t border-[#1e1e2e]/60 bg-[#0f0f18] px-5 py-3">
                    <span className="text-[12px] text-[#5a5a72]">
                      {order.payment} · {order.txRef.slice(0, 20)}
                      {order.txRef.length > 20 ? '…' : ''}
                    </span>
                    <span className="text-[14px] font-extrabold text-white">
                      ${order.total.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function AuthShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-[#09090f]/90 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-t-3xl border border-[#1e1e2e] bg-[#0f0f18] shadow-2xl sm:rounded-2xl">
        {/* Purple top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#6C5CE7] to-[#8B7CF8]" />

        <div className="px-8 pb-8 pt-7">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#a0a0b8] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="mb-7">
            <h2 className="text-[22px] font-extrabold text-white tracking-tight">{title}</h2>
            <p className="mt-1 text-[13px] text-[#5a5a72]">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#5a5a72]">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Login success toast ──────────────────────────────────────────────────────

export function LoginToast({ username, onDone }: { username: string; onDone: () => void }) {
  // auto-dismiss after 2.5 s
  useState(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  });

  return (
    <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 flex items-center gap-3 rounded-xl border border-[#6C5CE7]/30 bg-[#13131e] px-5 py-3.5 shadow-2xl animate-[reveal_.4s_cubic-bezier(.16,1,.3,1)_both]">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7]">
        <Check size={14} strokeWidth={2.5} />
      </div>
      <p className="text-[13px] font-bold text-white">
        Signed in as <span className="text-[#8B7CF8]">{username}</span>
      </p>
    </div>
  );
}
