import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Gamepad2,
  Grip,
  Headphones,
  Heart,
  History,
  LockKeyhole,
  LogOut,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import heroCharacters from './assets/hero-characters.png';
import { loadProducts, saveProducts } from './data';
import AdminPanel from './AdminPanel';
import {
  LoginModal,
  SignupModal,
  OrderHistoryModal,
  LoginToast,
} from './AuthModals';
import {
  loadSession,
  logout,
  getOrders,
  saveOrder,
  generateOrderId,
  type AuthUser,
  type Order,
} from './auth';
import { createStripeCheckoutSession } from './stripe';
import type { CartEntry, Product } from './types';

const wallets: Record<string, string> = {
  BTC: 'bc1qskwe5la2nxuw3h3vxl4zjszua2jmewhhnz20r0',
  LTC: 'LLe1ZLMUmwJ1m84kA6xY5qu6uoQCwEspwn',
  ETH: '0x9F56Ed1e644E8aD227Fd435fBeB0Fb14e17239c7',
  SOL: '3KWkVTQNWpHjsBzPRo4QZ7sVv3ZHeBg7rHzxzdRpiUiE',
};

type Category = 'Featured' | 'Items' | 'Services';
type AuthModal = 'login' | 'signup' | null;

function App() {
  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(loadProducts);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadSession);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [showToast, setShowToast] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthModal(null);
    setShowToast(true);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setShowUserMenu(false);
  };

  const openOrderHistory = () => {
    if (!currentUser) return;
    setUserOrders(getOrders(currentUser.username));
    setShowOrderHistory(true);
    setShowUserMenu(false);
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  const [adminOpen, setAdminOpen] = useState(false);

  const handleSaveProducts = (updated: Product[]) => {
    saveProducts(updated);
    setProducts(updated);
  };

  // ── Catalog ───────────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category>('Featured');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const listedProducts = useMemo(() => products.filter((p) => p.listed), [products]);

  const gameNames = useMemo(
    () => [...new Set(listedProducts.map((p) => p.game).filter(Boolean))],
    [listedProducts]
  );
  const visibleProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return listedProducts.filter((p) => {
      const matchesCategory = category === 'Featured' || p.category === category;
      const matchesQuery =
        !normalized ||
        `${p.name} ${p.game} ${p.type}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [listedProducts, category, query]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const cartEntries = Object.entries(cart);
  const cartProducts = cartEntries
    .map(([id, entry]) => {
      const product = products.find((p) => p.id === id);
      return product ? { product, entry } : null;
    })
    .filter(Boolean) as { product: Product; entry: CartEntry }[];

  const itemCount = cartEntries.reduce((sum, [, e]) => sum + e.qty, 0);
  const subtotal = cartProducts.reduce((sum, { product, entry }) => {
    const price = product.durations[entry.durationIndex]?.price ?? 0;
    return sum + price * entry.qty;
  }, 0);

  const addToCart = (product: Product, durationIndex = 0) => {
    setCart((c) => ({
      ...c,
      [product.id]: { durationIndex, qty: (c[product.id]?.qty ?? 0) + 1 },
    }));
    setCartOpen(true);
  };

  const updateQuantity = (id: string, amount: number) => {
    setCart((c) => {
      const entry = c[id];
      if (!entry) return c;
      const next = { ...c, [id]: { ...entry, qty: entry.qty + amount } };
      if (next[id].qty <= 0) {
        const copy = { ...next };
        delete copy[id];
        return copy;
      }
      return next;
    });
  };

  // ── Checkout ──────────────────────────────────────────────────────────────
  const [checkout, setCheckout] = useState(false);
  const [payment, setPayment] = useState('BTC');
  const [txRef, setTxRef] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Detect Stripe success redirect (?payment_success=true)
  const [stripeSuccess, setStripeSuccess] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('payment_success') === 'true';
  });

  const copyWallet = async () => {
    try { await navigator.clipboard.writeText(wallets[payment]); } catch { /* ignore */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleCheckoutSubmit = () => {
    // Save order to user's history if logged in as a regular user
    if (currentUser && !currentUser.isAdmin) {
      const order: Order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        items: cartProducts.map(({ product, entry }) => ({
          productName: product.name,
          duration: product.durations[entry.durationIndex]?.label ?? '',
          price: (product.durations[entry.durationIndex]?.price ?? 0) * entry.qty,
        })),
        total: subtotal,
        txRef,
        payment,
        status: 'Pending review',
      };
      saveOrder(currentUser.username, order);
    }
    setSubmitted(true);
  };

  const scrollToCatalog = () =>
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });

  // ── Admin panel (full-screen takeover) ────────────────────────────────────
  if (adminOpen) {
    return (
      <AdminPanel
        products={products}
        onSave={handleSaveProducts}
        onClose={() => setAdminOpen(false)}
      />
    );
  }

  return (
    <main className="noise min-h-[100dvh] overflow-x-hidden bg-[#09090f] text-white selection:bg-[#6C5CE7] selection:text-white">

      {/* ── HEADER ── */}
      <header className="relative z-50 border-b border-[#1e1e2e] bg-[#0c0c16]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 lg:px-10">

          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-3"
          >
            <Grip size={22} className="text-[#a0a0b8] transition-colors group-hover:text-white" />
            <span className="font-display text-[19px] font-extrabold tracking-[-.03em] text-white">Xtine<span className="text-[#6C5CE7]">Cheats</span></span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#a0a0b8] lg:flex">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white">Home</button>

            {/* Games dropdown */}
            <div className="relative">
              <button
                onClick={() => setGamesOpen((v) => !v)}
                onBlur={() => setTimeout(() => setGamesOpen(false), 150)}
                className="flex items-center gap-1.5 transition-colors hover:text-white"
              >
                Games <ChevronDown size={14} className={`text-[#5a5a72] transition-transform ${gamesOpen ? 'rotate-180' : ''}`} />
              </button>
              {gamesOpen && gameNames.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#0f0f18] shadow-2xl">
                  {gameNames.map((game) => (
                    <button
                      key={game}
                      onMouseDown={() => {
                        setQuery(game);
                        setCategory('Featured');
                        scrollToCatalog();
                        setGamesOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-semibold text-[#a0a0b8] transition-colors hover:bg-[#1e1e2e] hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6C5CE7]" />
                      {game}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={scrollToCatalog} className="transition-colors hover:text-white">Products</button>
            <button className="transition-colors hover:text-white">Discord</button>
            <button onClick={() => document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' })} className="transition-colors hover:text-white">Contact Us</button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-[#a0a0b8] transition-colors hover:text-white"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-2.5 -top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#6C5CE7] px-1.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(108,92,231,0.5)]">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth area — desktop */}
            <div className="hidden sm:flex items-center gap-3 border-l border-[#1e1e2e] pl-5">
              {currentUser ? (
                /* Logged-in user menu */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center gap-2.5 rounded-lg border border-[#1e1e2e] bg-[#13131e] px-3 py-2 text-[13px] font-semibold text-[#a0a0b8] hover:text-white hover:border-[#3a3a4a] transition-colors"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6C5CE7]/20 text-[#6C5CE7]">
                      <User size={13} />
                    </div>
                    {currentUser.username}
                    {currentUser.isAdmin && (
                      <span className="rounded bg-[#6C5CE7]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8B7CF8]">
                        Admin
                      </span>
                    )}
                    <ChevronDown size={13} className={`text-[#5a5a72] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#1e1e2e] bg-[#13131e] shadow-2xl overflow-hidden z-50">
                      <div className="border-b border-[#1e1e2e] px-4 py-3">
                        <p className="text-[12px] font-bold text-white">{currentUser.username}</p>
                        <p className="text-[11px] text-[#5a5a72]">{currentUser.isAdmin ? 'Administrator' : 'Member'}</p>
                      </div>
                      {currentUser.isAdmin && (
                        <button
                          onClick={() => { setShowUserMenu(false); setAdminOpen(true); }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-[#a0a0b8] hover:bg-[#1e1e2e] hover:text-white transition-colors"
                        >
                          <Settings2 size={14} className="text-[#6C5CE7]" /> Admin Panel
                        </button>
                      )}
                      {!currentUser.isAdmin && (
                        <button
                          onClick={openOrderHistory}
                          className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-[#a0a0b8] hover:bg-[#1e1e2e] hover:text-white transition-colors"
                        >
                          <History size={14} className="text-[#6C5CE7]" /> Order History
                        </button>
                      )}
                      <div className="border-t border-[#1e1e2e]">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-[13px] text-[#a0a0b8] hover:bg-[#1e1e2e] hover:text-red-400 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest buttons */
                <>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="text-[13px] font-semibold text-[#a0a0b8] hover:text-white transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthModal('signup')}
                    className="rounded-lg bg-[#6C5CE7] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#7B6FF0] transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNav((v) => !v)}
              className="flex text-[#a0a0b8] lg:hidden"
            >
              {mobileNav ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNav && (
          <nav className="absolute w-full border-b border-[#1e1e2e] bg-[#0f0f18] px-5 py-5 shadow-xl lg:hidden z-40">
            <div className="flex flex-col gap-4 text-[14px] font-semibold text-[#a0a0b8]">
              <button onClick={() => { scrollToCatalog(); setMobileNav(false); }} className="text-left transition-colors hover:text-white">Products</button>
              {/* Games list on mobile */}
              {gameNames.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72]">Games</p>
                  {gameNames.map((game) => (
                    <button
                      key={game}
                      onClick={() => { setQuery(game); setCategory('Featured'); scrollToCatalog(); setMobileNav(false); }}
                      className="flex items-center gap-2 text-left text-[13px] text-[#a0a0b8] transition-colors hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6C5CE7]" />{game}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => { document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' }); setMobileNav(false); }} className="text-left transition-colors hover:text-white">Contact Us</button>

              <div className="pt-2 border-t border-[#1e1e2e]">
                {currentUser ? (
                  <div className="space-y-3">
                    <p className="text-[12px] text-[#5a5a72]">Signed in as <span className="font-bold text-[#8B7CF8]">{currentUser.username}</span></p>
                    {currentUser.isAdmin && (
                      <button onClick={() => { setMobileNav(false); setAdminOpen(true); }} className="flex items-center gap-2 text-[13px] text-[#a0a0b8] hover:text-white transition-colors">
                        <Settings2 size={14} className="text-[#6C5CE7]" /> Admin Panel
                      </button>
                    )}
                    {!currentUser.isAdmin && (
                      <button onClick={() => { setMobileNav(false); openOrderHistory(); }} className="flex items-center gap-2 text-[13px] text-[#a0a0b8] hover:text-white transition-colors">
                        <History size={14} className="text-[#6C5CE7]" /> Order History
                      </button>
                    )}
                    <button onClick={() => { setMobileNav(false); handleLogout(); }} className="flex items-center gap-2 text-[13px] text-[#a0a0b8] hover:text-red-400 transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setMobileNav(false); setAuthModal('login'); }}
                      className="flex-1 rounded-lg border border-[#1e1e2e] bg-[#13131e] py-2.5 text-[13px] font-bold text-white hover:bg-[#1e1e2e] transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { setMobileNav(false); setAuthModal('signup'); }}
                      className="flex-1 rounded-lg bg-[#6C5CE7] py-2.5 text-[13px] font-bold text-white hover:bg-[#7B6FF0] transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-[#09090f]">
        <div className="absolute top-0 right-0 w-full md:w-[60%] h-full z-0 pointer-events-none opacity-40 md:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090f] via-[#09090f]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090f] via-transparent to-transparent z-10" />
          <img src={heroCharacters} alt="" className="w-full h-full object-cover object-left-top opacity-90 mix-blend-screen" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 lg:px-10 py-20 pb-40">
          <div className="max-w-[700px] reveal">
            <h1 className="text-[52px] sm:text-[72px] lg:text-[92px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white mb-6">
              unfair advantage
              <br />
              <span className="text-[#6C5CE7]">guaranteed.</span>
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#a0a0b8] max-w-[480px] mb-10 leading-relaxed font-medium">
              Get ahead with premium game services and digital goods.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={scrollToCatalog} className="rounded-lg bg-[#6C5CE7] px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_30px_rgba(108,92,231,0.3)]">
                Explore Products
              </button>
              <button className="rounded-lg border border-[#2a2a3a] bg-[#0c0c16]/50 backdrop-blur px-8 py-4 text-[15px] font-bold text-[#a0a0b8] transition-all hover:bg-[#1e1e2e] hover:text-white hover:border-[#3a3a4a]">
                Our Discord
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 w-full z-20 translate-y-1/2 px-5 lg:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 rounded-2xl bg-[#0f0f18] p-6 sm:p-10 border border-[#1e1e2e] shadow-2xl relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#1e1e2e] via-[#6C5CE7]/30 to-[#1e1e2e] -z-10" />
              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]"><ShoppingBag size={22} strokeWidth={2.5} /></div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">Trusted since 2025</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">Established and trusted by thousands of players since day one.</p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/4 top-1/2 -translate-y-1/2 h-20 w-px bg-[#1e1e2e]" />
              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]"><Sparkles size={22} strokeWidth={2.5} /></div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">Easy To Use</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">User friendly products, simple installation, and quick setup.</p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-2/4 top-1/2 -translate-y-1/2 h-20 w-px bg-[#1e1e2e]" />
              <div className="hidden sm:block lg:hidden absolute left-1/2 top-1/2 -translate-y-1/2 h-[80%] w-px bg-[#1e1e2e]" />
              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]"><Headphones size={22} strokeWidth={2.5} /></div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">Dedicated Support</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">24/7 support for any of your troubleshooting needs.</p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-3/4 top-1/2 -translate-y-1/2 h-20 w-px bg-[#1e1e2e]" />
              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]"><Zap size={22} strokeWidth={2.5} /></div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">Instant Access</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">Instant delivery and immediate access after purchase.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section id="catalog" className="bg-[#09090f] pt-48 pb-20 relative z-10">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Our Products</h2>
              <p className="text-[#a0a0b8] mt-3 text-[15px]">Browse our premium selection of digital goods and services.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex h-11 w-full sm:w-[280px] items-center gap-2 rounded-lg border border-[#1e1e2e] bg-[#13131e] px-4 text-[#5a5a72] focus-within:border-[#6C5CE7] transition-colors">
                <Search size={16} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#5a5a72]" />
              </label>
              <div className="flex w-full sm:w-auto items-center gap-1 rounded-lg border border-[#1e1e2e] bg-[#13131e] p-1">
                {(['Featured', 'Items', 'Services'] as Category[]).map((filter) => (
                  <button key={filter} onClick={() => setCategory(filter)} className={`flex-1 sm:flex-none rounded-md px-5 py-2 text-[12px] font-bold transition-all ${category === filter ? 'bg-[#1e1e2e] text-white shadow-sm' : 'text-[#a0a0b8] hover:text-white'}`}>{filter}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between border-b border-[#1e1e2e] pb-5">
            <p className="text-[12px] font-semibold tracking-wider text-[#5a5a72] uppercase">{visibleProducts.length} available selections</p>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#a0a0b8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.6)]" /> Updated this week <ChevronDown size={14} />
            </div>
          </div>

          {visibleProducts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  favorite={favorites.includes(product.id)}
                  onFavorite={() => setFavorites((f) => f.includes(product.id) ? f.filter((id) => id !== product.id) : [...f, product.id])}
                  onView={() => setSelected(product)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#1e1e2e] bg-[#0f0f18] px-6 py-24 text-center">
              <Search className="mx-auto text-[#5a5a72] mb-5" size={32} />
              <h3 className="text-xl font-bold text-white">No products found</h3>
              <p className="mt-2 text-[14px] text-[#a0a0b8]">Try adjusting your search or filter.</p>
              <button onClick={() => { setQuery(''); setCategory('Featured'); }} className="mt-6 rounded-lg bg-[#1e1e2e] px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#2a2a3a]">Clear Filters</button>
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST ── */}
      <section id="trust" className="border-t border-[#1e1e2e] bg-[#0c0c16] py-24">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="mb-16 text-center max-w-[600px] mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Buy with confidence.</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#a0a0b8]">The internet has enough sketchy checkout flows. Xtine keeps it simple: clear pricing, human review, and no account access required.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <TrustItem icon={<LockKeyhole size={28} />} title="You stay in control" copy="We never ask for passwords, codes, or account access. Your account remains yours." />
            <TrustItem icon={<Clock3 size={28} />} title="A human checks it" copy="Every transaction reference is matched manually before delivery to ensure quality." />
            <TrustItem icon={<PackageCheck size={28} />} title="Clear next step" copy="You get an email with the review status and delivery details as soon as we finish." />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1e1e2e] bg-[#09090f] py-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-5 sm:flex-row lg:px-10">
          <div className="flex items-center gap-3">
            <Grip size={20} className="text-[#a0a0b8]" />
            <span className="font-display font-extrabold tracking-tight text-white text-[16px]">Xtine<span className="text-[#6C5CE7]">Cheats</span></span>
          </div>
          <p className="text-[13px] text-[#5a5a72] font-medium">© 2025 Xtine Store. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[13px] font-medium text-[#5a5a72] transition-colors hover:text-white">Terms of Service</a>
            <a href="#" className="text-[13px] font-medium text-[#5a5a72] transition-colors hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* ── OVERLAYS ── */}
      {selected && (
        <ProductDetail
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={(durationIndex) => { addToCart(selected, durationIndex); setSelected(null); }}
        />
      )}
      {cartOpen && (
        <CartDrawer
          cartProducts={cartProducts}
          subtotal={subtotal}
          onClose={() => setCartOpen(false)}
          onUpdate={updateQuantity}
          onCheckout={() => { setCartOpen(false); setCheckout(true); }}
        />
      )}
      {checkout && (
        <Checkout
          cartProducts={cartProducts}
          subtotal={subtotal}
          payment={payment}
          setPayment={setPayment}
          txRef={txRef}
          setTxRef={setTxRef}
          copied={copied}
          copyWallet={copyWallet}
          submitted={submitted}
          onClose={() => { setCheckout(false); setSubmitted(false); setTxRef(''); setCart({}); }}
          onSubmit={handleCheckoutSubmit}
        />
      )}

      {/* Stripe payment success overlay */}
      {stripeSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#09090f]/90 p-5 backdrop-blur-md">
          <div className="w-full max-w-[500px] rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] p-8 text-center sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6C5CE7] to-[#8B7CF8]" />
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/20 mb-6">
              <Check size={36} strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] mb-2">Payment Confirmed</p>
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">You're all set.</h2>
            <p className="text-[14px] text-[#a0a0b8] mb-8 font-medium leading-relaxed max-w-[360px] mx-auto">
              Your card payment went through. We'll process your order and send delivery details shortly.
            </p>
            <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5 text-left mb-8">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-4">What happens next</p>
              <div className="space-y-3 text-[13px] text-[#a0a0b8] font-medium">
                <div className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#6C5CE7]/20 text-[#8B7CF8] text-[11px] font-bold">1</span><span>Payment verified by Stripe</span></div>
                <div className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#6C5CE7]/20 text-[#8B7CF8] text-[11px] font-bold">2</span><span>Order queued for fulfillment</span></div>
                <div className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#6C5CE7]/20 text-[#8B7CF8] text-[11px] font-bold">3</span><span>Delivery details sent to your email</span></div>
              </div>
            </div>
            <button
              onClick={() => {
                setStripeSuccess(false);
                setCart({});
                window.history.replaceState({}, '', window.location.pathname);
              }}
              className="w-full rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-colors hover:bg-[#7B6FF0]"
            >
              Back to Store
            </button>
          </div>
        </div>
      )}

      {/* Auth modals */}
      {authModal === 'login' && (
        <LoginModal
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModal(null)}
          onSwitchToSignup={() => setAuthModal('signup')}
        />
      )}
      {authModal === 'signup' && (
        <SignupModal
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModal(null)}
          onSwitchToLogin={() => setAuthModal('login')}
        />
      )}

      {/* Order history */}
      {showOrderHistory && currentUser && (
        <OrderHistoryModal
          orders={userOrders}
          username={currentUser.username}
          onClose={() => setShowOrderHistory(false)}
        />
      )}

      {/* Login success toast */}
      {showToast && currentUser && (
        <LoginToast username={currentUser.username} onDone={() => setShowToast(false)} />
      )}
    </main>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────

function ProductCard({ product, index, favorite, onFavorite, onView }: {
  product: Product; index: number; favorite: boolean; onFavorite: () => void; onView: () => void;
}) {
  const lowestPrice = Math.min(...product.durations.map((d) => d.price));

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#6C5CE7]/40 hover:shadow-[0_15px_30px_-10px_rgba(108,92,231,0.15)] reveal"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        role="button" tabIndex={0} onClick={onView}
        onKeyDown={(e) => { if (e.key === 'Enter') onView(); }}
        className="relative h-[220px] w-full cursor-pointer bg-[#13131e] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#13131e] to-[#0f0f18] z-0" />
        {product.image ? (
          <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        ) : (
          <>
            <div className="absolute h-40 w-40 rounded-full bg-[#6C5CE7]/10 blur-3xl group-hover:bg-[#6C5CE7]/20 transition-colors duration-500 z-0" />
            <div className="z-10 relative text-[#1e1e2e] group-hover:text-[#6C5CE7]/30 transition-colors duration-500 transform group-hover:scale-110">
              <Gamepad2 size={72} strokeWidth={1} />
            </div>
          </>
        )}
        <div className="absolute left-4 top-4 z-20">
          <span className="rounded bg-[#0f0f18]/80 backdrop-blur border border-[#1e1e2e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a0a0b8] group-hover:text-[#8B7CF8] group-hover:border-[#6C5CE7]/30 transition-colors">
            {product.tag}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(); }}
          className={`absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#0f0f18]/80 backdrop-blur transition-colors ${favorite ? 'text-[#6C5CE7] border-[#6C5CE7]/30' : 'text-[#a0a0b8] hover:text-white hover:bg-[#1e1e2e]'}`}
        >
          <Heart size={14} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-[11px] font-bold text-[#5a5a72] uppercase tracking-wider mb-1">{product.game}</p>
            <h3 className="text-[17px] font-bold text-white tracking-tight">{product.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#5a5a72] font-medium">from</p>
            <p className="text-[17px] font-bold text-[#8B7CF8]">${lowestPrice.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[#1e1e2e] pt-5">
          <span className="text-[12px] font-medium text-[#a0a0b8]">{product.note}</span>
          <button onClick={onView} className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-4 py-2 text-[12px] font-bold text-white transition-all hover:bg-[#6C5CE7] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)]">
            View <Plus size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── PRODUCT DETAIL ────────────────────────────────────────────────────────────

function ProductDetail({ product, onClose, onAdd }: {
  product: Product; onClose: () => void; onAdd: (durationIndex: number) => void;
}) {
  const [selectedDuration, setSelectedDuration] = useState(0);
  const chosen = product.durations[selectedDuration];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#09090f]/90 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="relative max-h-[92dvh] w-full max-w-[950px] overflow-hidden rounded-t-3xl border border-[#1e1e2e] bg-[#0f0f18] shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-2xl flex flex-col">
        <button onClick={onClose} className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#13131e] text-[#a0a0b8] border border-[#1e1e2e] hover:text-white transition-colors">
          <X size={18} />
        </button>
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[1fr_1.1fr]">
            <div className="flex min-h-[280px] md:min-h-[420px] items-center justify-center bg-[#13131e] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#13131e] to-[#0f0f18] z-0" />
              <div className="absolute h-64 w-64 rounded-full bg-[#6C5CE7]/10 blur-3xl z-0" />
              {product.image ? (
                <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover z-10 opacity-90" />
              ) : (
                <Gamepad2 size={120} strokeWidth={1} className="text-[#6C5CE7]/20 z-10" />
              )}
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] mb-2">{product.type}</p>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">{product.name}</h2>
              <p className="text-[13px] font-bold text-[#5a5a72] uppercase tracking-wider mb-5">{product.game}</p>
              <p className="text-[15px] leading-relaxed text-[#a0a0b8] mb-6 font-medium">{product.description}</p>
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-3">Select Duration</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {product.durations.map((d, i) => (
                    <button key={i} onClick={() => setSelectedDuration(i)} className={`flex flex-col items-center rounded-xl border py-3 px-2 transition-all ${selectedDuration === i ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 shadow-[0_0_15px_rgba(108,92,231,0.15)]' : 'border-[#1e1e2e] bg-[#13131e] hover:border-[#3a3a4a]'}`}>
                      <span className={`text-[11px] font-bold ${selectedDuration === i ? 'text-[#8B7CF8]' : 'text-[#a0a0b8]'}`}>{d.label}</span>
                      <span className={`text-[15px] font-extrabold mt-1 ${selectedDuration === i ? 'text-white' : 'text-[#a0a0b8]'}`}>${d.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-0.5">Delivery</p>
                  <p className="text-[13px] font-semibold text-white">{product.eta}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-0.5">Total</p>
                  <p className="text-[20px] font-extrabold text-[#8B7CF8]">${chosen?.price.toFixed(2)} USD</p>
                </div>
              </div>
              <button onClick={() => onAdd(selectedDuration)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)]">
                Add to Bag — {chosen?.label} <ShoppingCart size={16} />
              </button>
            </div>
          </div>
          {product.features.length > 0 && (
            <div className="border-t border-[#1e1e2e] px-8 py-10">
              <h3 className="text-[22px] font-extrabold text-white mb-6">Feature <span className="text-[#6C5CE7]">Overview</span></h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {product.features.map((group) => (
                  <div key={group.id} className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#6C5CE7] mb-4">{group.title}</p>
                    <ul className="space-y-2">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#a0a0b8]">
                          <Check size={13} className="mt-0.5 shrink-0 text-[#6C5CE7]" strokeWidth={2.5} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CART DRAWER ───────────────────────────────────────────────────────────────

function CartDrawer({ cartProducts, subtotal, onClose, onUpdate, onCheckout }: {
  cartProducts: { product: Product; entry: CartEntry }[];
  subtotal: number; onClose: () => void;
  onUpdate: (id: string, amount: number) => void; onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#09090f]/80 backdrop-blur-sm">
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-[#1e1e2e] bg-[#0f0f18] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e1e2e] px-7 py-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-1">Your Selection</p>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">The Bag <span className="text-[#6C5CE7]">({cartProducts.length})</span></h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#a0a0b8] hover:text-white transition-colors"><X size={18} /></button>
        </div>
        {cartProducts.length ? (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-7">
              {cartProducts.map(({ product, entry }) => {
                const duration = product.durations[entry.durationIndex];
                return (
                  <div key={product.id} className="flex gap-4 rounded-xl border border-[#1e1e2e] bg-[#13131e] p-4">
                    <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-lg bg-[#0f0f18] border border-[#1e1e2e] overflow-hidden">
                      {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <Gamepad2 size={32} strokeWidth={1.5} className="text-[#6C5CE7]/40" />}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="truncate text-[14px] font-bold text-white">{product.name}</p>
                          <p className="mt-0.5 text-[11px] font-bold text-[#6C5CE7]">{duration?.label}</p>
                        </div>
                        <p className="text-[14px] font-bold text-[#8B7CF8]">${((duration?.price ?? 0) * entry.qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-md bg-[#0f0f18] border border-[#1e1e2e] p-0.5 w-fit mt-2">
                        <button onClick={() => onUpdate(product.id, -1)} className="flex h-6 w-6 items-center justify-center rounded text-[#a0a0b8] hover:text-white hover:bg-[#1e1e2e]"><Minus size={12} /></button>
                        <span className="w-6 text-center text-[12px] font-bold text-white">{entry.qty}</span>
                        <button onClick={() => onUpdate(product.id, 1)} className="flex h-6 w-6 items-center justify-center rounded text-[#a0a0b8] hover:text-white hover:bg-[#1e1e2e]"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#1e1e2e] p-7 bg-[#0c0c16]">
              <div className="mb-5 flex justify-between items-center">
                <span className="text-[14px] font-medium text-[#a0a0b8]">Subtotal</span>
                <span className="text-[18px] font-extrabold text-white">${subtotal.toFixed(2)} USD</span>
              </div>
              <button onClick={onCheckout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)]">
                Continue to Review <ArrowRight size={16} />
              </button>
              <p className="mt-4 text-center text-[11px] font-medium text-[#5a5a72]">Payment is reviewed manually before delivery.</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#5a5a72]"><ShoppingBag size={28} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Your bag is quiet.</h3>
            <p className="text-[14px] text-[#a0a0b8] max-w-[240px] leading-relaxed">Start with a considered drop, then come back here when it feels right.</p>
            <button onClick={onClose} className="mt-8 rounded-lg border border-[#1e1e2e] bg-[#13131e] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#1e1e2e] hover:border-[#3a3a4a]">Keep Browsing</button>
          </div>
        )}
      </aside>
    </div>
  );
}

// ── CHECKOUT ──────────────────────────────────────────────────────────────────

function Checkout({ cartProducts, subtotal, payment, setPayment, txRef, setTxRef, copied, copyWallet, submitted, onClose, onSubmit }: {
  cartProducts: { product: Product; entry: CartEntry }[];
  subtotal: number; payment: string; setPayment: (v: string) => void;
  txRef: string; setTxRef: (v: string) => void; copied: boolean;
  copyWallet: () => void; submitted: boolean; onClose: () => void; onSubmit: () => void;
}) {
  const [method, setMethod] = useState<'stripe' | 'crypto'>('stripe');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');

  const handleStripePay = async () => {
    setStripeError('');
    setStripeLoading(true);
    try {
      const items = cartProducts.map(({ product, entry }) => ({
        name: product.name,
        duration: product.durations[entry.durationIndex]?.label ?? '',
        price: product.durations[entry.durationIndex]?.price ?? 0,
        qty: entry.qty,
      }));
      const { url } = await createStripeCheckoutSession(items);
      // Navigate the top-level window so Stripe's checkout page
      // isn't blocked by X-Frame-Options inside an iframe (e.g. Replit preview).
      if (window.top && window.top !== window) {
        window.top.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (err) {
      console.error('[Stripe] checkout error:', err);
      setStripeError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStripeLoading(false);
    }
  };

  // ── Crypto submitted success screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#09090f]/90 p-5 backdrop-blur-md">
        <div className="w-full max-w-[500px] rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] p-8 text-center sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#6C5CE7]" />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/20 mb-6"><Check size={36} strokeWidth={2.5} /></div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] mb-2">Reference Received</p>
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">You're in the queue.</h2>
          <p className="text-[14px] text-[#a0a0b8] mb-8 font-medium leading-relaxed max-w-[360px] mx-auto">We'll match your transaction and send delivery details to your inbox. Most reviews land within 20 minutes.</p>
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5 text-left mb-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-4">What happens next</p>
            <div className="space-y-4 text-[13px] text-[#a0a0b8] font-medium">
              <div className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1e1e2e] text-white text-[11px] font-bold">1</span><span>Transaction matched against your order</span></div>
              <div className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1e1e2e] text-white text-[11px] font-bold">2</span><span>Delivery details sent by email</span></div>
            </div>
          </div>
          <button onClick={onClose} className="w-full rounded-xl bg-[#1e1e2e] py-4 text-[14px] font-bold text-white transition-colors hover:bg-[#2a2a3a]">Return to Store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#09090f]/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[#1e1e2e] px-7 py-5 flex items-center justify-between bg-[#0c0c16]">
          <h2 className="text-[18px] font-extrabold text-white tracking-tight">Checkout</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#a0a0b8] hover:text-white transition-colors"><X size={16} /></button>
        </div>

        <div className="p-7">
          {/* Amount */}
          <div className="mb-6 rounded-xl border border-[#1e1e2e] bg-[#13131e] p-4 flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#5a5a72]">Amount Due</span>
            <span className="text-2xl font-extrabold text-[#8B7CF8]">${subtotal.toFixed(2)} USD</span>
          </div>

          {/* Payment method tabs */}
          <div className="mb-6 flex gap-2 rounded-xl border border-[#1e1e2e] bg-[#13131e] p-1">
            <button
              onClick={() => setMethod('stripe')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-bold transition-all ${method === 'stripe' ? 'bg-[#6C5CE7] text-white shadow-[0_0_12px_rgba(108,92,231,0.25)]' : 'text-[#a0a0b8] hover:text-white'}`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>
              Card (Stripe)
            </button>
            <button
              onClick={() => setMethod('crypto')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-bold transition-all ${method === 'crypto' ? 'bg-[#1e1e2e] text-white' : 'text-[#a0a0b8] hover:text-white'}`}
            >
              ₿ Crypto
            </button>
          </div>

          {/* Stripe tab */}
          {method === 'stripe' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#6C5CE7]/20 bg-[#6C5CE7]/5 p-5">
                <p className="text-[13px] font-semibold text-[#a0a0b8] leading-relaxed">
                  You'll be taken to Stripe's secure checkout page to enter your card details. After payment you'll be redirected back automatically.
                </p>
              </div>
              {stripeError && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">{stripeError}</p>
              )}
              <button
                onClick={handleStripePay}
                disabled={stripeLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {stripeLoading ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Connecting to Stripe…</>
                ) : (
                  <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg> Pay ${subtotal.toFixed(2)} with Stripe</>
                )}
              </button>
              <p className="text-center text-[11px] font-medium text-[#5a5a72]">Secured by Stripe · All major cards accepted</p>
            </div>
          )}

          {/* Crypto tab */}
          {method === 'crypto' && (
            <div className="space-y-5">
              <div>
                <label className="text-[13px] font-bold text-white block mb-3">Select Cryptocurrency</label>
                <div className="grid grid-cols-4 gap-3">
                  {['BTC', 'LTC', 'ETH', 'SOL'].map((coin) => (
                    <button key={coin} onClick={() => setPayment(coin)} className={`rounded-lg border py-3 text-[13px] font-bold transition-all ${payment === coin ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white shadow-[0_0_15px_rgba(108,92,231,0.2)]' : 'border-[#1e1e2e] bg-[#13131e] text-[#a0a0b8] hover:border-[#3a3a4a] hover:text-white'}`}>{coin}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-white block mb-3">Send to Address</label>
                <div className="flex items-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#13131e] p-1.5">
                  <input readOnly value={wallets[payment]} className="flex-1 bg-transparent px-3 text-[13px] font-medium text-white outline-none" />
                  <button onClick={copyWallet} className="flex h-10 items-center gap-2 rounded-lg bg-[#1e1e2e] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#2a2a3a]">
                    {copied ? <Check size={14} className="text-[#00d4aa]" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-bold text-white block mb-3">Transaction Hash / Reference</label>
                <input value={txRef} onChange={(e) => setTxRef(e.target.value)} placeholder="Paste your tx hash here..." className="w-full rounded-xl border border-[#1e1e2e] bg-[#13131e] px-5 py-3.5 text-[14px] text-white outline-none focus:border-[#6C5CE7] transition-colors placeholder:text-[#5a5a72] font-medium" />
              </div>
              <button disabled={!txRef} onClick={onSubmit} className="flex w-full items-center justify-center rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#6C5CE7] disabled:hover:shadow-none">
                Submit Payment Reference
              </button>
              <p className="text-center text-[11px] font-medium text-[#5a5a72]">Manual review · Delivery confirmed after verification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TRUST ITEM ────────────────────────────────────────────────────────────────

function TrustItem({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] p-8 text-center transition-transform hover:-translate-y-1.5 group shadow-lg">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#13131e] text-[#a0a0b8] border border-[#1e1e2e] group-hover:text-[#6C5CE7] group-hover:border-[#6C5CE7]/40 group-hover:bg-[#6C5CE7]/10 group-hover:shadow-[0_0_20px_rgba(108,92,231,0.2)] transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-[18px] font-bold text-white mb-3">{title}</h3>
      <p className="text-[14px] text-[#5a5a72] leading-relaxed font-medium max-w-[280px] mx-auto">{copy}</p>
    </div>
  );
}

export default App;
