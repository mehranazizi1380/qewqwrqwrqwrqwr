
import { useState } from 'react';
import { useLanguage, Language } from '../../hooks/useLanguage';

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
      >
        <i className="ri-global-line"></i>
        <span className="text-sm">{languages[currentLanguage]}</span>
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-xs`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[150px]">
          {Object.entries(languages).map(([code, name]) => (
            <button
              key={code}
              onClick={() => {
                changeLanguage(code as Language);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                currentLanguage === code ? 'text-blue-400 bg-gray-700' : 'text-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
