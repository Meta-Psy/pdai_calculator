import { useTranslation } from 'react-i18next';
import { Download, Printer, Loader, RefreshCw } from './icons';

export default function StickyResults({
  totals,
  getSeverity,
  onDownloadPDF,
  onPrint,
  onReset,
  pdfLoading,
}) {
  const { t } = useTranslation();
  const sev = getSeverity(totals.overallSeverity, t);
  const hasData = totals.totalScore > 0;

  if (!hasData) return null;

  const sevBg = totals.overallSeverity < 15
    ? 'bg-green-500'
    : totals.overallSeverity < 45
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-indigo-800 text-white shadow-2xl z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          {/* Left: scores (desktop only) */}
          <div className="hidden sm:flex items-center gap-6">
            <span className="opacity-75">{t('results.severity')} <b className="text-base">{totals.overallSeverity.toFixed(1)}</b></span>
            <span className="opacity-75">{t('results.damage')} <b className="text-base">{totals.overallDamage}</b></span>
          </div>

          {/* Mobile: PDAI score left */}
          <div className="flex sm:hidden items-center gap-2">
            <span className="font-medium">PDAI: <b className="text-lg">{totals.totalScore.toFixed(1)}</b></span>
            <span className={`${sevBg} px-2 py-0.5 rounded text-xs font-bold`}>{sev.level}</span>
          </div>

          {/* Mobile: action buttons */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={onDownloadPDF}
              disabled={pdfLoading}
              className="p-2 text-indigo-200 hover:text-white hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors"
              title={t('actions.downloadPdf')}
            >
              {pdfLoading ? <Loader /> : <Download />}
            </button>
            <button
              onClick={onPrint}
              className="p-2 text-indigo-200 hover:text-white hover:bg-indigo-700 rounded-lg transition-colors"
              title={t('actions.print')}
            >
              <Printer />
            </button>
            <button
              onClick={onReset}
              className="p-2 text-indigo-200 hover:text-white hover:bg-indigo-700 rounded-lg transition-colors"
              title={t('actions.reset')}
            >
              <RefreshCw />
            </button>
          </div>

          {/* Desktop: PDAI score right */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="font-medium">PDAI: <b className="text-lg">{totals.totalScore.toFixed(1)}</b></span>
            <span className={`${sevBg} px-2 py-0.5 rounded text-xs font-bold`}>{sev.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
