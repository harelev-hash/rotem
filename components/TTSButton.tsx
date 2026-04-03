'use client';

import { useState, useEffect, useRef } from 'react';

interface TTSButtonProps {
  text: string;
}

export default function TTSButton({ text }: TTSButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setAvailable(false);
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = () => {
    if (!available) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'he-IL';
    utter.rate = 0.8;
    utter.pitch = 1;

    // Try to find a Hebrew voice
    const voices = window.speechSynthesis.getVoices();
    const heVoice = voices.find(v => v.lang.startsWith('he'));
    if (heVoice) utter.voice = heVoice;

    utter.onstart  = () => setSpeaking(true);
    utter.onend    = () => setSpeaking(false);
    utter.onerror  = () => setSpeaking(false);

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  if (!available) {
    return (
      <span className="text-xs text-slate-400 px-3">קול לא זמין</span>
    );
  }

  return (
    <button
      onClick={speak}
      aria-label="הקרא את המשפט"
      className={`
        w-14 h-14 rounded-full flex items-center justify-center text-2xl
        transition-all duration-200 shadow-md
        ${speaking
          ? 'bg-blue-500 text-white scale-110 ring-4 ring-blue-200'
          : 'bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 active:scale-95'}
      `}
    >
      {speaking ? '🔊' : '🔈'}
    </button>
  );
}
