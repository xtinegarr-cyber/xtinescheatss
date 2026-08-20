import { Link, useParams } from 'wouter';
import { ArrowLeft, ArrowRight, BookOpen, Check, Gamepad2 } from 'lucide-react';
import { getGuide, guides } from './guides';
import { Seo, SITE_URL } from './seo';

function guideSchema(slug: string, title: string, description: string) {
  const url = `${SITE_URL}/guides/${slug}/`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description,
        mainEntityOfPage: url,
        author: { '@type': 'Organization', name: 'XtineCheats' },
        publisher: { '@type': 'Organization', name: 'XtineCheats' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides/` },
          { '@type': 'ListItem', position: 3, name: title, item: url },
        ],
      },
    ],
  };
}

export function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <Seo
        title="Gaming Guides, Cheats & Scripts | XtineCheats"
        description="Browse XtineCheats guides for DonutSMP money-making methods, Arc Raiders, Rainbow Six Siege, Rust, and HWID Spoofer product resources."
        path="/guides/"
      />
      <header className="border-b border-[#1e1e2e] bg-[#09090f]/95">
        <div className="mx-auto flex h-20 max-w-[1160px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
            <Gamepad2 size={20} className="text-[#6C5CE7]" />
            Xtine<span className="text-[#6C5CE7]">Cheats</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-[#a0a0b8] transition-colors hover:text-white">Store</Link>
        </div>
      </header>

      <section className="border-b border-[#1e1e2e] bg-[radial-gradient(circle_at_top_right,rgba(108,92,231,0.16),transparent_38%)]">
        <div className="mx-auto max-w-[1160px] px-5 py-20 sm:py-24">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#8f82ff]">XtineCheats resources</p>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-6xl">Gaming guides and product resources.</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#a0a0b8] sm:text-lg">
            Browse practical DonutSMP money guides and clear product checklists for every current XtineCheats listing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group rounded-2xl border border-[#1e1e2e] bg-[#0f0f18] p-7 transition-colors hover:border-[#6C5CE7]/60 hover:bg-[#141421]">
              <BookOpen size={22} className="mb-8 text-[#8f82ff]" />
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#77718d]">{guide.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white">{guide.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#a0a0b8]">{guide.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#a497ff]">Read guide <ArrowRight size={16} /></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = getGuide(slug);

  if (!guide) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#09090f] px-5 text-center text-white">
        <Seo title="Guide Not Found | XtineCheats" description="The requested XtineCheats guide is unavailable." path={`/guides/${slug ?? ''}`} noIndex />
        <h1 className="text-3xl font-extrabold">Guide not found</h1>
        <p className="max-w-md text-[#a0a0b8]">Browse the current XtineCheats resources for available guides.</p>
        <Link href="/guides" className="rounded-lg bg-[#6C5CE7] px-5 py-3 text-sm font-bold text-white">Browse guides</Link>
      </main>
    );
  }

  const relatedGuides = guides.filter((item) => item.slug !== guide.slug && item.productSlug === guide.productSlug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <Seo title={`${guide.title} | XtineCheats`} description={guide.description} path={`/guides/${guide.slug}/`} schema={guideSchema(guide.slug, guide.title, guide.description)} />
      <header className="border-b border-[#1e1e2e] bg-[#09090f]/95">
        <div className="mx-auto flex h-20 max-w-[960px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-white">
            <Gamepad2 size={20} className="text-[#6C5CE7]" />
            Xtine<span className="text-[#6C5CE7]">Cheats</span>
          </Link>
          <Link href="/guides" className="text-sm font-semibold text-[#a0a0b8] transition-colors hover:text-white">All guides</Link>
        </div>
      </header>

      <article className="mx-auto max-w-[840px] px-5 py-12 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-xs font-semibold text-[#77718d]">
          <Link href="/" className="hover:text-white">Home</Link><span>/</span>
          <Link href="/guides" className="hover:text-white">Guides</Link><span>/</span>
          <span className="truncate text-[#a0a0b8]">{guide.title}</span>
        </nav>

        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#8f82ff]">{guide.eyebrow}</p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl">{guide.title}</h1>
        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-[#b4b0c2]">{guide.intro}</p>

        <div className="mt-12 space-y-12">
          {guide.sections.map((section) => (
            <section key={section.heading} className="border-t border-[#1e1e2e] pt-10">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{section.heading}</h2>
              <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-[#b4b0c2]">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.bullets && (
                <ul className="mt-6 space-y-3 rounded-xl border border-[#252538] bg-[#10101a] p-5 text-sm leading-relaxed text-[#c2bfce]">
                  {section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#8f82ff]" />{bullet}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-2xl border border-[#6C5CE7]/35 bg-[#171426] p-7 sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a497ff]">Current listing</p>
          <h2 className="mt-3 text-2xl font-extrabold text-white">Ready to review the live options?</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#b4b0c2]">Open the product page to confirm the current price, selection, and delivery information before checkout.</p>
          <Link href={`/${guide.productSlug}`} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7c70ef]">
            {guide.productLabel} <ArrowRight size={16} />
          </Link>
        </section>

        {relatedGuides.length > 0 && (
          <section className="mt-14 border-t border-[#1e1e2e] pt-10">
            <h2 className="text-2xl font-extrabold text-white">Related DonutSMP guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {relatedGuides.map((item) => (
                <Link key={item.slug} href={`/guides/${item.slug}`} className="rounded-xl border border-[#1e1e2e] bg-[#0f0f18] p-5 transition-colors hover:border-[#6C5CE7]/60">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#a497ff]">Read guide <ArrowRight size={15} /></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link href="/guides" className="mt-12 inline-flex items-center gap-2 text-sm font-bold text-[#a0a0b8] transition-colors hover:text-white"><ArrowLeft size={16} /> All guides</Link>
      </article>
    </main>
  );
}