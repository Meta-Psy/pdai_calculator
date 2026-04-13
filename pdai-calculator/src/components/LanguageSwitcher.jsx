import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const languages = [
  {
    code: 'ru',
    label: 'RU',
    flag: (
      <svg viewBox="0 0 640 480" width="20" height="15" aria-hidden="true">
        <rect width="640" height="160" fill="#fff"/>
        <rect y="160" width="640" height="160" fill="#0039a6"/>
        <rect y="320" width="640" height="160" fill="#d52b1e"/>
      </svg>
    ),
  },
  {
    code: 'uz',
    label: 'UZ',
    flag: (
      <svg viewBox="0 0 640 480" width="20" height="15" aria-hidden="true">
        <rect width="640" height="160" fill="#1eb53a"/>
        <rect y="160" width="640" height="40" fill="#ce1126"/>
        <rect y="200" width="640" height="80" fill="#fff"/>
        <rect y="280" width="640" height="40" fill="#ce1126"/>
        <rect y="320" width="640" height="160" fill="#0099b5"/>
        <circle cx="100" cy="80" r="40" fill="#fff"/>
        <circle cx="115" cy="80" r="35" fill="#0099b5"/>
      </svg>
    ),
  },
  {
    code: 'en',
    label: 'EN',
    flag: (
      <svg viewBox="0 0 640 480" width="20" height="15" aria-hidden="true">
        <rect width="640" height="480" fill="#012169"/>
        <path d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="60"/>
        <path d="M0 0l640 480M640 0L0 480" stroke="#C8102E" strokeWidth="40"/>
        <path d="M320 0v480M0 240h640" stroke="#fff" strokeWidth="100"/>
        <path d="M320 0v480M0 240h640" stroke="#C8102E" strokeWidth="60"/>
      </svg>
    ),
  },
  {
    code: 'kk',
    label: 'КК',
    flag: (
      <svg viewBox="0 0 640 320" width="20" height="10" aria-hidden="true">
        <rect width="640" height="108" fill="#0099b5"/>
        <rect y="108" width="640" height="6" fill="#ce1126"/>
        <rect y="114" width="640" height="3" fill="#fff"/>
        <rect y="117" width="640" height="87" fill="#ffd700"/>
        <rect y="204" width="640" height="3" fill="#fff"/>
        <rect y="207" width="640" height="6" fill="#ce1126"/>
        <rect y="213" width="640" height="107" fill="#1eb53a"/>
        <circle cx="90" cy="54" r="24" fill="#fff"/>
        <circle cx="100" cy="54" r="20" fill="#0099b5"/>
        <circle cx="145" cy="38" r="5" fill="#fff"/>
        <circle cx="165" cy="38" r="5" fill="#fff"/>
        <circle cx="135" cy="55" r="5" fill="#fff"/>
        <circle cx="155" cy="55" r="5" fill="#fff"/>
        <circle cx="175" cy="55" r="5" fill="#fff"/>
      </svg>
    ),
  },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const switchLang = (code) => {
    i18n.changeLanguage(code);
    navigate(`/${code}`, { replace: true });
  };

  return (
    <nav aria-label="Language switcher" className="flex flex-wrap gap-1">
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          className={`flex items-center gap-1 px-1.5 py-1 sm:px-2 rounded text-xs font-medium transition-colors shrink-0 ${
            (lang || i18n.language) === code
              ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={`Switch to ${label}`}
          aria-current={(lang || i18n.language) === code ? 'true' : undefined}
        >
          {flag}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
