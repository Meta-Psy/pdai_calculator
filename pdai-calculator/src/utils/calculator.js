export function calculateLesionScore(count) {
  if (count === 1) return 1;
  if (count === 2) return 1.3;
  if (count === 3) return 1.6;
  return 0;
}

export function calculateTotals(skinAreas, scalp, mucosa) {
  // Display fields (raw sums for subtotal display)
  const se = Object.values(skinAreas).reduce((s, a) => s + a.erosions, 0);
  const sp = Object.values(skinAreas).reduce((s, a) => s + a.pigmentation, 0);
  const sl = Object.values(skinAreas).reduce((s, a) => s + calculateLesionScore(a.lesionCount), 0);
  const mt = Object.values(mucosa).reduce((s, v) => s + v.score, 0);
  const scl = calculateLesionScore(scalp.lesionCount);

  // Activity calculation: lesion count REPLACES erosion value of 1 (per Rosenbach 2009)
  const skinActivity = Object.values(skinAreas).reduce(
    (s, a) => s + (a.erosions === 1 && a.lesionCount > 0 ? calculateLesionScore(a.lesionCount) : a.erosions), 0
  );
  const scalpActivity = scalp.erosions === 1 && scalp.lesionCount > 0
    ? calculateLesionScore(scalp.lesionCount) : scalp.erosions;
  const os = skinActivity + scalpActivity + mt;
  const od = sp + scalp.pigmentation;
  return {
    skinErosions: se, skinPigmentation: sp, skinLesionCount: sl,
    scalpErosions: scalp.erosions, scalpPigmentation: scalp.pigmentation,
    scalpLesionCount: scl, mucosaTotal: mt, overallSeverity: os,
    overallDamage: od, totalScore: os + od,
  };
}

// Single source of truth for the mild/moderate/severe cutoffs.
export const SEVERITY_THRESHOLDS = { mild: 15, moderate: 45 };

export function getSeverityBand(score) {
  if (score < SEVERITY_THRESHOLDS.mild) return 'mild';
  if (score < SEVERITY_THRESHOLDS.moderate) return 'moderate';
  return 'severe';
}

export function getSeverityLevel(score) {
  return getSeverityBand(score);
}
