import { useState, useEffect, useRef } from "react";

const useTextToSpeech = (text: string, rate: number) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const createAndSpeakUtterance = (startIndex: number) => {
    const words = text.split(" ");
    const remainingText = words.slice(startIndex).join(" ");

    if (!remainingText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(remainingText);
    utterance.rate = rate;

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentIndex(null);
    };

    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      let runningIndex = 0;
      for (let i = startIndex; i < words.length; i++) {
        runningIndex += words[i].length + 1;
        if (charIndex < runningIndex) {
          setCurrentIndex(i);
          break;
        }
      }
    };
    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  useEffect(() => {
    return () => synth.cancel();
  }, []);

  useEffect(() => {
    if (synth.paused) {
      synth.cancel();

      if (currentIndex !== null) {
        createAndSpeakUtterance(currentIndex);

        setTimeout(() => {
          synth.pause();
        }, 50);
      }
    } else if (isSpeaking) {
      synth.cancel();

      if (currentIndex !== null) {
        createAndSpeakUtterance(currentIndex);
      }
    }
  }, [rate]);

  const speak = () => {
    if (synth.paused && !isStopped) {
      synth.resume();
      setIsSpeaking(true);
      return;
    }

    if (synth.speaking) {
      synth.cancel();
    }

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.rate = rate;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsStopped(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentIndex(null);
    };

    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      let runningIndex = 0;
      const words = text.split(" ");

      for (let i = 0; i < words.length; i++) {
        runningIndex += words[i].length + 1;
        if (charIndex < runningIndex) {
          setCurrentIndex(i);
          break;
        }
      }
    };

    synth.speak(utterance);
  };

  const pause = () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    synth.cancel();
    setIsSpeaking(false);
    setCurrentIndex(null);
    utteranceRef.current = null;
    setIsStopped(true);
  };

  return { isSpeaking, currentIndex, speak, pause, stop };
};

export default useTextToSpeech;
