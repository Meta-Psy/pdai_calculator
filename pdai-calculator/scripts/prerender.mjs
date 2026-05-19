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
