import type { Product } from './types';

export const defaultProducts: Product[] = [
  {
    id: 'nebula-bundle',
    name: 'Nebula Bundle',
    game: 'Apex Legends',
    category: 'Items',
    durations: [
      { label: '1 Day', days: 1, price: 9.99 },
      { label: '3 Days', days: 3, price: 24.99 },
      { label: '7 Days', days: 7, price: 44.99 },
      { label: '30 Days', days: 30, price: 99.99 },
    ],
    note: '3 curated cosmetics',
    tag: 'Popular',
    image: '',
    description: 'A hand-picked set of celestial cosmetics with a clean, competitive silhouette.',
    eta: 'Instant delivery',
    type: 'Cosmetic bundle',
    listed: true,
    features: [
      {
        id: 'aimbot',
        title: 'AIMBOT:',
        items: [
          'Aimbot',
          'Aimbot Prediction',
          'Aimbot Hitbox (Head, Neck, Chest, Pelvis)',
          'Aimbot Smoothing Value',
          'Aimbot FOV',
          'Aimbot Max Distance',
          'Different Weapon Configs',
          'Triggerbot',
          'Triggerbot Hitbox (Head, Neck, Chest, Pelvis)',
          'Triggerbot Delay',
          'Other Aimbot',
          'Draw FOV',
          'Draw Filled FOV',
          'Aimbot Visible Check',
          'Aimbot Ignore Knocked',
          'Aimbot Ignore Team',
          'Aimbot Deadzone',
          'Aimbot Keybind',
          'Triggerbot Keybind',
          'Battlemode Toggle',
        ],
      },
      {
        id: 'visuals',
        title: 'VISUALS:',
        items: [
          'Box (Full, Corner)',
          'Skeleton (Sharp, Bezier)',
          'Name',
          'Team ID',
          'Distance',
          'Held Weapon',
          'Kills',
          'Show Team',
          'Show NPC',
          'Filled Box',
          'Platform',
          'Snaplines (Center, Top, Bottom)',
        ],
      },
      {
        id: 'item-esp',
        title: 'ITEM ESP:',
        items: [
          'Item ESP',
          'Item Configs',
          'Show Item',
          'Show Name',
          'Show Count',
          'Show Rarity',
          'Show Distance',
          'Item Max Distance',
        ],
      },
      {
        id: 'settings',
        title: 'SETTINGS:',
        items: [
          'Config System',
          'Overlay VSync',
          'ESP Font (Tahoma, Pixel, FN, Matcha)',
          'ESP Font Size',
          'ESP Outline (Drop Shadow, Full Outline, Half Outline)',
          'Full Controller Support',
        ],
      },
      {
        id: 'requirements',
        title: 'REQUIREMENTS:',
        items: ['CPU: Intel / AMD', 'OS: Windows 10 / 11'],
      },
      {
        id: 'other-visuals',
        title: 'OTHER VISUALS:',
        items: [
          'Separate Team ID Colors',
          'Radar',
          'Radar Team Visualizer',
          'Radar Automatic Distance Scaling',
          'Radar Background Alpha',
          'Radar Orientation Lock',
          'Radar Player Size',
          'Radar Radius',
          'Radar Distance',
          'Radar Enemy Color',
          'Radar Team Color',
          'Target Line',
        ],
      },
    ],
  },
  {
    id: 'velocity-pack',
    name: 'Velocity Pack',
    game: 'Valorant',
    category: 'Items',
    durations: [
      { label: '1 Day', days: 1, price: 7.99 },
      { label: '3 Days', days: 3, price: 18.99 },
      { label: '7 Days', days: 7, price: 34.99 },
      { label: '30 Days', days: 30, price: 74.99 },
    ],
    note: 'Limited colorway',
    tag: 'New drop',
    image: '',
    description: 'Bright signal tones and sharp geometry for a loadout that reads fast in every lobby.',
    eta: 'Instant delivery',
    type: 'Skin pack',
    listed: true,
    features: [],
  },
  {
    id: 'ranked-placement',
    name: 'Ranked Placement',
    game: 'Competitive service',
    category: 'Services',
    durations: [
      { label: '1 Day', days: 1, price: 19.99 },
      { label: '3 Days', days: 3, price: 44.99 },
      { label: '7 Days', days: 7, price: 84.99 },
      { label: '30 Days', days: 30, price: 199.99 },
    ],
    note: 'Per 5 games',
    tag: 'Most requested',
    image: '',
    description: 'A focused five-game session with a vetted player. You keep full account control throughout.',
    eta: 'Starts within 2 hours',
    type: 'Player service',
    listed: true,
    features: [],
  },
  {
    id: 'spectrum-knife',
    name: 'Spectrum Knife',
    game: 'Valorant',
    category: 'Items',
    durations: [
      { label: '1 Day', days: 1, price: 14.99 },
      { label: '3 Days', days: 3, price: 34.99 },
      { label: '7 Days', days: 7, price: 64.99 },
      { label: '30 Days', days: 30, price: 149.99 },
    ],
    note: 'Edition 04 / 50',
    tag: 'Rare',
    image: '',
    description: 'An original, prismatic melee concept for collectors who prefer the unusual angle.',
    eta: 'Instant delivery',
    type: 'Cosmetic item',
    listed: true,
    features: [],
  },
  {
    id: 'duo-coaching',
    name: 'Duo Coaching',
    game: 'Competitive service',
    category: 'Services',
    durations: [
      { label: '1 Day', days: 1, price: 14.99 },
      { label: '3 Days', days: 3, price: 29.99 },
      { label: '7 Days', days: 7, price: 54.99 },
      { label: '30 Days', days: 30, price: 119.99 },
    ],
    note: '60 minute session',
    tag: '1:1 session',
    image: '',
    description: 'A private review and live session built around your habits, not a generic playbook.',
    eta: 'Book a time',
    type: 'Player service',
    listed: true,
    features: [],
  },
  {
    id: 'midnight-set',
    name: 'Midnight Set',
    game: 'Arena collection',
    category: 'Items',
    durations: [
      { label: '1 Day', days: 1, price: 9.99 },
      { label: '3 Days', days: 3, price: 22.99 },
      { label: '7 Days', days: 7, price: 38.99 },
      { label: '30 Days', days: 30, price: 89.99 },
    ],
    note: '2 finishers + charm',
    tag: 'Curated',
    image: '',
    description: 'A low-light set with a soft red edge, selected to make a collection feel complete.',
    eta: 'Instant delivery',
    type: 'Cosmetic bundle',
    listed: true,
    features: [],
  },
];

const STORAGE_KEY = 'xtine_products_v2';
const ADMIN_KEY = 'Rubeans2124!';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {
    // ignore
  }
  return defaultProducts;
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore
  }
}

/** Fetch the admin-saved product list from the API server.
 *  Returns null if the server hasn't been seeded yet or is unreachable. */
export async function fetchProductsFromAPI(): Promise<Product[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) return null;
    const data = (await res.json()) as Product[];
    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

/** Push the current product list to the API server so all visitors see it. */
export async function pushProductsToAPI(products: Product[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey: ADMIN_KEY, products }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
