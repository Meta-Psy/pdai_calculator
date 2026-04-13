import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const SITE_URL = 'https://skinlabpro.uz';
const LANGS = ['ru', 'en', 'uz', 'kk'];

export default function SEOHead() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language;
  const canonicalUrl = `${SITE_URL}/${currentLang}`;

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
      <meta property="og:site_name" content="PDAI Calculator — Skin Lab Pro" />
      <meta property="og:locale" content={currentLang === 'ru' ? 'ru_RU' : currentLang === 'uz' ? 'uz_UZ' : currentLang === 'kk' ? 'kk_KK' : 'en_US'} />

      {/* Twitter/X Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={t('meta.title')} />
      <meta name="twitter:description" content={t('meta.description')} />

      {/* Hreflang */}
      {LANGS.map(l => (
        <link key={l} rel="alternate" hrefLang={l} href={`${SITE_URL}/${l}`} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/en`} />
    </>
  );
}
