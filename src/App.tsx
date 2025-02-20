import React, { useState, useRef, ChangeEvent, useId } from "react";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import "./App.css";
import useTextToSpeech from "./useTextToSpeech";

function App() {
  const [text, setText] = useState("");
  const [rate, setRate] = useState(1);
  const [typedRate, setTypedRate] = useState(1);
  const rateInputId = useId();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { isSpeaking, currentIndex, speak, pause, stop } = useTextToSpeech(
    text,
    rate
  );

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    stop();

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const offset = range?.startOffset || 0;

    setText(e.currentTarget.innerText);

    setTimeout(() => {
      const newRange = document.createRange();
      const newSelection = window.getSelection();
      if (contentRef.current && newSelection) {
        newRange.setStart(contentRef.current.childNodes[0], offset);
        newRange.collapse(true);
        newSelection.removeAllRanges();
        newSelection.addRange(newRange);
      }
    }, 0);
  };

  const getHighlightedText = (text: string, index: number | null) => {
    const words = text.split(" ");
    return words
      .map((word, i) =>
        i === index
          ? `<span style="background-color: yellow; color: #1a1a1a;">${word}</span>`
          : word
      )
      .join(" ");
  };

  const handleRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(event.target.value);
    setRate(newRate);
    setTypedRate(newRate);
  };

  const handleTypedRateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setTypedRate(value);
    if (value >= 0.1 && value <= 10) {
      setRate(Math.round(value * 10) / 10);
    }
  };

  return (
    <>
      <div className="title">Text to Speech</div>
      <div className="container">
        <div className="text-to-speech-container">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="text-box"
            role="textbox"
            aria-placeholder="Enter text to hear it read"
            dangerouslySetInnerHTML={{
              __html: getHighlightedText(text, currentIndex),
            }}
          />
          <div className="controls">
            <button
              onClick={speak}
              disabled={isSpeaking}
              aria-label="Play"
              tabIndex={0}
            >
              <FaPlay />
            </button>
            <button
              onClick={pause}
              disabled={!isSpeaking}
              aria-label="Pause"
              tabIndex={0}
            >
              <FaPause />
            </button>
            <button onClick={stop} aria-label="Stop" tabIndex={0}>
              <FaStop />
            </button>
          </div>
          <div className="rate-input-container">
            <label htmlFor={rateInputId}>Speed: </label>
            <input
              id={rateInputId}
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
            />
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={typedRate}
              onChange={handleTypedRateChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
