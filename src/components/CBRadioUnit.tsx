import React from 'react';
import { AnalogMeter } from './AnalogMeter';
import { RotaryKnob } from './RotaryKnob';
import { ChannelSelectorKnob } from './ChannelSelectorKnob';
import { RadioState, CBChannel } from '../types/cb';
import { cbAudio } from '../utils/audioEngine';
import { Power, Scan, Volume2 } from 'lucide-react';

interface CBRadioUnitProps {
  state: RadioState;
  channels: CBChannel[];
  activeChannel: CBChannel;
  signalStrength: number; // 0 to 100
  audioLevel: number;
  onUpdateState: <K extends keyof RadioState>(key: K, value: RadioState[K]) => void;
  onTogglePower: () => void;
  onToggleScan: () => void;
}

export const CBRadioUnit: React.FC<CBRadioUnitProps> = ({
  state,
  channels,
  activeChannel,
  signalStrength,
  audioLevel,
  onUpdateState,
  onTogglePower,
  onToggleScan,
}) => {
  const handleToggleSwitch = (
    key: 'noiseBlanker' | 'rogerBeep' | 'displayDim',
    currentVal: boolean
  ) => {
    cbAudio.playSwitchToggle();
    onUpdateState(key, !currentVal);
  };

  const handleMeterModeToggle = () => {
    cbAudio.playSwitchToggle();
    const modes: ('S/RF' | 'CAL' | 'SWR')[] = ['S/RF', 'CAL', 'SWR'];
    const idx = modes.indexOf(state.meterMode);
    const next = modes[(idx + 1) % modes.length];
    onUpdateState('meterMode', next);
  };

  const handlePACBToggle = () => {
    cbAudio.playSwitchToggle();
    const nextMode = state.mode === 'CB' ? 'PA' : 'CB';
    onUpdateState('mode', nextMode);
    if (nextMode === 'PA') {
      cbAudio.playPAHorn();
    }
  };

  const handleQuickChannel = (target: '9' | '19' | 'norm') => {
    cbAudio.playSwitchToggle();
    onUpdateState('quickChannel', target);
    if (target === '9') {
      onUpdateState('channel', 9);
    } else if (target === '19') {
      onUpdateState('channel', 19);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Heavy Bracket Mounts on Left and Right sides */}
      <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-36 bg-gradient-to-r from-neutral-700 via-neutral-500 to-neutral-800 rounded-l-md border-y border-l border-neutral-600 shadow-xl" />
      <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-36 bg-gradient-to-l from-neutral-700 via-neutral-500 to-neutral-800 rounded-r-md border-y border-r border-neutral-600 shadow-xl" />

      {/* Main CB Radio Metal Chassis */}
      <div className="relative rounded-2xl p-4 md:p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-4 border-neutral-700 shadow-2xl overflow-hidden">
        {/* Brushed aluminum faceplate finish overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/20 via-transparent to-black pointer-events-none" />

        {/* Top Header Bar: Screws & Classic Model Typography */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-neutral-800">
          {/* Left chrome screw */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-neutral-600 via-neutral-300 to-neutral-700 border border-neutral-500 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-[1.5px] bg-neutral-800 rotate-45" />
            </div>
            <div>
              <span className="text-xs md:text-sm font-black tracking-widest text-amber-500 uppercase drop-shadow-sm font-mono">
                HIGHWAY 29 LTD CLASSIC
              </span>
              <span className="hidden sm:inline-block ml-3 text-[10px] tracking-wider text-neutral-400 font-mono">
                40 CHANNEL AM CITIZENS BAND TRANSCEIVER
              </span>
            </div>
          </div>

          {/* Right Power Indicator & Right Chrome Screw */}
          <div className="flex items-center gap-4">
            <button
              onClick={onTogglePower}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider transition-all duration-150 cursor-pointer border ${
                state.power
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'
              }`}
              title="Toggle Master Power On/Off"
            >
              <Power className="w-3.5 h-3.5" />
              <span>{state.power ? 'POWER ON' : 'STANDBY'}</span>
            </button>

            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-neutral-600 via-neutral-300 to-neutral-700 border border-neutral-500 shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-[1.5px] bg-neutral-800 -rotate-45" />
            </div>
          </div>
        </div>

        {/* Top Electronics Bay: Analog S/RF Meter, Status Annunciators, Digital 7-Segment LED */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-4 items-center">
          {/* Left Bay: Analog Illuminated Meter */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            <AnalogMeter
              power={state.power}
              isTransmitting={state.isTransmitting}
              signalStrength={signalStrength}
              audioLevel={audioLevel}
              mode={state.meterMode}
              rfGain={state.rfGain}
            />
          </div>

          {/* Center Bay: Status LEDs & Mode Annunciators */}
          <div className="md:col-span-3 flex flex-col items-center justify-center gap-3 py-2 bg-neutral-900/60 rounded-xl border border-neutral-800 p-3">
            <div className="text-[10px] font-mono tracking-widest text-neutral-400 font-semibold">
              TRANSCEIVER STATUS
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              {/* TX LED (Red) */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-100 ${
                    state.power && state.isTransmitting
                      ? 'bg-rose-500 border-rose-300 shadow-[0_0_12px_rgba(244,63,94,1)] scale-110'
                      : 'bg-rose-950/60 border-neutral-700'
                  }`}
                />
                <span className="text-[8px] font-mono font-bold text-neutral-400">TX</span>
              </div>

              {/* RX LED (Green) */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-100 ${
                    state.power && !state.isTransmitting
                      ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)]'
                      : 'bg-emerald-950/60 border-neutral-700'
                  }`}
                />
                <span className="text-[8px] font-mono font-bold text-neutral-400">RX</span>
              </div>

              {/* ANT / Warning LED (Amber) */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-100 ${
                    state.power && state.meterMode === 'SWR' && state.isTransmitting
                      ? 'bg-amber-400 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse'
                      : 'bg-amber-950/60 border-neutral-700'
                  }`}
                />
                <span className="text-[8px] font-mono font-bold text-neutral-400">ANT</span>
              </div>
            </div>

            {/* PA / CB Indicator */}
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                  state.mode === 'CB'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                }`}
              >
                CB ACTIVE
              </span>
              {state.mode === 'PA' && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
                  PA HORN
                </span>
              )}
            </div>
          </div>

          {/* Right Bay: 7-Segment Digital Channel LED Readout */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center">
            <div className="relative p-3 bg-neutral-950 rounded-xl border-2 border-neutral-800 shadow-inner flex flex-col items-center">
              <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase font-semibold mb-1">
                CHANNEL
              </span>

              {/* Glowing LED display */}
              <div
                className={`relative px-6 py-2 rounded-lg border flex items-center justify-center font-mono font-black transition-all duration-300 ${
                  state.power
                    ? state.displayDim
                      ? 'bg-emerald-950/80 text-emerald-500 border-emerald-900 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-700 shadow-[0_0_20px_rgba(52,211,153,0.6)]'
                    : 'bg-neutral-900 text-neutral-700 border-neutral-800'
                }`}
                style={{ fontFamily: "'VT323', 'Chakra Petch', monospace" }}
              >
                <span className="text-5xl md:text-6xl tracking-tighter tabular-nums drop-shadow">
                  {state.power ? (state.channel < 10 ? `0${state.channel}` : state.channel) : '--'}
                </span>
              </div>

              {/* Frequency readout below channel */}
              <div className="mt-2 text-center">
                <span className="text-xs font-mono font-bold text-amber-400/90 tracking-wide">
                  {state.power ? `${activeChannel.frequency.toFixed(3)} MHz` : '---.--- MHz'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Heavy Metal Toggle Switch Bank */}
        <div className="relative z-10 my-4 p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* 1. NB/ANL (Noise Blanker / Auto Noise Limiter) */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">NB/ANL</span>
            <button
              onClick={() => handleToggleSwitch('noiseBlanker', state.noiseBlanker)}
              className={`mt-2 w-7 h-11 rounded-md border-2 p-0.5 flex flex-col transition-colors cursor-pointer shadow-md ${
                state.noiseBlanker
                  ? 'bg-neutral-800 border-amber-400 justify-start'
                  : 'bg-neutral-900 border-neutral-600 justify-end'
              }`}
              title="Noise Blanker / Automatic Noise Limiter Toggle"
            >
              <div
                className={`w-full h-4 rounded bg-gradient-to-b from-neutral-200 to-neutral-400 border border-neutral-500 shadow-sm transition-all ${
                  state.noiseBlanker ? 'bg-amber-400' : ''
                }`}
              />
            </button>
            <span className="text-[8px] font-mono text-neutral-400 mt-1 font-bold">
              {state.noiseBlanker ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* 2. S/RF - CAL - SWR Toggle */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">METER</span>
            <button
              onClick={handleMeterModeToggle}
              className="mt-2 w-7 h-11 rounded-md border-2 border-neutral-500 bg-neutral-800 p-0.5 flex flex-col justify-center cursor-pointer shadow-md"
              title="Meter selector: S/RF -> CAL -> SWR"
            >
              <div className="w-full h-4 rounded bg-gradient-to-b from-neutral-200 to-neutral-400 border border-neutral-500 shadow-sm" />
            </button>
            <span className="text-[8px] font-mono text-amber-400 font-bold mt-1">
              {state.meterMode}
            </span>
          </div>

          {/* 3. Roger Beep Toggle */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">ROGER BEEP</span>
            <button
              onClick={() => handleToggleSwitch('rogerBeep', state.rogerBeep)}
              className={`mt-2 w-7 h-11 rounded-md border-2 p-0.5 flex flex-col transition-colors cursor-pointer shadow-md ${
                state.rogerBeep
                  ? 'bg-neutral-800 border-amber-400 justify-start'
                  : 'bg-neutral-900 border-neutral-600 justify-end'
              }`}
              title="Roger Beep tone at end of transmission"
            >
              <div
                className={`w-full h-4 rounded bg-gradient-to-b from-neutral-200 to-neutral-400 border border-neutral-500 shadow-sm ${
                  state.rogerBeep ? 'bg-amber-400' : ''
                }`}
              />
            </button>
            <span className="text-[8px] font-mono text-neutral-400 mt-1 font-bold">
              {state.rogerBeep ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* 4. CH 9 / CH 19 Instant Rocker */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">CH 9 / 19</span>
            <div className="mt-2 flex gap-1">
              <button
                onClick={() => handleQuickChannel('9')}
                className={`px-1.5 py-1 text-[8px] font-mono font-bold rounded border cursor-pointer ${
                  state.channel === 9
                    ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_8px_rgba(225,29,72,0.8)]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
                title="Instant Emergency Channel 9"
              >
                CH 9
              </button>
              <button
                onClick={() => handleQuickChannel('19')}
                className={`px-1.5 py-1 text-[8px] font-mono font-bold rounded border cursor-pointer ${
                  state.channel === 19
                    ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
                title="Instant Highway Channel 19"
              >
                CH 19
              </button>
            </div>
            <span className="text-[8px] font-mono text-neutral-500 mt-1 font-bold">INSTANT</span>
          </div>

          {/* 5. PA / CB Mode */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">PA / CB</span>
            <button
              onClick={handlePACBToggle}
              className={`mt-2 w-7 h-11 rounded-md border-2 p-0.5 flex flex-col transition-colors cursor-pointer shadow-md ${
                state.mode === 'PA'
                  ? 'bg-neutral-800 border-rose-400 justify-start'
                  : 'bg-neutral-900 border-neutral-600 justify-end'
              }`}
              title="Public Address / Citizens Band Switch"
            >
              <div className="w-full h-4 rounded bg-gradient-to-b from-neutral-200 to-neutral-400 border border-neutral-500 shadow-sm" />
            </button>
            <span className="text-[8px] font-mono text-neutral-400 mt-1 font-bold">
              {state.mode}
            </span>
          </div>

          {/* 6. Channel Auto-Scanner */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">SCANNER</span>
            <button
              onClick={onToggleScan}
              disabled={!state.power}
              className={`mt-2 px-2 py-1.5 rounded-md border text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                state.isScanning
                  ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.7)] animate-pulse'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
              }`}
              title="Auto-scan 40 channels for active transmissions"
            >
              <Scan className="w-3 h-3" />
              <span>{state.isScanning ? 'SCANNING' : 'SCAN'}</span>
            </button>
            <span className="text-[8px] font-mono text-neutral-400 mt-1">40-CH</span>
          </div>
        </div>

        {/* Bottom Knob Control Deck: Knurled Rotaries */}
        <div className="relative z-10 pt-4 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-end">
          {/* 1. Volume / Power */}
          <RotaryKnob
            label="VOL"
            subLabel="POWER"
            value={state.volume}
            min={0}
            max={100}
            step={2}
            onChange={(val) => onUpdateState('volume', val)}
            unit="%"
          />

          {/* 2. Squelch (Threshold Noise Gate) */}
          <RotaryKnob
            label="SQL"
            subLabel="SQUELCH"
            value={state.squelch}
            min={0}
            max={100}
            step={2}
            onChange={(val) => onUpdateState('squelch', val)}
            unit="%"
          />

          {/* 3. RF Gain */}
          <RotaryKnob
            label="RF GAIN"
            subLabel="RECEIVER"
            value={state.rfGain}
            min={0}
            max={100}
            step={2}
            onChange={(val) => onUpdateState('rfGain', val)}
            unit="%"
          />

          {/* 4. Mic Gain / Dynamike */}
          <RotaryKnob
            label="MIC GAIN"
            subLabel="DYNAMIKE"
            value={state.micGain}
            min={0}
            max={100}
            step={2}
            onChange={(val) => onUpdateState('micGain', val)}
            unit="%"
          />

          {/* 5. Delta Tune / Clarifier */}
          <RotaryKnob
            label="CLARIFIER"
            subLabel="DELTA TUNE"
            value={state.clarifier}
            min={-50}
            max={50}
            step={2}
            centerDetent={true}
            onChange={(val) => onUpdateState('clarifier', val)}
            unit="Hz"
          />

          {/* 6. Heavy 40-Channel Selector Knob */}
          <ChannelSelectorKnob
            channel={state.channel}
            onChange={(ch) => onUpdateState('channel', ch)}
            frequency={activeChannel.frequency}
          />
        </div>

        {/* 4-Pin Mic Receptacle on Bottom Edge */}
        <div className="relative z-10 mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-neutral-400">
          <div className="flex items-center gap-2">
            {/* 4-Pin Circular Jack */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neutral-800 via-neutral-600 to-neutral-400 border border-neutral-500 shadow-inner flex items-center justify-center p-0.5">
              <div className="w-full h-full rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center relative">
                {/* 4 pins */}
                <div className="w-1 h-1 rounded-full bg-amber-400 absolute top-1" />
                <div className="w-1 h-1 rounded-full bg-amber-400 absolute bottom-1" />
                <div className="w-1 h-1 rounded-full bg-amber-400 absolute left-1" />
                <div className="w-1 h-1 rounded-full bg-amber-400 absolute right-1" />
              </div>
            </div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
              MIC INPUT · 4-PIN DYNAMIC
            </span>
          </div>

          <div className="flex items-center gap-3 text-[9px] font-mono text-neutral-400">
            <span>FCC PART 95 RULES</span>
            <span>·</span>
            <span>4W CARRIER MAX</span>
          </div>
        </div>
      </div>
    </div>
  );
};
