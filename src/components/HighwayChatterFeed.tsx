import React, { useState } from 'react';
import { Transmission, CBChannel } from '../types/cb';
import { Volume2, Radio, Truck, AlertTriangle, ShieldAlert, Sparkles, User } from 'lucide-react';

interface HighwayChatterFeedProps {
  transmissions: Transmission[];
  currentChannel: CBChannel;
  onReplayAudio: (tx: Transmission) => void;
  onQuickRespond: (handle: string, channel: number) => void;
  isReceiving: boolean;
  activeTransmissionId?: string | null;
}

export const HighwayChatterFeed: React.FC<HighwayChatterFeedProps> = ({
  transmissions,
  currentChannel,
  onReplayAudio,
  onQuickRespond,
  isReceiving,
  activeTransmissionId,
}) => {
  const [filterMode, setFilterMode] = useState<'current' | 'all'>('current');

  const filteredTransmissions = transmissions.filter((t) => {
    if (filterMode === 'current') {
      return t.channel === currentChannel.channel;
    }
    return true;
  });

  const getCategoryBadge = (category?: Transmission['category']) => {
    switch (category) {
      case 'smokey':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Smokey Alert</span>
          </span>
        );
      case 'hazard':
        return (
          <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Road Hazard</span>
          </span>
        );
      case 'weigh-station':
        return (
          <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium">
            <Truck className="w-3 h-3 text-cyan-400" />
            <span>Weigh Station</span>
          </span>
        );
      case 'emergency':
        return (
          <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>Emergency 10-33</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] text-neutral-400">
            <Radio className="w-3 h-3 text-neutral-500" />
            <span>Chatter</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500" />
              <span>Interstate Traffic Log</span>
            </h3>
            {isReceiving && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                RECEIVING LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
            <span>{currentChannel.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-amber-400/90">{currentChannel.frequency.toFixed(3)} MHz</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
          <button
            onClick={() => setFilterMode('current')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterMode === 'current'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Ch {currentChannel.channel} Only
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All 40 Channels
          </button>
        </div>
      </div>

      {/* Channel Overview Banner */}
      <div className="px-4 py-2.5 bg-neutral-950/40 border-b border-neutral-800 text-xs flex items-center justify-between">
        <p className="text-neutral-300 leading-snug truncate max-w-xl">
          <span className="text-amber-500 font-semibold font-mono mr-1.5">[CH {currentChannel.channel}]</span>
          {currentChannel.description}
        </p>
        <div className="text-[11px] font-mono text-neutral-500 shrink-0 ml-3">
          Activity: <span className="text-amber-400 uppercase font-semibold">{currentChannel.activityLevel}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[360px] max-h-[500px]">
        {filteredTransmissions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
            <Radio className="w-10 h-10 mb-2 opacity-30 text-amber-500" />
            <p className="text-sm font-medium text-neutral-400">Channel is quiet</p>
            <p className="text-xs text-neutral-500 max-w-xs mt-1">
              Key your mic and call out "Break 19 for a radio check", or wait for truckers passing through to transmit.
            </p>
          </div>
        ) : (
          filteredTransmissions.map((tx) => {
            const isActive = activeTransmissionId === tx.id;
            return (
              <div
                key={tx.id}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                    : tx.isUser
                    ? 'bg-neutral-950/80 border-amber-500/30'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Transmission Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-amber-400">
                      {tx.isUser ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <User className="w-3.5 h-3.5" />
                          <span>YOU ({tx.handle})</span>
                        </span>
                      ) : (
                        <span>"{tx.handle}"</span>
                      )}
                    </span>

                    {tx.rig && (
                      <span className="hidden sm:inline-block text-[11px] text-neutral-400">
                        · {tx.rig}
                      </span>
                    )}

                    {tx.location && (
                      <span className="text-[11px] text-neutral-400 font-mono">
                        · {tx.location}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-neutral-400 font-semibold bg-neutral-800 px-1.5 py-0.5 rounded">
                      CH {tx.channel}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      S{tx.signalStrength}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs md:text-sm text-neutral-200 leading-relaxed font-sans pl-1">
                  "{tx.text}"
                </p>

                {/* Footer Controls */}
                <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryBadge(tx.category)}
                    <span className="text-[10px] font-mono text-neutral-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!tx.isUser && (
                      <button
                        onClick={() => onQuickRespond(tx.handle, tx.channel)}
                        className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        Respond
                      </button>
                    )}
                    <button
                      onClick={() => onReplayAudio(tx)}
                      className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded transition-colors cursor-pointer"
                      title="Replay CB audio transmission"
                    >
                      <Volume2 className="w-3 h-3 text-amber-500" />
                      <span>Replay</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
