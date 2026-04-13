import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SKIN_KEYS, MUCOSA_KEYS } from '../hooks/useCalculator';

function getSeverityStyle(score) {
  if (score < 15) return { bg: '#dcfce7', color: '#15803d', border: '#86efac' };
  if (score < 45) return { bg: '#fef9c3', color: '#a16207', border: '#facc15' };
  return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function tableRow(cells, isHeader = false, bgColor = '') {
  const tag = isHeader ? 'th' : 'td';
  const bg = bgColor ? `background:${bgColor};` : '';
  const fw = isHeader || bgColor ? 'font-weight:bold;' : '';
  // Wrap content in a flex div — html2canvas doesn't reliably support vertical-align:middle on td/th
  return `<tr>${cells.map((c, i) =>
    `<${tag} style="border:1px solid #aaa;padding:0;${bg}"><div style="display:flex;align-items:center;${i > 0 ? 'justify-content:center;' : ''}padding:3px 5px;line-height:1.2;${fw}">${c}</div></${tag}>`
  ).join('')}</tr>`;
}

function zc(area) {
  if (area.erosions > 0) return '#ef4444';
  if (area.pigmentation > 0) return '#93c5fd';
  return '#d1d5db';
}

function mc(val) {
  return val > 0 ? '#ef4444' : '#d1d5db';
}

// Common text attributes: text-anchor centers horizontally, dy="0.35em" centers vertically
// (dominant-baseline is not supported by html2canvas)
const T = 'text-anchor="middle" dy="0.35em"';

function buildVisualizationHTML(skinAreas, scalp, mucosa, t) {
  const S = '#6b7280';
  const G = '#e5e7eb';
  const boxStyle = 'background:#f9fafb;border:1px solid #e5e7eb;border-radius:3px;height:195px;display:flex;align-items:center;justify-content:center;';

  return `
    <div style="margin-bottom:6px;">
      <div style="font-size:10px;font-weight:bold;text-align:center;margin-bottom:4px;color:#312e81;">${esc(t('visualization.title'))}</div>
      <div style="display:flex;gap:4px;align-items:stretch;">

        <!-- Head -->
        <div style="flex:1;text-align:center;">
          <div style="font-size:8px;font-weight:bold;margin-bottom:3px;">${esc(t('visualization.head'))}</div>
          <div style="${boxStyle}">
            <svg viewBox="0 0 200 260" style="max-width:100%;max-height:185px;">
              <path d="M 40 60 Q 100 22 160 60" fill="${scalp.erosions > 0 ? '#ef4444' : (scalp.pigmentation > 0 ? '#93c5fd' : '#9ca3af')}" stroke="${S}" stroke-width="1.5"/>
              <ellipse cx="100" cy="88" rx="60" ry="65" fill="${zc(skinAreas.face)}" stroke="${S}" stroke-width="2"/>
              <ellipse cx="38" cy="88" rx="10" ry="16" fill="${zc(skinAreas.ears)}" stroke="${S}" stroke-width="1.5"/>
              <ellipse cx="162" cy="88" rx="10" ry="16" fill="${zc(skinAreas.ears)}" stroke="${S}" stroke-width="1.5"/>
              <ellipse cx="78" cy="78" rx="10" ry="7" fill="white" stroke="${S}" stroke-width="1"/>
              <ellipse cx="122" cy="78" rx="10" ry="7" fill="white" stroke="${S}" stroke-width="1"/>
              <circle cx="78" cy="80" r="3.5" fill="#4b5563"/>
              <circle cx="122" cy="80" r="3.5" fill="#4b5563"/>
              <path d="M 100 90 L 94 108 L 100 111 L 106 108 Z" fill="${zc(skinAreas.nose)}" stroke="${S}" stroke-width="1"/>
              <path d="M 82 122 Q 100 132 118 122" fill="none" stroke="${S}" stroke-width="2"/>
              <rect x="82" y="153" width="36" height="34" rx="6" fill="${zc(skinAreas.neck)}" stroke="${S}" stroke-width="1.5"/>
              <text x="100" y="44" ${T} font-size="9" fill="#374151" font-weight="500">${esc(t('scalp.title'))}</text>
              <text x="100" y="142" ${T} font-size="8" fill="#374151">${esc(t('skin.face'))}</text>
              <text x="100" y="170" ${T} font-size="7" fill="#374151">${esc(t('skin.neck'))}</text>
              <text x="100" y="200" ${T} font-size="7" fill="#6b7280" font-weight="600">${esc(t('visualization.extraOral'))}</text>
              <rect x="5" y="212" width="56" height="16" rx="3" fill="${mc(mucosa.eyes)}" stroke="${S}" stroke-width="0.6"/>
              <text x="33" y="220" ${T} font-size="6" fill="#374151">${esc(t('mucosa.eyes'))}</text>
              <rect x="72" y="212" width="56" height="16" rx="3" fill="${mc(mucosa.nose)}" stroke="${S}" stroke-width="0.6"/>
              <text x="100" y="220" ${T} font-size="6" fill="#374151">${esc(t('mucosa.nose'))}</text>
              <rect x="139" y="212" width="56" height="16" rx="3" fill="${mc(mucosa.anogenital)}" stroke="${S}" stroke-width="0.6"/>
              <text x="167" y="220" ${T} font-size="5.5" fill="#374151">${esc(t('mucosa.anogenital'))}</text>
            </svg>
          </div>
        </div>

        <!-- Oral -->
        <div style="flex:1;text-align:center;">
          <div style="font-size:8px;font-weight:bold;margin-bottom:3px;">${esc(t('visualization.oral'))}</div>
          <div style="${boxStyle}">
            <svg viewBox="0 0 200 170" style="max-width:100%;max-height:185px;">
              <ellipse cx="100" cy="78" rx="80" ry="58" fill="${mc(mucosa.lips)}" stroke="${S}" stroke-width="2"/>
              <ellipse cx="100" cy="78" rx="64" ry="46" fill="#fecaca" stroke="${S}" stroke-width="1"/>
              <path d="M 45 48 Q 100 26 155 48" fill="${mc(mucosa.hardPalate)}" stroke="${S}" stroke-width="1.2"/>
              <text x="100" y="38" ${T} font-size="6" fill="#374151">${esc(t('mucosa.hardPalate'))}</text>
              <path d="M 52 52 Q 100 40 148 52" fill="${mc(mucosa.softPalate)}" stroke="${S}" stroke-width="1"/>
              <text x="100" y="53" ${T} font-size="5" fill="#374151">${esc(t('mucosa.softPalate'))}</text>
              <path d="M 42 56 Q 100 48 158 56 L 154 63 Q 100 55 46 63 Z" fill="${mc(mucosa.upperGingiva)}" stroke="${S}" stroke-width="0.8"/>
              <text x="100" y="59" ${T} font-size="4.5" fill="#6b7280">${esc(t('mucosa.upperGingiva'))}</text>
              <ellipse cx="100" cy="68" rx="12" ry="7" fill="${mc(mucosa.pharynx)}" stroke="${S}" stroke-width="0.8"/>
              <text x="100" y="68" ${T} font-size="4.5" fill="#374151">${esc(t('mucosa.pharynx'))}</text>
              <ellipse cx="46" cy="82" rx="14" ry="22" fill="${mc(mucosa.buccal)}" stroke="${S}" stroke-width="0.8"/>
              <ellipse cx="154" cy="82" rx="14" ry="22" fill="${mc(mucosa.buccal)}" stroke="${S}" stroke-width="0.8"/>
              <text x="46" y="82" ${T} font-size="4.5" fill="#374151">${esc(t('mucosa.buccal'))}</text>
              <ellipse cx="100" cy="90" rx="34" ry="20" fill="${mc(mucosa.tongue)}" stroke="${S}" stroke-width="1.2"/>
              <text x="100" y="90" ${T} font-size="7" fill="#374151">${esc(t('mucosa.tongue'))}</text>
              <path d="M 72 110 Q 100 120 128 110" fill="${mc(mucosa.floorOfMouth)}" stroke="${S}" stroke-width="0.8"/>
              <text x="100" y="118" ${T} font-size="4.5" fill="#374151">${esc(t('mucosa.floorOfMouth'))}</text>
              <path d="M 46 114 Q 100 124 154 114 L 158 121 Q 100 131 42 121 Z" fill="${mc(mucosa.lowerGingiva)}" stroke="${S}" stroke-width="0.8"/>
              <text x="100" y="117" ${T} font-size="4.5" fill="#6b7280">${esc(t('mucosa.lowerGingiva'))}</text>
              <text x="100" y="143" ${T} font-size="6" fill="#374151">${esc(t('mucosa.lips'))}</text>
            </svg>
          </div>
        </div>

        <!-- Body -->
        <div style="flex:1;text-align:center;">
          <div style="font-size:8px;font-weight:bold;margin-bottom:3px;">${esc(t('visualization.body'))}</div>
          <div style="${boxStyle}">
            <svg viewBox="0 0 200 260" style="max-width:100%;max-height:185px;">
              <path d="M 70 10 L 70 120 Q 70 130 80 130 L 120 130 Q 130 130 130 120 L 130 10 Z" fill="${G}" stroke="${S}" stroke-width="1.5"/>
              <rect x="74" y="14" width="52" height="45" rx="6" fill="${zc(skinAreas.chest)}" stroke="${S}" stroke-width="1" opacity="0.85"/>
              <text x="100" y="36" ${T} font-size="8" fill="#374151">${esc(t('skin.chest'))}</text>
              <rect x="74" y="63" width="52" height="45" rx="6" fill="${zc(skinAreas.abdomen)}" stroke="${S}" stroke-width="1" opacity="0.85"/>
              <text x="100" y="85" ${T} font-size="8" fill="#374151">${esc(t('skin.abdomen'))}</text>
              <ellipse cx="100" cy="125" rx="10" ry="6" fill="${zc(skinAreas.genitals)}" stroke="${S}" stroke-width="0.8"/>
              <rect x="30" y="14" width="22" height="75" rx="10" fill="${zc(skinAreas.arms)}" stroke="${S}" stroke-width="1.5"/>
              <rect x="148" y="14" width="22" height="75" rx="10" fill="${zc(skinAreas.arms)}" stroke="${S}" stroke-width="1.5"/>
              <rect x="32" y="93" width="18" height="22" rx="5" fill="${zc(skinAreas.hands)}" stroke="${S}" stroke-width="1"/>
              <rect x="150" y="93" width="18" height="22" rx="5" fill="${zc(skinAreas.hands)}" stroke="${S}" stroke-width="1"/>
              <rect x="72" y="136" width="24" height="80" rx="10" fill="${zc(skinAreas.legs)}" stroke="${S}" stroke-width="1.5"/>
              <rect x="104" y="136" width="24" height="80" rx="10" fill="${zc(skinAreas.legs)}" stroke="${S}" stroke-width="1.5"/>
              <rect x="68" y="220" width="30" height="14" rx="5" fill="${zc(skinAreas.feet)}" stroke="${S}" stroke-width="1"/>
              <text x="83" y="227" ${T} font-size="6" fill="#374151">${esc(t('skin.feet'))}</text>
              <rect x="102" y="220" width="30" height="14" rx="5" fill="${zc(skinAreas.feet)}" stroke="${S}" stroke-width="1"/>
              <rect x="140" y="140" width="52" height="18" rx="4" fill="${zc(skinAreas.back)}" stroke="${S}" stroke-width="0.8"/>
              <text x="166" y="149" ${T} font-size="7" fill="#374151" font-weight="500">${esc(t('skin.back'))}</text>
              <line x1="140" y1="149" x2="132" y2="100" stroke="${S}" stroke-width="0.6" stroke-dasharray="3,2"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <table style="margin:5px auto 0;border:none;border-collapse:collapse;font-size:7px;color:#6b7280;">
        <tr>
          <td style="border:none;padding:0 3px 0 0;vertical-align:middle;"><div style="width:9px;height:9px;background:#d1d5db;border:1px solid #6b7280;border-radius:1px;"></div></td>
          <td style="border:none;padding:0 14px 0 0;vertical-align:middle;">${esc(t('visualization.normal'))}</td>
          <td style="border:none;padding:0 3px 0 0;vertical-align:middle;"><div style="width:9px;height:9px;background:#ef4444;border-radius:1px;"></div></td>
          <td style="border:none;padding:0 14px 0 0;vertical-align:middle;">${esc(t('visualization.affected'))}</td>
          <td style="border:none;padding:0 3px 0 0;vertical-align:middle;"><div style="width:9px;height:9px;background:#93c5fd;border-radius:1px;"></div></td>
          <td style="border:none;padding:0;vertical-align:middle;">${esc(t('visualization.pigmentation'))}</td>
        </tr>
      </table>
    </div>
  `;
}

function buildHTML(data) {
  const { patientData, skinAreas, scalp, mucosa, totals, recommendations, t } = data;
  const sev = getSeverityStyle(totals.overallSeverity);

  const getSevLabel = (score, t) => {
    if (score < 15) return t('results.mild');
    if (score < 45) return t('results.moderate');
    return t('results.severe');
  };

  // Patient info row
  const patientParts = [];
  if (patientData.fullName) patientParts.push(`<b>${esc(t('patient.fullName'))}:</b> ${esc(patientData.fullName)}`);
  if (patientData.birthYear) patientParts.push(`<b>${esc(t('patient.birthYear'))}:</b> ${esc(patientData.birthYear)}`);
  if (patientData.diagnosis) patientParts.push(`<b>${esc(t('patient.diagnosis'))}:</b> ${esc(patientData.diagnosis)}`);
  if (patientData.immunofluorescence) patientParts.push(`<b>${esc(t('patient.immunofluorescence'))}:</b> ${esc(patientData.immunofluorescence)}`);

  // Skin rows
  const skinRows = SKIN_KEYS.map(k =>
    tableRow([esc(t(`skin.${k}`)), skinAreas[k].erosions, skinAreas[k].lesionCount, skinAreas[k].pigmentation])
  ).join('');

  // Mucosa rows
  const mucosaRows = MUCOSA_KEYS.map(k =>
    tableRow([esc(t(`mucosa.${k}`)), mucosa[k]])
  ).join('');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#111;line-height:1.25;width:750px;padding:10px 16px;background:#fff;">

      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333;padding-bottom:5px;margin-bottom:6px;">
        <b style="font-size:12px;">PDAI Calculator &mdash; Pemphigus Disease Area Index</b>
        <span style="font-size:9px;color:#555;">${esc(t('printHeader'))} ${new Date().toLocaleDateString()}</span>
      </div>

      ${patientParts.length ? `<div style="margin-bottom:6px;font-size:9px;color:#333;">${patientParts.join(' &nbsp;|&nbsp; ')}</div>` : ''}

      ${buildVisualizationHTML(skinAreas, scalp, mucosa, t)}

      <!-- Tables side by side: Skin (left) | Scalp+Mucosa (right) -->
      <div style="display:flex;gap:6px;margin-bottom:5px;align-items:stretch;">
        <!-- SKIN — stretches to match right column height -->
        <div style="flex:3;display:flex;flex-direction:column;">
          <div style="font-size:10px;font-weight:bold;margin-bottom:5px;color:#312e81;">${esc(t('skin.title'))}</div>
          <table style="width:100%;border-collapse:collapse;font-size:8px;">
            ${tableRow([esc(t('skin.colLocation')), esc(t('skin.colErosions')), esc(t('skin.colLesionCount')), esc(t('skin.colPigmentation'))], true, '#e0e7ff')}
            ${skinRows}
            ${tableRow([esc(t('skin.totalSkin')), totals.skinErosions, totals.skinLesionCount.toFixed(1), totals.skinPigmentation], false, '#c7d2fe')}
          </table>
        </div>

        <!-- SCALP + MUCOSA stacked -->
        <div style="flex:2;">
          <div style="font-size:10px;font-weight:bold;margin-bottom:5px;color:#312e81;">${esc(t('scalp.title'))}</div>
          <table style="width:100%;border-collapse:collapse;font-size:8px;margin-bottom:5px;">
            ${tableRow([esc(t('scalp.colScalp')), esc(t('scalp.colErosions')), esc(t('scalp.colLesionCount')), esc(t('scalp.colPigmentation'))], true, '#e0e7ff')}
            ${tableRow([esc(t('scalp.colScalp')), scalp.erosions, scalp.lesionCount, scalp.pigmentation])}
            ${tableRow([esc(t('scalp.totalScalp')), totals.scalpErosions, totals.scalpLesionCount.toFixed(1), totals.scalpPigmentation], false, '#c7d2fe')}
          </table>

          <div style="font-size:10px;font-weight:bold;margin-bottom:5px;color:#312e81;">${esc(t('mucosa.title'))}</div>
          <table style="width:100%;border-collapse:collapse;font-size:8px;">
            ${tableRow([esc(t('mucosa.colLocation')), esc(t('mucosa.colErosions'))], true, '#e0e7ff')}
            ${mucosaRows}
            ${tableRow([esc(t('mucosa.totalMucosa')), totals.mucosaTotal], false, '#c7d2fe')}
          </table>
        </div>
      </div>

      <!-- RESULTS -->
      <div style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#fff;padding:6px 8px;border-radius:5px;margin-bottom:5px;">
        <div style="font-size:10px;font-weight:bold;text-align:center;margin-bottom:5px;">${esc(t('results.title'))}</div>
        <div style="display:flex;gap:6px;">
          <div style="flex:1;background:rgba(255,255,255,0.18);padding:5px;border-radius:3px;">
            <div style="font-size:7px;opacity:0.85;">${esc(t('results.severity'))}</div>
            <div style="font-size:14px;font-weight:bold;margin:1px 0;">${totals.overallSeverity.toFixed(1)}</div>
            <div style="font-size:6px;opacity:0.65;">${esc(t('results.severityMax'))}</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.18);padding:5px;border-radius:3px;">
            <div style="font-size:7px;opacity:0.85;">${esc(t('results.damage'))}</div>
            <div style="font-size:14px;font-weight:bold;margin:1px 0;">${totals.overallDamage}</div>
            <div style="font-size:6px;opacity:0.65;">${esc(t('results.damageMax'))}</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.18);padding:5px;border-radius:3px;">
            <div style="font-size:7px;opacity:0.85;">${esc(t('results.total'))}</div>
            <div style="font-size:14px;font-weight:bold;margin:1px 0;">${totals.totalScore.toFixed(1)}</div>
            <div style="font-size:6px;opacity:0.65;">${esc(t('results.totalMax'))}</div>
          </div>
          <div style="flex:1;background:${sev.bg};color:${sev.color};padding:5px;border-radius:3px;border:2px solid ${sev.border};">
            <div style="font-size:7px;">${esc(t('results.level'))}</div>
            <div style="font-size:10px;font-weight:bold;margin-top:2px;">${esc(getSevLabel(totals.overallSeverity, t))}</div>
          </div>
        </div>
      </div>

      ${recommendations.trim() ? `
      <!-- RECOMMENDATIONS -->
      <div style="margin-bottom:5px;">
        <div style="font-size:10px;font-weight:bold;margin-bottom:5px;color:#312e81;">${esc(t('recommendations.title'))}</div>
        <div style="border:1px solid #ccc;padding:4px 6px;font-size:8px;white-space:pre-wrap;word-wrap:break-word;border-radius:3px;line-height:1.3;">${esc(recommendations)}</div>
      </div>
      ` : ''}

      <!-- FOOTER -->
      <div style="text-align:center;font-size:7px;color:#888;border-top:1px solid #ddd;padding-top:3px;margin-top:3px;">
        ${esc(t('footer.copyright'))} &nbsp;|&nbsp; ${esc(t('footer.medical'))}
      </div>
    </div>
  `;
}

export async function generatePDF(data) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  container.innerHTML = buildHTML(data);
  document.body.appendChild(container);

  try {
    const content = container.firstElementChild;
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 5;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;

    let imgW = maxW;
    let imgH = (canvas.height * maxW) / canvas.width;

    // Fit to one page
    if (imgH > maxH) {
      const ratio = maxH / imgH;
      imgW *= ratio;
      imgH = maxH;
    }

    const xOffset = margin + (maxW - imgW) / 2;
    const yOffset = margin;
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgW, imgH);

    const name = data.patientData.fullName
      ? `_${data.patientData.fullName.trim().replace(/\s+/g, '_')}`
      : '';
    pdf.save(`PDAI${name}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
