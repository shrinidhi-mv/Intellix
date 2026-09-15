import React from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'auto', label: 'Auto Detect (தன்னியக்கம் / स्वतः पहचान)', short: 'Auto' },
  { code: 'ta', label: 'தமிழ் (Tamil)', short: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी (Hindi)', short: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు (Telugu)', short: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', short: 'ಕನ್ನಡ' },
  { code: 'en', label: 'English', short: 'English' },
];

export default function LanguageSelect({ selectedLang, onSelectLang }) {
  return (
    <div className="flex items-center space-x-2 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-700 shadow-sm">
      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      <span className="text-xs font-medium text-stone-500 dark:text-stone-400 hidden sm:inline">Language:</span>
      <select
        value={selectedLang}
        onChange={(e) => onSelectLang(e.target.value)}
        className="bg-transparent text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer pr-2"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
