import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import {
  ArrowLeft,
  Check,
  Gamepad2,
  Grip,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { loadProducts, fetchProductsFromAPI } from './data';
import { Seo, productSchema } from './seo';
import { calculateChargeAmount, toSlug } from './utils';
import type { Product, CartEntry } from './types';

const CART_KEY = 'xtine_cart_v3';

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
  const [selectedUnitOptionIndex, setSelectedUnitOptionIndex] = useState(0);
  const [unitQuantity, setUnitQuantity] = useState(1);
  const [mode, setMode] = useState<'duration' | 'unit'>('duration');
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

  const isMixed = product?.purchaseType === 'mixed';
  const effectiveUnitMode = product?.purchaseType === 'unit' || (isMixed && mode === 'unit');

  const addToCart = () => {
    if (!product) return;
    const cart = readCart();
    const unitOption = product.unitOptions?.[selectedUnitOptionIndex];
    const cartKey = effectiveUnitMode && unitOption
      ? `${product.id}:${unitOption.id}`
      : product.id;
    const existing = cart[cartKey];
    cart[cartKey] = {
      durationIndex: selectedDuration,
      optionIndex: effectiveUnitMode ? selectedUnitOptionIndex : undefined,
      qty: (existing?.qty ?? 0) + (effectiveUnitMode ? unitQuantity : 1),
    };
    writeCart(cart);
    setCartCount(Object.values(cart).reduce((s, e) => s + e.qty, 0));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#09090f] text-white">
        <Seo
          title="Product Not Found | XtineCheats"
          description="The requested XtineCheats product is unavailable."
          path={`/${slug ?? ''}`}
          noIndex
        />
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

  // Minimal working version for now - full UI will be restored
  return (
    <div className="min-h-screen bg-[#09090f] text-white p-8">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="mt-2">{product.description}</p>
      <Link to="/" className="mt-4 inline-block text-[#8B7CF8]">← Back</Link>
    </div>
  );
}
