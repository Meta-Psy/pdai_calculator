import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Printer, Loader, RefreshCw } from './icons';

export default function FloatingToolbar({
  onDownloadPDF,
  onPrint,
  onReset,
  pdfLoading,
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 no-print animate-fade-in">
      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-1.5">
        <button
          onClick={onDownloadPDF}
          disabled={pdfLoading}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors text-sm"
          title={t('actions.downloadPdf')}
        >
          {pdfLoading ? <Loader /> : <Download />}
          <span className="hidden lg:inline">{pdfLoading ? t('actions.pdfLoading') : 'PDF'}</span>
        </button>

        <button
          onClick={onPrint}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={t('actions.print')}
        >
          <Printer />
        </button>

        <div className="w-px h-6 bg-gray-200" />

        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('actions.more')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px]">
              <button
                onClick={() => { onReset(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw />{t('actions.reset')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
