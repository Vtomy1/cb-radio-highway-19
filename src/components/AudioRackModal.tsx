import React from 'react';
import { RadioState } from '../types/cb';
import { cbAudio } from '../utils/audioEngine';
import { X, Sliders, Volume2, Sparkles, User, Bell } from 'lucide-react';

interface AudioRackModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: RadioState;
  onUpdateState: <K extends keyof RadioState>(key: K, value: RadioState[K]) => void;
}

export const AudioRackModal: React.FC<AudioRackModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
}) => {
  if (!isOpen) return null;

  const presetHandles = [
    'Silver Streak',
    'Night Rider',
    'Blue Bandit',
    'Desert Fox',
    'Iron Eagle',
    'Wildcard',
    'Roadrunner',
    'Black Diamond',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-neutral-100">
              CB Audio Rack & Mod Options
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Trucker Handle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Your Trucker Handle</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={state.userHandle}
                onChange={(e) => onUpdateState('userHandle', e.target.value)}
                maxLength={20}
                className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presetHandles.map((handle) => (
                <button
                  key={handle}
                  onClick={() => onUpdateState('userHandle', handle)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    state.userHandle === handle
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  }`}
                >
                  "{handle}"
                </button>
              ))}
            </div>
          </div>

          {/* Echo Box Effect */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-neutral-200">Trucker Echo Box</span>
              </div>
              <button
                onClick={() => onUpdateState('echoEnabled', !state.echoEnabled)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
                  state.echoEnabled
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                {state.echoEnabled ? 'ECHO ON' : 'ECHO OFF'}
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Simulates the famous power-mic echo chamber favored by DX shooters and skip talkers.
            </p>

            {state.echoEnabled && (
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Echo Delay</span>
                    <span className="font-mono text-amber-400">{state.echoDelay} ms</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="350"
                    step="10"
                    value={state.echoDelay}
                    onChange={(e) => onUpdateState('echoDelay', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Echo Repeat / Depth</span>
                    <span className="font-mono text-amber-400">{state.echoFeedback}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={state.echoFeedback}
                    onChange={(e) => onUpdateState('echoFeedback', Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sound FX Audition & Diagnostics */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Audio FX Audition</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => cbAudio.playRogerBeep('classic')}
                className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer text-center"
              >
                Classic 1050Hz Beep
              </button>
              <button
                onClick={() => cbAudio.playRogerBeep('dual')}
                className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer text-center"
              >
                Dual K-Tone Beep
              </button>
              <button
                onClick={() => cbAudio.playPAHorn()}
                className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer text-center"
              >
                PA Horn Blast
              </button>
              <button
                onClick={() => cbAudio.playMicKeyDown()}
                className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer text-center"
              >
                Mic Key Click
              </button>
              <button
                onClick={() => cbAudio.playMicKeyUp(true)}
                className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer text-center"
              >
                Squelch Tail + Beep
              </button>
              <button
                onClick={() => cbAudio.playSwitchToggle()}
                className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer text-center"
              >
                Metal Toggle Click
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
