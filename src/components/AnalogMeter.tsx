import React, { useEffect, useState } from 'react';

interface AnalogMeterProps {
  power: boolean;
  isTransmitting: boolean;
  signalStrength: number; // 0 to 100
  audioLevel: number; // 0 to 100
  mode: 'S/RF' | 'CAL' | 'SWR';
  rfGain: number;
}

export const AnalogMeter: React.FC<AnalogMeterProps> = ({
  power,
  isTransmitting,
  signalStrength,
  audioLevel,
  mode,
  rfGain,
}) => {
  const [needlePos, setNeedlePos] = useState(0); // 0 (far left) to 100 (far right)

  useEffect(() => {
    if (!power) {
      setNeedlePos(0);
      return;
    }

    let target = 0;
    if (isTransmitting) {
      // In transmit mode, needle displays RF output power (usually 4 Watts ~ 75-85% scale) + modulation bounce
      if (mode === 'S/RF') {
        const baseWatts = 78; // approx 4 Watts standard
        const modulation = (audioLevel / 100) * 16;
        target = Math.min(98, baseWatts + modulation);
      } else if (mode === 'SWR') {
        target = 22; // Low SWR 1.2:1 (well tuned antenna)
      } else if (mode === 'CAL') {
        target = 88; // Calibration set point marker
      }
    } else {
      // Receive mode: signal strength from current channel traffic or RF noise baseline
      if (mode === 'S/RF') {
        const rfBaseline = (rfGain / 100) * 8; // subtle baseline drift
        target = Math.min(95, signalStrength + rfBaseline);
      } else if (mode === 'CAL' || mode === 'SWR') {
        target = 4; // idle during receive
      }
    }

    // Smooth physical spring damping
    const timer = setTimeout(() => {
      setNeedlePos(target);
    }, 30);

    return () => clearTimeout(timer);
  }, [power, isTransmitting, signalStrength, audioLevel, mode, rfGain]);

  // Map 0-100 to angle in degrees:
  // Far left: -42deg, Far right: +42deg
  const needleAngle = -42 + (needlePos / 100) * 84;

  return (
    <div className="relative w-full max-w-[280px] h-[155px] bg-neutral-900 rounded-md border-2 border-neutral-700 shadow-inner overflow-hidden select-none">
      {/* Vintage backlight glow (warm amber incandescent) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          power
            ? 'opacity-100 bg-gradient-to-b from-amber-400/25 via-amber-300/15 to-transparent'
            : 'opacity-0'
        }`}
      />

      {/* Meter Dial Face Plate */}
      <div className="relative w-full h-full p-2.5 flex flex-col justify-between">
        {/* Scale labels header */}
        <div className="flex justify-between items-center text-[9px] font-mono tracking-wider font-semibold text-neutral-400 px-2 pt-0.5">
          <span className="text-amber-500/90">SIGNAL</span>
          <span className="text-neutral-300 font-bold tracking-widest text-[10px]">S / RF</span>
          <span className="text-rose-400 font-bold">POWER (W)</span>
        </div>

        {/* Scaled Meter Arc SVG */}
        <div className="relative w-full h-[90px] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 240 110">
            {/* Meter backing arc */}
            <path
              d="M 22 92 A 130 130 0 0 1 218 92"
              fill="none"
              stroke="#525252"
              strokeWidth="1.5"
            />

            {/* S-Meter Marks (S1 to S9 in white/neutral, +10 to +30dB in RED) */}
            {/* S1 */}
            <line x1="38" y1="83" x2="42" y2="74" stroke="#d4d4d4" strokeWidth="1.5" />
            <text x="35" y="70" fill="#a3a3a3" fontSize="8" fontFamily="monospace">1</text>
            {/* S3 */}
            <line x1="60" y1="68" x2="65" y2="60" stroke="#d4d4d4" strokeWidth="1.5" />
            <text x="59" y="56" fill="#a3a3a3" fontSize="8" fontFamily="monospace">3</text>
            {/* S5 */}
            <line x1="88" y1="56" x2="92" y2="47" stroke="#d4d4d4" strokeWidth="1.5" />
            <text x="87" y="44" fill="#a3a3a3" fontSize="8" fontFamily="monospace">5</text>
            {/* S7 */}
            <line x1="118" y1="50" x2="120" y2="40" stroke="#d4d4d4" strokeWidth="1.5" />
            <text x="117" y="37" fill="#a3a3a3" fontSize="8" fontFamily="monospace">7</text>
            {/* S9 */}
            <line x1="148" y1="53" x2="149" y2="43" stroke="#f59e0b" strokeWidth="2" />
            <text x="146" y="40" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">9</text>

            {/* +10dB, +20dB, +30dB (Red warning zone) */}
            <line x1="174" y1="62" x2="178" y2="52" stroke="#ef4444" strokeWidth="1.8" />
            <text x="169" y="50" fill="#ef4444" fontSize="7" fontFamily="monospace">+10</text>
            <line x1="198" y1="76" x2="204" y2="67" stroke="#ef4444" strokeWidth="1.8" />
            <text x="193" y="65" fill="#ef4444" fontSize="7" fontFamily="monospace">+30</text>

            {/* Lower Arc for RF Output Power / Watts (0 to 4 Watts) */}
            <path
              d="M 40 98 A 110 110 0 0 1 200 98"
              fill="none"
              stroke="#404040"
              strokeWidth="1"
            />
            {/* 1W */}
            <line x1="72" y1="84" x2="75" y2="79" stroke="#737373" strokeWidth="1" />
            <text x="73" y="92" fill="#737373" fontSize="7" fontFamily="monospace">1W</text>
            {/* 2W */}
            <line x1="114" y1="74" x2="116" y2="69" stroke="#737373" strokeWidth="1" />
            <text x="114" y="82" fill="#737373" fontSize="7" fontFamily="monospace">2W</text>
            {/* 4W Legal Limit Marker */}
            <line x1="168" y1="78" x2="171" y2="72" stroke="#ef4444" strokeWidth="1.5" />
            <text x="164" y="87" fill="#ef4444" fontSize="7" fontWeight="bold" fontFamily="monospace">4W</text>

            {/* The Pivot Needle (spring-loaded moving coil) */}
            <g
              transform={`rotate(${needleAngle}, 120, 115)`}
              className="transition-transform duration-100 ease-out"
            >
              {/* Needle shadow */}
              <line
                x1="121"
                y1="115"
                x2="121"
                y2="23"
                stroke="#000000"
                strokeWidth="2"
                opacity="0.4"
              />
              {/* Needle pointer */}
              <line
                x1="120"
                y1="115"
                x2="120"
                y2="22"
                stroke={isTransmitting ? '#ef4444' : '#e5e5e5'}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Needle tip accent */}
              <circle cx="120" cy="22" r="1.2" fill="#f59e0b" />
            </g>

            {/* Pivot screw cap */}
            <circle cx="120" cy="115" r="9" fill="#171717" stroke="#525252" strokeWidth="1.5" />
            <circle cx="120" cy="115" r="4" fill="#404040" />
            <line x1="117" y1="115" x2="123" y2="115" stroke="#737373" strokeWidth="1" />
          </svg>
        </div>

        {/* Footer indicators for meter */}
        <div className="flex justify-between items-center text-[8px] font-mono text-neutral-400 px-2 pb-0.5 border-t border-neutral-800">
          <span className={`${mode === 'S/RF' ? 'text-amber-400 font-bold' : 'text-neutral-500'}`}>S/RF</span>
          <span className={`${mode === 'CAL' ? 'text-amber-400 font-bold' : 'text-neutral-500'}`}>CAL</span>
          <span className={`${mode === 'SWR' ? 'text-amber-400 font-bold' : 'text-neutral-500'}`}>SWR</span>
          <span className="text-neutral-500">FS: 50µA</span>
        </div>
      </div>

      {/* Glass glare highlight reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none" />
    </div>
  );
};
