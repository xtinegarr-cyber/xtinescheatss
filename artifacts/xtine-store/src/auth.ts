// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderItem = {
  productName: string;
  duration: string;
  price: number;
};

export type Order = {
  id: string;
  date: string; // ISO string
  items: OrderItem[];
  total: number;
  txRef: string;
  payment: string;
  status: 'Pending review' | 'Confirmed';
};

export type AuthUser = {
  username: string;
  isAdmin: boolean;
};

type StoredUser = {
  username: string;
  password: string; // plaintext — no backend, so this is acceptable for this build
  orders: Order[];
};

// ─── Admin credentials ────────────────────────────────────────────────────────
// NOTE: These are visible in browser devtools because this is a frontend-only
// app. Move to a real backend before taking the store to production.
const ADMIN_USERNAME = 'Xtinegar';
const ADMIN_PASSWORD = 'Rubeans2124!';

// ─── Storage helpers ──────────────────────────────────────────────────────────
const USERS_KEY = 'xtine_users_v1';
const SESSION_KEY = 'xtine_session_v1';

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveSession(user: AuthUser | null): void {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function loadSession(): AuthUser | null {
  return getSession();
}

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

export function login(username: string, password: string): LoginResult {
  // Admin shortcut
  if (
    username.toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
    password === ADMIN_PASSWORD
  ) {
    const user: AuthUser = { username: ADMIN_USERNAME, isAdmin: true };
    saveSession(user);
    return { ok: true, user };
  }

  const users = getStoredUsers();
  const found = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (!found) return { ok: false, error: 'No account found with that username.' };
  if (found.password !== password)
    return { ok: false, error: 'Incorrect password.' };

  const user: AuthUser = { username: found.username, isAdmin: false };
  saveSession(user);
  return { ok: true, user };
}

export type SignupResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

export function signup(username: string, password: string): SignupResult {
  if (username.length < 3)
    return { ok: false, error: 'Username must be at least 3 characters.' };
  if (password.length < 6)
    return { ok: false, error: 'Password must be at least 6 characters.' };

  if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase())
    return { ok: false, error: 'That username is taken.' };

  const users = getStoredUsers();
  const exists = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) return { ok: false, error: 'Username already taken.' };

  const newUser: StoredUser = { username, password, orders: [] };
  saveStoredUsers([...users, newUser]);

  const user: AuthUser = { username, isAdmin: false };
  saveSession(user);
  return { ok: true, user };
}

export function logout(): void {
  saveSession(null);
}

export function getOrders(username: string): Order[] {
  const users = getStoredUsers();
  const found = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  return found?.orders ?? [];
}

export function saveOrder(username: string, order: Order): void {
  const users = getStoredUsers();
  const updated = users.map((u) =>
    u.username.toLowerCase() === username.toLowerCase()
      ? { ...u, orders: [order, ...u.orders] }
      : u
  );
  saveStoredUsers(updated);
}

export function generateOrderId(): string {
  return `XTC-${Date.now().toString(36).toUpperCase()}`;
}
