import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cbAudio } from '../utils/audioEngine';

interface ChannelSelectorKnobProps {
  channel: number; // 1 to 40
  onChange: (ch: number) => void;
  frequency: number; // MHz
}

export const ChannelSelectorKnob: React.FC<ChannelSelectorKnobProps> = ({
  channel,
  onChange,
  frequency,
}) => {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startCh = useRef(channel);

  // Rotate knob face: 360 deg spread across 40 channels = 9 degrees per channel step
  const rotation = ((channel - 1) * (360 / 40)) % 360;

  const stepChannel = (delta: number) => {
    let next = channel + delta;
    if (next < 1) next = 40;
    if (next > 40) next = 1;
    onChange(next);
    cbAudio.playKnobClick();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    startY.current = e.clientY;
    startCh.current = channel;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dy = startY.current - e.clientY;
    const steps = Math.floor(dy / 8);
    let next = startCh.current + steps;
    while (next < 1) next += 40;
    while (next > 40) next -= 40;
    if (next !== channel) {
      onChange(next);
      cbAudio.playKnobClick();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    stepChannel(e.deltaY < 0 ? 1 : -1);
  };

  return (
    <div className="flex flex-col items-center select-none group">
      <div className="flex items-center gap-2">
        {/* Step Down Button */}
        <button
          onClick={() => stepChannel(-1)}
          className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 border border-neutral-600 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer shadow"
          title="Channel Down (Step -1)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Big Stepped Selector Knob */}
        <div
          className="relative w-16 h-16 rounded-full cursor-ns-resize flex items-center justify-center touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          title="Drag up/down or roll wheel to tune 40 channels"
        >
          {/* Heavy outer knurled metal flange */}
          <div className="absolute inset-0 rounded-full border-2 border-neutral-400 bg-gradient-to-b from-neutral-200 via-neutral-500 to-neutral-700 shadow-lg" />

          {/* Deep fluted rotor */}
          <div
            className="absolute inset-[3px] rounded-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black shadow-inner flex items-center justify-center transition-transform duration-75"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* 40 Detent ribs */}
            <div className="absolute inset-0 rounded-full opacity-35 bg-[repeating-conic-gradient(from_0deg,#ffffff_0deg_3deg,#000000_3deg_9deg)] pointer-events-none" />

            {/* Silver inlay cap */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-500 via-neutral-300 to-neutral-600 shadow-md border border-neutral-400 flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold text-neutral-800">40CH</span>
            </div>

            {/* Amber locator marker */}
            <div className="absolute top-1 w-1.5 h-3 bg-amber-400 rounded-sm shadow-[0_0_5px_rgba(245,158,11,1)]" />
          </div>
        </div>

        {/* Step Up Button */}
        <button
          onClick={() => stepChannel(1)}
          className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 border border-neutral-600 text-neutral-300 flex items-center justify-center transition-colors cursor-pointer shadow"
          title="Channel Up (Step +1)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Label and MHz readout */}
      <div className="mt-1 flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-wider text-neutral-300 uppercase">
          CHANNEL SELECTOR
        </span>
        <span className="text-[9px] font-mono text-amber-500 font-semibold tabular-nums">
          {frequency.toFixed(3)} MHz
        </span>
      </div>
    </div>
  );
};
