import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscript: (transcript: string) => void;
  className?: string;
}

// Support standard and WebKit prefix for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'listening' | 'understanding' | 'success' | 'unsupported' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechStatus('unsupported');
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type your query.');
      setSpeechStatus('unsupported');
      setTimeout(() => setSpeechStatus('idle'), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Also picks up Roman Urdu phonetics well

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatus('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');

        setSpeechStatus('understanding');

        if (event.results[0].isFinal) {
          setIsListening(false);
          setSpeechStatus('success');
          onTranscript(transcript);
          setTimeout(() => setSpeechStatus('idle'), 1500);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechStatus('error');
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
        } else {
          setErrorMessage('Could not capture audio. Please try again or type your care inquiry.');
        }
        setTimeout(() => setSpeechStatus('idle'), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechStatus('error');
      setErrorMessage('Voice recognition failed to initialize.');
      setTimeout(() => setSpeechStatus('idle'), 3000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setSpeechStatus('idle');
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? 'Stop voice listening' : 'Start voice search'}
        title={isListening ? 'Click to stop listening' : 'Speak your symptoms or care inquiry'}
        className={`relative p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105 ring-4 ring-rose-300/50 animate-pulse'
            : 'bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 dark:text-teal-300'
        } ${className}`}
      >
        {isListening ? (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <Mic className="w-5 h-5 text-white animate-bounce" />
          </div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Voice Status Indicator Pill */}
      {speechStatus === 'listening' && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 z-50 animate-fade-in border border-gray-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span>Listening... Speak naturally (English or Urdu)</span>
        </div>
      )}

      {speechStatus === 'understanding' && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-teal-900/90 text-teal-100 text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 z-50 animate-fade-in border border-teal-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-300" />
          <span>Understanding & finding care...</span>
        </div>
      )}

      {speechStatus === 'error' && errorMessage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-900/95 text-rose-100 text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 z-50 border border-rose-700">
          <AlertCircle className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {speechStatus === 'unsupported' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-900/95 text-amber-100 text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 z-50 border border-amber-700">
          <MicOff className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span>Voice not supported in this browser. Please type.</span>
        </div>
      )}
    </div>
  );
};

