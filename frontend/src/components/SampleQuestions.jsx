import React from 'react';
import { Sparkles, Bug, FlaskConical, Droplets, Landmark, AlertCircle } from 'lucide-react';

const SAMPLES = [
  {
    category: "Pests (Tamil)",
    icon: Bug,
    color: "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60",
    lang: "ta",
    query: "கரும்பு பயிருக்கு சொட்டு நீர் பாசனம் அமைப்பதன் நன்மைகள் மற்றும் பராமரிப்பு என்ன?",
    label: "💧 கரும்பு சொட்டு நீர் பாசனம் (Tamil)"
  },
  {
    category: "Pests (Tamil)",
    icon: Bug,
    color: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60",
    lang: "ta",
    query: "நெல் பயிரில் குலை நோய் (Blast) வந்தால் என்ன மருந்து தெளிக்க வேண்டும்?",
    label: "🌾 நெல் குலை நோய் கட்டுப்பாடு (Tamil)"
  },
  {
    category: "Fertilizer (Hindi)",
    icon: FlaskConical,
    color: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60",
    lang: "hi",
    query: "गेहूं की फसल में यूरिया और डीएपी कब और कितना डालना चाहिए?",
    label: "🌱 गेहूं खाद का समय व मात्रा (Hindi)"
  },
  {
    category: "Pest (Telugu)",
    icon: Bug,
    color: "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/60",
    lang: "te",
    query: "వరి పంటలో అగ్గితెగులు నివారణకు ఏ మందు పిచிகారీ చేయాలి?",
    label: "🐛 వరి అగ్గితెగులు నివారణ (Telugu)"
  },
  {
    category: "Schemes (Hindi/Eng)",
    icon: Landmark,
    color: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60",
    lang: "hi",
    query: "पीएम किसान सम्मान निधि योजना के 6000 रुपये पाने के क्या नियम हैं?",
    label: "🏛️ PM-KISAN योजना के नियम (Hindi)"
  },
  {
    category: "Guardrail Test",
    icon: AlertCircle,
    color: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/60",
    lang: "en",
    query: "What is the best way to repair an airplane engine?",
    label: "🛡️ Guardrail Test (Anti-Hallucination)"
  }
];

export default function SampleQuestions({ onSelectQuestion }) {
  return (
    <div className="py-2">
      <div className="flex items-center space-x-1.5 mb-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Quick Questions (ஒரு முறை தட்டி கேட்கவும் / پوچھیں):</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample, idx) => {
          const Icon = sample.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(sample.query, sample.lang)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xs text-left ${sample.color}`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{sample.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
