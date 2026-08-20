import guideData from './guides.json';

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  productSlug: string;
  productLabel: string;
  sections: GuideSection[];
};

export const guides = guideData as Guide[];

export function getGuide(slug: string | undefined) {
  return guides.find((guide) => guide.slug === slug);
}