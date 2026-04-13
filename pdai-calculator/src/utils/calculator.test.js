import { describe, it, expect } from 'vitest';
import { calculateLesionScore, calculateTotals, getSeverityLevel } from './calculator.js';

describe('calculateLesionScore', () => {
  it('returns 0/1/1.3/1.6 for counts 0/1/2/3', () => {
    expect(calculateLesionScore(0)).toBe(0);
    expect(calculateLesionScore(1)).toBe(1);
    expect(calculateLesionScore(2)).toBe(1.3);
    expect(calculateLesionScore(3)).toBe(1.6);
  });

  it('returns 0 for count > 3', () => {
    expect(calculateLesionScore(4)).toBe(0);
  });
});

function emptySkin() {
  const keys = ['ears', 'nose', 'face', 'neck', 'chest', 'abdomen', 'back', 'arms', 'hands', 'legs', 'feet', 'genitals'];
  return Object.fromEntries(keys.map(k => [k, { erosions: 0, pigmentation: 0, lesionCount: 0 }]));
}

function emptyMucosa() {
  const keys = ['eyes', 'nose', 'buccal', 'hardPalate', 'softPalate', 'upperGingiva', 'lowerGingiva', 'tongue', 'floorOfMouth', 'lips', 'pharynx', 'anogenital'];
  return Object.fromEntries(keys.map(k => [k, 0]));
}

const emptyScalp = { erosions: 0, pigmentation: 0, lesionCount: 0 };

describe('calculateTotals', () => {
  it('returns all zeros for empty inputs', () => {
    const t = calculateTotals(emptySkin(), emptyScalp, emptyMucosa());
    expect(t.totalScore).toBe(0);
  });

  it('sums erosions and pigmentation across all areas', () => {
    const skin = emptySkin();
    skin.face.erosions = 5;
    skin.chest.erosions = 3;
    skin.arms.pigmentation = 1;
    const t = calculateTotals(skin, emptyScalp, emptyMucosa());
    expect(t.skinErosions).toBe(8);
    expect(t.skinPigmentation).toBe(1);
  });

  it('lesion count replaces erosion=1 (Rosenbach 2009)', () => {
    const skin = emptySkin();
    skin.face.erosions = 1;
    skin.face.lesionCount = 2; // lesionScore=1.3 replaces erosion=1
    const t = calculateTotals(skin, emptyScalp, emptyMucosa());
    expect(t.overallSeverity).toBeCloseTo(1.3);
  });

  it('does not replace when erosion != 1', () => {
    const skin = emptySkin();
    skin.face.erosions = 5;
    skin.face.lesionCount = 2;
    const t = calculateTotals(skin, emptyScalp, emptyMucosa());
    expect(t.overallSeverity).toBe(5);
  });

  it('computes totalScore = overallSeverity + overallDamage', () => {
    const skin = emptySkin();
    skin.face.erosions = 10;
    skin.face.pigmentation = 1;
    const scalp = { erosions: 4, pigmentation: 1, lesionCount: 0 };
    const mucosa = emptyMucosa();
    mucosa.buccal = 10;
    const t = calculateTotals(skin, scalp, mucosa);
    expect(t.overallSeverity).toBe(24);
    expect(t.overallDamage).toBe(2);
    expect(t.totalScore).toBe(26);
  });
});

describe('getSeverityLevel', () => {
  it('classifies score into mild/moderate/severe', () => {
    expect(getSeverityLevel(0)).toBe('mild');
    expect(getSeverityLevel(14.9)).toBe('mild');
    expect(getSeverityLevel(15)).toBe('moderate');
    expect(getSeverityLevel(44.9)).toBe('moderate');
    expect(getSeverityLevel(45)).toBe('severe');
  });
});
