import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SCALP_SCORES, LESION_COUNTS, PIGMENTATION_SCORES } from '../hooks/useCalculator';
import ScoreButtons from './ScoreButtons';

export default function ScalpTable({ scalp, totals, updateScalp }) {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const [activeRow, setActiveRow] = useState(false);

  const hasValue = scalp.erosions > 0 || scalp.lesionCount > 0 || scalp.pigmentation > 0;

  return (
    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6" aria-labelledby="scalp-title">
      <h2 id="scalp-title" className="text-2xl font-bold mb-4">{t('scalp.title')}</h2>
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
          <p className="font-bold mb-2 text-gray-800">{t('scalp.scaleTitle')}</p>
          <ul className="space-y-1 ml-4 text-gray-700">
            <li><strong>0</strong> — {t('scalp.scale0').replace('0 — ', '')}</li>
            <li><strong>1</strong> — {t('scalp.scale1').replace('1 — ', '')}</li>
            <li><strong>2</strong> — {t('scalp.scale2').replace('2 — ', '')}</li>
            <li><strong>3</strong> — {t('scalp.scale3').replace('3 — ', '')}</li>
            <li><strong>4</strong> — {t('scalp.scale4').replace('4 — ', '')}</li>
            <li><strong>10</strong> — {t('scalp.scale10').replace('10 — ', '')}</li>
          </ul>
        </div>
      )}

      {/* Mobile: card layout */}
      <div className="sm:hidden no-print">
        <div className={`border rounded-lg p-3 ${hasValue ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'}`}>
          <div className="font-medium text-sm text-gray-800 mb-2 flex items-center gap-1.5">
            {hasValue && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
            {t('scalp.colScalp')}
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-500 block mb-1">{t('scalp.colErosions')}</span>
              <ScoreButtons scores={SCALP_SCORES} value={scalp.erosions} onChange={v => updateScalp('erosions', v)} />
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">{t('scalp.colLesionCount')}</span>
              <ScoreButtons scores={LESION_COUNTS} value={scalp.lesionCount} onChange={v => updateScalp('lesionCount', v)} disabled={scalp.erosions !== 1} />
            </div>
            <div>
              <span className="text-xs text-gray-500 block mb-1">{t('scalp.colPigmentation')}</span>
              <ScoreButtons scores={PIGMENTATION_SCORES} value={scalp.pigmentation} onChange={v => updateScalp('pigmentation', v)} />
            </div>
          </div>
        </div>
        <div className="bg-indigo-100 rounded-lg p-3 font-bold text-sm mt-3">
          <div>{t('scalp.totalScalp')}</div>
          <div className="flex gap-4 mt-1 text-xs">
            <span>{t('scalp.colErosions')}: {totals.scalpErosions}</span>
            <span>{t('scalp.colLesionCount')}: {totals.scalpLesionCount.toFixed(1)}</span>
            <span>{t('scalp.colPigmentation')}: {totals.scalpPigmentation}</span>
          </div>
        </div>
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-50">
              <th className="border p-2 text-left">{t('scalp.colScalp')}</th>
              <th className="border p-2 text-center">{t('scalp.colErosions')}</th>
              <th className="border p-2 text-center">{t('scalp.colLesionCount')}</th>
              <th className="border p-2 text-center">{t('scalp.colPigmentation')}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              className={`transition-colors ${activeRow ? 'bg-indigo-50/70' : ''}`}
              onFocus={() => setActiveRow(true)}
              onMouseEnter={() => setActiveRow(true)}
              onMouseLeave={() => setActiveRow(false)}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setActiveRow(false); }}
            >
              <td className="border px-2">
                <span className="flex items-center gap-1.5">
                  {hasValue && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                  {t('scalp.colScalp')}
                </span>
              </td>
              <td className="border px-2">
                <div className="no-print">
                  <ScoreButtons scores={SCALP_SCORES} value={scalp.erosions} onChange={v => updateScalp('erosions', v)} />
                </div>
                <div className="hidden print-only text-center">{scalp.erosions}</div>
              </td>
              <td className="border px-2">
                <div className="no-print">
                  <ScoreButtons scores={LESION_COUNTS} value={scalp.lesionCount} onChange={v => updateScalp('lesionCount', v)} disabled={scalp.erosions !== 1} />
                </div>
                <div className="hidden print-only text-center">{scalp.lesionCount}</div>
              </td>
              <td className="border px-2">
                <div className="no-print">
                  <ScoreButtons scores={PIGMENTATION_SCORES} value={scalp.pigmentation} onChange={v => updateScalp('pigmentation', v)} />
                </div>
                <div className="hidden print-only text-center">{scalp.pigmentation}</div>
              </td>
            </tr>
            <tr className="bg-indigo-100 font-bold">
              <td className="border p-2">{t('scalp.totalScalp')}</td>
              <td className="border p-2 text-center">{totals.scalpErosions}</td>
              <td className="border p-2 text-center">{totals.scalpLesionCount.toFixed(1)}</td>
              <td className="border p-2 text-center">{totals.scalpPigmentation}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
