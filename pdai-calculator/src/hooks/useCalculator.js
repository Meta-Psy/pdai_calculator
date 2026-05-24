import { useState, useMemo, useEffect } from 'react';
import { calculateTotals } from '../utils/calculator.js';

const STORAGE_KEY = 'pdai-calculator-data';

const INITIAL_SKIN = {
  ears: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  nose: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  face: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  neck: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  chest: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  abdomen: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  back: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  arms: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  hands: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  legs: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  feet: { erosions: 0, pigmentation: 0, lesionCount: 0 },
  genitals: { erosions: 0, pigmentation: 0, lesionCount: 0 },
};

const INITIAL_SCALP = { erosions: 0, pigmentation: 0, lesionCount: 0 };

const INITIAL_MUCOSA = {
  eyes: { score: 0, lesionCount: 0 }, nose: { score: 0, lesionCount: 0 },
  buccal: { score: 0, lesionCount: 0 }, hardPalate: { score: 0, lesionCount: 0 },
  softPalate: { score: 0, lesionCount: 0 }, upperGingiva: { score: 0, lesionCount: 0 },
  lowerGingiva: { score: 0, lesionCount: 0 }, tongue: { score: 0, lesionCount: 0 },
  floorOfMouth: { score: 0, lesionCount: 0 }, lips: { score: 0, lesionCount: 0 },
  pharynx: { score: 0, lesionCount: 0 }, anogenital: { score: 0, lesionCount: 0 },
};

const INITIAL_PATIENT = { fullName: '', birthYear: '', diagnosis: '', immunofluorescence: '' };

function migrateMucosa(mucosa) {
  if (!mucosa) return null;
  const result = {};
  for (const [k, v] of Object.entries(mucosa)) {
    result[k] = typeof v === 'number' ? { score: v, lesionCount: 0 } : v;
  }
  return result;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.mucosa) parsed.mucosa = migrateMucosa(parsed.mucosa);
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

export function useCalculator() {
  const saved = loadSaved();

  const [patientData, setPatientData] = useState(saved?.patientData || INITIAL_PATIENT);
  const [recommendations, setRecommendations] = useState(saved?.recommendations || '');
  const [skinAreas, setSkinAreas] = useState(saved?.skinAreas || INITIAL_SKIN);
  const [scalp, setScalp] = useState(saved?.scalp || INITIAL_SCALP);
  const [mucosa, setMucosa] = useState(saved?.mucosa || INITIAL_MUCOSA);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        patientData, recommendations, skinAreas, scalp, mucosa,
      }));
    } catch { /* ignore */ }
  }, [patientData, recommendations, skinAreas, scalp, mucosa]);

  const totals = useMemo(() => calculateTotals(skinAreas, scalp, mucosa), [skinAreas, scalp, mucosa]);

  const updatePatient = (f, v) => setPatientData(p => ({ ...p, [f]: v }));

  const updateSkin = (area, field, value) => {
    const n = typeof value === 'number' ? value : (value === '' ? 0 : parseInt(value));
    const val = isNaN(n) ? 0 : n;
    setSkinAreas(p => {
      const updated = { ...p, [area]: { ...p[area], [field]: val } };
      if (field === 'erosions' && val !== 1) {
        updated[area] = { ...updated[area], lesionCount: 0 };
      }
      return updated;
    });
  };

  const updateScalp = (field, value) => {
    const n = typeof value === 'number' ? value : (value === '' ? 0 : parseInt(value));
    const val = isNaN(n) ? 0 : n;
    setScalp(p => {
      const updated = { ...p, [field]: val };
      if (field === 'erosions' && val !== 1) {
        updated.lesionCount = 0;
      }
      return updated;
    });
  };

  const updateMucosa = (area, field, value) => {
    const n = typeof value === 'number' ? value : (value === '' ? 0 : parseInt(value));
    const val = isNaN(n) ? 0 : n;
    setMucosa(p => {
      const updated = { ...p, [area]: { ...p[area], [field]: val } };
      if (field === 'score' && (val === 0 || val >= 5)) {
        updated[area] = { ...updated[area], lesionCount: 0 };
      }
      return updated;
    });
  };

  const reset = () => {
    setPatientData(INITIAL_PATIENT);
    setRecommendations('');
    setSkinAreas(INITIAL_SKIN);
    setScalp(INITIAL_SCALP);
    setMucosa(INITIAL_MUCOSA);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const getSeverity = (score, t) => {
    if (score < 15) return { level: t('results.mild'), color: 'text-green-700 bg-green-50 border-green-300', iconType: 'check' };
    if (score < 45) return { level: t('results.moderate'), color: 'text-yellow-700 bg-yellow-50 border-yellow-300', iconType: 'alert' };
    return { level: t('results.severe'), color: 'text-red-700 bg-red-50 border-red-300', iconType: 'x' };
  };

  return {
    patientData, recommendations, skinAreas, scalp, mucosa, totals,
    updatePatient, updateSkin, updateScalp, updateMucosa,
    setRecommendations, reset, getSeverity,
  };
}

export const SKIN_KEYS = Object.keys(INITIAL_SKIN);
export const MUCOSA_KEYS = Object.keys(INITIAL_MUCOSA);
export const SCORES = [0, 1, 2, 3, 5, 10];
export const MUCOSA_SCORES = [0, 1, 2, 5, 10];
export const SCALP_SCORES = [0, 1, 2, 3, 4, 10];
export const LESION_COUNTS = [0, 1, 2, 3];
export const PIGMENTATION_SCORES = [0, 1];
