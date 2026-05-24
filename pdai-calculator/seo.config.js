// Единственный источник SEO-констант. Читается scripts/prerender.mjs и тестом.
export const SITE = 'https://skinlabpro.uz';
export const LANGS = ['ru', 'en', 'uz', 'kk'];
export const DEFAULT_LANG = 'en'; // x-default + корень / ; соответствует sitemap и SEOHead.jsx
export const OG_IMAGE = '/og.png';
export const OG_IMAGE_ALT = 'PDAI Calculator — Pemphigus Disease Area Index — skinlabpro.uz';
export const OG_LOCALE = { ru: 'ru_RU', en: 'en_US', uz: 'uz_UZ', kk: 'kk_KZ' };
export const SITE_NAME = 'PDAI Calculator — Skin Lab Pro';
// Verification tokens (public — рендерятся в <meta> на каждой странице).
// Заведены 2026-05-20 для Yandex.Webmaster и Google Search Console (URL-prefix property).
export const YANDEX_VERIFICATION = '0b0d8480dd469db0';
export const GOOGLE_VERIFICATION = 'Slu6f1BXMp2WA3eCT_0zTcZ3fSIr55Nr3XYJCJ9ujsk';
