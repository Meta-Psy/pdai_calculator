export const CalculatorIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect width="16" height="20" x="4" y="2" rx="2"/>
    <line x1="8" x2="16" y1="6" y2="6"/>
  </svg>
);

export const RefreshCw = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M8 16H3v5"/>
  </svg>
);

export const Download = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

export const Loader = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export const Printer = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/>
    <rect x="6" y="14" width="12" height="8" rx="1"/>
  </svg>
);

export const CheckCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
);

export const AlertCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

export const XCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/>
    <path d="m9 9 6 6"/>
  </svg>
);

export const InfoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);


export function SeverityIcon({ type }) {
  if (type === 'check') return <CheckCircle />;
  if (type === 'alert') return <AlertCircle />;
  return <XCircle />;
}
