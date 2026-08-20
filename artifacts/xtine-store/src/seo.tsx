import { useEffect } from 'react';
import type { Product } from './types';

export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://xtinecheats.com').replace(/\/$/, '');

type SeoProps = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  schema?: Record<string, unknown>;
};

function absoluteUrl(path: string) {
  return path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function Seo({ title, description, path, noIndex = false, schema }: SeoProps) {
  useEffect(() => {
    const canonicalUrl = absoluteUrl(path);
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const schemaId = 'route-schema';
    const existingSchema = document.querySelector<HTMLScriptElement>(`script#${schemaId}`);
    if (schema) {
      const script: HTMLScriptElement = existingSchema ?? document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      if (!existingSchema) document.head.appendChild(script);
    } else {
      existingSchema?.remove();
    }
  }, [description, noIndex, path, schema, title]);

  return null;
}

export function productSchema(product: Product) {
  const prices = product.purchaseType === 'unit'
    ? product.unitOptions?.map((option) => option.price) ?? []
    : product.durations.map((duration) => duration.price);
  const price = Math.min(...prices);
  const path = `/${product.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: absoluteUrl(product.image),
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'XtineCheats',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: price.toFixed(price < 1 ? 3 : 2),
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(path),
    },
  };
}