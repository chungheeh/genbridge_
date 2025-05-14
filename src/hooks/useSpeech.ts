import { useState, useEffect, useCallback } from 'react';

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!speechSynthesis) return;

    // 이전 발화가 있다면 중지
    if (utterance) {
      speechSynthesis.cancel();
    }

    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // 한국어 음성으로 설정
    newUtterance.lang = 'ko-KR';
    newUtterance.rate = 0.9; // 약간 천천히
    newUtterance.pitch = 1;

    // 이벤트 핸들러 설정
    newUtterance.onstart = () => setIsPlaying(true);
    newUtterance.onend = () => setIsPlaying(false);
    newUtterance.onerror = () => setIsPlaying(false);

    setUtterance(newUtterance);
    speechSynthesis.speak(newUtterance);
    setIsPlaying(true);
  }, [speechSynthesis, utterance]);

  const stop = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [speechSynthesis]);

  const pause = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, [speechSynthesis]);

  const resume = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.resume();
      setIsPlaying(true);
    }
  }, [speechSynthesis]);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying
  };
} 