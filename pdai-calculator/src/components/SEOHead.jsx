import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  SITE, LANGS, DEFAULT_LANG, OG_IMAGE, OG_IMAGE_ALT, OG_LOCALE, SITE_NAME,
} from '../../seo.config.js';

export default function SEOHead() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language;
  const canonicalUrl = `${SITE}/${currentLang}`;
  const ogImage = `${SITE}${OG_IMAGE}`;
  const ogLocale = OG_LOCALE[currentLang] ?? OG_LOCALE[DEFAULT_LANG];

  return (
    <>
      <title>{t('meta.title')}</title>
      <meta name="description" content={t('meta.description')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={t('meta.title')} />
      <meta property="og:description" content={t('meta.description')} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />

      {/* Twitter/X Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t('meta.title')} />
      <meta name="twitter:description" content={t('meta.description')} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={OG_IMAGE_ALT} />

      {/* Hreflang */}
      {LANGS.map(l => (
        <link key={l} rel="alternate" hrefLang={l} href={`${SITE}/${l}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SITE}/${DEFAULT_LANG}`} />
    </>
  );
}
