# SEO Prerender для skinlabpro.uz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Не-JS краулеры (YandexBot, Telegram/FB-скрейперы) и сервисы верификации получают на каждый маршрут `/ru /en /uz /kk` статический HTML с локализованной метой, OG-картинкой и verification — без headless-браузера и без рефактора SPA.

**Architecture:** Build-time Node-скрипт `scripts/prerender.mjs` (без npm-зависимостей) пост-обрабатывает `vite build`: на каждый язык переписывает `<head>` и `<html lang>` в `dist/<lang>/index.html`, сохраняя Vite-инжектированные ассет-теги дословно; генерит `dist/sitemap.xml` с `<lastmod>` и x-default-корень. Тело SPA не трогается — пользователи получают тот же клиентский рендер. Верификация чинится тем, что реальные файлы появляются в `dist/` (раньше SPA-fallback отдавал index.html на любой путь).

**Tech Stack:** Node 22 ESM, Vite 7, React 19, react-router 7, react-i18next, vitest 4, nginx (Docker), GitHub Actions (push→master).

**Spec:** `docs/superpowers/specs/2026-05-19-skinlabpro-seo-design.md`
**Рабочая ветка:** `feature/seo-prerender` (от `origin/master` @ 435cfe4). Репо-корень `C:/Users/Alex/10_Projects/pdai_calculator/`, приложение в `pdai-calculator/`. Все пути ниже — относительно `pdai-calculator/`, если не указано иное.

---

## File Structure

| Файл | Ответственность |
|---|---|
| `seo.config.js` | Единственный источник SEO-констант (SITE, LANGS, локали, verification-токены) |
| `scripts/prerender.mjs` | Чистые функции (escAttr, extractViteAssetTags, buildJsonLd, renderDocument, buildSitemap) + `main()` FS-оркестрация |
| `scripts/prerender.test.js` | vitest для чистых функций |
| `package.json` | `build` += `&& node scripts/prerender.mjs` |
| `src/components/SEOHead.jsx` | Паритет клиентской меты со статикой (kk_KZ, og:image, twitter large) |
| `public/og.svg` | Редактируемый источник OG-картинки (вариант C) |
| `public/og.png` | Растровый OG-ассет 1200×630 (коммит-бинарь, ручной экспорт) |
| `docs/superpowers/runbooks/2026-05-19-skinlabpro-seo-verification.md` | Пост-деплой runbook (Webmaster/GSC, merge в master) |

---

## Task 1: Branch-гигиена

**Files:** только git (без файлов).

- [ ] **Step 1: Проверить состояние веток**

Run (из репо-корня `C:/Users/Alex/10_Projects/pdai_calculator`):
```bash
git branch -vv
git rev-parse --short HEAD origin/master
```
Expected: текущая ветка `feature/seo-prerender`, HEAD и `origin/master` оба `435cfe4` (либо feature на 1 коммит впереди — spec-коммит `4f63649`).

- [ ] **Step 2: Выровнять локальный `master` на `origin/master`, удалить stale `master-tmp`**

Run:
```bash
git branch -f master origin/master
git branch -D master-tmp
git branch
```
Expected: `master` указывает на `origin/master`; `master-tmp` исчез; остаются `feature/seo-prerender`, `master`, `initial`.
Примечание: удалённые `origin/main`, `origin/initial` НЕ трогаем (решение Alex, вне плана).

- [ ] **Step 3: Вернуться на рабочую ветку**

Run:
```bash
git switch feature/seo-prerender
git rev-parse --abbrev-ref HEAD
```
Expected: `feature/seo-prerender`. (Коммита нет — это git-гигиена.)

---

## Task 2: `seo.config.js`

**Files:**
- Create: `seo.config.js`

- [ ] **Step 1: Создать `seo.config.js`**

Создать `pdai-calculator/seo.config.js`:
```js
// Единственный источник SEO-констант. Читается scripts/prerender.mjs и тестом.
export const SITE = 'https://skinlabpro.uz';
export const LANGS = ['ru', 'en', 'uz', 'kk'];
export const DEFAULT_LANG = 'en'; // x-default + корень / ; соответствует sitemap и SEOHead.jsx
export const OG_IMAGE = '/og.png';
export const OG_IMAGE_ALT = 'PDAI Calculator — Pemphigus Disease Area Index — skinlabpro.uz';
export const OG_LOCALE = { ru: 'ru_RU', en: 'en_US', uz: 'uz_UZ', kk: 'kk_KZ' };
export const SITE_NAME = 'PDAI Calculator — Skin Lab Pro';
// Вставит Alex после заведения проперти. Пустая строка → <meta> не пишется, билд не падает.
export const YANDEX_VERIFICATION = '';
export const GOOGLE_VERIFICATION = '';
```

- [ ] **Step 2: Проверить, что модуль валиден**

Run (из `pdai-calculator/`):
```bash
node -e "import('./seo.config.js').then(m=>console.log(m.LANGS, m.OG_LOCALE.kk))"
```
Expected: `[ 'ru', 'en', 'uz', 'kk' ] kk_KZ`

- [ ] **Step 3: Commit**

```bash
git add pdai-calculator/seo.config.js
git commit -m "feat(seo): add seo.config.js single source of SEO constants"
```

---

## Task 3: `prerender.mjs` — `escAttr` + `extractViteAssetTags` (TDD)

**Files:**
- Create: `scripts/prerender.mjs`
- Create: `scripts/prerender.test.js`

- [ ] **Step 1: Написать падающий тест**

Создать `pdai-calculator/scripts/prerender.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { escAttr, extractViteAssetTags } from './prerender.mjs';

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

export { SHELL };
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run (из `pdai-calculator/`):
```bash
npx vitest run scripts/prerender.test.js
```
Expected: FAIL — `Failed to resolve import "./prerender.mjs"` / функции не определены.

- [ ] **Step 3: Минимальная реализация**

Создать `pdai-calculator/scripts/prerender.mjs`:
```js
// Build-time prerender: per-language static <head>. Без npm-зависимостей.

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
```

- [ ] **Step 4: Запустить тест — убедиться, что проходит**

Run:
```bash
npx vitest run scripts/prerender.test.js
```
Expected: PASS (4 теста: escAttr ×2, extractViteAssetTags ×2).

- [ ] **Step 5: Commit**

```bash
git add pdai-calculator/scripts/prerender.mjs pdai-calculator/scripts/prerender.test.js
git commit -m "feat(seo): prerender escAttr + extractViteAssetTags (TDD)"
```

---

## Task 4: `prerender.mjs` — `buildJsonLd` (TDD)

**Files:**
- Modify: `scripts/prerender.mjs`
- Modify: `scripts/prerender.test.js`

- [ ] **Step 1: Дописать падающий тест**

Добавить в `scripts/prerender.test.js` (новый блок в конце, перед `export`):
```js
import { buildJsonLd } from './prerender.mjs';

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
```
(Передвинуть `import { buildJsonLd } ...` к остальным импортам наверху файла — не держать import в середине.)

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run scripts/prerender.test.js`
Expected: FAIL — `buildJsonLd is not a function`.

- [ ] **Step 3: Реализация**

Добавить в `scripts/prerender.mjs`:
```js
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
  return JSON.stringify(obj, null, 2);
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npx vitest run scripts/prerender.test.js`
Expected: PASS (добавился buildJsonLd-блок).

- [ ] **Step 5: Commit**

```bash
git add pdai-calculator/scripts/prerender.mjs pdai-calculator/scripts/prerender.test.js
git commit -m "feat(seo): prerender buildJsonLd localized MedicalWebPage (TDD)"
```

---

## Task 5: `prerender.mjs` — `renderDocument` (TDD, ядро)

**Files:**
- Modify: `scripts/prerender.mjs`
- Modify: `scripts/prerender.test.js`

- [ ] **Step 1: Дописать падающий тест**

Добавить `renderDocument` в верхний импорт и новый блок в `scripts/prerender.test.js`:
```js
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
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run scripts/prerender.test.js`
Expected: FAIL — `renderDocument is not a function`.

- [ ] **Step 3: Реализация**

Добавить в `scripts/prerender.mjs`:
```js
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
    ...hreflang,
    `<script type="application/ld+json">\n${buildJsonLd(lang, description)}\n</script>`,
    ...assetTags,
  ].map(line => '    ' + line).join('\n');

  let out = shellHtml.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
  out = out.replace(/<head>[\s\S]*?<\/head>/, `<head>\n${head}\n  </head>`);
  return out;
}
```
Примечание: JSON-LD внутри `<script>` не эскейпится через escAttr — `JSON.stringify` уже безопасен для JSON; `</script>` в данных не появляется (контент контролируемый). Тест на `inLanguage` подтверждает форму.

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npx vitest run scripts/prerender.test.js`
Expected: PASS — все блоки renderDocument зелёные.

- [ ] **Step 5: Commit**

```bash
git add pdai-calculator/scripts/prerender.mjs pdai-calculator/scripts/prerender.test.js
git commit -m "feat(seo): prerender renderDocument per-lang head (TDD)"
```

---

## Task 6: `prerender.mjs` — `buildSitemap` (TDD)

**Files:**
- Modify: `scripts/prerender.mjs`
- Modify: `scripts/prerender.test.js`

- [ ] **Step 1: Дописать падающий тест**

Добавить `buildSitemap` в верхний импорт и блок:
```js
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
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run scripts/prerender.test.js`
Expected: FAIL — `buildSitemap is not a function`.

- [ ] **Step 3: Реализация**

Добавить в `scripts/prerender.mjs`:
```js
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
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npx vitest run scripts/prerender.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add pdai-calculator/scripts/prerender.mjs pdai-calculator/scripts/prerender.test.js
git commit -m "feat(seo): prerender buildSitemap with lastmod (TDD)"
```

---

## Task 7: `prerender.mjs` — `runMain()` FS-оркестрация

**Files:**
- Modify: `scripts/prerender.mjs`

- [ ] **Step 1: Добавить `runMain()` + direct-run guard**

В начало `scripts/prerender.mjs` (вместе с прочими, до функций) добавить импорты:
```js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
```

Дописать в конец `scripts/prerender.mjs`:
```js
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
```
Замечания: (1) `import`-декларации ESM хостятся — добавлять их в начало файла. (2) `pathToFileURL` обязателен: на Windows путь с бэкслэшами ломает `file://`-схему динамического `import()`. (3) Файл экспортирует чистые функции + `runMain`; функции `main` нет.

- [ ] **Step 2: Прогнать чистые тесты — регрессий нет**

Run (из `pdai-calculator/`): `npx vitest run scripts/prerender.test.js`
Expected: PASS (импорт `runMain`/FS-кода не исполняет FS при import — guard `process.argv[1]` срабатывает только при прямом запуске).

- [ ] **Step 3: Smoke — реальный прогон на свежем билде**

Run (из `pdai-calculator/`):
```bash
npx vite build
node scripts/prerender.mjs
ls dist/ru/index.html dist/uz/index.html dist/sitemap.xml
grep -o '<html lang="uz">' dist/uz/index.html
grep -c '/assets/' dist/ru/index.html
```
Expected: файлы существуют; `<html lang="uz">` найден; `/assets/` встречается ≥2 раз в `dist/ru/index.html` (script+link сохранены).

- [ ] **Step 4: Commit**

```bash
git add pdai-calculator/scripts/prerender.mjs
git commit -m "feat(seo): prerender main() FS orchestration (per-lang + root + sitemap)"
```

---

## Task 8: `package.json` build hook

**Files:**
- Modify: `package.json` (строка `"build"`)

- [ ] **Step 1: Изменить build-скрипт**

В `pdai-calculator/package.json` заменить:
```json
"build": "vite build",
```
на:
```json
"build": "vite build && node scripts/prerender.mjs",
```

- [ ] **Step 2: Полный билд через npm**

Run (из `pdai-calculator/`):
```bash
rm -rf dist
npm run build
node -e "const h=require('fs').readFileSync('dist/kk/index.html','utf8'); if(!h.includes('<html lang=\"kk\">')||!h.includes('og:image')) {console.error('FAIL');process.exit(1)} console.log('OK kk page')"
```
Expected: `OK kk page`. Билд проходит, prerender отработал в составе `npm run build`.

- [ ] **Step 3: Commit**

```bash
git add pdai-calculator/package.json
git commit -m "build(seo): run prerender after vite build"
```

---

## Task 9: `SEOHead.jsx` паритет клиентской меты

**Files:**
- Modify: `src/components/SEOHead.jsx`

Цель: клиентский (после JS) head совпадал со статическим — `kk_KZ`, `og:image`, `twitter:image`, `twitter:card=summary_large_image`.

- [ ] **Step 1: Исправить kk-локаль и добавить image-теги**

В `pdai-calculator/src/components/SEOHead.jsx`:

Заменить строку:
```jsx
      <meta property="og:locale" content={currentLang === 'ru' ? 'ru_RU' : currentLang === 'uz' ? 'uz_UZ' : currentLang === 'kk' ? 'kk_KK' : 'en_US'} />
```
на:
```jsx
      <meta property="og:locale" content={currentLang === 'ru' ? 'ru_RU' : currentLang === 'uz' ? 'uz_UZ' : currentLang === 'kk' ? 'kk_KZ' : 'en_US'} />
      <meta property="og:image" content={`${SITE_URL}/og.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="PDAI Calculator — Pemphigus Disease Area Index — skinlabpro.uz" />
```

Заменить строку:
```jsx
      <meta name="twitter:card" content="summary" />
```
на:
```jsx
      <meta name="twitter:card" content="summary_large_image" />
```

Добавить сразу после `<meta name="twitter:description" .../>`:
```jsx
      <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
```

- [ ] **Step 2: Lint + сборка не сломаны**

Run (из `pdai-calculator/`):
```bash
npm run lint
npx vite build
```
Expected: lint без ошибок; build успешен.

- [ ] **Step 3: Commit**

```bash
git add pdai-calculator/src/components/SEOHead.jsx
git commit -m "fix(seo): SEOHead parity — kk_KZ, og:image, twitter large card"
```

---

## Task 10: OG-картинка (вариант C)

**Files:**
- Create: `public/og.svg`
- Create: `public/og.png` (бинарь, ручной экспорт)

- [ ] **Step 1: Создать `public/og.svg`**

Создать `pdai-calculator/public/og.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="Arial, Helvetica, sans-serif">
  <rect width="1200" height="630" fill="#0f172a"/>
  <text x="80" y="250" fill="#818cf8" font-size="26" font-weight="700" letter-spacing="3">CLINICAL SCORING</text>
  <text x="78" y="330" fill="#ffffff" font-size="72" font-weight="800">PDAI Calculator</text>
  <text x="80" y="385" fill="#94a3b8" font-size="32">Pemphigus Disease Area Index</text>
  <text x="80" y="470" fill="#cbd5e1" font-size="24" font-weight="600">skinlabpro.uz · Skin Lab Pro</text>
  <g transform="translate(965 315)">
    <circle r="150" fill="none" stroke="#1e293b" stroke-width="34"/>
    <circle r="150" fill="none" stroke="#6366f1" stroke-width="34" stroke-linecap="round"
            stroke-dasharray="640 943" transform="rotate(-90)"/>
    <text x="0" y="-2" text-anchor="middle" fill="#ffffff" font-size="58" font-weight="900">0–250</text>
    <text x="0" y="34" text-anchor="middle" fill="#94a3b8" font-size="20">severity range</text>
  </g>
</svg>
```

- [ ] **Step 2: Экспортировать `public/og.png` (ручной one-off, вне build)**

Run (из `pdai-calculator/`, основной способ — кроссплатформенный `svgexport` через npx, без добавления в deps):
```bash
npx -y svgexport public/og.svg public/og.png 1200:630
```
Expected: создан `public/og.png` 1200×630.

Fallback (если `svgexport`/Chromium недоступен): открыть `public/og.svg` в Chrome, окно 1200×630, сделать скриншот, сохранить как `public/og.png`.

Проверка:
```bash
node -e "const s=require('fs').statSync('public/og.png'); console.log('og.png bytes:', s.size)"
```
Expected: размер > 0 (обычно 20–80 КБ).

- [ ] **Step 3: Убедиться, что Vite копирует ассет в dist**

Run (из `pdai-calculator/`):
```bash
npm run build
ls dist/og.png dist/og.svg
```
Expected: оба файла в `dist/` (Vite копирует `public/*`).

- [ ] **Step 4: Commit**

```bash
git add pdai-calculator/public/og.svg pdai-calculator/public/og.png
git commit -m "feat(seo): OG image variant C (svg source + png 1200x630)"
```

---

## Task 11: Verification runbook

**Files:**
- Create: `docs/superpowers/runbooks/2026-05-19-skinlabpro-seo-verification.md` (в репо-корне)

- [ ] **Step 1: Создать runbook**

Создать `C:/Users/Alex/10_Projects/pdai_calculator/docs/superpowers/runbooks/2026-05-19-skinlabpro-seo-verification.md`:
```markdown
# Runbook — деплой и верификация SEO skinlabpro.uz

## A. Merge → деплой (CI деплоит только master)
1. Убедиться: `feature/seo-prerender` зелёная (`npm run lint && npm test && npm run build` в pdai-calculator/).
2. `git switch master && git merge --no-ff feature/seo-prerender`
3. `git push origin master`  ← триггерит GitHub Actions (check → SSH deploy: git reset --hard origin/master + docker rebuild).
4. Дождаться зелёного workflow в GitHub Actions.

## B. Smoke прода (как краулер, без JS)
- `curl -s -A "YandexBot" https://skinlabpro.uz/uz | grep -E '<html lang|og:image|twitter:card|hreflang'`
  Ожидание: `lang="uz"`, `og:image .../og.png`, `summary_large_image`, hreflang-блок.
- `curl -s https://skinlabpro.uz/sitemap.xml | grep lastmod` → дата сборки.
- `curl -sI https://skinlabpro.uz/og.png` → `200`, `content-type: image/png`.

## C. Yandex.Webmaster (Alex выполняет — аккаунт/проперти заводит сам)
1. webmaster.yandex.ru → добавить сайт `https://skinlabpro.uz`.
2. Метод «Мета-тег»: скопировать `content` токена → `seo.config.js` → `YANDEX_VERIFICATION`.
   ИЛИ метод «HTML-файл»: положить выданный `yandex_<token>.html` в `pdai-calculator/public/`.
3. Коммит токена/файла на `feature/seo-prerender` → merge → push master → деплой (A).
4. Проверить файловый путь: `curl -s https://skinlabpro.uz/yandex_<token>.html` → должен вернуть ТОКЕН, не HTML SPA.
5. В Вебмастере нажать «Проверить». Сабмитнуть `https://skinlabpro.uz/sitemap.xml`.

## D. Google Search Console (аналогично)
1. search.google.com/search-console → property URL-prefix `https://skinlabpro.uz`.
2. Метод «HTML tag»: `content` → `seo.config.js` → `GOOGLE_VERIFICATION`.
   ИЛИ «HTML file»: `google<token>.html` в `pdai-calculator/public/`.
3. Коммит → merge → push → деплой → «Verify». Сабмит sitemap.

## E. Соц-превью
- Telegram: отправить ссылку https://skinlabpro.uz/ru в Saved Messages → карточка C.
- Facebook debugger: developers.facebook.com/tools/debug/ → Scrape Again.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/runbooks/2026-05-19-skinlabpro-seo-verification.md
git commit -m "docs(seo): post-deploy verification runbook"
```

---

## Task 12: Финальная интеграция

**Files:** только проверки + финальный статус (без новых файлов).

- [ ] **Step 1: Полный гейт локально (как CI `check`)**

Run (из `pdai-calculator/`):
```bash
npm ci
npm run lint
npm test
npm run build
```
Expected: всё зелёное; `dist/{ru,en,uz,kk}/index.html`, `dist/index.html`, `dist/sitemap.xml`, `dist/og.png` на месте.

- [ ] **Step 2: Финальные ассерты вывода**

Run (из `pdai-calculator/`):
```bash
for l in ru en uz kk; do
  grep -q "<html lang=\"$l\">" dist/$l/index.html && \
  grep -q 'og:image" content="https://skinlabpro.uz/og.png"' dist/$l/index.html && \
  grep -q "canonical\" href=\"https://skinlabpro.uz/$l\"" dist/$l/index.html && \
  echo "$l OK" || echo "$l FAIL";
done
grep -q '<lastmod>' dist/sitemap.xml && echo "sitemap OK"
```
Expected: `ru OK`, `en OK`, `uz OK`, `kk OK`, `sitemap OK`.

- [ ] **Step 3: Краткий статус-отчёт пользователю**

Сообщить Alex: гейт зелёный, ветка `feature/seo-prerender` готова к merge. Дальнейшие действия (merge → push master → деплой → верификация Webmaster/GSC) — по runbook `docs/superpowers/runbooks/2026-05-19-skinlabpro-seo-verification.md`. Напомнить: вписать verification-токены в `seo.config.js` после заведения проперти; push в `master` подтверждает/делает Alex.

(Без коммита — это финальная проверка и хендофф.)

---

## Self-Review (выполнено автором плана)

- **Spec coverage:** §3.1 build hook → T8; §3.2 prerender алгоритм → T3–T7; §3.3 seo.config.js → T2; §3.4 OG → T10; §3.5 верификация → T7 (мета) + T10/T11 (файл) + runbook T11; §3.6 деплой/ветки → T1 + T11; §3.7 чистки (kk_KZ, SEOHead паритет, sitemap генерёж, JSON-LD локализация) → T9 + T5 + T6; §6 тесты → T3–T6 + T12; §7 файлы → все покрыты. Пробелов нет.
- **Placeholder scan:** код приведён полностью в каждом шаге; verification-токены — документированный вход (пустая строка = валидное поведение, не placeholder).
- **Type/signature consistency:** `escAttr`, `extractViteAssetTags`, `buildJsonLd(lang, desc)`, `renderDocument(shell,{lang,title,description,cfg})`, `buildSitemap(cfg,lastmod)`, `runMain()` — имена и сигнатуры консистентны между задачами и тестами.
- Исправлено инлайн: Windows `pathToFileURL` для динамического импорта `seo.config.js`; единая `runMain()` (без заглушки-`main`); direct-run guard через `process.argv[1]` чтобы import из теста не писал в FS.
