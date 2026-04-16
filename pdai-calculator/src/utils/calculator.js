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

export function getSeverityLevel(score) {
  if (score < 15) return 'mild';
  if (score < 45) return 'moderate';
  return 'severe';
}
