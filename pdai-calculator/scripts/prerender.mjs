// Build-time prerender: per-language static <head>. Без npm-зависимостей.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

export function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function extractViteAssetTags(shellHtml) {
  const re = /<script\b[^>]*\bsrc="\/assets\/[^"]*"[^>]*><\/script>|<link\b[^>]*\bhref="\/assets\/[^"]*"[^>]*>/g;
  const tags = shellHtml.match(re) || [];
  if (tags.length === 0) {
    throw new Error('prerender: no Vite asset tags found in dist/index.html — aborting (JS would not load)');
  }
  return tags;
}

export function buildJsonLd(lang, localizedDescription) {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'PDAI Calculator',
    description: localizedDescription,
    medicalSpecialty: 'Dermatology',
    mainEntity: {
      '@type': 'MedicalRiskCalculator',
      name: 'PDAI Score Calculator',
      description: 'Digital implementation of the Pemphigus Disease Area Index scoring system',
    },
    about: { '@type': 'MedicalCondition', name: 'Pemphigus', alternateName: 'Пузырчатка' },
    author: { '@type': 'Organization', name: 'International Pemphigus Definitions Committee' },
    creator: { '@type': 'Organization', name: 'Skin Lab Pro', url: 'https://skinlabpro.uz' },
    citation: {
      '@type': 'ScholarlyArticle',
      name: 'Consensus statement on definitions of disease, end points, and therapeutic response for pemphigus',
      author: 'Murrell DF, Dick S, Ahmed AR, et al.',
      datePublished: '2008',
      isPartOf: {
        '@type': 'PublicationVolume',
        volumeNumber: '58',
        isPartOf: { '@type': 'Periodical', name: 'Journal of the American Academy of Dermatology' },
      },
      url: 'https://doi.org/10.1016/j.jaad.2008.01.012',
    },
    inLanguage: [lang],
    isAccessibleForFree: true,
  };
  // Escape `<` to prevent premature </script> if any input ever contains it.
  // Defensive — current inputs are static, but this closes the entire vector.
  return JSON.stringify(obj, null, 2).replace(/</g, '\\u003C');
}

export function renderDocument(shellHtml, { lang, title, description, cfg }) {
  const assetTags = extractViteAssetTags(shellHtml);
  const url = `${cfg.SITE}/${lang}`;
  const ogImage = `${cfg.SITE}${cfg.OG_IMAGE}`;
  const t = escAttr(title);
  const d = escAttr(description);

  const verification = [];
  if (cfg.YANDEX_VERIFICATION) {
    verification.push(`<meta name="yandex-verification" content="${escAttr(cfg.YANDEX_VERIFICATION)}" />`);
  }
  if (cfg.GOOGLE_VERIFICATION) {
    verification.push(`<meta name="google-site-verification" content="${escAttr(cfg.GOOGLE_VERIFICATION)}" />`);
  }

  const hreflang = cfg.LANGS
    .map(l => `<link rel="alternate" hreflang="${l}" href="${cfg.SITE}/${l}" />`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${cfg.SITE}/${cfg.DEFAULT_LANG}" />`);

  const head = [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    ...verification,
    '<meta name="robots" content="index, follow" />',
    '<meta name="author" content="Skin Lab Pro" />',
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${escAttr(cfg.SITE_NAME)}" />`,
    `<meta property="og:locale" content="${cfg.OG_LOCALE[lang]}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escAttr(cfg.OG_IMAGE_ALT)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<meta name="twitter:image:alt" content="${escAttr(cfg.OG_IMAGE_ALT)}" />`,
    ...hreflang,
    `<script type="application/ld+json">\n${buildJsonLd(lang, description)}\n</script>`,
    ...assetTags,
  ].map(line => '    ' + line).join('\n');

  let out = shellHtml.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
  out = out.replace(/<head>[\s\S]*?<\/head>/, `<head>\n${head}\n  </head>`);
  return out;
}

export function buildSitemap(cfg, lastmod) {
  const alts = cfg.LANGS
    .map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${cfg.SITE}/${l}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.SITE}/${cfg.DEFAULT_LANG}"/>`)
    .join('\n');
  const urls = cfg.LANGS.map(l =>
`  <url>
    <loc>${cfg.SITE}/${l}</loc>
    <lastmod>${lastmod}</lastmod>
${alts}
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

export async function runMain() {
  const here = dirname(fileURLToPath(import.meta.url)); // pdai-calculator/scripts
  const root = join(here, '..');                        // pdai-calculator
  const distDir = join(root, 'dist');
  const cfg = await import(pathToFileURL(join(root, 'seo.config.js')).href);

  const shell = readFileSync(join(distDir, 'index.html'), 'utf8');
  const date = new Date().toISOString().slice(0, 10);

  for (const lang of cfg.LANGS) {
    const i18nPath = join(root, 'src', 'i18n', `${lang}.json`);
    const i18n = JSON.parse(readFileSync(i18nPath, 'utf8'));
    const title = i18n?.meta?.title;
    const description = i18n?.meta?.description;
    if (!title || !description) {
      console.error(`prerender: missing meta.title/description in ${lang}.json`);
      process.exit(1);
    }
    const htmlDoc = renderDocument(shell, { lang, title, description, cfg });
    mkdirSync(join(distDir, lang), { recursive: true });
    writeFileSync(join(distDir, lang, 'index.html'), htmlDoc, 'utf8');
  }

  // Корень / → x-default (DEFAULT_LANG). Тело SPA редиректит людей на /ru.
  const dl = cfg.DEFAULT_LANG;
  const di = JSON.parse(readFileSync(join(root, 'src', 'i18n', `${dl}.json`), 'utf8'));
  writeFileSync(
    join(distDir, 'index.html'),
    renderDocument(shell, { lang: dl, title: di.meta.title, description: di.meta.description, cfg }),
    'utf8'
  );

  writeFileSync(join(distDir, 'sitemap.xml'), buildSitemap(cfg, date), 'utf8');
  console.log(`prerender: wrote ${cfg.LANGS.length} lang pages + root + sitemap (lastmod ${date})`);
}

// Запуск только при прямом вызове (node scripts/prerender.mjs), не при import из теста.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMain();
}
