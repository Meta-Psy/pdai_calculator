import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SKIN_KEYS, SCORES, LESION_COUNTS, PIGMENTATION_SCORES } from '../hooks/useCalculator';
import ScoreButtons from './ScoreButtons';

export default function SkinTable({ skinAreas, totals, updateSkin }) {
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  const hasValue = (k) => skinAreas[k].erosions > 0 || skinAreas[k].lesionCount > 0 || skinAreas[k].pigmentation > 0;

  return (
    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6" aria-labelledby="skin-title">
      <h2 id="skin-title" className="text-2xl font-bold mb-4">{t('skin.title')}</h2>
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
          <p className="font-bold mb-2 text-gray-800">{t('skin.scaleTitle')}</p>
          <ul className="space-y-1 ml-4 text-gray-700">
            <li><strong>0</strong> — {t('skin.scale0').replace('0 — ', '')}</li>
            <li><strong>1</strong> — {t('skin.scale1').replace('1 — ', '')}</li>
            <li><strong>2</strong> — {t('skin.scale2').replace('2 — ', '')}</li>
            <li><strong>3</strong> — {t('skin.scale3').replace('3 — ', '')}</li>
            <li><strong>5</strong> — {t('skin.scale5').replace('5 — ', '')}</li>
            <li><strong>10</strong> — {t('skin.scale10').replace('10 — ', '')}</li>
          </ul>
          <p className="font-bold mt-3 mb-1 text-gray-800">{t('skin.lesionTitle')}</p>
          <p className="text-gray-700">{t('skin.lesionDesc')}</p>
          <ul className="space-y-1 ml-4 mt-1 text-gray-700">
            <li><strong>{t('skin.lesion1')}</strong></li>
            <li><strong>{t('skin.lesion2')}</strong></li>
            <li><strong>{t('skin.lesion3')}</strong></li>
          </ul>
          <p className="font-bold mt-3 mb-1 text-gray-800">{t('skin.pigmentationTitle')}</p>
          <ul className="space-y-1 ml-4 text-gray-700">
            <li><strong>0</strong> — {t('skin.pigmentation0').replace('0 — ', '')}</li>
            <li><strong>1</strong> — {t('skin.pigmentation1').replace('1 — ', '')}</li>
          </ul>
        </div>
      )}

      {/* Mobile: card layout */}
      <div className="sm:hidden space-y-3 no-print">
        {SKIN_KEYS.map(k => (
          <div key={k} className={`border rounded-lg p-3 ${hasValue(k) ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'}`}>
            <div className="font-medium text-sm text-gray-800 mb-2 flex items-center gap-1.5">
              {hasValue(k) && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
              {t(`skin.${k}`)}
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t('skin.colErosions')}</span>
                <ScoreButtons scores={SCORES} value={skinAreas[k].erosions} onChange={v => updateSkin(k, 'erosions', v)} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t('skin.colLesionCount')}</span>
                <ScoreButtons scores={LESION_COUNTS} value={skinAreas[k].lesionCount} onChange={v => updateSkin(k, 'lesionCount', v)} disabled={skinAreas[k].erosions !== 1} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">{t('skin.colPigmentation')}</span>
                <ScoreButtons scores={PIGMENTATION_SCORES} value={skinAreas[k].pigmentation} onChange={v => updateSkin(k, 'pigmentation', v)} />
              </div>
            </div>
          </div>
        ))}
        <div className="bg-indigo-100 rounded-lg p-3 font-bold text-sm">
          <div>{t('skin.totalSkin')}</div>
          <div className="flex gap-4 mt-1 text-xs">
            <span>{t('skin.colErosions')}: {totals.skinErosions}</span>
            <span>{t('skin.colLesionCount')}: {totals.skinLesionCount.toFixed(1)}</span>
            <span>{t('skin.colPigmentation')}: {totals.skinPigmentation}</span>
          </div>
        </div>
      </div>

      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-50">
              <th className="border p-2 text-left">{t('skin.colLocation')}</th>
              <th className="border p-2 text-center">{t('skin.colErosions')}</th>
              <th className="border p-2 text-center">{t('skin.colLesionCount')}</th>
              <th className="border p-2 text-center">{t('skin.colPigmentation')}</th>
            </tr>
          </thead>
          <tbody>
            {SKIN_KEYS.map(k => (
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
                    {hasValue(k) && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    {t(`skin.${k}`)}
                  </span>
                </td>
                <td className="border px-2">
                  <div className="no-print">
                    <ScoreButtons scores={SCORES} value={skinAreas[k].erosions} onChange={v => updateSkin(k, 'erosions', v)} />
                  </div>
                  <div className="hidden print-only text-center">{skinAreas[k].erosions}</div>
                </td>
                <td className="border px-2">
                  <div className="no-print">
                    <ScoreButtons scores={LESION_COUNTS} value={skinAreas[k].lesionCount} onChange={v => updateSkin(k, 'lesionCount', v)} disabled={skinAreas[k].erosions !== 1} />
                  </div>
                  <div className="hidden print-only text-center">{skinAreas[k].lesionCount}</div>
                </td>
                <td className="border px-2">
                  <div className="no-print">
                    <ScoreButtons scores={PIGMENTATION_SCORES} value={skinAreas[k].pigmentation} onChange={v => updateSkin(k, 'pigmentation', v)} />
                  </div>
                  <div className="hidden print-only text-center">{skinAreas[k].pigmentation}</div>
                </td>
              </tr>
            ))}
            <tr className="bg-indigo-100 font-bold">
              <td className="border p-2">{t('skin.totalSkin')}</td>
              <td className="border p-2 text-center">{totals.skinErosions}</td>
              <td className="border p-2 text-center">{totals.skinLesionCount.toFixed(1)}</td>
              <td className="border p-2 text-center">{totals.skinPigmentation}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
