import { useTranslation } from 'react-i18next';
import { InfoIcon } from './icons';

const DOI_URL = 'https://doi.org/10.1016/j.jaad.2008.01.012';

export default function InfoSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-4 sm:p-6 text-white mb-6 no-print" aria-labelledby="info-title">
      <div className="flex gap-4">
        <InfoIcon />
        <div className="space-y-3">
          <h2 id="info-title" className="text-2xl font-bold">{t('info.title')}</h2>
          <p className="text-sm">{t('info.description')}</p>

          {/* Interpretation */}
          <div className="text-sm space-y-2">
            <p><strong>{t('info.interpretation')}</strong></p>
            <ul className="list-disc ml-5">
              <li>{t('info.mild')}</li>
              <li>{t('info.moderate')}</li>
              <li>{t('info.severe')}</li>
            </ul>
          </div>

          {/* Attribution & Citation */}
          <div className="border-t border-white/20 pt-3 space-y-2 text-sm">
            <p className="text-white/90">{t('info.attribution')}</p>
            <p className="text-white/70 text-xs italic">
              {t('info.citation')}{' '}
              <a
                href={DOI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                DOI
              </a>
            </p>
            <p className="text-white/80 text-xs">{t('info.digitalTool')}</p>
            <p className="text-white/80 text-xs">{t('info.disclaimer')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
