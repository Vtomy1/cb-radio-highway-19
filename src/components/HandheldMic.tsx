import React, { useState } from 'react';
import { Mic, MicOff, Lock, Unlock, Radio } from 'lucide-react';
import { cbAudio } from '../utils/audioEngine';

interface HandheldMicProps {
  power: boolean;
  isTransmitting: boolean;
  onPTTDown: () => void;
  onPTTUp: () => void;
  micGain: number;
  userHandle: string;
  onQuickTransmitText?: (text: string) => void;
}

export const HandheldMic: React.FC<HandheldMicProps> = ({
  power,
  isTransmitting,
  onPTTDown,
  onPTTUp,
  micGain,
  userHandle,
  onQuickTransmitText,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const [inputText, setInputText] = useState('');
  const [micMode, setMicMode] = useState<'voice' | 'quick-text'>('voice');

  const handlePTTClick = () => {
    if (!power) return;
    if (isLocked) {
      // Toggle off
      setIsLocked(false);
      onPTTUp();
    } else {
      // Toggle on
      setIsLocked(true);
      onPTTDown();
    }
  };

  const handlePointerDownPTT = (e: React.PointerEvent) => {
    if (!power || isLocked) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onPTTDown();
  };

  const handlePointerUpPTT = (e: React.PointerEvent) => {
    if (!power || isLocked) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    onPTTUp();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !power) return;
    if (onQuickTransmitText) {
      onQuickTransmitText(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row items-center gap-6 p-4 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl shadow-xl">
      {/* Handheld Microphone Body */}
      <div className="flex items-center gap-4">
        {/* Coiled Cord simulation */}
        <div className="hidden lg:flex flex-col items-center justify-center h-28 w-8 text-neutral-600 opacity-70">
          <svg className="w-6 h-28" viewBox="0 0 24 110" fill="none">
            <path
              d="M 12 0 C 22 15, 2 30, 12 45 C 22 60, 2 75, 12 90 C 22 100, 12 110, 12 110"
              stroke="#262626"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 12 0 C 22 15, 2 30, 12 45 C 22 60, 2 75, 12 90 C 22 100, 12 110, 12 110"
              stroke="#404040"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* The Microphone Casing */}
        <div className="relative w-36 h-48 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 rounded-3xl border-2 border-neutral-700 shadow-2xl flex flex-col items-center justify-between p-3 select-none">
          {/* Top chrome hang-up button / hook */}
          <div className="w-5 h-2 bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-500 rounded-t-sm border border-neutral-600" />

          {/* Heavy Push-to-Talk side bar on left */}
          <button
            onPointerDown={handlePointerDownPTT}
            onPointerUp={handlePointerUpPTT}
            onPointerCancel={handlePointerUpPTT}
            disabled={!power}
            className={`absolute -left-3.5 top-12 bottom-12 w-4.5 rounded-l-lg border-2 border-r-0 transition-all duration-75 cursor-pointer touch-none flex items-center justify-center ${
              !power
                ? 'bg-neutral-800 border-neutral-700 opacity-50 cursor-not-allowed'
                : isTransmitting
                ? 'bg-rose-600 border-rose-400 translate-x-1 shadow-[0_0_12px_rgba(225,29,72,0.8)]'
                : 'bg-neutral-700 hover:bg-neutral-600 active:bg-rose-700 border-neutral-500 shadow-md'
            }`}
            title="PUSH TO TALK (Hold with mouse, touch, or SPACEBAR)"
          >
            <span className="text-[7px] font-bold text-white tracking-widest -rotate-90 select-none">
              PTT
            </span>
          </button>

          {/* Microphone Dynamic Grille */}
          <div className="relative w-20 h-20 rounded-full bg-neutral-950 border-2 border-neutral-700 shadow-inner flex items-center justify-center overflow-hidden">
            {/* Mesh pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#525252_1.5px,transparent_1.5px)] [background-size:6px_6px] opacity-70" />

            {/* Inner dynamic capsule ring */}
            <div
              className={`relative z-10 w-11 h-11 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                isTransmitting
                  ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'border-neutral-600 bg-neutral-900/80'
              }`}
            >
              <Mic
                className={`w-5 h-5 transition-colors ${
                  isTransmitting ? 'text-rose-400 animate-pulse' : 'text-neutral-400'
                }`}
              />
            </div>
          </div>

          {/* Mic Branding & Badge */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black tracking-widest text-neutral-300 uppercase">
              HIGHWAY DYNAMIC
            </span>
            <span className="text-[7px] font-mono text-neutral-500 tracking-wider">
              NOISE CANCELING 600Ω
            </span>
          </div>

          {/* TX Live Modulation indicator */}
          <div className="w-full px-2">
            <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all duration-75 ${
                  isTransmitting
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                    : 'bg-neutral-700'
                }`}
                style={{
                  width: isTransmitting ? `${Math.min(100, Math.max(25, micGain))}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* PTT Quick Action Controls */}
        <div className="flex flex-col gap-2">
          {/* Big Hold-to-Talk or Click-to-Talk button */}
          <button
            onPointerDown={handlePointerDownPTT}
            onPointerUp={handlePointerUpPTT}
            onPointerCancel={handlePointerUpPTT}
            disabled={!power}
            className={`px-4 py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-100 flex items-center gap-2 select-none shadow-md cursor-pointer ${
              !power
                ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                : isTransmitting
                ? 'bg-rose-600 text-white border-2 border-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.6)] scale-[0.98]'
                : 'bg-amber-500 hover:bg-amber-400 active:bg-rose-600 text-neutral-950 border border-amber-300'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{isTransmitting ? 'TRANSMITTING (TX)' : 'HOLD PTT TO TALK'}</span>
          </button>

          {/* Hands-Free PTT Lock toggle */}
          <button
            onClick={handlePTTClick}
            disabled={!power}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors cursor-pointer ${
              isLocked
                ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
            }`}
            title="Lock PTT active for hands-free transmission"
          >
            <span className="flex items-center gap-1.5">
              {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{isLocked ? 'PTT Locked On' : 'Hands-Free Lock'}</span>
            </span>
          </button>

          <span className="text-[10px] font-mono text-neutral-500 text-center">
            Shortcut: <kbd className="px-1 py-0.5 bg-neutral-800 text-amber-400 rounded text-[9px] border border-neutral-700">SPACEBAR</kbd>
          </span>
        </div>
      </div>

      {/* Voice / Text Dispatch Bar */}
      <div className="flex-1 w-full max-w-md flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-800 pt-3 md:pt-0 md:pl-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-300">Dispatch Handle:</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700">
              "{userHandle}"
            </span>
          </div>

          <div className="flex items-center gap-1 bg-neutral-800/80 p-0.5 rounded border border-neutral-700">
            <button
              onClick={() => setMicMode('voice')}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                micMode === 'voice'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Live Mic
            </button>
            <button
              onClick={() => setMicMode('quick-text')}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                micMode === 'quick-text'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Text-To-Air
            </button>
          </div>
        </div>

        {micMode === 'quick-text' ? (
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Break 19 for a radio check..."
              disabled={!power}
              className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              disabled={!power || !inputText.trim()}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Transmit
            </button>
          </form>
        ) : (
          <div className="p-2.5 bg-neutral-950/60 rounded-lg border border-neutral-800 text-xs text-neutral-400">
            <div className="flex items-center gap-2 mb-1 text-neutral-300 font-medium">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice Radio Broadcast Active</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Hold the PTT button to speak into your microphone. Your voice is modulated through our real-time 300Hz-2.8kHz CB bandpass filter and carbon mic saturation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
