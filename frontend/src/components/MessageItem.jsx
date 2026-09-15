import React, { useState } from 'react';
import { User, Sprout, ShieldCheck, AlertTriangle, FileText, Volume2, VolumeX } from 'lucide-react';

export default function MessageItem({ message, onOpenSources }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isUser = message.sender === 'user';

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    
    // Set appropriate voice language tag if available
    const langCode = message.detectedLanguage || 'en';
    switch (langCode) {
      case 'ta': utterance.lang = 'ta-IN'; break;
      case 'hi': utterance.lang = 'hi-IN'; break;
      case 'te': utterance.lang = 'te-IN'; break;
      case 'kn': utterance.lang = 'kn-IN'; break;
      default: utterance.lang = 'en-IN';
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="max-w-[85%] sm:max-w-[75%] flex items-start space-x-2 flex-row-reverse space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-stone-700 dark:bg-stone-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="bg-emerald-700 dark:bg-emerald-600 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm text-sm sm:text-base leading-relaxed">
              {message.text}
            </div>
            <div className="flex justify-end mt-1 text-[11px] text-stone-400 dark:text-stone-500">
              {message.timestamp}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="max-w-[95%] sm:max-w-[88%] flex items-start space-x-3">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
          <Sprout className="w-4 h-4" />
        </div>

        <div className="flex-1">
          {/* Card container */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-sm space-y-3.5 transition-colors">
            {/* Grounding & Translation Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex items-center space-x-2">
                {message.hasSufficientContext !== false ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Grounded in Verified Records</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Insufficient Verified Data</span>
                  </span>
                )}

                {message.languageName && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium text-[11px]">
                    {message.languageName}
                  </span>
                )}
              </div>

              {message.modelUsed && (
                <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                  {message.modelUsed}
                </span>
              )}
            </div>

            {/* Translation Transparency Pill */}
            {message.englishQuery && message.detectedLanguage !== 'en' && (
              <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 rounded-xl px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 flex items-center space-x-2">
                <span className="font-semibold text-emerald-800 dark:text-emerald-400 flex-shrink-0">Semantic Search:</span>
                <span className="italic truncate font-sans">"{message.englishQuery}"</span>
              </div>
            )}

            {/* Answer body with whitespace and bullet formatting */}
            <div className="text-stone-800 dark:text-stone-100 text-sm sm:text-base leading-relaxed space-y-2 whitespace-pre-line font-sans">
              {message.text}
            </div>

            {/* Sources & Controls Footer */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                {message.sources && message.sources.length > 0 && (
                  <button
                    onClick={() => onOpenSources(message.sources, message.query)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View {message.sources.length} Source Documents</span>
                  </button>
                )}

                <button
                  onClick={handleSpeak}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border transition-colors ${
                    isPlaying 
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse' 
                      : 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                  title={isPlaying ? "Stop speech" : "Read aloud (Audio)"}
                >
                  {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                </button>
              </div>

              <span className="text-[11px] text-stone-400 dark:text-stone-500">
                {message.timestamp}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
