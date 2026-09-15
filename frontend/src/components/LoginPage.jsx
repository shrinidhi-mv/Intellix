import React, { useState } from 'react';
import { Sprout, Sun, Moon, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Leaf, BookOpen } from 'lucide-react';

const LANGUAGES = [
  { code: 'ta', name: 'தமிழ்', label: 'Tamil', script: 'தமிழ்நாடு & இலங்கை உழவர்கள்' },
  { code: 'hi', name: 'हिन्दी', label: 'Hindi', script: 'उत्तर ও मध्य भारत' },
  { code: 'te', name: 'తెలుగు', label: 'Telugu', script: 'ఆంధ్రప్రదేశ్ & తెలంగాణ' },
  { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada', script: 'ಕರ್ನಾಟಕದ ರೈತರು' },
  { code: 'en', name: 'English', label: 'English', script: 'Universal Agri Advisory' },
];

const CROPS = [
  { id: 'rice', icon: '🌾', ta: 'நெல் (Paddy)', hi: 'धान (Paddy)', te: 'వరి (Paddy)', kn: 'ಭತ್ತ (Paddy)', en: 'Rice (Paddy)' },
  { id: 'sugarcane', icon: '🎋', ta: 'கரும்பு (Sugarcane)', hi: 'गन्ना (Sugarcane)', te: 'చెరకు (Sugarcane)', kn: 'ಕಬ್ಬು (Sugarcane)', en: 'Sugarcane' },
  { id: 'cotton', icon: '☁️', ta: 'பருத்தி (Cotton)', hi: 'कपास (Cotton)', te: 'పత్తి (Cotton)', kn: 'ಹತ್ತಿ (Cotton)', en: 'Cotton' },
  { id: 'wheat', icon: '🌿', ta: 'கோதுமை (Wheat)', hi: 'गेहूं (Wheat)', te: 'గోధుమ (Wheat)', kn: 'ಗೋಧಿ (Wheat)', en: 'Wheat' },
  { id: 'maize', icon: '🌽', ta: 'மக்காச்சோளம் (Maize)', hi: 'मक्का (Corn)', te: 'మొక్కజొన్న (Maize)', kn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)', en: 'Maize / Corn' },
  { id: 'tomato', icon: '🍅', ta: 'தக்காளி (Tomato)', hi: 'टमाटर (Tomato)', te: 'టమోటా (Tomato)', kn: 'ಟೊಮೆಟೊ (Tomato)', en: 'Tomato' },
];

const UI_TEXT = {
  ta: {
    welcome: 'வணக்கம்!',
    title: 'அக்ரிவா உழவர் மையம்',
    tagline: 'சரிபார்க்கப்பட்ட அறிவியல் வேளாண் ஆலோசனை',
    selectLangTitle: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    farmerDetails: 'உழவர் விவரங்கள்',
    nameLabel: 'விவசாயி பெயர் அல்லது அலைபேசி',
    namePlaceholder: 'எ.கா: திரு. ஆறுமுகம் / 9876543210',
    cropLabel: 'உங்கள் முதன்மை பயிர்',
    enterBtn: 'அக்ரிவா ஆலோசனைக்குள் நுழைக',
    demoBtn: '⚡ உடனடி முன்னோட்ட உள்நுழைவு (Demo Login)',
    verifiedBadge: 'பல்கலைக்கழக அங்கீகாரம் பெற்ற 16 ஆவணங்கள்',
    quote: '‘உழவுக்கும் தொழிலுக்கும் வந்தனை செய்வோம்’ - உங்கள் தாய்மொழியில் துல்லிய வழிகாட்டுதல்.'
  },
  hi: {
    welcome: 'नमस्ते!',
    title: 'अग्रीवा किसान केंद्र',
    tagline: 'सत्यापित वैज्ञानिक कृषि परामर्श',
    selectLangTitle: 'अपनी भाषा का चयन करें',
    farmerDetails: 'किसान विवरण',
    nameLabel: 'किसान का नाम या मोबाइल नंबर',
    namePlaceholder: 'उदा: रमेश पटेल / 9876543210',
    cropLabel: 'आपकी मुख्य फसल',
    enterBtn: 'अग्रीवा पोर्टल में प्रवेश करें',
    demoBtn: '⚡ 1-क्लिक त्वरित डेमो लॉगिन (Demo Login)',
    verifiedBadge: 'कृषि विश्वविद्यालय द्वारा 16 प्रमाणित रिकॉर्ड',
    quote: '‘जय जवान, जय किसान’ - आपकी अपनी भाषा में सही एवं सुरक्षित कृषि परामर्श।'
  },
  te: {
    welcome: 'నమస్కారం!',
    title: 'అగ్రివా రైతు కేంద్రం',
    tagline: 'ధృవీకరించబడిన శాస్త్రీయ వ్యవసాయ సలహాలు',
    selectLangTitle: 'మీ భాషను ఎంచుకోండి',
    farmerDetails: 'రైతు వివరాలు',
    nameLabel: 'రైతు పేరు లేదా మొబైల్ నంబర్',
    namePlaceholder: 'ఉదా: వెంకటేశ్వర రావు / 9876543210',
    cropLabel: 'మీ ప్రధాన పంట',
    enterBtn: 'అగ్రివా పోర్టల్‌లోకి ప్రవేశించండి',
    demoBtn: '⚡ 1-క్లిక్ త్వరిత డెమో లాగిన్ (Demo Login)',
    verifiedBadge: '16 ధృవీకరించబడిన విశ్వవిద్యాలయ రికార్డులు',
    quote: 'మీ మాతృభాషలోనే నమ్మకమైన, సురక్షితమైన పంట సంరక్షణ సలహాలు.'
  },
  kn: {
    welcome: 'ನಮಸ್ಕಾರ!',
    title: 'ಅಗ್ರಿವಾ ರೈತ ಮಿತ್ರ',
    tagline: 'ಪರಿಶೀಲಿಸಿದ ವೈಜ್ಞಾನಿಕ ಕೃಷಿ ಸಲಹೆಗಳು',
    selectLangTitle: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    farmerDetails: 'ರೈತರ ವಿವರಗಳು',
    nameLabel: 'ರೈತರ ಹೆಸರು ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    namePlaceholder: 'ಉದಾ: ಬಸವರಾಜ್ / 9876543210',
    cropLabel: 'ನಿಮ್ಮ ಮುಖ್ಯ ಬೆಳೆ',
    enterBtn: 'ಅಗ್ರಿವಾ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ',
    demoBtn: '⚡ 1-ಕ್ಲಿಕ್ ಡೆಮೊ ಲಾಗಿನ್ (Demo Login)',
    verifiedBadge: 'ಕೃಷಿ ವಿವಿಯ 16 ಅಧಿಕೃತ ದಾಖಲೆಗಳು',
    quote: 'ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ನಿಖರವಾದ ಹಾಗೂ ವಿಶ್ವಾಸಾರ್ಹ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ.'
  },
  en: {
    welcome: 'Welcome!',
    title: 'Agriva Farmer Portal',
    tagline: 'Grounded Scientific Agricultural Advisory',
    selectLangTitle: 'Select Your Preferred Language',
    farmerDetails: 'Farmer Profile',
    nameLabel: 'Farmer Name or Mobile Number',
    namePlaceholder: 'e.g. Ramesh Kumar / 9876543210',
    cropLabel: 'Your Primary Crop',
    enterBtn: 'Enter Agriva Advisory Portal',
    demoBtn: '⚡ 1-Click Instant Demo Login',
    verifiedBadge: '16 Certified University KB Records',
    quote: 'Empowering farmers with verified, zero-hallucination agronomic guidance.'
  }
};

export default function LoginPage({ onLogin, theme, onToggleTheme }) {
  const [selectedLang, setSelectedLang] = useState('ta');
  const [farmerName, setFarmerName] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('sugarcane');

  const text = UI_TEXT[selectedLang] || UI_TEXT.en;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const nameToUse = farmerName.trim() || (selectedLang === 'ta' ? 'உழவர் தோழர்' : selectedLang === 'hi' ? 'किसान मित्र' : 'Farmer Friend');
    onLogin({
      name: nameToUse,
      language: selectedLang,
      crop: selectedCrop
    });
  };

  const handleDemoLogin = () => {
    const demoNames = {
      ta: 'ஆறுமுகம் உழவர் (Arumugam)',
      hi: 'राजेश कुमार (Rajesh)',
      te: 'వెంకట్రావు (Venkata Rao)',
      kn: 'ಬಸವರಾಜ್ (Basavaraj)',
      en: 'Progressive Farmer'
    };
    onLogin({
      name: demoNames[selectedLang] || 'Progressive Farmer',
      language: selectedLang,
      crop: selectedCrop
    });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#fbf9f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between transition-colors duration-300`}>
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl tracking-tight text-emerald-900 dark:text-emerald-400">
                Agriva
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                அக்ரிவா
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              Intelligent Multilingual Agricultural Advisory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>State Agri Universities & ICAR Grounded</span>
          </div>

          <button
            onClick={onToggleTheme}
            type="button"
            className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm hover:shadow transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5 text-stone-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Graphic Section */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border border-stone-200/80 dark:border-stone-800 group">
              <img
                src="/images/farmer_hero_sunrise.jpg"
                alt="Agriva Farmland Sunrise"
                className="w-full h-64 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Agricultural Intelligence
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-md">
                    100% Regional Script
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  {text.title}
                </h2>
                <p className="text-stone-200 text-sm mt-1 sm:max-w-md">
                  {text.quote}
                </p>
              </div>
            </div>

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
                <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">100%</div>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">Mother Tongue Output</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
                <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">0%</div>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">Hallucination Risk</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm text-center">
                <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">16+</div>
                <div className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">University Guides</div>
              </div>
            </div>
          </div>

          {/* Right Login / Onboarding Form Card */}
          <div className="lg:col-span-6">
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none space-y-6">
              
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
                  <Leaf className="w-3.5 h-3.5" />
                  {text.welcome}
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white tracking-tight">
                  {text.title}
                </h1>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  {text.tagline}
                </p>
              </div>

              {/* Step 1: Language Picker Grid */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  1. {text.selectLangTitle}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedLang(lang.code)}
                        className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-stone-50/70 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-base ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-stone-800 dark:text-stone-200'}`}>
                            {lang.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 truncate">
                          {lang.script}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Farmer Details Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                    2. {text.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder={text.namePlaceholder}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 text-sm transition-all"
                  />
                </div>

                {/* Step 3: Primary Crop Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                    3. {text.cropLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CROPS.map((crop) => {
                      const isSelected = selectedCrop === crop.id;
                      const cropName = crop[selectedLang] || crop.en;
                      return (
                        <button
                          key={crop.id}
                          type="button"
                          onClick={() => setSelectedCrop(crop.id)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 truncate transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                          }`}
                        >
                          <span className="text-base">{crop.icon}</span>
                          <span className="truncate">{cropName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 group transition-all"
                  >
                    <span>{text.enterBtn}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full py-3 px-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{text.demoBtn}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-stone-200/60 dark:border-stone-800/60 mt-4">
        <div>
          Agriva (அக்ரிவா) • Powered by Multilingual RAG & Google Gemini 3.6 Flash
        </div>
        <div className="flex items-center gap-4 text-emerald-700 dark:text-emerald-400 font-medium">
          <span>Kisan Call Center: 1800-180-1551</span>
          <span>PM-KISAN: 155261</span>
        </div>
      </footer>
    </div>
  );
}
