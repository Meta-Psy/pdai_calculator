import { useTranslation } from 'react-i18next';

export default function Recommendations({ recommendations, setRecommendations }) {
  const { t } = useTranslation();
  const hasText = recommendations.trim().length > 0;

  return (
    <section className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 ${!hasText ? 'no-print' : ''}`} aria-labelledby="rec-title">
      <h2 id="rec-title" className="text-2xl font-bold mb-4">{t('recommendations.title')}</h2>
      <label htmlFor="recommendations" className="sr-only">{t('recommendations.title')}</label>
      <textarea id="recommendations" value={recommendations} onChange={e => setRecommendations(e.target.value)} rows="6" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 no-print" placeholder={t('recommendations.placeholder')} />
      {hasText && (
        <div className="print-rec-text">{recommendations}</div>
      )}
    </section>
  );
}
