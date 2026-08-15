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

export type Product = {
  id: string;
  name: string;
  game: string;
  category: 'Items' | 'Services';
  durations: DurationOption[];
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
  qty: number;
};
