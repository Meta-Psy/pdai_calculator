import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSeverityLevel } from '../utils/calculator';

const TABS = ['mild', 'moderate', 'severe', 'general'];

const TAB_STYLES = {
  mild: {
    active: 'bg-green-100 text-green-800 border-green-400',
    dot: 'bg-green-500',
  },
  moderate: {
    active: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    dot: 'bg-yellow-500',
  },
  severe: {
    active: 'bg-red-100 text-red-800 border-red-400',
    dot: 'bg-red-500',
  },
  general: {
    active: 'bg-blue-100 text-blue-800 border-blue-400',
    dot: 'bg-blue-500',
  },
};

const SECTIONS = ['treatment', 'management', 'nutrition'];

const SECTION_ICONS = {
  treatment: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  management: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  nutrition: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
};

export default function TreatmentGuide({ totals }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const severity = getSeverityLevel(totals.overallSeverity);
  const [tabState, setTabState] = useState({ tab: severity, forSeverity: severity });
  const activeTab = tabState.forSeverity === severity ? tabState.tab : severity;
  const setActiveTab = (tab) => setTabState({ tab, forSeverity: severity });

  return (
    <section className="bg-white rounded-xl shadow-lg mb-6 no-print" aria-labelledby="treatment-guide-title">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📋</span>
          <h2 id="treatment-guide-title" className="text-lg md:text-xl font-bold text-gray-800">
            {t('treatmentGuide.title')}
          </h2>
        </div>
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200/60 group-hover:bg-gray-300/60 transition-colors">
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="px-4 md:px-5 pb-4 md:pb-5">
          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin" role="tablist">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const style = TAB_STYLES[tab];
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors ${
                    isActive ? style.active : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  {t(`treatmentGuide.tab.${tab}`)}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div role="tabpanel" className="space-y-3">
            {activeTab === 'general' ? (
              /* General tab — single block */
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h3 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-1.5">
                  {SECTION_ICONS.management}
                  {t('treatmentGuide.general.title')}
                </h3>
                <div className="text-sm text-gray-700 space-y-1.5 whitespace-pre-line">
                  {t('treatmentGuide.general.content')}
                </div>
              </div>
            ) : (
              /* Severity tabs — treatment/management/nutrition */
              SECTIONS.map((section) => {
                const bgColors = {
                  treatment: 'bg-slate-50 border-slate-200',
                  management: 'bg-slate-50 border-slate-200',
                  nutrition: 'bg-slate-50 border-slate-200',
                };
                const titleColors = {
                  treatment: 'text-slate-800',
                  management: 'text-slate-800',
                  nutrition: 'text-slate-800',
                };
                return (
                  <div key={section} className={`${bgColors[section]} border rounded-lg p-3 md:p-4`}>
                    <h3 className={`font-semibold text-sm mb-2 flex items-center gap-1.5 ${titleColors[section]}`}>
                      {SECTION_ICONS[section]}
                      {t(`treatmentGuide.sections.${section}`)}
                    </h3>
                    <div className="text-sm text-gray-700 space-y-1.5 whitespace-pre-line">
                      {t(`treatmentGuide.${activeTab}.${section}`)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Notes */}
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-amber-800 text-sm mb-1.5">{t('treatmentGuide.notes.title')}</h3>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p>{t('treatmentGuide.notes.rule1')}</p>
              <p>{t('treatmentGuide.notes.rule2')}</p>
              <p>{t('treatmentGuide.notes.rule3')}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
