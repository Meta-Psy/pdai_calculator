import { describe, it, expect } from 'vitest';
import { escAttr, extractViteAssetTags, buildJsonLd } from './prerender.mjs';

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

export { SHELL };
