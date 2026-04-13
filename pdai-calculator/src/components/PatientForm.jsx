import { useTranslation } from 'react-i18next';

export default function PatientForm({ patientData, updatePatient }) {
  const { t } = useTranslation();

  return (
    <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6" aria-labelledby="patient-title">
      <h2 id="patient-title" className="text-2xl font-bold mb-4">{t('patient.title')}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold mb-2">{t('patient.fullName')}</label>
          <input id="fullName" type="text" value={patientData.fullName} onChange={e => updatePatient('fullName', e.target.value)} placeholder={t('patient.fullNamePlaceholder')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="birthYear" className="block text-sm font-semibold mb-2">{t('patient.birthYear')}</label>
          <input id="birthYear" type="text" value={patientData.birthYear} onChange={e => updatePatient('birthYear', e.target.value)} placeholder={t('patient.birthYearPlaceholder')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="diagnosis" className="block text-sm font-semibold mb-2">{t('patient.diagnosis')}</label>
          <input id="diagnosis" type="text" value={patientData.diagnosis} onChange={e => updatePatient('diagnosis', e.target.value)} placeholder={t('patient.diagnosisPlaceholder')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{t('patient.immunofluorescence')}</label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('patient.immunofluorescence')}>
            {[
              { value: '0', label: t('patient.ifNone') },
              { value: '+', label: t('patient.ifWeak') },
              { value: '++', label: t('patient.ifModerate') },
              { value: '+++', label: t('patient.ifStrong') },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={patientData.immunofluorescence === opt.value}
                onClick={() => updatePatient('immunofluorescence', patientData.immunofluorescence === opt.value ? '' : opt.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${patientData.immunofluorescence === opt.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="hidden print-only text-sm mt-1">{patientData.immunofluorescence || '—'}</div>
        </div>
      </div>
    </section>
  );
}
