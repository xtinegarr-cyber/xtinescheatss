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
    purchaseType: 'mixed',
    unitOptions: [
      {
        id: 'account',
        name: 'Rainbow Six Siege Account',
        unitLabel: 'account',
        price: 2.50,
        minimumSubtotal: 0,
        description: 'Ranked ready, Level 50+. Full access account — email and password are changeable after purchase.',
      },
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
      { label: 'Lifetime', days: 36500, price: 249 },
    ],
    purchaseType: 'mixed',
    unitOptions: [
      {
        id: 'account',
        name: 'Rust Account',
        unitLabel: 'account',
        price: 5.75,
        minimumSubtotal: 0,
        description: 'Full access Rust account. Email and password are changeable after purchase.',
      },
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
    id: 'roblox',
    name: 'Roblox',
    game: 'Roblox',
    category: 'Items',
    durations: [],
    purchaseType: 'unit',
    unitOptions: [
      { id: 'chromatic-gacha-box', name: 'Chromatic Gacha Box', unitLabel: 'gamepass', price: 1.07, minimumSubtotal: 0 },
      { id: '2x-mastery', name: '2x Mastery', unitLabel: 'gamepass', price: 2.15, minimumSubtotal: 0 },
      { id: '2x-boss-drops', name: '2x Boss Drops', unitLabel: 'gamepass', price: 1.45, minimumSubtotal: 0 },
      { id: 'fruit-notifier', name: 'Fruit Notifier', unitLabel: 'gamepass', price: 12.85, minimumSubtotal: 0 },
      { id: 'fast-boats', name: 'Fast Boats', unitLabel: 'gamepass', price: 1.60, minimumSubtotal: 0 },
      { id: '2x-money', name: '2x Money', unitLabel: 'gamepass', price: 2.15, minimumSubtotal: 0 },
      { id: 'dark-blade', name: 'Dark Blade', unitLabel: 'gamepass', price: 5.80, minimumSubtotal: 0 },
      { id: 'perm-sand-fruit', name: 'Perm Sand Fruit', unitLabel: 'item', price: 6.15, minimumSubtotal: 0 },
      { id: 'kitsune-fruit', name: 'Kitsune Fruit', unitLabel: 'item', price: 4.02, minimumSubtotal: 0 },
      { id: 'tiger-fruit', name: 'Tiger Fruit', unitLabel: 'item', price: 2.06, minimumSubtotal: 0 },
      { id: 'perm-gas-fruit', name: 'Perm Gas Fruit', unitLabel: 'item', price: 15.25, minimumSubtotal: 0 },
      { id: 'perm-ghost-fruit', name: 'Perm Ghost Fruit', unitLabel: 'item', price: 7.89, minimumSubtotal: 0 },
      { id: 'perm-quake-fruit', name: 'Perm Quake Fruit', unitLabel: 'item', price: 10.89, minimumSubtotal: 0 },
      { id: 'perm-venom-fruit', name: 'Perm Venom Fruit', unitLabel: 'item', price: 16.89, minimumSubtotal: 0 },
      { id: 'perm-ice-fruit', name: 'Perm Ice Fruit', unitLabel: 'item', price: 5.10, minimumSubtotal: 0 },
      { id: 'perm-portal-fruit', name: 'Perm Portal Fruit', unitLabel: 'item', price: 12.75, minimumSubtotal: 0 },
      { id: 'perm-dragon-fruit', name: 'Perm Dragon Fruit', unitLabel: 'item', price: 40.00, minimumSubtotal: 0 },
      { id: 'perm-flame-fruit', name: 'Perm Flame Fruit', unitLabel: 'item', price: 3.89, minimumSubtotal: 0 },
      { id: 'perm-rubber-fruit', name: 'Perm Rubber Fruit', unitLabel: 'item', price: 7.90, minimumSubtotal: 0 },
      { id: 'perm-love-fruit', name: 'Perm Love Fruit', unitLabel: 'item', price: 10.11, minimumSubtotal: 0 },
    ],
    note: 'Gamepasses & items',
    tag: 'Roblox',
    image: '/roblox.png',
    description: 'Choose a Roblox gamepass or item, then follow the instructions in our Discord to claim your purchase.',
    eta: 'Manual delivery via Discord',
    type: 'Roblox',
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
