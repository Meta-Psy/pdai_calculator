# Design — SEO prerender для skinlabpro.uz (PDAI Calculator)

- **Дата:** 2026-05-19
- **Статус:** Approved (дизайн утверждён Alex, OG-вариант C)
- **Репо:** `pdai_calculator/` (приложение в подпапке `pdai-calculator/`)
- **Ветка работы:** `feature/seo-prerender` (от `origin/master` @ 435cfe4)

---

## 1. Контекст и проблема

`skinlabpro.uz` — SPA: React 19 + Vite + react-router 7, i18n (ru/en/uz/kk) через
`react-i18next`. Деплой: GitHub Actions (`.github/workflows/deploy.yml`,
триггер `push` в `master`) → сервер делает `git reset --hard origin/master` +
`docker compose build --no-cache` + `up`. Dockerfile (multi-stage) собирает Vite,
nginx отдаёт `dist/` со SPA-fallback `try_files $uri $uri/ /index.html`.

Диагностика живого сайта (`curl` под `YandexBot`) выявила корневые причины:

1. **Один статический `index.html` на все маршруты.** `/`, `/ru`, `/uz`, `/en`,
   `/kk` и любой несуществующий путь отдают один и тот же `dist/index.html`
   (`<html lang="ru">` хардкод, английские title/description, только JSON-LD,
   **ноль `og:`-тегов, ноль verification-мета**). Динамический `SEOHead.jsx`
   виден только после исполнения JS.
2. **Не-JS краулеры/скрейперы слепы.** YandexBot (доминирует на `.uz`),
   Telegram/WhatsApp/Facebook link-preview скрейперы JS не исполняют → не видят
   локализованную мету, OG, hreflang.
3. **Верификация ломается by design.** SPA-fallback отдаёт HTTP 200 + `index.html`
   на ЛЮБОЙ путь (подтверждено: `/bogus-xyz.html` → 200, тот же `<title>`).
   - Файловый метод: верификатор тянет `/yandex_<token>.html` → получает 200, но
     контент = SPA index, не токен → fail навсегда.
   - Мета-метод: тег в JS-рендеренном `SEOHead` → верификатор без JS не видит → fail.
   Прошлая попытка Alex'а «ждал сутки, не подтвердилось» — это не вопрос времени,
   архитектура ломает оба метода.
4. **Дисциплина веток.** CI деплоит только `master`. Локально: `initial ==
   origin/master` (435cfe4); `master` диверг (3464036); `master-tmp` (27de9d1),
   `origin/main` (3a4d658) — устаревший мусор. Работа в не-master ветке не
   деплоится — вероятная причина «ничего не обновилось».

## 2. Цели / Не-цели

**Переформулировка:** SEO-требование здесь — **статический `<head>` на язык**
(title/description/OG/canonical/hreflang/JSON-LD/verification), а НЕ серверный
рендер тела калькулятора. Тело — интерактивный инструмент, не индексируемая
проза; Googlebot исполнит его JS сам.

**Цели:**

- Каждый маршрут `/ru /en /uz /kk` отдаёт не-JS краулеру статический HTML с
  корректным `<html lang>`, локализованными title/description, canonical,
  hreflang+x-default, OG (вкл. `og:image`), Twitter card, локализованным JSON-LD,
  verification-мета.
- Верификация Yandex.Webmaster + Google Search Console работает обоими методами
  (HTML-файл + мета).
- OG-картинка 1200×630 (вариант C) в соц-превью.
- `sitemap.xml` с `<lastmod>`, единый источник истины.
- Изменения доезжают до прода (ветка `master`, CI).
- SEO regression-proof (тест в CI-гейте до деплоя).

**Не-цели (YAGNI):**

- Полный SSR/SSG тела приложения.
- Локализация OG-картинки (один языко-нейтральный ассet — «PDAI Calculator»
  языко-независимо).
- Headless-браузер в build-пайплайне.
- Изменение поведения SPA для пользователей (клиентский редирект `*→/ru`
  остаётся).
- Создание аккаунтов/проперти в Webmaster/GSC (делает Alex — токены = вход).

## 3. Архитектура

### 3.1. Build-пайплайн

`pdai-calculator/package.json`:

```
"build": "vite build && node scripts/prerender.mjs"
```

`vite build` пишет `dist/` как сейчас. Затем `scripts/prerender.mjs` (Node 22,
ESM, **без npm-зависимостей**) пост-обрабатывает `dist/`. Запускается:

- в Docker-сборке на сервере (Dockerfile уже зовёт `npm run build`);
- в CI-job `check` (тоже `npm run build`) → SEO падает в гейте до деплоя.

### 3.2. `scripts/prerender.mjs` — алгоритм

Вход: собранный `dist/index.html`, `src/i18n/{ru,en,uz,kk}.json`, `seo.config.js`.

1. Прочитать `dist/index.html` в строку `shell`.
2. **Извлечь Vite-инжектированные теги ассетов** из `<head>` регэкспом:
   все `<script ... src="/assets/...">` и `<link ... href="/assets/...">`.
   Сохранить дословно в массив `viteAssetTags` (хэши имён нельзя терять).
3. Прочитать `seo.config.js`: `SITE`, `LANGS`, `DEFAULT_LANG`, `OG_IMAGE`,
   `OG_LOCALE` (мапа lang→`xx_YY`), `YANDEX_VERIFICATION`, `GOOGLE_VERIFICATION`.
4. Для каждого `lang` из `LANGS`:
   - Прочитать `meta.title`, `meta.description` из соответствующего i18n JSON.
     **Если ключа нет → `console.error` + `process.exit(1)`** (не деплоим
     битую мету).
   - Собрать `<head>` ЗАНОВО из частей (не string-replace всего head):
     - `<meta charset>`, `<meta viewport>`, `<link rel="icon">` (статичные, копия
       из shell);
     - verification-мета (Yandex + Google), если токен непустой;
     - `<title>`, `<meta name="description">` (локализованные);
     - `<meta name="robots" content="index, follow">`, `<meta name="author">`;
     - `<link rel="canonical" href="{SITE}/{lang}">`;
     - hreflang: по одному `<link rel="alternate" hreflang="{l}" href="{SITE}/{l}">`
       для всех `LANGS` + `<link rel="alternate" hreflang="x-default"
       href="{SITE}/{DEFAULT_LANG}">`;
     - OG: `og:type=website`, `og:title`, `og:description`, `og:url={SITE}/{lang}`,
       `og:site_name`, `og:locale={OG_LOCALE[lang]}`, `og:image={SITE}{OG_IMAGE}`
       (абсолютный), `og:image:width=1200`, `og:image:height=630`,
       `og:image:alt`;
     - Twitter: `twitter:card=summary_large_image`, `twitter:title`,
       `twitter:description`, `twitter:image={SITE}{OG_IMAGE}`;
     - JSON-LD `MedicalWebPage`: как в текущем `index.html`, но `description`
       локализован, `inLanguage` = `[lang]`;
     - `viteAssetTags` (дословно).
   - Заменить в `shell` атрибут `<html lang="...">` на `lang`.
   - Заменить `<head>…</head>` целиком на собранный head. Тело и всё после
     `</head>` — **без изменений** (SPA-скрипты в теле/после head сохраняются).
   - Записать `dist/{lang}/index.html` (mkdir -p).
5. Перезаписать корневой `dist/index.html`: head как для `DEFAULT_LANG` (en),
   но `canonical` и `og:url` → `{SITE}/{DEFAULT_LANG}`, `<html lang="en">`.
   (Клиентский редирект `*→/ru` в `main.jsx` для людей не трогаем; краулер на
   `/` видит en + canonical на `/en` — корректно для x-default.)
6. Сгенерировать `dist/sitemap.xml` из `LANGS`: по `<url>` на язык
   (`{SITE}/{lang}`) + полный hreflang-блок (как сейчас) + `<lastmod>` = дата
   сборки (`YYYY-MM-DD`, UTC). Перезаписывает скопированный из `public/`.

### 3.3. `pdai-calculator/seo.config.js`

Единый источник SEO-констант (ESM, без зависимостей), читается `prerender.mjs`:

```js
export const SITE = 'https://skinlabpro.uz';
export const LANGS = ['ru', 'en', 'uz', 'kk'];
export const DEFAULT_LANG = 'en';            // соответствует sitemap x-default + SEOHead
export const OG_IMAGE = '/og.png';
export const OG_LOCALE = { ru: 'ru_RU', en: 'en_US', uz: 'uz_UZ', kk: 'kk_KZ' };
export const YANDEX_VERIFICATION = '';       // вставит Alex (Yandex.Webmaster)
export const GOOGLE_VERIFICATION = '';       // вставит Alex (Search Console)
```

Пустой verification-токен → соответствующий `<meta>` не пишется (билд не падает).

### 3.4. OG-картинка

`pdai-calculator/public/og.png`, 1200×630, **вариант C** (тёмный фон `#0f172a`,
indigo-дуга «0–250», текст `PDAI Calculator` / `Pemphigus Disease Area Index` /
`skinlabpro.uz · Skin Lab Pro`). Статический закоммиченный бинарь → Vite копирует
`public/*` в `dist/og.png` → nginx отдаёт реальным файлом.

Генерация (однозначно): `public/og.svg` — **редактируемый источник истины**
(hand-authored, вариант C, viewBox 1200×630, цвета/текст как в §3.4 выше).
`public/og.png` — экспорт из него один раз локально, **коммитится как бинарь**
(скрейперы Telegram/FB требуют растровый `og:image`). В build-пайплайн
image-библиотеки НЕ добавляем (PNG — статический коммит, не генерится в Docker).
Команда регенерации PNG из SVG документируется в плане как ручной шаг (вне
`npm run build`). Эталон вёрстки варианта C — в gitignored
`.superpowers/brainstorm/271-1779193669/content/og-card.html` (только справка,
не зависимость сборки).

### 3.5. Верификация (DNS-доступа нет → file + meta, оба метода)

- **HTML-файл:** `public/yandex_<token>.html` и `public/google<token>.html`
  (точные имена даёт Yandex/Google) кладутся в `public/` → Vite копирует в
  `dist/` → `try_files $uri` отдаёт реальный файл **до** SPA-fallback. Это и
  чинит «ждал сутки»: раньше файла не было в `dist`.
- **Мета:** `YANDEX_VERIFICATION`/`GOOGLE_VERIFICATION` из `seo.config.js`
  пишутся статически в каждый `dist/<lang>/index.html` и корень (видны без JS).
- **nginx не меняем.** Фикс — чисто «файлы реально существуют в dist».
- Делаем оба метода (belt + suspenders) для обоих сервисов.

### 3.6. Деплой / ветки

- Вся работа — в `feature/seo-prerender` (от `origin/master`).
- Пре-флайт-гигиена (отдельная ранняя задача плана):
  - выровнять локальный `master` на `origin/master` (или удалить локальный
    диверг-`master`);
  - удалить stale `master-tmp`; зафиксировать статус `origin/main`/`origin/initial`
    (не трогаем удалённые без явного решения Alex — только локальная уборка).
- По готовности и зелёных тестах: merge `feature/seo-prerender` → `master`,
  `push origin master` → CI деплоит (`check` гейт → SSH `git reset --hard
  origin/master` → docker rebuild).
- Пуш в `master` делает Alex (или явно подтверждает) — не автоматически.

### 3.7. Чистки

- `kk_KK → kk_KZ`: исправить в `src/components/SEOHead.jsx` (текущий
  `currentLang === 'kk' ? 'kk_KK'`) и использовать `kk_KZ` в `seo.config.js`
  (консистентность статики и клиента).
- `SEOHead.jsx` дополнить до паритета со статикой: добавить `og:image`
  (+ width/height/alt), `twitter:image`, `twitter:card=summary_large_image`
  (сейчас `summary`, без картинки). Чтобы клиентский и пререндеренный head
  совпадали.
- Старый ручной `public/sitemap.xml` остаётся как fallback-копия, но
  авторитетный — сгенерированный в `prerender.mjs` (перезаписывает в `dist`).
- Статический `lang="ru"` / англ-description в исходном `index.html` больше не
  доходит до краулеров (перекрывается per-lang выводом) — отдельно не правим.

## 4. Поток данных

```
src/i18n/*.json  ─┐
seo.config.js  ───┼─► scripts/prerender.mjs ─► dist/{ru,en,uz,kk}/index.html
vite build ─► dist/index.html (shell, vite asset tags) ─┘   dist/index.html (root, x-default)
public/og.png ─► dist/og.png                                dist/sitemap.xml (lastmod)
public/yandex_*.html, google*.html ─► dist/ (реальные файлы)

Runtime: nginx try_files $uri $uri/ /index.html
  /ru        → $uri (нет) → $uri/ (=/ru/) + index → dist/ru/index.html
  /og.png    → $uri (есть)                         → dist/og.png
  /yandex_*  → $uri (есть)                         → dist/yandex_*.html
  /          → dist/index.html (x-default en); JS-редирект людей → /ru
```

## 5. Обработка ошибок / edge-кейсы

- **Сохранность hashed-ассет-тегов** — самый тонкий момент. Head собираем
  заново, `viteAssetTags` извлекаются регэкспом по `/assets/` и
  переносятся дословно. Тест обязан проверять их наличие в каждом
  `dist/<lang>/index.html`.
- **Отсутствие i18n-ключа** `meta.title`/`meta.description` → `process.exit(1)`,
  билд (и CI-гейт, и Docker) падает — битая мета не деплоится.
- **`/ru` без слеша**: nginx через `$uri/` + `index index.html` отдаёт
  `/ru/index.html`. Возможен внутренний rewrite без внешнего 301; дубль
  `/ru` vs `/ru/` разруливается `<link rel="canonical">`.
- **og:image абсолютный** (`https://skinlabpro.uz/og.png`) — скрейперы требуют
  абсолютный URL.
- **Vite base = `/`** (дефолт, подтверждён живым сайтом: `/assets/index-*.js`).
  Ассет-URL абсолютные → корректно резолвятся из `/<lang>/index.html`
  (поддиректория не ломает пути). Если когда-либо выставят относительный
  `base` — пререндер в подпапках сломается; тест на наличие `/assets/`-тегов
  это поймает косвенно, но допущение фиксируем явно.
- **Пустой verification-токен** → мета не пишется, билд не падает (нормальный
  старт до получения токенов).
- **Идемпотентность**: `prerender.mjs` работает только в `dist/` (артефакт
  сборки, gitignored) — повторный запуск из чистого `vite build` детерминирован.
- **Кэш nginx**: `.html` без long-cache (мета-обновления доходят); `.png` —
  дефолт; `location ~* \.(svg|xml|txt|ico)$` не шадоуит `.html`-верификацию.

## 6. Тестирование

- **Авто (vitest, в стеке, гоняется в CI `npm test` до деплоя):**
  новый тест прогоняет `prerender.mjs` на фикстуре/реальном `dist` и
  ассертит для каждого `dist/<lang>/index.html`:
  - `<html lang="{lang}">`;
  - локализованные `<title>` и `<meta name="description">` (= i18n JSON);
  - `<link rel="canonical" href="https://skinlabpro.uz/{lang}">`;
  - 4 hreflang + x-default → `/en`;
  - `og:image` = абсолютный `https://skinlabpro.uz/og.png`,
    `og:url={SITE}/{lang}`, `og:locale` корректный (kk → `kk_KZ`);
  - `twitter:card=summary_large_image`;
  - JSON-LD `inLanguage` = `["{lang}"]`;
  - **Vite-ассет-теги (`/assets/*.js`, `/assets/*.css`) присутствуют**;
  - `dist/sitemap.xml` содержит `<lastmod>` и 4 `<loc>`.
- **Ручная пост-деплой проверка (runbook в плане):**
  - `curl -A "YandexBot" https://skinlabpro.uz/uz` → uz-head;
  - Telegram/Facebook link-preview debugger → карточка C;
  - Yandex.Webmaster + Google Search Console: верификация (file + meta) +
    сабмит `sitemap.xml`;
  - проверить `/yandex_*.html` отдаёт токен (не SPA index).

## 7. Изменяемые / создаваемые файлы

| Файл | Действие |
|---|---|
| `pdai-calculator/scripts/prerender.mjs` | создать (ядро) |
| `pdai-calculator/seo.config.js` | создать (SEO-константы) |
| `pdai-calculator/package.json` | `build` += `&& node scripts/prerender.mjs` |
| `pdai-calculator/public/og.png` | создать (1200×630, вариант C) |
| `pdai-calculator/public/og.svg` | создать (опц. редактируемый исходник) |
| `pdai-calculator/src/components/SEOHead.jsx` | `kk_KZ`, +og:image/twitter:image/large card |
| `pdai-calculator/src/**/*.test.*` | добавить тест prerender |
| `pdai-calculator/public/sitemap.xml` | остаётся fallback; авторитет — генерёж |
| `public/yandex_*.html`, `public/google*.html` | добавляются когда Alex даст токены |
| `.gitignore` | `.superpowers/`, `.claude/`, `.claudeignore` (уже сделано) |
| nginx-конфиги | **без изменений** |

## 8. Внешние зависимости от Alex (входы, не блокеры дизайна)

1. Завести проперти в **Yandex.Webmaster** и **Google Search Console** для
   `https://skinlabpro.uz`, получить: verification-токены (для мета) и/или имена
   verification-HTML-файлов. Вписать в `seo.config.js` / положить файлы в
   `public/`.
2. Подтвердить/выполнить push в `master` для деплоя.
3. (Опц.) решение по удалённым веткам `origin/main`, `origin/initial`,
   `master-tmp`.

## 9. Критерии готовности

- `npm run build` локально → `dist/{ru,en,uz,kk}/index.html` с корректной
  локализованной метой + OG + сохранёнными ассет-тегами; `dist/sitemap.xml`
  с `<lastmod>`; `dist/og.png` на месте.
- `npm test` зелёный (вкл. новый prerender-тест).
- После деплоя: `curl -A YandexBot` на 4 маршрута возвращает корректные
  per-lang head; verification-файл отдаёт токен; OG-карточка C видна в
  Telegram-превью.
