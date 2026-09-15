import React from 'react';
import { Sprout, Sparkles, Droplets, Bug, ShieldAlert, ChevronRight } from 'lucide-react';

const CROP_CATEGORIES = [
  {
    id: 'sugarcane',
    name: { ta: 'கரும்பு வழிகாட்டி', hi: 'गन्ना परामर्श', te: 'చెరకు గైడ్', kn: 'ಕಬ್ಬು ಮಾರ್ಗದರ್ಶಿ', en: 'Sugarcane Guide' },
    icon: '🎋',
    badge: '100% Verified',
    highlight: {
      ta: 'சொட்டு நீர் பாசனம் & செவ்வழுகல் தடுப்பு',
      hi: 'ड्रिप सिंचाई एवं लाल सड़न रोकथाम',
      te: 'బిందు సేద్యం & ఎర్ర కుళ్ళు నివారణ',
      kn: 'ಹನಿ ನೀರಾವರಿ & ಕೆಂಪು ಕೊಳೆ ನಿಯಂತ್ರಣ',
      en: 'Drip Irrigation & Red Rot Control'
    },
    sampleQuery: {
      ta: 'கரும்பு பயிருக்கு சொட்டு நீர் பாசனம் அமைப்பதன் நன்மைகள் மற்றும் பராமரிப்பு என்ன?',
      hi: 'गन्ने की फसल में लाल सड़न रोग की रोकथाम और बीज उपचार क्या है?',
      te: 'చెరకు పంటలో ఎర్ర కుళ్ళు తెగులు నివారణ ఎలా చేయాలి?',
      kn: 'ಕಬ್ಬಿನ ಬೆಳೆಗೆ ರಸಗೊಬ್ಬರ ನಿರ್ವಹಣೆ ಹೇಗೆ ಮಾಡಬೇಕು?',
      en: 'What is the fertilizer schedule and drip irrigation timing for sugarcane?'
    }
  },
  {
    id: 'rice',
    name: { ta: 'நெல் சாகுபடி', hi: 'धान प्रबंधन', te: 'వరి సాగు', kn: 'ಭತ್ತದ ಕೃಷಿ', en: 'Paddy / Rice' },
    icon: '🌾',
    badge: 'Blast & Fertilizer',
    highlight: {
      ta: 'குலை நோய் மேலாண்மை & யூரியா அளவு',
      hi: 'झुलसा रोग रोकथाम एवं NPK सारिणी',
      te: 'అగ్గితెగులు మందు & ఎరువుల మోతాదు',
      kn: 'ಬೆಂಕಿ ರೋಗ & ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣ',
      en: 'Blast Management & NPK Schedule'
    },
    sampleQuery: {
      ta: 'நெல் பயிரில் குலை நோய் தாக்கினால் என்ன மருந்து தெளிக்க வேண்டும்?',
      hi: 'धान की फसल में ब्लास्ट रोग के लक्षण और रोकथाम क्या है?',
      te: 'వరి పంటలో అగ్గితెగులు నివారణకు ఏ మందు పిచికారీ చేయాలి?',
      kn: 'ಭತ್ತದ ಬೆಂಕಿ ರೋಗ ನಿಯಂತ್ರಣಕ್ಕೆ ಯಾವ ಔಷಧ ಸಿಂಪಡಿಸಬೇಕು?',
      en: 'What fungicide is recommended for rice blast disease control?'
    }
  },
  {
    id: 'cotton',
    name: { ta: 'பருத்தி பாதுகாப்பு', hi: 'कपास सुरक्षा', te: 'పత్తి రక్షణ', kn: 'ಹತ್ತಿ ರಕ್ಷಣೆ', en: 'Cotton Advisory' },
    icon: '☁️',
    badge: 'Bollworm Alert',
    highlight: {
      ta: 'இளஞ்சிவப்பு காய்ப்புழு & பூ உதிர்வு',
      hi: 'गुलाबी सुंडी एवं फल झड़ने की रोकथाम',
      te: 'గులాబీ రంగు పురుగు & పూత రాలడం',
      kn: 'ಗುಲಾಬಿ ಕಾಯಿ ಹುಳು & ಹೂವು ಉದುರುವುದು',
      en: 'Pink Bollworm & Square Drop'
    },
    sampleQuery: {
      ta: 'பருத்தி பயிரில் இளஞ்சிவப்பு காய்ப்புழுவை எவ்வாறு கட்டுப்படுத்துவது?',
      hi: 'कपास में गुलाबी सुंडी नियंत्रण के लिए फेरोमोन ट्रैप और दवा?',
      te: 'పత్తిలో గులాబీ రంగు కాయ తొలుచు పురుగు నివారణ ఎలా?',
      kn: 'ಹತ್ತಿ ಬೆಳೆಯಲ್ಲಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ನಿಯಂತ್ರಣ ಹೇಗೆ?',
      en: 'How to control pink bollworm and square shedding in cotton?'
    }
  },
  {
    id: 'schemes',
    name: { ta: 'அரசு திட்டங்கள்', hi: 'सरकारी योजनाएं', te: 'ప్రభుత్వ పథకాలు', kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', en: 'Govt Schemes' },
    icon: '🏛️',
    badge: '₹6000 & KCC 4%',
    highlight: {
      ta: 'பிஎம் கிசான் & பயிர் காப்பீடு 72 மணி நேரம்',
      hi: 'पीएम किसान एवं फसल बीमा 72 घंटे का नियम',
      te: 'పీఎం కిసాన్ & పంట బీమా 72 గంటల గడువు',
      kn: 'ಪಿಎಂ ಕಿಸಾನ್ & ಬೆಳೆ ವಿಮೆ 72 ಗಂಟೆಗಳ ನಿಯಮ',
      en: 'PM-KISAN & Crop Insurance 72-Hour Rule'
    },
    sampleQuery: {
      ta: 'பிரதம மந்திரி கிசான் சம்மான் நிதி திட்டத்தின் பலன்கள் மற்றும் தகுதிகள் என்ன?',
      hi: 'पीएम फसल बीमा योजना में फसल खराब होने पर कितने घंटे में शिकायत करनी होती है?',
      te: 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి పథకం ప్రయోజనాలు ఏమిటి?',
      kn: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಯೋಜನೆಯ ಬಡ್ಡಿ ದರ ಮತ್ತು ನಿಯಮಗಳು ಯಾವುವು?',
      en: 'What are the rules and deadline to report crop damage under PMFBY?'
    }
  }
];

export default function CropVisualCards({ activeLang = 'ta', onSelectQuery }) {
  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner with Attractive Crop Collage */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-md">
        <img
          src="/images/crops_harvest_collage.jpg"
          alt="Agriva Verified Crops Harvest"
          className="w-full h-32 sm:h-40 object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-transparent flex items-center p-4 sm:p-6">
          <div className="text-white max-w-md space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/80 text-white text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Agriva Knowledge Base
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              {activeLang === 'ta' && 'சரிபார்க்கப்பட்ட பயிர் கள வழிகாட்டுதல்கள்'}
              {activeLang === 'hi' && 'सत्यापित कृषि विश्वविद्यालय ज्ञानकोष'}
              {activeLang === 'te' && 'ధృవీకరించబడిన వ్యవసాయ మార్గదర్శకాలు'}
              {activeLang === 'kn' && 'ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಮಾರ್ಗದರ್ಶಿ'}
              {activeLang === 'en' && 'Verified University Crop Directives'}
            </h3>
            <p className="text-xs text-emerald-100 hidden sm:block">
              {activeLang === 'ta' && 'கரும்பு, நெல், பருத்தி, கோதுமை, மக்காச்சோளம் மற்றும் அரசு திட்டங்களுக்கான உடனடி பதில்கள்.'}
              {activeLang === 'hi' && 'गन्ना, धान, कपास, गेहूं, मक्का और योजनाओं की वैज्ञानिक जानकारी एक क्लिक में।'}
              {activeLang === 'te' && 'వరి, చెరకు, పత్తి, గోధుమ మరియు ప్రభుత్వ పథకాల సమాచారం.'}
              {activeLang === 'kn' && 'ಭತ್ತ, ಕಬ್ಬು, ಹತ್ತಿ, ಗೋಧಿ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಅಧಿಕೃತ ಮಾಹಿತಿ.'}
              {activeLang === 'en' && 'Instant non-hallucinated advisory for paddy, sugarcane, cotton, wheat, and government schemes.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Interactive Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CROP_CATEGORIES.map((cat) => {
          const title = cat.name[activeLang] || cat.name.en;
          const highlight = cat.highlight[activeLang] || cat.highlight.en;
          const queryText = cat.sampleQuery[activeLang] || cat.sampleQuery.en;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectQuery(queryText)}
              className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all text-left group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60">
                    {cat.icon}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {cat.badge}
                  </span>
                </div>

                <div className="font-display font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {title}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                  {highlight}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span>
                  {activeLang === 'ta' && 'கேள்வி கேட்க'}
                  {activeLang === 'hi' && 'प्रश्न पूछें'}
                  {activeLang === 'te' && 'ప్రశ్నించండి'}
                  {activeLang === 'kn' && 'ಪ್ರಶ್ನೆ ಕೇಳಿ'}
                  {activeLang === 'en' && 'Ask Question'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
