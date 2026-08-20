import type { Product } from './types';
import donutSmpArtwork from '@assets/sussmp_1787258622751.png';

export const defaultProducts: Product[] = [
  {
    id: 'arc-raiders',
    name: 'Arc Raiders',
    game: 'Arc Raiders',
    category: 'Services',
    durations: [
      { label: '1 Day',  days: 1,  price: 4.99  },
      { label: '3 Days', days: 3,  price: 12.99 },
      { label: '7 Days', days: 7,  price: 19.99 },
      { label: '30 Days',days: 30, price: 39.99 },
    ],
    note: '',
    tag: 'Popular',
    image: '/arc-raiders.png',
    description: 'Premium cheat software for Arc Raiders.',
    eta: 'Instant delivery',
    type: 'Cheat',
    listed: true,
    features: [],
  },
  {
    id: 'hwid-spoofer',
    name: 'HWID Spoofer',
    game: 'All Games',
    category: 'Services',
    durations: [
      { label: '1 Day',  days: 1,  price: 2.99  },
      { label: '3 Days', days: 3,  price: 5.99  },
      { label: '7 Days', days: 7,  price: 9.99  },
      { label: '30 Days',days: 30, price: 19.99 },
    ],
    note: '',
    tag: 'Essential',
    image: '/hwid-spoofer.png',
    description: 'Spoof your hardware ID to bypass bans across all games.',
    eta: 'Instant delivery',
    type: 'Spoofer',
    listed: true,
    features: [],
  },
  {
    id: 'rainbow-six-siege',
    name: 'Rainbow Six Siege',
    game: 'Rainbow Six Siege',
    category: 'Services',
    durations: [
      { label: '1 Day',  days: 1,  price: 4.99  },
      { label: '3 Days', days: 3,  price: 12.99 },
      { label: '7 Days', days: 7,  price: 28.99 },
      { label: '30 Days',days: 30, price: 58.99 },
    ],
    note: '',
    tag: 'New',
    image: '/rainbow-six.png',
    description: 'Premium cheat software for Rainbow Six Siege.',
    eta: 'Instant delivery',
    type: 'Cheat',
    listed: true,
    features: [],
  },
  {
    id: 'rust',
    name: 'Rust',
    game: 'Rust',
    category: 'Services',
    durations: [
      { label: '1 Day',  days: 1,  price: 6.99  },
      { label: '3 Days', days: 3,  price: 14.99 },
      { label: '7 Days', days: 7,  price: 28.99 },
      { label: '30 Days',days: 30, price: 55.99 },
    ],
    note: '',
    tag: 'Hot',
    image: '/rust.png',
    description: 'Premium cheat software for Rust.',
    eta: 'Instant delivery',
    type: 'Cheat',
    listed: true,
    features: [],
  },
  {
    id: 'donutsmp',
    name: 'DonutSMP',
    game: 'DonutSMP',
    category: 'Items',
    durations: [],
    purchaseType: 'unit',
    unitOptions: [
      { id: 'money', name: 'In-Game Money', unitLabel: 'million', price: 0.081, minimumSubtotal: 4 },
      { id: 'skeleton-spawner', name: 'Skeleton Spawner', unitLabel: 'spawner', price: 0.45, minimumSubtotal: 4 },
      { id: 'elytra', name: 'Elytra', unitLabel: 'elytra', price: 24.58, minimumSubtotal: 4 },
    ],
    note: 'Money, spawners & Elytra',
    tag: 'DonutSMP',
    image: donutSmpArtwork,
    description: 'Choose from DonutSMP in-game money, Skeleton Spawners, and Elytra.',
    eta: 'Manual delivery',
    type: 'DonutSMP',
    listed: true,
    features: [],
  },
];

export function loadProducts(): Product[] {
  return defaultProducts;
}

export function saveProducts(_products: Product[]): void {
  // Products are now hardcoded — no local save needed.
}

export async function fetchProductsFromAPI(): Promise<Product[] | null> {
  return null;
}

export async function pushProductsToAPI(_products: Product[]): Promise<boolean> {
  return false;
}
