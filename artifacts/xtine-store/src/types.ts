export type DurationOption = {
  label: string;
  days: number;
  price: number;
};

export type FeatureGroup = {
  id: string;
  title: string;
  items: string[];
};

export type UnitOption = {
  id: string;
  name: string;
  unitLabel: string;
  price: number;
  minimumSubtotal: number;
  description?: string;
};

export type Product = {
  id: string;
  name: string;
  game: string;
  category: 'Items' | 'Services';
  durations: DurationOption[];
  purchaseType?: 'duration' | 'unit' | 'mixed';
  unitOptions?: UnitOption[];
  note: string;
  tag: string;
  image: string;
  description: string;
  eta: string;
  type: string;
  listed: boolean;
  features: FeatureGroup[];
};

export type CartEntry = {
  durationIndex: number;
  optionIndex?: number;
  qty: number;
};
