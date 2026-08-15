import { type ReactNode, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Gamepad2,
  Grip,
  Headphones,
  Heart,
  LockKeyhole,
  LogOut,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import heroCharacters from './assets/hero-characters.png';

type Category = 'Featured' | 'Items' | 'Services';
type Product = {
  id: string;
  name: string;
  game: string;
  category: Exclude<Category, 'Featured'>;
  price: number;
  oldPrice?: number;
  note: string;
  tag: string;
  art: string;
  description: string;
  eta: string;
  type: string;
};

const products: Product[] = [
  {
    id: 'nebula-bundle',
    name: 'Nebula Bundle',
    game: 'Apex-inspired collection',
    category: 'Items',
    price: 24,
    oldPrice: 32,
    note: '3 curated cosmetics',
    tag: 'Popular',
    art: '',
    description: 'A hand-picked set of celestial cosmetics with a clean, competitive silhouette.',
    eta: 'Instant delivery',
    type: 'Cosmetic bundle',
  },
  {
    id: 'velocity-pack',
    name: 'Velocity Pack',
    game: 'Tactical shooter collection',
    category: 'Items',
    price: 18,
    note: 'Limited colorway',
    tag: 'New drop',
    art: 'teal',
    description: 'Bright signal tones and sharp geometry for a loadout that reads fast in every lobby.',
    eta: 'Instant delivery',
    type: 'Skin pack',
  },
  {
    id: 'ranked-placement',
    name: 'Ranked Placement',
    game: 'Competitive player service',
    category: 'Services',
    price: 45,
    note: 'Per 5 games',
    tag: 'Most requested',
    art: 'rose',
    description: 'A focused five-game session with a vetted player. You keep full account control throughout.',
    eta: 'Starts within 2 hours',
    type: 'Player service',
  },
  {
    id: 'spectrum-knife',
    name: 'Spectrum Knife',
    game: 'Tactical shooter collection',
    category: 'Items',
    price: 64,
    note: 'Edition 04 / 50',
    tag: 'Rare',
    art: 'violet',
    description: 'An original, prismatic melee concept for collectors who prefer the unusual angle.',
    eta: 'Instant delivery',
    type: 'Cosmetic item',
  },
  {
    id: 'duo-coaching',
    name: 'Duo Coaching',
    game: 'Competitive player service',
    category: 'Services',
    price: 30,
    note: '60 minute session',
    tag: '1:1 session',
    art: 'teal',
    description: 'A private review and live session built around your habits, not a generic playbook.',
    eta: 'Book a time',
    type: 'Player service',
  },
  {
    id: 'midnight-set',
    name: 'Midnight Set',
    game: 'Arena collection',
    category: 'Items',
    price: 38,
    note: '2 finishers + charm',
    tag: 'Curated',
    art: 'rose',
    description: 'A low-light set with a soft red edge, selected to make a collection feel complete.',
    eta: 'Instant delivery',
    type: 'Cosmetic bundle',
  },
];

const wallets: Record<string, string> = {
  BTC: 'bc1q-xtine-review-7m4k-8w2p',
  LTC: 'ltc1q-xtine-review-3t6v-1n9x',
  ETH: '0xXtineReviewWallet8c4e',
  SOL: 'XtineReview9Qh4m2K7p',
};

function App() {
  const [category, setCategory] = useState<Category>('Featured');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [payment, setPayment] = useState('BTC');
  const [txRef, setTxRef] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const visibleProducts = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return products.filter((product) => {
      const matchesCategory = category === 'Featured' || product.category === category;
      const matchesQuery = !normalized || `${product.name} ${product.game} ${product.type}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const cartItems = products.filter((product) => cart[product.id]);
  const itemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const subtotal = cartItems.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0);

  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    setCartOpen(true);
  };
  const updateQuantity = (id: string, amount: number) => {
    setCart((current) => {
      const next = { ...current, [id]: (current[id] ?? 0) + amount };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  };
  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(wallets[payment]);
    } catch {
      // Clipboard may be unavailable in a preview; the confirmation still gives clear feedback.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const scrollToCatalog = () => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="noise min-h-[100dvh] overflow-x-hidden bg-[#09090f] text-white selection:bg-[#6C5CE7] selection:text-white">
      
      <header className="relative z-50 border-b border-[#1e1e2e] bg-[#0c0c16]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 lg:px-10">
          
          <button data-testid="button-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-3">
            <Grip size={22} className="text-[#a0a0b8] transition-colors group-hover:text-white" />
            <span className="font-display text-[19px] font-extrabold tracking-[-.03em] text-white">XTINE</span>
          </button>

          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#a0a0b8] lg:flex">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white">Home</button>
            <button className="flex items-center gap-1.5 transition-colors hover:text-white">Games <ChevronDown size={14} className="text-[#5a5a72]" /></button>
            <button className="transition-colors hover:text-white">Status</button>
            <button className="transition-colors hover:text-white">Reviews</button>
            <button data-testid="button-nav-shop" onClick={scrollToCatalog} className="transition-colors hover:text-white">Products</button>
            <button className="transition-colors hover:text-white">Discord</button>
            <button data-testid="button-nav-how" onClick={() => document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' })} className="transition-colors hover:text-white">Contact Us</button>
            <button className="flex items-center gap-1.5 transition-colors hover:text-white">More <ChevronDown size={14} className="text-[#5a5a72]" /></button>
          </nav>

          <div className="flex items-center gap-6">
            <button data-testid="button-open-cart" onClick={() => setCartOpen(true)} className="relative text-[#a0a0b8] transition-colors hover:text-white">
              <ShoppingCart size={20} />
              {itemCount > 0 && <span data-testid="text-cart-count" className="absolute -right-2.5 -top-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#6C5CE7] px-1.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(108,92,231,0.5)]">{itemCount}</span>}
            </button>
            <button className="relative hidden text-[#a0a0b8] transition-colors hover:text-white sm:block">
              <Bell size={20} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#6C5CE7] border-2 border-[#0c0c16]" />
            </button>
            
            <div className="hidden items-center gap-3 border-l border-[#1e1e2e] pl-6 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#13131e] text-[#a0a0b8] border border-[#1e1e2e]">
                <User size={16} />
              </div>
              <span className="text-[13px] font-semibold text-[#a0a0b8]">xtinegar</span>
              <button className="ml-1 text-[#5a5a72] transition-colors hover:text-white">
                <LogOut size={16} />
              </button>
            </div>
            
            <button data-testid="button-mobile-menu" onClick={() => setMobileNav((open) => !open)} className="flex text-[#a0a0b8] lg:hidden">
              {mobileNav ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {mobileNav && (
          <nav className="absolute w-full border-b border-[#1e1e2e] bg-[#0f0f18] px-5 py-4 shadow-xl lg:hidden z-40">
            <div className="flex flex-col gap-4 text-[14px] font-semibold text-[#a0a0b8]">
              <button data-testid="button-mobile-shop" onClick={() => { scrollToCatalog(); setMobileNav(false); }} className="text-left transition-colors hover:text-white">Products</button>
              <button data-testid="button-mobile-services" onClick={() => { setCategory('Services'); scrollToCatalog(); setMobileNav(false); }} className="text-left transition-colors hover:text-white">Services</button>
              <button data-testid="button-mobile-how" onClick={() => { document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' }); setMobileNav(false); }} className="text-left transition-colors hover:text-white">Contact Us</button>
            </div>
          </nav>
        )}
      </header>

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
              Your advantage,
              <br />
              <span className="text-[#6C5CE7]">guaranteed.</span>
            </h1>
            <p className="text-[16px] sm:text-[18px] text-[#a0a0b8] max-w-[480px] mb-10 leading-relaxed font-medium">
              Get ahead with premium game services and digital goods.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button data-testid="button-browse-drops" onClick={scrollToCatalog} className="rounded-lg bg-[#6C5CE7] px-8 py-4 text-[15px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_30px_rgba(108,92,231,0.3)]">
                Explore Products
              </button>
              <button className="rounded-lg border border-[#2a2a3a] bg-[#0c0c16]/50 backdrop-blur px-8 py-4 text-[15px] font-bold text-[#a0a0b8] transition-all hover:bg-[#1e1e2e] hover:text-white hover:border-[#3a3a4a]">
                Our Discord
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full z-20 translate-y-1/2 px-5 lg:px-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 rounded-2xl bg-[#0f0f18] p-6 sm:p-10 border border-[#1e1e2e] shadow-2xl relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#1e1e2e] via-[#6C5CE7]/30 to-[#1e1e2e] -z-10" />
              
              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]">
                  <ShoppingBag size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">70,000+ products sold</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">Wide variety of products and over 70,000 products sold!</p>
                </div>
              </div>
              
              <div className="hidden lg:block absolute left-1/4 top-1/2 -translate-y-1/2 h-20 w-px bg-[#1e1e2e]" />
              
              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]">
                  <Sparkles size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">Easy To Use</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">User friendly products, simple installation, and quick setup.</p>
                </div>
              </div>

              <div className="hidden lg:block absolute left-2/4 top-1/2 -translate-y-1/2 h-20 w-px bg-[#1e1e2e]" />
              <div className="hidden sm:block lg:hidden absolute left-1/2 top-1/2 -translate-y-1/2 h-[80%] w-px bg-[#1e1e2e]" />

              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]">
                  <Headphones size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">Dedicated Support</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">24/7 support for any of your troubleshooting needs.</p>
                </div>
              </div>
              
              <div className="hidden lg:block absolute left-3/4 top-1/2 -translate-y-1/2 h-20 w-px bg-[#1e1e2e]" />

              <div className="flex items-start gap-5 relative z-10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#13131e] border border-[#1e1e2e] text-[#6C5CE7]">
                  <Zap size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px] mb-1.5 tracking-tight">Instant Access</h4>
                  <p className="text-[#5a5a72] text-[13px] leading-relaxed">Instant delivery and immediate access after purchase.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <input data-testid="input-search-header" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-[#5a5a72]" />
              </label>
              
              <div className="flex w-full sm:w-auto items-center gap-1 rounded-lg border border-[#1e1e2e] bg-[#13131e] p-1">
                {(['Featured', 'Items', 'Services'] as Category[]).map((filter) => (
                  <button data-testid={`button-filter-${filter.toLowerCase()}`} key={filter} onClick={() => setCategory(filter)} className={`flex-1 sm:flex-none rounded-md px-5 py-2 text-[12px] font-bold transition-all ${category === filter ? 'bg-[#1e1e2e] text-white shadow-sm' : 'text-[#a0a0b8] hover:text-white'}`}>{filter}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between border-b border-[#1e1e2e] pb-5">
            <p data-testid="text-catalog-count" className="text-[12px] font-semibold tracking-wider text-[#5a5a72] uppercase">{visibleProducts.length} available selections</p>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#a0a0b8]"><span className="h-1.5 w-1.5 rounded-full bg-[#00d4aa] shadow-[0_0_8px_rgba(0,212,170,0.6)]" /> Updated this week <ChevronDown size={14} /></div>
          </div>

          {visibleProducts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} favorite={favorites.includes(product.id)} onFavorite={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} onView={() => setSelected(product)} onAdd={() => addToCart(product)} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#1e1e2e] bg-[#0f0f18] px-6 py-24 text-center">
              <Search className="mx-auto text-[#5a5a72] mb-5" size={32} />
              <h3 className="text-xl font-bold text-white">No products found</h3>
              <p className="mt-2 text-[14px] text-[#a0a0b8]">Try adjusting your search or filter to find what you're looking for.</p>
              <button data-testid="button-clear-search" onClick={() => { setQuery(''); setCategory('Featured'); }} className="mt-6 rounded-lg bg-[#1e1e2e] px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#2a2a3a]">Clear Filters</button>
            </div>
          )}
        </div>
      </section>

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

      <footer className="border-t border-[#1e1e2e] bg-[#09090f] py-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-5 sm:flex-row lg:px-10">
          <div className="flex items-center gap-3">
            <Grip size={20} className="text-[#a0a0b8]" />
            <span className="font-display font-extrabold tracking-tight text-white text-[16px]">XTINE</span>
          </div>
          <p className="text-[13px] text-[#5a5a72] font-medium">© 2025 Xtine Store. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[13px] font-medium text-[#5a5a72] transition-colors hover:text-white">Terms of Service</a>
            <a href="#" className="text-[13px] font-medium text-[#5a5a72] transition-colors hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} onAdd={() => { addToCart(selected); setSelected(null); }} />}
      {cartOpen && <CartDrawer cartItems={cartItems} cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onCheckout={() => { setCartOpen(false); setCheckout(true); }} />}
      {checkout && <Checkout cartItems={cartItems} subtotal={subtotal} payment={payment} setPayment={setPayment} txRef={txRef} setTxRef={setTxRef} copied={copied} copyWallet={copyWallet} submitted={submitted} onClose={() => setCheckout(false)} onSubmit={() => setSubmitted(true)} />}
    </main>
  );
}

function ProductCard({ product, index, favorite, onFavorite, onView, onAdd }: { product: Product; index: number; favorite: boolean; onFavorite: () => void; onView: () => void; onAdd: () => void }) {
  return (
    <article data-testid={`card-product-${product.id}`} className="group relative overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#6C5CE7]/40 hover:shadow-[0_15px_30px_-10px_rgba(108,92,231,0.15)] reveal" style={{ animationDelay: `${index * 80}ms` }}>
      <div data-testid={`button-view-${product.id}`} role="button" tabIndex={0} onClick={onView} onKeyDown={(e) => { if (e.key === 'Enter') onView(); }} className="relative h-[220px] w-full cursor-pointer bg-[#13131e] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13131e] to-[#0f0f18] z-0" />
        
        <div className="absolute h-40 w-40 rounded-full bg-[#6C5CE7]/10 blur-3xl group-hover:bg-[#6C5CE7]/20 transition-colors duration-500 z-0" />
        
        <div className="z-10 relative text-[#1e1e2e] group-hover:text-[#6C5CE7]/30 transition-colors duration-500 transform group-hover:scale-110">
          <Gamepad2 size={72} strokeWidth={1} />
        </div>
        
        <div className="absolute left-4 top-4 z-20">
          <span className="rounded bg-[#0f0f18]/80 backdrop-blur border border-[#1e1e2e] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a0a0b8] group-hover:text-[#8B7CF8] group-hover:border-[#6C5CE7]/30 transition-colors">
            {product.tag}
          </span>
        </div>
        
        <button data-testid={`button-favorite-${product.id}`} onClick={(e) => { e.stopPropagation(); onFavorite(); }} className={`absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e1e2e] bg-[#0f0f18]/80 backdrop-blur transition-colors ${favorite ? 'text-[#6C5CE7] border-[#6C5CE7]/30' : 'text-[#a0a0b8] hover:text-white hover:bg-[#1e1e2e]'}`}>
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
            <p className="text-[17px] font-bold text-[#8B7CF8]">${product.price.toFixed(2)}</p>
            {product.oldPrice && <p className="text-[12px] font-medium text-[#5a5a72] line-through mt-0.5">${product.oldPrice.toFixed(2)}</p>}
          </div>
        </div>
        
        <div className="mt-5 flex items-center justify-between border-t border-[#1e1e2e] pt-5">
          <span className="text-[12px] font-medium text-[#a0a0b8]">{product.note}</span>
          <button data-testid={`button-add-${product.id}`} onClick={onAdd} className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-4 py-2 text-[12px] font-bold text-white transition-all hover:bg-[#6C5CE7] hover:shadow-[0_0_15px_rgba(108,92,231,0.3)]">
            Add to Bag <Plus size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

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

function ProductDetail({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#09090f]/90 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="relative max-h-[92dvh] w-full max-w-[850px] overflow-hidden rounded-t-3xl border border-[#1e1e2e] bg-[#0f0f18] shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-2xl flex flex-col">
        <button data-testid="button-close-detail" onClick={onClose} className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#13131e] text-[#a0a0b8] border border-[#1e1e2e] hover:text-white transition-colors">
          <X size={18} />
        </button>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[1fr_1.1fr]">
            <div className="flex min-h-[300px] md:min-h-[500px] items-center justify-center bg-[#13131e] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#13131e] to-[#0f0f18] z-0" />
              <div className="absolute h-64 w-64 rounded-full bg-[#6C5CE7]/10 blur-3xl z-0" />
              <Gamepad2 size={120} strokeWidth={1} className="text-[#6C5CE7]/20 z-10" />
            </div>
            
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] mb-2">{product.type}</p>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">{product.name}</h2>
              <p className="text-[13px] font-bold text-[#5a5a72] uppercase tracking-wider mb-6">{product.game}</p>
              
              <p className="text-[15px] leading-relaxed text-[#a0a0b8] mb-8 font-medium">{product.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-1.5">Delivery</p>
                  <p className="text-[14px] font-semibold text-white">{product.eta}</p>
                </div>
                <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-1.5">Price</p>
                  <p className="text-[18px] font-bold text-[#8B7CF8]">${product.price.toFixed(2)} USD</p>
                </div>
              </div>
              
              <button data-testid="button-detail-add" onClick={onAdd} className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)]">
                Add to Bag <ShoppingCart size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cartItems, cart, subtotal, onClose, onUpdate, onCheckout }: { cartItems: Product[]; cart: Record<string, number>; subtotal: number; onClose: () => void; onUpdate: (id: string, amount: number) => void; onCheckout: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#09090f]/80 backdrop-blur-sm">
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-[#1e1e2e] bg-[#0f0f18] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e1e2e] px-7 py-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-1">Your Selection</p>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">The Bag <span className="text-[#6C5CE7]">({cartItems.length})</span></h2>
          </div>
          <button data-testid="button-close-cart" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#a0a0b8] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {cartItems.length ? (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-7">
              {cartItems.map((product) => (
                <div data-testid={`row-cart-${product.id}`} key={product.id} className="flex gap-4 rounded-xl border border-[#1e1e2e] bg-[#13131e] p-4">
                  <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-lg bg-[#0f0f18] border border-[#1e1e2e]">
                    <Gamepad2 size={32} strokeWidth={1.5} className="text-[#6C5CE7]/40" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="truncate text-[14px] font-bold text-white">{product.name}</p>
                        <p className="mt-0.5 text-[12px] font-medium text-[#5a5a72]">{product.note}</p>
                      </div>
                      <p className="text-[14px] font-bold text-[#8B7CF8]">${(product.price * cart[product.id]).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 rounded-md bg-[#0f0f18] border border-[#1e1e2e] p-0.5">
                        <button data-testid={`button-decrease-${product.id}`} onClick={() => onUpdate(product.id, -1)} className="flex h-6 w-6 items-center justify-center rounded text-[#a0a0b8] hover:text-white hover:bg-[#1e1e2e]"><Minus size={12} /></button>
                        <span data-testid={`text-quantity-${product.id}`} className="w-6 text-center text-[12px] font-bold text-white">{cart[product.id]}</span>
                        <button data-testid={`button-increase-${product.id}`} onClick={() => onUpdate(product.id, 1)} className="flex h-6 w-6 items-center justify-center rounded text-[#a0a0b8] hover:text-white hover:bg-[#1e1e2e]"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#1e1e2e] p-7 bg-[#0c0c16]">
              <div className="mb-5 flex justify-between items-center">
                <span className="text-[14px] font-medium text-[#a0a0b8]">Subtotal</span>
                <span data-testid="text-cart-subtotal" className="text-[18px] font-extrabold text-white">${subtotal.toFixed(2)} USD</span>
              </div>
              <button data-testid="button-checkout" onClick={onCheckout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)]">
                Continue to Review <ArrowRight size={16} />
              </button>
              <p className="mt-4 text-center text-[11px] font-medium text-[#5a5a72]">Payment is reviewed manually before delivery.</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#5a5a72]">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your bag is quiet.</h3>
            <p className="text-[14px] text-[#a0a0b8] max-w-[240px] leading-relaxed">Start with a considered drop, then come back here when it feels right.</p>
            <button data-testid="button-close-empty-cart" onClick={onClose} className="mt-8 rounded-lg border border-[#1e1e2e] bg-[#13131e] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#1e1e2e] hover:border-[#3a3a4a]">
              Keep Browsing
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Checkout({ cartItems, subtotal, payment, setPayment, txRef, setTxRef, copied, copyWallet, submitted, onClose, onSubmit }: { cartItems: Product[]; subtotal: number; payment: string; setPayment: (value: string) => void; txRef: string; setTxRef: (value: string) => void; copied: boolean; copyWallet: () => void; submitted: boolean; onClose: () => void; onSubmit: () => void }) {
  if (submitted) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#09090f]/90 p-5 backdrop-blur-md">
        <div className="w-full max-w-[500px] rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] p-8 text-center sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#6C5CE7]" />
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/20 mb-6">
            <Check size={36} strokeWidth={2.5} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6C5CE7] mb-2">Reference Received</p>
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">You're in the queue.</h2>
          <p className="text-[14px] text-[#a0a0b8] mb-8 font-medium leading-relaxed max-w-[360px] mx-auto">
            We'll review your transaction and send delivery details to your inbox. Most reviews land within 20 minutes.
          </p>
          
          <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5 text-left mb-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a72] mb-4">What happens next</p>
            <div className="space-y-4 text-[13px] text-[#a0a0b8] font-medium">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1e1e2e] text-white text-[11px] font-bold">1</span> 
                <span>Transaction matched against your order</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1e1e2e] text-white text-[11px] font-bold">2</span> 
                <span>Delivery details sent by email</span>
              </div>
            </div>
          </div>
          
          <button data-testid="button-finish-review" onClick={onClose} className="w-full rounded-xl bg-[#1e1e2e] py-4 text-[14px] font-bold text-white transition-colors hover:bg-[#2a2a3a]">
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#09090f]/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[540px] overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] shadow-2xl">
        <div className="border-b border-[#1e1e2e] px-7 py-5 flex items-center justify-between bg-[#0c0c16]">
          <h2 className="text-[18px] font-extrabold text-white tracking-tight">Checkout Review</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#13131e] border border-[#1e1e2e] text-[#a0a0b8] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-7">
          <div className="mb-7 rounded-xl border border-[#1e1e2e] bg-[#13131e] p-5 flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#5a5a72]">Amount Due</span>
            <span className="text-2xl font-extrabold text-[#8B7CF8]">${subtotal.toFixed(2)} USD</span>
          </div>
          
          <div className="space-y-6">
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
              <div className="flex items-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#13131e] p-1.5 focus-within:border-[#3a3a4a] transition-colors">
                <input readOnly value={wallets[payment]} className="flex-1 bg-transparent px-3 text-[14px] font-medium text-white outline-none" />
                <button onClick={copyWallet} className="flex h-10 items-center gap-2 rounded-lg bg-[#1e1e2e] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#2a2a3a]">
                  {copied ? <Check size={14} className="text-[#00d4aa]" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-[13px] font-bold text-white block mb-3">Transaction Hash / Reference</label>
              <input value={txRef} onChange={(e) => setTxRef(e.target.value)} placeholder="Paste your tx hash here..." className="w-full rounded-xl border border-[#1e1e2e] bg-[#13131e] px-5 py-3.5 text-[14px] text-white outline-none focus:border-[#6C5CE7] transition-colors placeholder:text-[#5a5a72] font-medium" />
            </div>
          </div>
          
          <button disabled={!txRef} onClick={onSubmit} className="mt-8 flex w-full items-center justify-center rounded-xl bg-[#6C5CE7] py-4 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#6C5CE7] disabled:hover:shadow-none">
            Submit Payment Reference
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
