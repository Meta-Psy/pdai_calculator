import { useTranslation } from 'react-i18next';

const R = '#ef4444';
const D = '#d1d5db';
const S = '#6b7280';
const B = '#93c5fd';

function zc(area) {
  if (area.erosions > 0) return R;
  if (area.pigmentation > 0) return B;
  return D;
}

function mc(val) {
  return val > 0 ? R : D;
}

/** Pattern fill URL for colorblind accessibility overlay */
function pat(area) {
  if (area.erosions > 0) return 'url(#pat-erosion)';
  if (area.pigmentation > 0) return 'url(#pat-pigment)';
  return null;
}

function mcPat(val) {
  return val > 0 ? 'url(#pat-erosion)' : null;
}

/** Text props: white halo for contrast + vertical centering */
function tp(fontSize, extra) {
  return {
    fontSize, fill: '#374151', textAnchor: 'middle', dominantBaseline: 'central',
    stroke: 'white', strokeWidth: 3, paintOrder: 'stroke fill', strokeLinejoin: 'round',
    ...extra,
  };
}

const boxClass = 'bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center flex-1';

export default function BodyVisualization({ skinAreas, scalp, mucosa }) {
  const { t } = useTranslation();

  /* Accessible descriptions for screen readers */
  const headDesc = [
    scalp.erosions > 0 ? `${t('scalp.title')}: ${t('visualization.affected')}` : scalp.pigmentation > 0 ? `${t('scalp.title')}: ${t('visualization.pigmentation')}` : null,
    skinAreas.face.erosions > 0 ? `${t('skin.face')}: ${t('visualization.affected')}` : skinAreas.face.pigmentation > 0 ? `${t('skin.face')}: ${t('visualization.pigmentation')}` : null,
    skinAreas.ears.erosions > 0 ? `${t('skin.ears')}: ${t('visualization.affected')}` : skinAreas.ears.pigmentation > 0 ? `${t('skin.ears')}: ${t('visualization.pigmentation')}` : null,
    skinAreas.neck.erosions > 0 ? `${t('skin.neck')}: ${t('visualization.affected')}` : skinAreas.neck.pigmentation > 0 ? `${t('skin.neck')}: ${t('visualization.pigmentation')}` : null,
    mucosa.eyes > 0 ? `${t('mucosa.eyes')}: ${t('visualization.affected')}` : null,
    mucosa.nose > 0 ? `${t('mucosa.nose')}: ${t('visualization.affected')}` : null,
    mucosa.anogenital > 0 ? `${t('mucosa.anogenital')}: ${t('visualization.affected')}` : null,
  ].filter(Boolean).join('; ') || t('visualization.normal');

  const oralDesc = [
    'lips', 'hardPalate', 'softPalate', 'upperGingiva', 'lowerGingiva',
    'buccal', 'tongue', 'floorOfMouth', 'pharynx',
  ].filter(k => mucosa[k] > 0).map(k => t(`mucosa.${k}`)).join(', ') || t('visualization.normal');

  const bodyDesc = [
    'chest', 'abdomen', 'back', 'arms', 'hands', 'legs', 'feet', 'genitals',
  ].filter(k => skinAreas[k].erosions > 0 || skinAreas[k].pigmentation > 0)
    .map(k => `${t(`skin.${k}`)}: ${skinAreas[k].erosions > 0 ? t('visualization.affected') : t('visualization.pigmentation')}`)
    .join('; ') || t('visualization.normal');

  const scalpFill = scalp.erosions > 0 ? R : scalp.pigmentation > 0 ? B : '#9ca3af';
  const scalpPat = pat({ erosions: scalp.erosions, pigmentation: scalp.pigmentation });

  return (
    <section className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 print-viz" aria-labelledby="viz-title">
      {/* Shared SVG pattern definitions for colorblind accessibility */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <pattern id="pat-erosion" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
          </pattern>
          <pattern id="pat-pigment" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.2" fill="rgba(0,0,0,0.35)" />
          </pattern>
        </defs>
      </svg>

      <h2 id="viz-title" className="text-lg md:text-2xl font-bold text-gray-800 mb-3 text-center">{t('visualization.title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 items-stretch">

        {/* 1. HEAD + extra-oral mucosa */}
        <div className="flex flex-col">
          <h3 className="text-xs md:text-base font-bold text-gray-800 mb-1 md:mb-2 text-center">{t('visualization.head')}</h3>
          <div className={boxClass}>
            <svg viewBox="0 0 200 260" className="w-full h-auto p-1 md:p-2" preserveAspectRatio="xMidYMid meet"
              role="img" aria-labelledby="svg-head-title svg-head-desc">
              <title id="svg-head-title">{t('visualization.head')}</title>
              <desc id="svg-head-desc">{headDesc}</desc>

              {/* Scalp */}
              <g>
                <path d="M 40 60 Q 100 22 160 60" fill={scalpFill} stroke={S} strokeWidth="1.5"/>
                {scalpPat && <path d="M 40 60 Q 100 22 160 60" fill={scalpPat} />}
              </g>

              {/* Head outline (face zone) */}
              <g>
                <ellipse cx="100" cy="88" rx="60" ry="65" fill={zc(skinAreas.face)} stroke={S} strokeWidth="2"/>
                {pat(skinAreas.face) && <ellipse cx="100" cy="88" rx="60" ry="65" fill={pat(skinAreas.face)} />}
              </g>

              {/* Face zone dashed overlay */}
              <ellipse cx="100" cy="100" rx="45" ry="32"
                fill={skinAreas.face.erosions > 0 ? 'rgba(239, 68, 68, 0.2)' : 'none'}
                stroke={skinAreas.face.erosions > 0 ? R : 'transparent'} strokeWidth="2" strokeDasharray="5,5"/>

              {/* Ears */}
              <g>
                <ellipse cx="38" cy="88" rx="10" ry="16" fill={zc(skinAreas.ears)} stroke={S} strokeWidth="1.5"/>
                {pat(skinAreas.ears) && <ellipse cx="38" cy="88" rx="10" ry="16" fill={pat(skinAreas.ears)} />}
                <ellipse cx="162" cy="88" rx="10" ry="16" fill={zc(skinAreas.ears)} stroke={S} strokeWidth="1.5"/>
                {pat(skinAreas.ears) && <ellipse cx="162" cy="88" rx="10" ry="16" fill={pat(skinAreas.ears)} />}
              </g>

              {/* Eyes */}
              <ellipse cx="78" cy="78" rx="10" ry="7" fill="white" stroke={S} strokeWidth="1"/>
              <ellipse cx="122" cy="78" rx="10" ry="7" fill="white" stroke={S} strokeWidth="1"/>
              <circle cx="78" cy="80" r="3.5" fill="#4b5563"/>
              <circle cx="122" cy="80" r="3.5" fill="#4b5563"/>

              {/* Nose */}
              <g>
                <path d="M 100 90 L 94 108 L 100 111 L 106 108 Z" fill={zc(skinAreas.nose)} stroke={S} strokeWidth="1"/>
                {pat(skinAreas.nose) && <path d="M 100 90 L 94 108 L 100 111 L 106 108 Z" fill={pat(skinAreas.nose)} />}
              </g>

              {/* Mouth */}
              <path d="M 82 122 Q 100 132 118 122" fill="none" stroke={S} strokeWidth="2"/>

              {/* Neck */}
              <g>
                <rect x="82" y="153" width="36" height="34" rx="6" fill={zc(skinAreas.neck)} stroke={S} strokeWidth="1.5"/>
                {pat(skinAreas.neck) && <rect x="82" y="153" width="36" height="34" rx="6" fill={pat(skinAreas.neck)} />}
              </g>

              {/* Labels */}
              <text x="100" y="46" {...tp(9, { fontWeight: 500 })}>{t('scalp.title')}</text>
              <text x="100" y="145" {...tp(8)}>{t('skin.face')}</text>
              <text x="100" y="170" {...tp(7)}>{t('skin.neck')}</text>
              <text x="22" y="92" {...tp(6, { fill: '#6b7280' })}>{t('skin.ears')}</text>

              {/* Extra-oral mucosa section */}
              <text x="100" y="202" {...tp(7, { fill: '#6b7280', fontWeight: 600 })}>{t('visualization.extraOral')}</text>

              <g>
                <rect x="5" y="210" width="56" height="16" rx="3" fill={mc(mucosa.eyes)} stroke={S} strokeWidth="0.6"/>
                {mcPat(mucosa.eyes) && <rect x="5" y="210" width="56" height="16" rx="3" fill={mcPat(mucosa.eyes)} />}
                <text x="33" y="218" {...tp(6)}>{t('mucosa.eyes')}</text>
              </g>

              <g>
                <rect x="72" y="210" width="56" height="16" rx="3" fill={mc(mucosa.nose)} stroke={S} strokeWidth="0.6"/>
                {mcPat(mucosa.nose) && <rect x="72" y="210" width="56" height="16" rx="3" fill={mcPat(mucosa.nose)} />}
                <text x="100" y="218" {...tp(6)}>{t('mucosa.nose')}</text>
              </g>

              <g>
                <rect x="139" y="210" width="56" height="16" rx="3" fill={mc(mucosa.anogenital)} stroke={S} strokeWidth="0.6"/>
                {mcPat(mucosa.anogenital) && <rect x="139" y="210" width="56" height="16" rx="3" fill={mcPat(mucosa.anogenital)} />}
                <text x="167" y="218" {...tp(5.5)}>{t('mucosa.anogenital')}</text>
              </g>
            </svg>
          </div>
        </div>

        {/* 2. ORAL CAVITY */}
        <div className="flex flex-col">
          <h3 className="text-xs md:text-base font-bold text-gray-800 mb-1 md:mb-2 text-center">{t('visualization.oral')}</h3>
          <div className={boxClass}>
            <svg viewBox="0 0 200 170" className="w-full h-auto p-1 md:p-2" preserveAspectRatio="xMidYMid meet"
              role="img" aria-labelledby="svg-oral-title svg-oral-desc">
              <title id="svg-oral-title">{t('visualization.oral')}</title>
              <desc id="svg-oral-desc">{oralDesc}</desc>

              {/* --- Shapes layer --- */}

              {/* Outer lips */}
              <ellipse cx="100" cy="75" rx="80" ry="58" fill={mc(mucosa.lips)} stroke={S} strokeWidth="2"/>
              {mcPat(mucosa.lips) && <ellipse cx="100" cy="75" rx="80" ry="58" fill={mcPat(mucosa.lips)} />}

              {/* Inner oral cavity */}
              <ellipse cx="100" cy="75" rx="64" ry="46" fill="#fecaca" stroke={S} strokeWidth="1"/>

              {/* Hard palate */}
              <path d="M 45 47 Q 100 24 155 47" fill={mc(mucosa.hardPalate)} stroke={S} strokeWidth="1.2"/>
              {mcPat(mucosa.hardPalate) && <path d="M 45 47 Q 100 24 155 47" fill={mcPat(mucosa.hardPalate)} />}

              {/* Soft palate */}
              <path d="M 52 50 Q 100 38 148 50" fill={mc(mucosa.softPalate)} stroke={S} strokeWidth="1"/>
              {mcPat(mucosa.softPalate) && <path d="M 52 50 Q 100 38 148 50" fill={mcPat(mucosa.softPalate)} />}

              {/* Upper gingiva */}
              <path d="M 42 54 Q 100 46 158 54 L 154 61 Q 100 53 46 61 Z"
                fill={mc(mucosa.upperGingiva)} stroke={S} strokeWidth="0.8"/>
              {mcPat(mucosa.upperGingiva) && <path d="M 42 54 Q 100 46 158 54 L 154 61 Q 100 53 46 61 Z"
                fill={mcPat(mucosa.upperGingiva)} />}

              {/* Pharynx */}
              <ellipse cx="100" cy="64" rx="12" ry="8" fill={mc(mucosa.pharynx)} stroke={S} strokeWidth="0.8"/>
              {mcPat(mucosa.pharynx) && <ellipse cx="100" cy="64" rx="12" ry="8" fill={mcPat(mucosa.pharynx)} />}

              {/* Buccal (cheeks) */}
              <ellipse cx="46" cy="78" rx="14" ry="22" fill={mc(mucosa.buccal)} stroke={S} strokeWidth="0.8"/>
              {mcPat(mucosa.buccal) && <ellipse cx="46" cy="78" rx="14" ry="22" fill={mcPat(mucosa.buccal)} />}
              <ellipse cx="154" cy="78" rx="14" ry="22" fill={mc(mucosa.buccal)} stroke={S} strokeWidth="0.8"/>
              {mcPat(mucosa.buccal) && <ellipse cx="154" cy="78" rx="14" ry="22" fill={mcPat(mucosa.buccal)} />}

              {/* Tongue */}
              <ellipse cx="100" cy="85" rx="34" ry="20" fill={mc(mucosa.tongue)} stroke={S} strokeWidth="1.2"/>
              {mcPat(mucosa.tongue) && <ellipse cx="100" cy="85" rx="34" ry="20" fill={mcPat(mucosa.tongue)} />}

              {/* Floor of mouth */}
              <path d="M 72 105 Q 100 116 128 105" fill={mc(mucosa.floorOfMouth)} stroke={S} strokeWidth="0.8"/>
              {mcPat(mucosa.floorOfMouth) && <path d="M 72 105 Q 100 116 128 105" fill={mcPat(mucosa.floorOfMouth)} />}

              {/* Lower gingiva */}
              <path d="M 46 110 Q 100 120 154 110 L 158 117 Q 100 127 42 117 Z"
                fill={mc(mucosa.lowerGingiva)} stroke={S} strokeWidth="0.8"/>
              {mcPat(mucosa.lowerGingiva) && <path d="M 46 110 Q 100 120 154 110 L 158 117 Q 100 127 42 117 Z"
                fill={mcPat(mucosa.lowerGingiva)} />}

              {/* --- Labels layer (on top of all shapes) --- */}
              <text x="100" y="38" {...tp(7)}>{t('mucosa.hardPalate')}</text>
              <text x="100" y="56" {...tp(6)}>{t('mucosa.softPalate')}</text>
              <text x="100" y="48" {...tp(5, { fill: '#6b7280' })}>{t('mucosa.upperGingiva')}</text>
              <text x="100" y="64" {...tp(5)}>{t('mucosa.pharynx')}</text>
              <text x="46" y="78" {...tp(5)}>{t('mucosa.buccal')}</text>
              <text x="100" y="85" {...tp(7)}>{t('mucosa.tongue')}</text>
              <text x="100" y="118" {...tp(5)}>{t('mucosa.floorOfMouth')}</text>
              <text x="100" y="138" {...tp(6)}>{t('mucosa.lips')}</text>
              <text x="100" y="126" {...tp(5, { fill: '#6b7280' })}>{t('mucosa.lowerGingiva')}</text>
            </svg>
          </div>
        </div>

        {/* 3. BODY */}
        <div className="flex flex-col">
          <h3 className="text-xs md:text-base font-bold text-gray-800 mb-1 md:mb-2 text-center">{t('visualization.body')}</h3>
          <div className={boxClass}>
            <svg viewBox="0 0 200 260" className="w-full h-auto p-1 md:p-2" preserveAspectRatio="xMidYMid meet"
              role="img" aria-labelledby="svg-body-title svg-body-desc">
              <title id="svg-body-title">{t('visualization.body')}</title>
              <desc id="svg-body-desc">{bodyDesc}</desc>

              {/* Torso outline */}
              <path d="M 70 10 L 70 120 Q 70 130 80 130 L 120 130 Q 130 130 130 120 L 130 10 Z"
                fill="#e5e7eb" stroke={S} strokeWidth="1.5"/>

              {/* Chest */}
              <g>
                <rect x="74" y="14" width="52" height="45" rx="6"
                  fill={zc(skinAreas.chest)} stroke={S} strokeWidth="1" opacity="0.85"/>
                {pat(skinAreas.chest) && <rect x="74" y="14" width="52" height="45" rx="6" fill={pat(skinAreas.chest)} opacity="0.85" />}
                <text x="100" y="36" {...tp(8)}>{t('skin.chest')}</text>
              </g>

              {/* Abdomen */}
              <g>
                <rect x="74" y="63" width="52" height="45" rx="6"
                  fill={zc(skinAreas.abdomen)} stroke={S} strokeWidth="1" opacity="0.85"/>
                {pat(skinAreas.abdomen) && <rect x="74" y="63" width="52" height="45" rx="6" fill={pat(skinAreas.abdomen)} opacity="0.85" />}
                <text x="100" y="85" {...tp(8)}>{t('skin.abdomen')}</text>
              </g>

              {/* Genitals */}
              <g>
                <ellipse cx="100" cy="125" rx="10" ry="6"
                  fill={zc(skinAreas.genitals)} stroke={S} strokeWidth="0.8"/>
                {pat(skinAreas.genitals) && <ellipse cx="100" cy="125" rx="10" ry="6" fill={pat(skinAreas.genitals)} />}
                <text x="100" y="125" {...tp(5)}>{t('skin.genitals')}</text>
              </g>

              {/* Left arm */}
              <g>
                <rect x="30" y="14" width="22" height="75" rx="10"
                  fill={zc(skinAreas.arms)} stroke={S} strokeWidth="1.5"/>
                {pat(skinAreas.arms) && <rect x="30" y="14" width="22" height="75" rx="10" fill={pat(skinAreas.arms)} />}
                <text x="41" y="52" {...tp(6)} transform="rotate(-90,41,52)">{t('skin.arms')}</text>
              </g>

              {/* Right arm */}
              <g>
                <rect x="148" y="14" width="22" height="75" rx="10"
                  fill={zc(skinAreas.arms)} stroke={S} strokeWidth="1.5"/>
                {pat(skinAreas.arms) && <rect x="148" y="14" width="22" height="75" rx="10" fill={pat(skinAreas.arms)} />}
              </g>

              {/* Left hand */}
              <g>
                <rect x="32" y="93" width="18" height="22" rx="5"
                  fill={zc(skinAreas.hands)} stroke={S} strokeWidth="1"/>
                {pat(skinAreas.hands) && <rect x="32" y="93" width="18" height="22" rx="5" fill={pat(skinAreas.hands)} />}
                <text x="41" y="104" {...tp(5)}>{t('skin.hands')}</text>
              </g>

              {/* Right hand */}
              <g>
                <rect x="150" y="93" width="18" height="22" rx="5"
                  fill={zc(skinAreas.hands)} stroke={S} strokeWidth="1"/>
                {pat(skinAreas.hands) && <rect x="150" y="93" width="18" height="22" rx="5" fill={pat(skinAreas.hands)} />}
              </g>

              {/* Left leg */}
              <g>
                <rect x="72" y="136" width="24" height="80" rx="10"
                  fill={zc(skinAreas.legs)} stroke={S} strokeWidth="1.5"/>
                {pat(skinAreas.legs) && <rect x="72" y="136" width="24" height="80" rx="10" fill={pat(skinAreas.legs)} />}
                <text x="84" y="176" {...tp(6)} transform="rotate(-90,84,176)">{t('skin.legs')}</text>
              </g>

              {/* Right leg */}
              <g>
                <rect x="104" y="136" width="24" height="80" rx="10"
                  fill={zc(skinAreas.legs)} stroke={S} strokeWidth="1.5"/>
                {pat(skinAreas.legs) && <rect x="104" y="136" width="24" height="80" rx="10" fill={pat(skinAreas.legs)} />}
              </g>

              {/* Left foot */}
              <g>
                <rect x="68" y="220" width="30" height="14" rx="5"
                  fill={zc(skinAreas.feet)} stroke={S} strokeWidth="1"/>
                {pat(skinAreas.feet) && <rect x="68" y="220" width="30" height="14" rx="5" fill={pat(skinAreas.feet)} />}
                <text x="83" y="227" {...tp(6)}>{t('skin.feet')}</text>
              </g>

              {/* Right foot */}
              <g>
                <rect x="102" y="220" width="30" height="14" rx="5"
                  fill={zc(skinAreas.feet)} stroke={S} strokeWidth="1"/>
                {pat(skinAreas.feet) && <rect x="102" y="220" width="30" height="14" rx="5" fill={pat(skinAreas.feet)} />}
              </g>

              {/* Back indicator */}
              <g>
                <rect x="140" y="140" width="52" height="18" rx="4"
                  fill={zc(skinAreas.back)} stroke={S} strokeWidth="0.8"/>
                {pat(skinAreas.back) && <rect x="140" y="140" width="52" height="18" rx="4" fill={pat(skinAreas.back)} />}
                <text x="166" y="149" {...tp(7, { fontWeight: 500 })}>{t('skin.back')}</text>
                <line x1="140" y1="149" x2="132" y2="100" stroke={S} strokeWidth="0.6" strokeDasharray="3,2"/>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Legend with pattern swatches for colorblind accessibility */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: D, border: `1px solid ${S}` }}/>
          {t('visualization.normal')}
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" className="inline-block rounded-sm" aria-hidden="true">
            <rect width="12" height="12" fill={R} />
            <rect width="12" height="12" fill="url(#pat-erosion)" />
          </svg>
          {t('visualization.affected')}
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" className="inline-block rounded-sm" aria-hidden="true">
            <rect width="12" height="12" fill={B} />
            <rect width="12" height="12" fill="url(#pat-pigment)" />
          </svg>
          {t('visualization.pigmentation')}
        </span>
      </div>
    </section>
  );
}
