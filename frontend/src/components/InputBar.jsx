import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Loader2, Sparkles } from 'lucide-react';

const PLACEHOLDERS = {
  ta: 'வேளாண் கேள்வியைக் கேட்கவும் (எ.கா: கரும்பு சொட்டு நீர், நெல் குலை நோய், பருத்தி புழு)...',
  hi: 'कृषि प्रश्न पूछें (उदा: गेहूं पीला रतुआ, धान में खाद, कपास कीट, पीएम किसान)...',
  te: 'వ్యవసాయ ప్రశ్నను అడగండి (ఉదా: వరి అగ్గితెగులు, చెరకు ఎర్ర కుళ్ళు, పత్తి ఎరువులు)...',
  kn: 'ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ (ಉದಾ: ಕಬ್ಬಿನ ರಸಗೊಬ್ಬರ, ಭತ್ತದ ಬೆಂಕಿ ರೋಗ, ಹನಿ ನೀರಾವರಿ)...',
  en: 'Ask an agricultural question (e.g. drip irrigation, fertilizer schedule, rice blast)...',
};

export default function InputBar({ onSendMessage, isLoading, currentLang }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const getBcp47Code = (code) => {
    switch (code) {
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-IN';
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getBcp47Code(currentLang);

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Voice input is supported directly in modern browsers (Chrome, Edge, Safari). Please allow microphone access.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = getBcp47Code(currentLang);
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const placeholderText = PLACEHOLDERS[currentLang] || PLACEHOLDERS.en;

  return (
    <div className="sticky bottom-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 p-3 sm:p-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Listening indicator pill */}
        {isListening && (
          <div className="mb-2 flex items-center justify-center space-x-2 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Listening in {getBcp47Code(currentLang)}... Speak clearly into microphone</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl border transition-all flex-shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200 animate-bounce'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700'
            }`}
            title={isListening ? "Stop listening" : "Speak question (Voice Input)"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={placeholderText}
              className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all text-sm sm:text-base font-normal disabled:opacity-60"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white rounded-2xl font-medium shadow-md shadow-emerald-600/20 transition-all flex-shrink-0 disabled:cursor-not-allowed"
            title="Submit question to Agriva"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-1.5 text-center">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            🌱 Agriva Farmer Safety: All advisories are strictly cross-checked with certified agricultural university guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
