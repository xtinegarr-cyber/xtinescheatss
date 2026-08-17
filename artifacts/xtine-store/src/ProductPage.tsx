import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import {
  ArrowLeft,
  Check,
  Gamepad2,
  Grip,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-react';
import { loadProducts, fetchProductsFromAPI } from './data';
import { toSlug } from './utils';
import type { Product, CartEntry } from './types';

const CART_KEY = 'xtine_cart_v1';

function readCart(): Record<string, CartEntry> {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CartEntry>) : {};
  } catch {
    return {};
  }
}

function writeCart(cart: Record<string, CartEntry>) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch { /* ignore */ }
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(() =>
    Object.values(readCart()).reduce((s, e) => s + e.qty, 0)
  );

  // Fetch from API so the product list is always up-to-date
  useEffect(() => {
    fetchProductsFromAPI().then((api) => { if (api) setProducts(api); });
  }, []);

  const product = products
    .filter((p) => p.listed)
    .find((p) => toSlug(p.name) === slug);

  const addToCart = () => {
    if (!product) return;
    const cart = readCart();
    const existing = cart[product.id];
    cart[product.id] = {
      durationIndex: selectedDuration,
      qty: (existing?.qty ?? 0) + 1,
    };
    writeCart(cart);
    setCartCount(Object.values(cart).reduce((s, e) => s + e.qty, 0));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#09090f] text-white">
        <Gamepad2 size={64} className="text-[#1e1e2e]" strokeWidth={1} />
        <div className="text-center">
          <h1 className="text-2xl font-extrabold">Product not found</h1>
          <p className="mt-2 text-[#5a5a72]">This product doesn't exist or has been removed.</p>
        </div>
        <Link to="/" className="rounded-xl bg-[#6C5CE7] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#7B6FF0] transition-colors">
          ← Back to Store
        </Link>
      </div>
    );
  }

  const chosen = product.durations[selectedDuration];
  const lowestPrice = Math.min(...product.durations.map((d) => d.price));

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#0c0c16]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#a0a0b8] transition-colors hover:text-white"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="h-4 w-px bg-[#1e1e2e]" />
            <Link to="/" className="flex items-center gap-2">
              <Grip size={20} className="text-[#a0a0b8]" />
              <span className="text-[17px] font-extrabold tracking-tight text-white">
                Xtine<span className="text-[#6C5CE7]">Cheats</span>
              </span>
            </Link>
          </div>
          <Link
            to="/"
            onClick={() => {
              // signal App.tsx to open cart when it mounts
              sessionStorage.setItem('openCart', '1');
            }}
            className="relative text-[#a0a0b8] transition-colors hover:text-white"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#6C5CE7] px-1.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-10 lg:px-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-[12px] text-[#5a5a72]">
          <Link to="/" className="hover:text-[#a0a0b8] transition-colors">Store</Link>
          <span>/</span>
          <span className="text-[#a0a0b8]">{product.name}</span>
        </nav>

        {/* Main content grid */}
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* Left — image */}
          <div className="relative overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#13131e]" style={{ minHeight: 360 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#13131e] to-[#0f0f18]" />
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6C5CE7]/10 blur-3xl" />
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
            ) : (
              <div className="flex h-full min-h-[360px] items-center justify-center">
                <Gamepad2 size={120} strokeWidth={1} className="text-[#6C5CE7]/20" />
              </div>
            )}
            {product.tag && (
              <div className="absolute left-5 top-5 z-10">
                <span className="rounded-lg border border-[#1e1e2e] bg-[#0f0f18]/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8B7CF8] backdrop-blur">
                  {product.tag}
                </span>
              </div>
            )}
          </div>

          {/* Right — details + purchase */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7]">{product.type}</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">{product.name}</h1>
              {product.game && (
                <p className="mt-1.5 text-[13px] font-bold uppercase tracking-wider text-[#5a5a72]">{product.game}</p>
              )}
            </div>

            <p className="text-[15px] leading-relaxed text-[#a0a0b8]">{product.description}</p>

            {/* Duration picker */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5a5a72]">Select Duration</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {product.durations.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDuration(i)}
                    className={`flex flex-col items-center rounded-xl border px-2 py-3 transition-all ${
                      selectedDuration === i
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 shadow-[0_0_15px_rgba(108,92,231,0.15)]'
                        : 'border-[#1e1e2e] bg-[#13131e] hover:border-[#3a3a4a]'
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${selectedDuration === i ? 'text-[#8B7CF8]' : 'text-[#a0a0b8]'}`}>{d.label}</span>
                    <span className={`mt-1 text-[15px] font-extrabold ${selectedDuration === i ? 'text-white' : 'text-[#a0a0b8]'}`}>${d.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery + total */}
            <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-0.5">Delivery</p>
                <p className="text-[13px] font-semibold text-white">{product.eta}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-0.5">Total</p>
                <p className="text-[22px] font-extrabold text-[#8B7CF8]">${chosen?.price.toFixed(2)} USD</p>
              </div>
            </div>

            {/* Add to bag */}
            <button
              onClick={addToCart}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-[15px] font-bold transition-all ${
                added
                  ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/30 text-[#00d4aa]'
                  : 'bg-[#6C5CE7] text-white hover:bg-[#7B6FF0] hover:shadow-[0_0_25px_rgba(108,92,231,0.4)]'
              }`}
            >
              {added ? (
                <><Check size={16} /> Added to Bag</>
              ) : (
                <><ShoppingBag size={16} /> Add to Bag — {chosen?.label}</>
              )}
            </button>

            {/* Go to bag button shown after adding */}
            {added && (
              <Link
                to="/"
                onClick={() => sessionStorage.setItem('openCart', '1')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#13131e] py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#1e1e2e]"
              >
                <ShoppingCart size={14} /> View Bag & Checkout
              </Link>
            )}

            {/* From price note */}
            <p className="text-center text-[12px] text-[#3a3a4a]">
              Starting from ${lowestPrice.toFixed(2)} · Secure checkout via Stripe or crypto
            </p>
          </div>
        </div>

        {/* Feature overview */}
        {product.features.length > 0 && (
          <div className="mt-14 border-t border-[#1e1e2e] pt-12">
            <h2 className="mb-8 text-[28px] font-extrabold tracking-tight text-white">
              Feature <span className="text-[#6C5CE7]">Overview</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.features.map((group) => (
                <div key={group.id} className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5">
                  <p className="mb-4 text-[11px] font-extrabold uppercase tracking-wider text-[#6C5CE7]">{group.title}</p>
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
      </main>
    </div>
  );
}
