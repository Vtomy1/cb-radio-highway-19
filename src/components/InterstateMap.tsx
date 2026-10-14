import React, { useState } from 'react';
import { HIGHWAY_POINTS } from '../data/highwayMap';
import { TRUCKER_PERSONAS } from '../data/truckers';
import { HighwayPoint, TruckerPersona } from '../types/cb';
import { MapPin, Truck, AlertTriangle, ShieldAlert, Fuel, Coffee, Compass } from 'lucide-react';

interface InterstateMapProps {
  currentChannel: number;
  onSelectMileMarker: (mm: number, name: string) => void;
}

export const InterstateMap: React.FC<InterstateMapProps> = ({
  currentChannel,
  onSelectMileMarker,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<HighwayPoint | null>(null);

  const getPointIcon = (type: HighwayPoint['type']) => {
    switch (type) {
      case 'truck-stop':
        return <Fuel className="w-3.5 h-3.5 text-amber-400" />;
      case 'weigh-station':
        return <Truck className="w-3.5 h-3.5 text-cyan-400" />;
      case 'smokey-trap':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'hazard':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
      case 'rest-area':
        return <Coffee className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Interstate 80 Dispatch Radar</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time highway mile markers, weigh stations & Smokey reports
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-800/80 px-2.5 py-1 rounded border border-neutral-700">
          CORRIDOR: MM 60 – 250
        </span>
      </div>

      {/* Visual Interstate Ribbon */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="relative pl-6 border-l-2 border-neutral-700 space-y-5 my-2">
          {HIGHWAY_POINTS.map((pt) => {
            const isSelected = selectedPoint?.id === pt.id;
            const nearbyTrucks = TRUCKER_PERSONAS.filter(
              (t) => Math.abs(t.mileMarker - pt.mileMarker) <= 12
            );

            return (
              <div
                key={pt.id}
                onClick={() => {
                  setSelectedPoint(pt);
                  onSelectMileMarker(pt.mileMarker, pt.name);
                }}
                className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Milestone Node on Highway Line */}
                <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-neutral-950 border-2 border-amber-500 flex items-center justify-center shadow">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-neutral-800 border border-neutral-700">
                      {getPointIcon(pt.type)}
                    </span>
                    <span className="text-xs font-bold text-neutral-200">
                      {pt.name}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-amber-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 shrink-0">
                    MM {pt.mileMarker}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-400">
                  <span>{pt.status}</span>
                  <span className="text-[10px] text-neutral-400">Click to report</span>
                </div>

                {/* Trucks in proximity */}
                {nearbyTrucks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-mono">Nearby Rigs:</span>
                    {nearbyTrucks.map((truck) => (
                      <span
                        key={truck.id}
                        className="text-[10px] font-mono text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded flex items-center gap-1 border border-neutral-700"
                      >
                        <Truck className="w-2.5 h-2.5 text-amber-400" />
                        <span>"{truck.handle}" (MM {truck.mileMarker})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
