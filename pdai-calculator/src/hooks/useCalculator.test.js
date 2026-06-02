import { describe, it, expect } from 'vitest';
import { sanitizeSaved, INITIAL_SKIN, INITIAL_SCALP, INITIAL_MUCOSA, INITIAL_PATIENT } from './useCalculator.js';

describe('sanitizeSaved', () => {
  it('returns null for non-object payloads', () => {
    expect(sanitizeSaved(null)).toBeNull();
    expect(sanitizeSaved(undefined)).toBeNull();
    expect(sanitizeSaved(42)).toBeNull();
    expect(sanitizeSaved('string')).toBeNull();
    expect(sanitizeSaved([])).toBeNull();
  });

  it('fills a fully empty object with defaults', () => {
    const result = sanitizeSaved({});
    expect(result.skinAreas).toEqual(INITIAL_SKIN);
    expect(result.scalp).toEqual(INITIAL_SCALP);
    expect(result.mucosa).toEqual(INITIAL_MUCOSA);
    expect(result.patientData).toEqual(INITIAL_PATIENT);
    expect(result.recommendations).toBe('');
  });

  it('backfills a skin area that is missing from a partial payload', () => {
    const partial = {
      skinAreas: { face: { erosions: 1, pigmentation: 0, lesionCount: 2 } },
    };
    const result = sanitizeSaved(partial);
    // every INITIAL_SKIN key must be present
    for (const key of Object.keys(INITIAL_SKIN)) {
      expect(result.skinAreas[key]).toBeDefined();
    }
    // the supplied area's fields are preserved
    expect(result.skinAreas.face).toEqual({ erosions: 1, pigmentation: 0, lesionCount: 2 });
    // a missing area defaults to the initial shape
    expect(result.skinAreas.ears).toEqual(INITIAL_SKIN.ears);
  });

  it('drops unknown keys inside a skin area but keeps known fields', () => {
    const result = sanitizeSaved({
      skinAreas: { face: { erosions: 2, bogus: 'x' } },
    });
    expect(result.skinAreas.face).toEqual({ erosions: 2, pigmentation: 0, lesionCount: 0 });
    expect(result.skinAreas.face.bogus).toBeUndefined();
  });

  it('ignores unknown top-level skin areas', () => {
    const result = sanitizeSaved({
      skinAreas: { martian: { erosions: 1 } },
    });
    expect(result.skinAreas.martian).toBeUndefined();
    expect(Object.keys(result.skinAreas).sort()).toEqual(Object.keys(INITIAL_SKIN).sort());
  });

  it('replaces a non-object skin area with the default shape', () => {
    const result = sanitizeSaved({ skinAreas: { face: 'corrupt' } });
    expect(result.skinAreas.face).toEqual(INITIAL_SKIN.face);
  });

  it('backfills missing mucosa regions and migrates legacy numeric scores', () => {
    const result = sanitizeSaved({ mucosa: { eyes: 5 } });
    expect(result.mucosa.eyes).toEqual({ score: 5, lesionCount: 0 });
    expect(result.mucosa.lips).toEqual(INITIAL_MUCOSA.lips);
  });

  it('coerces a corrupt scalp into the default shape', () => {
    const result = sanitizeSaved({ scalp: 'broken' });
    expect(result.scalp).toEqual(INITIAL_SCALP);
  });

  it('keeps only known patientData fields and ignores extras', () => {
    const result = sanitizeSaved({
      patientData: { fullName: 'A', birthYear: '1990', extra: 'nope' },
    });
    expect(result.patientData).toEqual({
      fullName: 'A', birthYear: '1990', diagnosis: '', immunofluorescence: '',
    });
  });

  it('defaults recommendations to empty string when not a string', () => {
    expect(sanitizeSaved({ recommendations: 123 }).recommendations).toBe('');
    expect(sanitizeSaved({ recommendations: 'note' }).recommendations).toBe('note');
  });
});
