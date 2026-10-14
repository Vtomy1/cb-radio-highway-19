import React, { useRef, useState } from 'react';
import { cbAudio } from '../utils/audioEngine';

interface RotaryKnobProps {
  label: string;
  subLabel?: string;
  value: number; // 0 to 100 or custom range
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  unit?: string;
  centerDetent?: boolean;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  label,
  subLabel,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  size = 'md',
  unit = '',
  centerDetent = false,
}) => {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(value);
  const [isActive, setIsActive] = useState(false);

  // Normalize to 0..1
  const norm = (value - min) / (max - min);
  // Angle: -135deg (min) to +135deg (max)
  const angle = -135 + norm * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    startY.current = e.clientY;
    startVal.current = value;
    setIsActive(true);
    cbAudio.playKnobClick();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dy = startY.current - e.clientY;
    const range = max - min;
    const delta = (dy / 140) * range;
    let next = Math.round((startVal.current + delta) / step) * step;

    if (centerDetent && Math.abs(next - (min + max) / 2) < range * 0.04) {
      next = (min + max) / 2;
    }

    next = Math.max(min, Math.min(max, next));
    if (next !== value) {
      onChange(next);
      if (Math.abs(next - value) >= step * 3) {
        cbAudio.playKnobClick();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      setIsActive(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? step * 2 : -step * 2;
    let next = Math.round((value + delta) / step) * step;
    next = Math.max(min, Math.min(max, next));
    if (next !== value) {
      onChange(next);
      cbAudio.playKnobClick();
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];

  return (
    <div className="flex flex-col items-center select-none group touch-none">
      {/* Knob Dial Container */}
      <div
        className={`relative ${sizeClasses} rounded-full cursor-ns-resize flex items-center justify-center`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        title={`${label}: ${value}${unit}`}
      >
        {/* Outer chrome bezel with subtle shadow */}
        <div
          className={`absolute inset-0 rounded-full border-2 transition-colors duration-150 ${
            isActive
              ? 'border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              : 'border-neutral-500 shadow-md group-hover:border-neutral-300'
          } bg-gradient-to-b from-neutral-300 via-neutral-600 to-neutral-800`}
        />

        {/* Inner fluted / knurled knob body */}
        <div
          className="absolute inset-[3px] rounded-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black shadow-inner flex items-center justify-center"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Subtle knurled radial tick marks */}
          <div className="absolute inset-0 rounded-full opacity-30 bg-[repeating-conic-gradient(from_0deg,#ffffff_0deg_4deg,#000000_4deg_8deg)] pointer-events-none" />

          {/* Center cap (brushed aluminum disc) */}
          <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-tr from-neutral-600 via-neutral-400 to-neutral-700 shadow-sm border border-neutral-600" />

          {/* Pointer indicator line */}
          <div className="absolute top-1 w-[2.5px] h-[35%] bg-amber-400 rounded-full shadow-[0_0_4px_rgba(245,158,11,0.9)]" />
        </div>
      </div>

      {/* Label and Readout */}
      <div className="mt-1.5 flex flex-col items-center text-center">
        <span className="text-[10px] font-bold tracking-wider text-neutral-300 uppercase leading-tight">
          {label}
        </span>
        {subLabel && (
          <span className="text-[8px] font-mono text-neutral-500 leading-none">
            {subLabel}
          </span>
        )}
        <span className="text-[9px] font-mono text-amber-500/90 font-semibold tabular-nums mt-0.5">
          {value}{unit}
        </span>
      </div>
    </div>
  );
};
