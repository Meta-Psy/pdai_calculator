import { useTranslation } from 'react-i18next';
import { SeverityIcon } from './icons';

export default function ResultsSummary({ totals, getSeverity }) {
  const { t } = useTranslation();
  const sev = getSeverity(totals.overallSeverity, t);

  return (
    <section className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-8 text-white mb-6 print-results" aria-labelledby="results-title">
      <h2 id="results-title" className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">{t('results.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white/20 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm mb-1">{t('results.severity')}</p>
          <p className="text-2xl md:text-4xl font-bold">{totals.overallSeverity.toFixed(1)}</p>
          <p className="text-xs mt-1 opacity-80">{t('results.severityMax')}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm mb-1">{t('results.damage')}</p>
          <p className="text-2xl md:text-4xl font-bold">{totals.overallDamage}</p>
          <p className="text-xs mt-1 opacity-80">{t('results.damageMax')}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm mb-1">{t('results.total')}</p>
          <p className="text-2xl md:text-4xl font-bold">{totals.totalScore.toFixed(1)}</p>
          <p className="text-xs mt-1 opacity-80">{t('results.totalMax')}</p>
        </div>
        <div className={`rounded-lg p-3 md:p-4 border-2 col-span-2 md:col-span-1 ${sev.color}`}>
          <SeverityIcon type={sev.iconType} />
          <p className="text-sm md:text-base font-bold mt-2">{t('results.level')}</p>
          <p className="text-lg md:text-xl font-bold">{sev.level}</p>
        </div>
      </div>
    </section>
  );
}
