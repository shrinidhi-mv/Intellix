import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import CropVisualCards from './components/CropVisualCards';
import LanguageSelect from './components/LanguageSelect';
import SampleQuestions from './components/SampleQuestions';
import MessageItem from './components/MessageItem';
import InputBar from './components/InputBar';
import SourceModal from './components/SourceModal';
import { BookOpen, X, Sparkles, Sprout, ShieldCheck } from 'lucide-react';

const WELCOME_GREETINGS = {
  ta: (name, crop) =>
    `வணக்கம் ${name}! நான் உங்கள் அக்ரிவா (Agriva) வேளாண் AI ஆலோசகர்.\n\nஉங்கள் ${crop || 'பயிர்'} சாகுபடி, சொட்டு நீர் பாசனம், பூச்சி மேலாண்மை, அல்லது அரசு திட்டங்கள் (PM-KISAN, PMFBY) குறித்து எந்த கேள்வியையும் கேளுங்கள்.\n\nநான் வழங்கும் ஒவ்வொரு பதிலும் பல்கலைக்கழக சரிபார்க்கப்பட்ட ஆவணங்களின்படி 100% தூய தமிழில் உங்களுக்கு வழங்கப்படும்.`,
  hi: (name, crop) =>
    `नमस्ते ${name}! मैं आपका अग्रीवा (Agriva) बहुभाषी कृषि AI सलाहकार हूँ।\n\nआपकी ${crop || 'फसल'} की सुरक्षा, उर्वरक सारिणी, ड्रिप सिंचाई या सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछें। सभी उत्तर प्रमाणित संदर्भों पर आधारित हैं।`,
  te: (name, crop) =>
    `నమస్కారం ${name}! నేను మీ అగ్రివా (Agriva) వ్యవసాయ AI సలహాదారుని.\n\nమీ ${crop || 'పంట'} రక్షణ, ఎరువుల నిర్వహణ లేదా ప్రభుత్వ పథకాల గురించి ఏ ప్రశ్న అయినా అడగండి.`,
  kn: (name, crop) =>
    `ನಮಸ್ಕಾರ ${name}! ನಾನು ನಿಮ್ಮ ಅಗ್ರಿವಾ (Agriva) ಕೃಷಿ AI ಸಲಹೆಗಾರ.\n\nನಿಮ್ಮ ${crop || 'ಬೆಳೆ'} ಸಂರಕ್ಷಣೆ, ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಅಥವಾ ಸರ್ಕಾರದ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.`,
  en: (name, crop) =>
    `Welcome ${name}! I am your Agriva Agricultural Knowledge Assistant.\n\nAsk any question regarding ${crop || 'crops'}, fertilizer schedules, drip irrigation, or government schemes (PM-KISAN, PMFBY). Every answer is strictly grounded in certified agricultural records.`
};

export default function App() {
  // Theme state: light by default with instant toggle to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('agriva_theme') || 'light';
  });

  // Farmer user state
  const [farmerUser, setFarmerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agriva_farmer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedLang, setSelectedLang] = useState(() => {
    return farmerUser?.language || 'ta';
  });

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeSources, setActiveSources] = useState([]);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [allDocs, setAllDocs] = useState([]);

  const chatEndRef = useRef(null);

  // Sync theme with HTML document and body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('agriva_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      localStorage.setItem('agriva_theme', next);
      return next;
    });
  };

  // Keyboard shortcut for theme toggle (Alt + T or Ctrl + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input, textarea, or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if ((e.altKey && (e.key === 't' || e.key === 'T')) || (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize greeting when user logs in
  useEffect(() => {
    if (farmerUser) {
      const lang = farmerUser.language || selectedLang || 'ta';
      const greetingFn = WELCOME_GREETINGS[lang] || WELCOME_GREETINGS.en;
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          sender: 'assistant',
          text: greetingFn(farmerUser.name, farmerUser.crop),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedLanguage: lang,
          languageName: lang === 'ta' ? 'தமிழ்' : lang === 'hi' ? 'हिन्दी' : lang === 'te' ? 'తెలుగు' : lang === 'kn' ? 'ಕನ್ನಡ' : 'English',
          hasSufficientContext: true,
          sources: []
        }
      ]);
    }
  }, [farmerUser]);

  const fetchHealthAndDocs = async () => {
    try {
      const [healthRes, docsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/documents')
      ]);
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setSystemHealth(healthData);
      }
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setAllDocs(docsData);
      }
    } catch (err) {
      console.warn('Backend connection pending:', err);
    }
  };

  useEffect(() => {
    fetchHealthAndDocs();
    const interval = setInterval(fetchHealthAndDocs, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleLogin = (userProfile) => {
    setFarmerUser(userProfile);
    setSelectedLang(userProfile.language);
    localStorage.setItem('agriva_farmer_user', JSON.stringify(userProfile));
  };

  const handleLogout = () => {
    if (window.confirm('Do you want to change farmer profile / logout?')) {
      localStorage.removeItem('agriva_farmer_user');
      setFarmerUser(null);
      setMessages([]);
    }
  };

  const handleSendMessage = async (text, overrideLang = null) => {
    if (!text.trim() || isLoading) return;

    const langToSend = overrideLang || selectedLang;
    const userMsgId = 'user-' + Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: text.trim(),
        timestamp: timestamp
      }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          language: langToSend === 'auto' ? null : langToSend
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMsg = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: data.answer,
        query: data.query,
        englishQuery: data.english_query,
        detectedLanguage: data.detected_language,
        languageName: data.language_name,
        sources: data.sources || [],
        confidence: data.confidence,
        hasSufficientContext: data.has_sufficient_context,
        modelUsed: data.model_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error during query:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'assistant',
          text: '⚠️ Unable to connect to the agricultural knowledge service. Please ensure the backend is running on port 8000.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasSufficientContext: false,
          sources: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (query, lang) => {
    if (lang) {
      setSelectedLang(lang);
    }
    handleSendMessage(query, lang);
  };

  const handleOpenSources = (sources) => {
    setActiveSources(sources);
    setIsSourceModalOpen(true);
  };

  const handleClearChat = () => {
    if (window.confirm("Reset conversation history?")) {
      const lang = selectedLang || 'ta';
      const greetingFn = WELCOME_GREETINGS[lang] || WELCOME_GREETINGS.en;
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          sender: 'assistant',
          text: greetingFn(farmerUser?.name || 'Farmer', farmerUser?.crop || 'Crops'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          detectedLanguage: lang,
          languageName: lang === 'ta' ? 'தமிழ்' : 'Multilingual',
          hasSufficientContext: true,
          sources: []
        }
      ]);
    }
  };

  // If farmer is not logged in, display the Multilingual Login / Onboarding screen
  if (!farmerUser) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#fbf9f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300`}>
      {/* Top Navigation */}
      <Header 
        systemHealth={systemHealth} 
        farmerUser={farmerUser}
        onLogout={handleLogout}
        onClearChat={handleClearChat}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col">
        {/* Controls Bar: Language Selector & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <LanguageSelect 
            selectedLang={selectedLang} 
            onSelectLang={setSelectedLang} 
          />

          <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">100% Certified University Grounded</span>
            <span className="sm:hidden">Verified RAG</span>
          </div>
        </div>

        {/* Visual Crop Category Showcase & Quick Cards */}
        {messages.length <= 2 && (
          <CropVisualCards 
            activeLang={selectedLang} 
            onSelectQuery={(q) => handleSendMessage(q, selectedLang)} 
          />
        )}

        {/* Quick Sample Prompts */}
        {messages.length <= 2 && (
          <div className="mb-4 bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3 sm:p-4 backdrop-blur-xs shadow-xs">
            <SampleQuestions onSelectQuestion={handleSelectSample} />
          </div>
        )}

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto pb-4 space-y-2">
          {messages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              onOpenSources={handleOpenSources} 
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3 mb-4 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 text-white flex items-center justify-center shadow-md animate-pulse">
                <Sprout className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl rounded-tl-xs p-4 shadow-sm flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" />
                </div>
                <span className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                  Agriva is searching certified university records & synthesizing 100% native language advisory...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <InputBar 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        currentLang={selectedLang} 
      />

      {/* Source Verification Modal */}
      <SourceModal 
        isOpen={isSourceModalOpen} 
        onClose={() => setIsSourceModalOpen(false)} 
        sources={activeSources} 
      />

      {/* Ingested Knowledge Base Articles Browser Modal */}
      {isDocsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-850">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    Agriva Certified Knowledge Base
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {allDocs.length} Seed Documents indexed in local ChromaDB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDocsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 space-y-3">
              {allDocs.map((doc, idx) => (
                <div key={idx} className={idx > 0 ? "pt-3" : ""}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100">{doc.title}</h4>
                      <code className="text-xs text-stone-500 dark:text-stone-400 font-mono">{doc.filename}</code>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                      {doc.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 flex justify-end">
              <button
                onClick={() => setIsDocsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
