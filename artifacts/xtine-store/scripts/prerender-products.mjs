// Runs after `vite build`. Gives every product its own HTML file
// (dist/public/<product>.html) with that product's title, description,
// link preview image and structured data already in the page, so search
// engines and link previews (Discord, X, iMessage) see the right product
// without running JavaScript. The store app still loads on top as usual.
// Also writes the sitemap from the same product list, so new products are
// picked up automatically.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { transformWithEsbuild } from 'vite';

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://xtinecheats.com').replace(/\/$/, '');
const root = process.cwd();
const dist = join(root, 'dist/public');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const toSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const absolute = (path) => (path.startsWith('http') ? path : `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`);

// ── Product list, read from src/data.ts so it never drifts from the store ──
const assets = await readdir(join(dist, 'assets')).catch(() => []);
let source = await readFile(join(root, 'src/data.ts'), 'utf8');
// Image imports become the built file's address (Vite names it <name>-<hash>.<ext>).
source = source.replace(/^import\s+(\w+)\s+from\s+['"]@assets\/([^'"]+)['"];?$/gm, (_, name, file) => {
  const base = file.replace(/\.[^.]+$/, '');
  const built = assets.find((asset) => asset.startsWith(`${base}-`) || asset.startsWith(`${base}.`));
  return `const ${name} = ${JSON.stringify(built ? `/assets/${built}` : '/favicon.png')};`;
});
const { code } = await transformWithEsbuild(source, 'data.ts', { loader: 'ts', format: 'esm' });
const { defaultProducts } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const products = defaultProducts.filter((product) => product.listed !== false);

// ── Helpers ──────────────────────────────────────────────────────────────────
function prices(product) {
  return product.purchaseType === 'unit'
    ? (product.unitOptions ?? []).map((option) => option.price)
    : [...product.durations.map((duration) => duration.price), ...(product.unitOptions ?? []).map((option) => option.price)];
}

const money = (value) => `$${value.toFixed(value < 1 ? 3 : 2).replace(/(\.\d\d)0$/, '$1')}`;

function productSchema(product) {
  const lowest = Math.min(...prices(product));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: absolute(product.image),
        category: product.category,
        brand: { '@type': 'Brand', name: 'XtineCheats' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: lowest.toFixed(lowest < 1 ? 3 : 2),
          availability: 'https://schema.org/InStock',
          url: absolute(`/${toSlug(product.name)}`),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: product.name, item: absolute(`/${toSlug(product.name)}`) },
        ],
      },
    ],
  };
}

function noscriptBody(product) {
  const plans = product.durations.map((duration) => `<li>${escapeHtml(duration.label)}: ${money(duration.price)}</li>`);
  const options = (product.unitOptions ?? []).map((option) => `<li>${escapeHtml(option.name)}: ${money(option.price)} per ${escapeHtml(option.unitLabel)}</li>`);
  const list = [...plans, ...options];
  return `<noscript>
      <main>
        <h1>${escapeHtml(product.name)}</h1>
        <p>${escapeHtml(product.description)}</p>
        ${list.length ? `<ul>${list.join('')}</ul>` : ''}
        <p>${escapeHtml(product.eta || '')}</p>
        <p><a href="/">Browse all XtineCheats products</a> · <a href="/guides/">Guides</a></p>
      </main>
    </noscript>`;
}

/** Replaces one tag's content attribute (or adds the tag before </head>). */
function setMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function pageFor(template, product) {
  const path = `/${toSlug(product.name)}`;
  // Same title and description the product page sets once the app loads.
  const title = `${product.name} Gaming Service | XtineCheats`;
  const description = `${product.description} Browse options and purchase through XtineCheats.`;
  const image = absolute(product.image);

  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${absolute(path)}" />`);
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', absolute(path));
  html = setMeta(html, 'property', 'og:type', 'product');
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'name', 'twitter:image', image);
  html = html.replace(
    '</head>',
    `    <script type="application/ld+json" id="route-schema">${JSON.stringify(productSchema(product)).replaceAll('<', '\\u003c')}</script>\n  </head>`,
  );
  html = html.replace(/<noscript>\s*<main>[\s\S]*?<\/main>\s*<\/noscript>/, noscriptBody(product));
  return html;
}

// ── Write the pages ──────────────────────────────────────────────────────────
const template = await readFile(join(dist, 'index.html'), 'utf8');
for (const product of products) {
  await writeFile(join(dist, `${toSlug(product.name)}.html`), pageFor(template, product));
}

// The home page also gets a link preview image.
const homeImage = absolute(products[0]?.image ?? '/favicon.png');
let home = setMeta(template, 'property', 'og:image', homeImage);
home = setMeta(home, 'name', 'twitter:image', homeImage);
await writeFile(join(dist, 'index.html'), home);

// ── Sitemap: home, every listed product, the guides ─────────────────────────
const guides = JSON.parse(await readFile(join(root, 'src/guides.json'), 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const paths = ['/', ...products.map((product) => `/${toSlug(product.name)}`), '/guides/', ...guides.map((guide) => `/guides/${guide.slug}/`)];
const urls = paths.map((path) => `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n');
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log(`Prerendered ${products.length} product pages and the sitemap (${paths.length} pages).`);
