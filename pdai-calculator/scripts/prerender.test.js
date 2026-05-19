import { describe, it, expect } from 'vitest';
import { escAttr, extractViteAssetTags, buildJsonLd, renderDocument, buildSitemap } from './prerender.mjs';

const SHELL = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Skin Lab Pro" />
    <title>PDAI Calculator — Skin Lab Pro</title>
    <meta name="description" content="old english desc" />
    <script type="application/ld+json">
    { "@context": "https://schema.org" }
    </script>
    <script type="module" crossorigin src="/assets/index-BbW19ylY.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-TcJyCJzP.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

describe('escAttr', () => {
  it('escapes & < > " for HTML attribute context', () => {
    expect(escAttr('a & b "<c>"')).toBe('a &amp; b &quot;&lt;c&gt;&quot;');
  });
  it('leaves unicode (em dash, cyrillic) intact', () => {
    expect(escAttr('Калькулятор — PDAI')).toBe('Калькулятор — PDAI');
  });
});

describe('extractViteAssetTags', () => {
  it('extracts hashed script and stylesheet tags in document order', () => {
    const tags = extractViteAssetTags(SHELL);
    expect(tags).toEqual([
      '<script type="module" crossorigin src="/assets/index-BbW19ylY.js"></script>',
      '<link rel="stylesheet" crossorigin href="/assets/index-TcJyCJzP.css">',
    ]);
  });
  it('throws if no asset tags found (build would ship broken JS)', () => {
    expect(() => extractViteAssetTags('<html><head></head><body></body></html>'))
      .toThrow(/no Vite asset tags/i);
  });
});

describe('buildJsonLd', () => {
  it('localizes description and inLanguage per lang', () => {
    const json = buildJsonLd('uz', 'Bepul onlayn PDAI kalkulyatori');
    const obj = JSON.parse(json);
    expect(obj['@type']).toBe('MedicalWebPage');
    expect(obj.description).toBe('Bepul onlayn PDAI kalkulyatori');
    expect(obj.inLanguage).toEqual(['uz']);
    expect(obj.creator.url).toBe('https://skinlabpro.uz');
    expect(obj.about.alternateName).toBe('Пузырчатка');
  });
});

describe('renderDocument', () => {
  const cfg = {
    SITE: 'https://skinlabpro.uz', LANGS: ['ru','en','uz','kk'], DEFAULT_LANG: 'en',
    OG_IMAGE: '/og.png', OG_IMAGE_ALT: 'alt text', SITE_NAME: 'PDAI Calculator — Skin Lab Pro',
    OG_LOCALE: { ru:'ru_RU', en:'en_US', uz:'uz_UZ', kk:'kk_KZ' },
    YANDEX_VERIFICATION: 'yatoken', GOOGLE_VERIFICATION: '',
  };
  const html = renderDocument(SHELL, { lang: 'uz', title: 'UZ Title', description: 'UZ Desc "x"', cfg });

  it('rewrites <html lang>', () => {
    expect(html).toContain('<html lang="uz">');
    expect(html).not.toContain('<html lang="ru">');
  });
  it('injects localized title and escaped description', () => {
    expect(html).toContain('<title>UZ Title</title>');
    expect(html).toContain('<meta name="description" content="UZ Desc &quot;x&quot;" />');
  });
  it('sets canonical and og:url per lang', () => {
    expect(html).toContain('<link rel="canonical" href="https://skinlabpro.uz/uz" />');
    expect(html).toContain('<meta property="og:url" content="https://skinlabpro.uz/uz" />');
  });
  it('emits absolute og:image + large twitter card + og:locale', () => {
    expect(html).toContain('<meta property="og:image" content="https://skinlabpro.uz/og.png" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta property="og:locale" content="uz_UZ" />');
  });
  it('emits 4 hreflang + x-default→/en', () => {
    for (const l of ['ru','en','uz','kk']) {
      expect(html).toContain(`<link rel="alternate" hreflang="${l}" href="https://skinlabpro.uz/${l}" />`);
    }
    expect(html).toContain('<link rel="alternate" hreflang="x-default" href="https://skinlabpro.uz/en" />');
  });
  it('emits verification meta only when token non-empty', () => {
    expect(html).toContain('<meta name="yandex-verification" content="yatoken" />');
    expect(html).not.toContain('google-site-verification');
  });
  it('preserves Vite asset tags verbatim', () => {
    expect(html).toContain('<script type="module" crossorigin src="/assets/index-BbW19ylY.js"></script>');
    expect(html).toContain('<link rel="stylesheet" crossorigin href="/assets/index-TcJyCJzP.css">');
  });
  it('localized JSON-LD inLanguage', () => {
    expect(html).toContain('"inLanguage": [\n    "uz"\n  ]');
  });
  it('keeps body untouched', () => {
    expect(html).toContain('<body>\n    <div id="root"></div>\n  </body>');
  });
});

describe('buildSitemap', () => {
  const cfg = { SITE:'https://skinlabpro.uz', LANGS:['ru','en','uz','kk'], DEFAULT_LANG:'en' };
  const xml = buildSitemap(cfg, '2026-05-19');
  it('one <url> per lang with loc and lastmod', () => {
    expect((xml.match(/<loc>/g) || []).length).toBe(4);
    expect(xml).toContain('<loc>https://skinlabpro.uz/ru</loc>');
    expect((xml.match(/<lastmod>2026-05-19<\/lastmod>/g) || []).length).toBe(4);
  });
  it('each url has full hreflang alternates incl x-default', () => {
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://skinlabpro.uz/en"/>');
    expect((xml.match(/hreflang="uz"/g) || []).length).toBe(4); // 4 url × 1 each
  });
  it('valid urlset envelope', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });
});

export { SHELL };
