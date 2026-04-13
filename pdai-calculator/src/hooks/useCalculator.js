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
  eyes: 0, nose: 0, buccal: 0, hardPalate: 0, softPalate: 0,
  upperGingiva: 0, lowerGingiva: 0, tongue: 0, floorOfMouth: 0,
  lips: 0, pharynx: 0, anogenital: 0,
};

const INITIAL_PATIENT = { fullName: '', birthYear: '', diagnosis: '', immunofluorescence: '' };

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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

  const updateMucosa = (area, value) => {
    const n = typeof value === 'number' ? value : (value === '' ? 0 : parseInt(value));
    setMucosa(p => ({ ...p, [area]: isNaN(n) ? 0 : n }));
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
