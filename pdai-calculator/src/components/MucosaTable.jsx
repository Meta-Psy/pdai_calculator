import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MUCOSA_KEYS, MUCOSA_SCORES } from '../hooks/useCalculator';
import ScoreButtons from './ScoreButtons';

export default function MucosaTable({ mucosa, totals, updateMucosa }) {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  return (
    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6" aria-labelledby="mucosa-title">
      <h2 id="mucosa-title" className="text-2xl font-bold mb-4">{t('mucosa.title')}</h2>
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg px-3 py-1.5 transition-colors no-print"
        aria-expanded={showGuide}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
        {t('guide.toggle')}
      </button>
      {showGuide && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-sm no-print">
          <p className="font-bold mb-2 text-gray-800">{t('mucosa.scaleTitle')}</p>
          <ul className="space-y-1 ml-4 text-gray-700">
            <li><strong>0</strong> — {t('mucosa.scale0').replace('0 — ', '')}</li>
            <li><strong>1</strong> — {t('mucosa.scale1').replace('1 — ', '')}</li>
            <li><strong>2</strong> — {t('mucosa.scale2').replace('2 — ', '')}</li>
            <li><strong>5</strong> — {t('mucosa.scale5').replace('5 — ', '')}</li>
            <li><strong>10</strong> — {t('mucosa.scale10').replace('10 — ', '')}</li>
          </ul>
          <p className="font-bold mt-3 mb-1 text-gray-800">{t('mucosa.note')}</p>
          <p className="text-gray-700">{t('mucosa.noteText')}</p>
        </div>
      )}

      {/* Mobile: card layout */}
      <div className="sm:hidden space-y-2 no-print">
        {MUCOSA_KEYS.map(k => (
          <div key={k} className={`border rounded-lg p-3 ${mucosa[k] > 0 ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm text-gray-800 flex items-center gap-1.5 shrink-0">
                {mucosa[k] > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                {t(`mucosa.${k}`)}
              </span>
              <ScoreButtons scores={MUCOSA_SCORES} value={mucosa[k]} onChange={v => updateMucosa(k, v)} />
            </div>
          </div>
        ))}
        <div className="bg-indigo-100 rounded-lg p-3 font-bold text-sm flex justify-between">
          <span>{t('mucosa.totalMucosa')}</span>
          <span>{totals.mucosaTotal}</span>
        </div>
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-50">
              <th className="border p-2 text-left">{t('mucosa.colLocation')}</th>
              <th className="border p-2 text-center">{t('mucosa.colErosions')}</th>
            </tr>
          </thead>
          <tbody>
            {MUCOSA_KEYS.map(k => (
              <tr
                key={k}
                className={`transition-colors ${activeRow === k ? 'bg-indigo-50/70' : ''}`}
                onFocus={() => setActiveRow(k)}
                onMouseEnter={() => setActiveRow(k)}
                onMouseLeave={() => setActiveRow(null)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setActiveRow(null); }}
              >
                <td className="border px-2">
                  <span className="flex items-center gap-1.5">
                    {mucosa[k] > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    {t(`mucosa.${k}`)}
                  </span>
                </td>
                <td className="border px-2">
                  <div className="no-print">
                    <ScoreButtons scores={MUCOSA_SCORES} value={mucosa[k]} onChange={v => updateMucosa(k, v)} />
                  </div>
                  <div className="hidden print-only text-center">{mucosa[k]}</div>
                </td>
              </tr>
            ))}
            <tr className="bg-indigo-100 font-bold">
              <td className="border p-2">{t('mucosa.totalMucosa')}</td>
              <td className="border p-2 text-center">{totals.mucosaTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
