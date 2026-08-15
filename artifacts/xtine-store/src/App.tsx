import { type ReactNode, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Heart,
  LockKeyhole,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

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
    <main className="noise min-h-[100dvh] overflow-x-hidden bg-[#111116] text-[#f3f0e7]">
      <div className="pointer-events-none fixed left-[-16rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[#d3ad3e]/[.06] blur-[110px]" />
      <div className="pointer-events-none fixed bottom-[-18rem] right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[#4bd2a6]/[.04] blur-[120px]" />

      <header className="relative z-20 border-b border-[#2a2931] bg-[#111116]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1280px] items-center justify-between px-5 lg:px-10">
          <button data-testid="button-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#e9bd48]/60 bg-[#e9bd48]/10 text-[#f1c64b]">
              <span className="absolute h-4 w-4 rotate-45 border border-current" />
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            <span className="font-display text-[17px] font-bold tracking-[-.03em]">XTINE<span className="text-[#f1c64b]">.</span></span>
          </button>

          <nav className="hidden items-center gap-8 text-[12px] font-semibold tracking-[.08em] text-[#9a98a3] md:flex">
            <button data-testid="button-nav-shop" onClick={scrollToCatalog} className="transition-colors hover:text-[#f3f0e7]">SHOP</button>
            <button data-testid="button-nav-services" onClick={() => { setCategory('Services'); scrollToCatalog(); }} className="transition-colors hover:text-[#f3f0e7]">SERVICES</button>
            <button data-testid="button-nav-how" onClick={() => document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' })} className="transition-colors hover:text-[#f3f0e7]">HOW IT WORKS</button>
          </nav>

          <div className="flex items-center gap-2">
            <label className="hidden h-10 items-center gap-2 rounded-full border border-[#2d2c35] bg-[#17171e] px-3 text-[#777581] sm:flex">
              <Search size={15} />
              <input data-testid="input-search-header" value={query} onChange={(event) => { setQuery(event.target.value); scrollToCatalog(); }} placeholder="Search drops..." className="w-[116px] bg-transparent text-[12px] text-[#f3f0e7] outline-none placeholder:text-[#686671]" />
            </label>
            <button data-testid="button-open-cart" onClick={() => setCartOpen(true)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#2d2c35] bg-[#17171e] text-[#d4d0c6] transition-all hover:border-[#e9bd48]/70 hover:text-[#f1c64b]">
              <ShoppingBag size={16} />
              {itemCount > 0 && <span data-testid="text-cart-count" className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#f1c64b] px-1 text-[10px] font-bold text-[#111116]">{itemCount}</span>}
            </button>
            <button data-testid="button-mobile-menu" onClick={() => setMobileNav((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2d2c35] text-[#d4d0c6] md:hidden">
              {mobileNav ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        {mobileNav && (
          <nav className="border-t border-[#2a2931] bg-[#15151b] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-[12px] font-semibold tracking-[.1em] text-[#aaa7af]">
              <button data-testid="button-mobile-shop" onClick={() => { scrollToCatalog(); setMobileNav(false); }}>SHOP</button>
              <button data-testid="button-mobile-services" onClick={() => { setCategory('Services'); scrollToCatalog(); setMobileNav(false); }}>SERVICES</button>
              <button data-testid="button-mobile-how" onClick={() => { document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' }); setMobileNav(false); }}>HOW IT WORKS</button>
            </div>
          </nav>
        )}
      </header>

      <section className="relative mx-auto max-w-[1280px] px-5 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div className="reveal">
            <div className="mb-7 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[.24em] text-[#8e8b97]">
              <span className="h-px w-9 bg-[#f1c64b]" /> A better way to collect
            </div>
            <h1 className="max-w-[700px] font-display text-[54px] font-bold leading-[.98] tracking-[-.065em] text-[#f3f0e7] sm:text-[72px] lg:text-[92px]">Loadouts,<br /><span className="text-[#f1c64b]">considered.</span></h1>
            <p className="mt-7 max-w-[470px] text-[15px] leading-7 text-[#9b99a3]">Curated digital goods and player services for people who care about the details. Clear pricing. Human review. No account access required.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button data-testid="button-browse-drops" onClick={scrollToCatalog} className="group flex items-center gap-4 rounded-full bg-[#f1c64b] py-3.5 pl-5 pr-4 text-[12px] font-bold tracking-[.05em] text-[#111116] transition-transform hover:-translate-y-0.5">
                BROWSE THE DROPS <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111116] text-[#f1c64b] transition-transform group-hover:translate-x-0.5"><ArrowRight size={14} /></span>
              </button>
              <span className="flex items-center gap-2 text-[11px] text-[#777581]"><ShieldCheck size={15} className="text-[#53d3a9]" /> Manual review on every order</span>
            </div>
          </div>
          <div className="relative mx-auto h-[380px] w-full max-w-[510px] reveal reveal-delay-2 lg:h-[470px]">
            <div className="absolute inset-[10%_8%] rotate-[-7deg] rounded-[2rem] border border-[#474452] bg-[#1a1921] shadow-[0_35px_90px_rgba(0,0,0,.45)]" />
            <div className="absolute inset-[6%_13%] rotate-[5deg] rounded-[2rem] border border-[#c69d37]/50 bg-[#201e20] shadow-[0_35px_90px_rgba(0,0,0,.45)]" />
            <div className="product-art absolute inset-[3%_17%] flex rotate-[-2deg] flex-col justify-between rounded-[2rem] border border-[#3c3a45] bg-[radial-gradient(circle_at_65%_38%,#514226_0,#27221b_26%,#17171c_66%)] p-6 shadow-[0_40px_100px_rgba(0,0,0,.55)] sm:p-8">
              <div className="flex items-start justify-between">
                <div><p className="font-mono-ui text-[9px] tracking-[.18em] text-[#d7b54e]">XT / 004</p><p className="mt-2 font-display text-xl font-bold tracking-[-.04em]">NEBULA</p></div>
                <span className="rounded-full border border-[#f1c64b]/30 px-2 py-1 text-[8px] uppercase tracking-[.17em] text-[#d7b54e]">Edition 04</span>
              </div>
              <div className="drift relative mx-auto flex h-40 w-40 items-center justify-center sm:h-52 sm:w-52">
                <div className="absolute inset-5 rotate-45 border border-[#f1c64b]/70" />
                <div className="absolute inset-10 rotate-45 border border-[#f1c64b]/40" />
                <div className="h-20 w-20 rounded-full border border-[#f1c64b]/80 bg-[#e4b844]/10 shadow-[0_0_55px_rgba(241,198,75,.3)]" />
                <Sparkles className="absolute text-[#f1c64b]" size={26} strokeWidth={1.2} />
              </div>
              <div className="flex items-end justify-between"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#777581]">A considered collection</p><p className="mt-1 text-[12px] text-[#c2bec1]">For the next session.</p></div><p className="font-mono-ui text-sm text-[#f1c64b]">$24.00</p></div>
            </div>
            <div className="absolute bottom-2 left-0 flex items-center gap-2 rounded-full border border-[#2f3940] bg-[#171e20] px-3 py-2 text-[10px] text-[#8faaa6] shadow-xl sm:bottom-8 sm:left-4"><span className="h-1.5 w-1.5 rounded-full bg-[#53d3a9]" /> 12 orders reviewed today</div>
          </div>
        </div>
      </section>

      <section id="catalog" className="relative border-y border-[#26252d] bg-[#131319]">
        <div className="mx-auto max-w-[1280px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#d5af41]">01 / The selection</p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-[-.05em] sm:text-5xl">Good stuff, no noise.</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#2c2b34] bg-[#17171e] p-1">
              {(['Featured', 'Items', 'Services'] as Category[]).map((filter) => (
                <button data-testid={`button-filter-${filter.toLowerCase()}`} key={filter} onClick={() => setCategory(filter)} className={`rounded-full px-4 py-2 text-[11px] font-semibold transition-colors ${category === filter ? 'bg-[#f1c64b] text-[#111116]' : 'text-[#898791] hover:text-[#f3f0e7]'}`}>{filter}</button>
              ))}
            </div>
          </div>
          <div className="mb-7 flex items-center justify-between border-b border-[#28272f] pb-4">
            <p data-testid="text-catalog-count" className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[#797782]">{visibleProducts.length.toString().padStart(2, '0')} available selections</p>
            <div className="flex items-center gap-2 text-[11px] text-[#777581]"><span className="h-1.5 w-1.5 rounded-full bg-[#53d3a9]" /> Updated this week <ChevronDown size={13} /></div>
          </div>
          {visibleProducts.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} favorite={favorites.includes(product.id)} onFavorite={() => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} onView={() => setSelected(product)} onAdd={() => addToCart(product)} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#3b3944] bg-[#17171e] px-6 py-20 text-center">
              <Search className="mx-auto text-[#f1c64b]" size={24} />
              <h3 className="mt-4 font-display text-xl font-bold">Nothing in that lane yet.</h3>
              <p className="mt-2 text-sm text-[#85828e]">Try another search or return to the full selection.</p>
              <button data-testid="button-clear-search" onClick={() => { setQuery(''); setCategory('Featured'); }} className="mt-5 rounded-full border border-[#4a464a] px-4 py-2 text-[11px] font-bold text-[#f1c64b]">CLEAR FILTERS</button>
            </div>
          )}
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-[1280px] px-5 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#d5af41]">02 / The promise</p><h2 className="mt-4 max-w-[420px] font-display text-4xl font-bold leading-[1.03] tracking-[-.055em] sm:text-5xl">Buy with a clear head.</h2><p className="mt-5 max-w-[390px] text-[14px] leading-7 text-[#8e8b96]">The internet has enough sketchy checkout flows. Xtine keeps it simple: show you exactly what is included, then let a human confirm the payment.</p></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <TrustItem icon={<LockKeyhole size={19} />} number="01" title="You stay in control" copy="We never ask for passwords, codes, or account access." />
            <TrustItem icon={<Clock3 size={19} />} number="02" title="A human checks it" copy="Every transaction reference is matched manually before delivery." />
            <TrustItem icon={<PackageCheck size={19} />} number="03" title="Clear next step" copy="You get an email with the review status and delivery details." />
          </div>
        </div>
        <div className="mt-20 flex flex-col items-start justify-between gap-5 border-t border-[#2a2931] pt-7 sm:flex-row sm:items-center"><p className="text-[11px] uppercase tracking-[.18em] text-[#73717b]">Curated for players with taste</p><div className="flex gap-6 font-mono-ui text-[10px] text-[#64626c]"><span>ORIGINAL ART</span><span>MANUAL REVIEW</span><span>NO ACCOUNT ACCESS</span></div></div>
      </section>

      <footer className="border-t border-[#28272f] bg-[#0e0e12]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-10"><div className="flex items-center gap-3"><span className="font-display font-bold">XTINE<span className="text-[#f1c64b]">.</span></span><span className="text-[11px] text-[#65636c]">Digital goods, done properly.</span></div><p className="font-mono-ui text-[10px] text-[#65636c]">© 2025 XTINE STORE / PRESENTATION BUILD</p></div>
      </footer>

      {selected && <ProductDetail product={selected} onClose={() => setSelected(null)} onAdd={() => { addToCart(selected); setSelected(null); }} />}
      {cartOpen && <CartDrawer cartItems={cartItems} cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onCheckout={() => { setCartOpen(false); setCheckout(true); }} />}
      {checkout && <Checkout cartItems={cartItems} subtotal={subtotal} payment={payment} setPayment={setPayment} txRef={txRef} setTxRef={setTxRef} copied={copied} copyWallet={copyWallet} submitted={submitted} onClose={() => setCheckout(false)} onSubmit={() => setSubmitted(true)} />}
    </main>
  );
}

function ProductCard({ product, index, favorite, onFavorite, onView, onAdd }: { product: Product; index: number; favorite: boolean; onFavorite: () => void; onView: () => void; onAdd: () => void }) {
  return (
    <article data-testid={`card-product-${product.id}`} className="group reveal overflow-hidden rounded-2xl border border-[#2b2a33] bg-[#19191f] transition-all duration-300 hover:-translate-y-1 hover:border-[#66552a]" style={{ animationDelay: `${index * 70}ms` }}>
      <div data-testid={`button-view-${product.id}`} role="button" tabIndex={0} onClick={onView} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onView(); }} className={`product-art ${product.art} relative block h-[235px] w-full cursor-pointer bg-[radial-gradient(circle_at_50%_42%,#363026,#202027_54%,#17171c)] text-left`}>
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2"><span className="rounded-full border border-[#47434a] bg-[#17171d]/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-[#bbb7b8]">{product.tag}</span></div>
        <button data-testid={`button-favorite-${product.id}`} onClick={(event) => { event.stopPropagation(); onFavorite(); }} className={`absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#47434a] bg-[#17171d]/70 transition-colors ${favorite ? 'text-[#f1c64b]' : 'text-[#8e8b96] hover:text-[#f1c64b]'}`} aria-label="Save item"><Heart size={14} fill={favorite ? 'currentColor' : 'none'} /></button>
        <div className="absolute inset-0 flex items-center justify-center"><div className="h-24 w-24 rotate-45 border border-[#f1c64b]/50 transition-transform duration-500 group-hover:rotate-[55deg] group-hover:scale-110" /><div className="absolute h-14 w-14 rounded-full border border-[#f1c64b]/70 bg-[#f1c64b]/10 shadow-[0_0_45px_rgba(241,198,75,.18)]" /><span className="absolute font-mono-ui text-[9px] tracking-[.2em] text-[#efc552]">XT / {String(index + 4).padStart(3, '0')}</span></div>
        <div className="absolute bottom-5 left-5 z-10 font-mono-ui text-[9px] uppercase tracking-[.16em] text-[#76737e]">{product.type}</div>
      </div>
      <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.12em] text-[#77747f]">{product.game}</p><h3 className="mt-1 font-display text-[20px] font-bold tracking-[-.035em]">{product.name}</h3></div><div className="text-right"><p className="font-mono-ui text-[15px] text-[#f1c64b]">${product.price.toFixed(2)}</p>{product.oldPrice && <p className="font-mono-ui text-[10px] text-[#68656f] line-through">${product.oldPrice.toFixed(2)}</p>}</div></div><div className="mt-5 flex items-center justify-between border-t border-[#2a2931] pt-4"><span className="text-[11px] text-[#8a8791]">{product.note}</span><button data-testid={`button-add-${product.id}`} onClick={onAdd} className="flex items-center gap-2 text-[10px] font-bold tracking-[.1em] text-[#f1c64b] transition-colors hover:text-[#fff0b4]">ADD TO BAG <Plus size={14} /></button></div></div>
    </article>
  );
}

function TrustItem({ icon, number, title, copy }: { icon: ReactNode; number: string; title: string; copy: string }) {
  return <div className="rounded-2xl border border-[#2c2b34] bg-[#17171e] p-5"><div className="flex items-center justify-between text-[#53d3a9]"><span>{icon}</span><span className="font-mono-ui text-[10px] text-[#5e5c66]">{number}</span></div><h3 className="mt-9 font-display text-[16px] font-bold">{title}</h3><p className="mt-2 text-[12px] leading-5 text-[#85828d]">{copy}</p></div>;
}

function ProductDetail({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) {
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#09090c]/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"><div className="relative max-h-[92dvh] w-full max-w-[820px] overflow-auto rounded-t-3xl border border-[#393641] bg-[#19191f] shadow-2xl sm:rounded-3xl"><button data-testid="button-close-detail" onClick={onClose} className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#42404a] bg-[#1d1d24] text-[#aaa6ac] hover:text-[#f1c64b]"><X size={16} /></button><div className="grid md:grid-cols-[.9fr_1.1fr]"><div className={`product-art ${product.art} flex min-h-[310px] items-center justify-center bg-[#1d1c23] p-12 md:min-h-[500px]`}><div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-[#f1c64b]/60 bg-[#f1c64b]/10 shadow-[0_0_90px_rgba(241,198,75,.17)]"><div className="absolute inset-[-22px] rotate-45 border border-[#f1c64b]/40" /><Sparkles className="text-[#f1c64b]" size={34} strokeWidth={1.1} /></div></div><div className="flex flex-col justify-center p-7 sm:p-10"><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#d5af41]">{product.type} / detail</p><h2 className="mt-4 font-display text-4xl font-bold tracking-[-.055em]">{product.name}</h2><p className="mt-2 text-[12px] uppercase tracking-[.12em] text-[#77747f]">{product.game}</p><p className="mt-7 text-[14px] leading-7 text-[#aaa7b0]">{product.description}</p><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-xl border border-[#2d2c35] bg-[#15151b] p-3"><p className="text-[10px] uppercase tracking-[.1em] text-[#696670]">Delivery</p><p className="mt-1 text-[12px] text-[#d3cfc9]">{product.eta}</p></div><div className="rounded-xl border border-[#2d2c35] bg-[#15151b] p-3"><p className="text-[10px] uppercase tracking-[.1em] text-[#696670]">Price</p><p className="mt-1 font-mono-ui text-[13px] text-[#f1c64b]">${product.price.toFixed(2)} USD</p></div></div><button data-testid="button-detail-add" onClick={onAdd} className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#f1c64b] py-3.5 text-[11px] font-bold tracking-[.08em] text-[#111116] transition-transform hover:-translate-y-0.5">ADD TO BAG <ArrowRight size={15} /></button></div></div></div></div>;
}

function CartDrawer({ cartItems, cart, subtotal, onClose, onUpdate, onCheckout }: { cartItems: Product[]; cart: Record<string, number>; subtotal: number; onClose: () => void; onUpdate: (id: string, amount: number) => void; onCheckout: () => void }) {
  return <div className="fixed inset-0 z-40 bg-[#09090c]/75 backdrop-blur-sm"><aside className="absolute right-0 top-0 flex h-full w-full max-w-[450px] flex-col border-l border-[#393641] bg-[#17171e] shadow-2xl"><div className="flex items-center justify-between border-b border-[#2c2b34] px-6 py-5"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#77747f]">Your selection</p><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.04em]">The bag <span className="text-[#f1c64b]">({cartItems.length})</span></h2></div><button data-testid="button-close-cart" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3d3a44] text-[#aaa6ac] hover:text-[#f1c64b]"><X size={16} /></button></div>{cartItems.length ? <><div className="flex-1 space-y-3 overflow-auto p-6">{cartItems.map((product) => <div data-testid={`row-cart-${product.id}`} key={product.id} className="flex gap-4 rounded-xl border border-[#2d2c35] bg-[#1d1d24] p-3"><div className={`product-art ${product.art} h-[74px] w-[74px] shrink-0 rounded-lg bg-[#25232a]`}><div className="absolute inset-0 flex items-center justify-center"><div className="h-8 w-8 rotate-45 border border-[#f1c64b]/60" /></div></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><p className="truncate text-[13px] font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-[#77747f]">{product.note}</p></div><p className="font-mono-ui text-[12px] text-[#f1c64b]">${(product.price * cart[product.id]).toFixed(2)}</p></div><div className="mt-3 flex items-center gap-2"><button data-testid={`button-decrease-${product.id}`} onClick={() => onUpdate(product.id, -1)} className="flex h-6 w-6 items-center justify-center rounded border border-[#3b3944] text-[#aaa6ac]"><Minus size={12} /></button><span data-testid={`text-quantity-${product.id}`} className="w-5 text-center font-mono-ui text-[11px]">{cart[product.id]}</span><button data-testid={`button-increase-${product.id}`} onClick={() => onUpdate(product.id, 1)} className="flex h-6 w-6 items-center justify-center rounded border border-[#3b3944] text-[#aaa6ac]"><Plus size={12} /></button></div></div></div>)}</div><div className="border-t border-[#2c2b34] p-6"><div className="mb-4 flex justify-between text-sm"><span className="text-[#8e8b96]">Subtotal</span><span data-testid="text-cart-subtotal" className="font-mono-ui text-[#f3f0e7]">${subtotal.toFixed(2)} USD</span></div><button data-testid="button-checkout" onClick={onCheckout} className="flex w-full items-center justify-center gap-3 rounded-full bg-[#f1c64b] py-3.5 text-[11px] font-bold tracking-[.08em] text-[#111116]">CONTINUE TO REVIEW <ArrowRight size={15} /></button><p className="mt-3 text-center text-[10px] text-[#68656f]">Payment is reviewed manually before delivery.</p></div></> : <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#3b3944] text-[#f1c64b]"><ShoppingBag size={22} /></div><h3 className="mt-5 font-display text-xl font-bold">Your bag is quiet.</h3><p className="mt-2 text-sm leading-6 text-[#85828d]">Start with a considered drop, then come back here when it feels right.</p><button data-testid="button-close-empty-cart" onClick={onClose} className="mt-6 rounded-full border border-[#4b4640] px-5 py-2.5 text-[11px] font-bold tracking-[.08em] text-[#f1c64b]">KEEP BROWSING</button></div>}</aside></div>;
}

function Checkout({ cartItems, subtotal, payment, setPayment, txRef, setTxRef, copied, copyWallet, submitted, onClose, onSubmit }: { cartItems: Product[]; subtotal: number; payment: string; setPayment: (value: string) => void; txRef: string; setTxRef: (value: string) => void; copied: boolean; copyWallet: () => void; submitted: boolean; onClose: () => void; onSubmit: () => void }) {
  if (submitted) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090c]/90 p-5 backdrop-blur-md"><div className="w-full max-w-[520px] rounded-3xl border border-[#3e6256] bg-[#171f1d] p-8 text-center sm:p-12"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#53d3a9]/15 text-[#53d3a9]"><Check size={29} /></div><p className="mt-7 font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#53d3a9]">Reference received</p><h2 className="mt-3 font-display text-4xl font-bold tracking-[-.05em]">You’re in the queue.</h2><p className="mx-auto mt-4 max-w-[360px] text-sm leading-6 text-[#a4b5ae]">We’ll review your transaction and send delivery details to your inbox. Most reviews land within 20 minutes.</p><div className="mt-8 rounded-xl border border-[#365449] bg-[#14201d] p-4 text-left"><p className="text-[10px] uppercase tracking-[.13em] text-[#6f9084]">What happens next</p><div className="mt-3 space-y-2 text-[12px] text-[#bdd0c8]"><p>01 &nbsp; Transaction matched against your order</p><p>02 &nbsp; Delivery details sent by email</p></div></div><button data-testid="button-finish-review" onClick={onClose} className="mt-8 rounded-full bg-[#f1c64b] px-6 py-3 text-[11px] font-bold tracking-[.08em] text-[#111116]">RETURN TO STORE</button></div></div>;
  return <div className="fixed inset-0 z-50 overflow-auto bg-[#0b0b0e]/95 p-4 backdrop-blur-md sm:p-8"><div className="mx-auto max-w-[1060px]"><div className="flex items-center justify-between py-3"><button data-testid="button-back-to-cart" onClick={onClose} className="flex items-center gap-2 text-[11px] font-semibold tracking-[.08em] text-[#9b98a1] hover:text-[#f1c64b]"><ArrowLeft size={15} /> BACK TO BAG</button><div className="flex items-center gap-2 font-display text-lg font-bold">XTINE<span className="text-[#f1c64b]">.</span></div><span className="font-mono-ui text-[10px] text-[#66636e]">ORDER REVIEW</span></div><div className="gold-line mt-3" /><div className="grid gap-8 py-10 lg:grid-cols-[1fr_370px]"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#d5af41]">03 / Manual payment</p><h1 className="mt-4 max-w-[580px] font-display text-4xl font-bold leading-[1.02] tracking-[-.055em] sm:text-6xl">Send it once.<br /><span className="text-[#f1c64b]">We’ll handle the rest.</span></h1><p className="mt-5 max-w-[520px] text-[14px] leading-7 text-[#93909b]">Choose a network below, send the exact order total, then paste your transaction reference. We manually review every payment before anything is delivered.</p><div className="mt-9"><p className="mb-3 text-[11px] font-semibold uppercase tracking-[.13em] text-[#c2bec2]">1. Select a network</p><div className="grid grid-cols-4 gap-2">{Object.keys(wallets).map((coin) => <button data-testid={`button-payment-${coin.toLowerCase()}`} key={coin} onClick={() => setPayment(coin)} className={`rounded-xl border px-2 py-3 text-center transition-colors ${payment === coin ? 'border-[#f1c64b] bg-[#2a2619] text-[#f1c64b]' : 'border-[#302e38] bg-[#17171e] text-[#88858f] hover:border-[#55505a]'}`}><span className="block font-display text-sm font-bold">{coin}</span><span className="mt-1 block text-[9px]">NETWORK</span></button>)}</div></div><div className="mt-7"><p className="mb-3 text-[11px] font-semibold uppercase tracking-[.13em] text-[#c2bec2]">2. Send exact amount</p><div className="rounded-2xl border border-[#3b3740] bg-[#17171e] p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-mono-ui break-all text-[12px] text-[#d3cfc8]">{wallets[payment]}</p><p className="mt-2 text-[10px] text-[#6f6c77]">Wallet placeholder for presentation build</p></div><button data-testid="button-copy-wallet" onClick={copyWallet} className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-bold ${copied ? 'border-[#53d3a9]/50 text-[#53d3a9]' : 'border-[#4b464c] text-[#f1c64b]'}`}>{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'COPIED' : 'COPY'}</button></div></div></div><div className="mt-7"><label htmlFor="tx-ref" className="mb-3 block text-[11px] font-semibold uppercase tracking-[.13em] text-[#c2bec2]">3. Add transaction reference</label><textarea data-testid="input-transaction-reference" id="tx-ref" value={txRef} onChange={(event) => setTxRef(event.target.value)} placeholder="Paste your transaction hash or reference here..." className="min-h-[105px] w-full resize-none rounded-2xl border border-[#37343e] bg-[#17171e] p-4 text-[13px] text-[#eee9de] outline-none transition-colors placeholder:text-[#5f5c67] focus:border-[#f1c64b]/70" /></div><button data-testid="button-submit-payment" onClick={onSubmit} disabled={!txRef.trim()} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#f1c64b] py-4 text-[11px] font-bold tracking-[.1em] text-[#111116] transition-opacity disabled:cursor-not-allowed disabled:opacity-40">SUBMIT FOR REVIEW <ArrowRight size={15} /></button><p className="mt-3 flex items-center justify-center gap-2 text-[10px] text-[#68656f]"><ShieldCheck size={13} className="text-[#53d3a9]" /> No account credentials are ever requested.</p></div><aside className="h-fit rounded-2xl border border-[#2e2c35] bg-[#17171e] p-6 lg:sticky lg:top-8"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">Order summary</h2><span className="font-mono-ui text-[10px] text-[#66636e]">{cartItems.length} ITEMS</span></div><div className="mt-6 space-y-4 border-b border-[#2d2c35] pb-5">{cartItems.map((product) => <div key={product.id} className="flex justify-between gap-3 text-[12px]"><span className="text-[#96929d]">{product.name}</span><span className="font-mono-ui text-[#d7d2c9]">${product.price.toFixed(2)}</span></div>)}</div><div className="flex justify-between pt-5"><span className="text-sm text-[#aaa6ad]">Total</span><span data-testid="text-checkout-total" className="font-mono-ui text-lg text-[#f1c64b]">${subtotal.toFixed(2)} USD</span></div><div className="mt-6 rounded-xl border border-[#2f4b42] bg-[#14201d] p-4"><div className="flex gap-2 text-[#53d3a9]"><Zap size={14} /><span className="text-[11px] font-semibold">Fast, human review</span></div><p className="mt-2 text-[10px] leading-5 text-[#78968c]">We aim to review references within 20 minutes during active hours.</p></div></aside></div></div></div>;
}

export default App;