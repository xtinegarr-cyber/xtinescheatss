import { API_BASE } from './stripe';

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

// ─── Admin ────────────────────────────────────────────────────────────────────
// The admin password is checked by the server (ADMIN_KEY), never stored here.
const ADMIN_USERNAME = 'Xtinegar';

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

export async function login(username: string, password: string): Promise<LoginResult> {
  // Admin: the server checks the password.
  if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, error: data.error ?? 'Incorrect username or password.' };
      }
    } catch {
      return { ok: false, error: 'Could not reach the server. Try again.' };
    }
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

// ─── Admin helpers ────────────────────────────────────────────────────────────

export type AdminOrder = Order & { username: string };

/** Returns every order from every user, newest first. */
export function getAllOrders(): AdminOrder[] {
  const users = getStoredUsers();
  const all: AdminOrder[] = [];
  for (const user of users) {
    for (const order of user.orders) {
      all.push({ ...order, username: user.username });
    }
  }
  return all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Update the status of a specific order for a given user. */
export function updateOrderStatus(
  username: string,
  orderId: string,
  status: Order['status']
): void {
  const users = getStoredUsers();
  const updated = users.map((u) =>
    u.username.toLowerCase() === username.toLowerCase()
      ? {
          ...u,
          orders: u.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        }
      : u
  );
  saveStoredUsers(updated);
}
