import React, { useState } from 'react';
import { TEN_CODES, CB_SLANG_DICTIONARY } from '../data/cbLingo';
import { BookOpen, Radio, Search, Volume2, Send } from 'lucide-react';

interface LingoSoundboardProps {
  onTransmitPhrase: (phrase: string) => void;
  disabled: boolean;
}

export const LingoSoundboard: React.FC<LingoSoundboardProps> = ({
  onTransmitPhrase,
  disabled,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'codes' | 'slang'>('quick');
  const [searchQuery, setSearchQuery] = useState('');

  const quickPhrases = [
    { title: 'Radio Check', phrase: 'Break one-nine for a radio check, how am I getting out there drivers?', category: 'check' },
    { title: 'Smokey Report', phrase: 'Heads up eastbound, Smokey Bear parked in the center median with radar on.', category: 'smokey' },
    { title: 'What is your 20?', phrase: 'What is your twenty eastbound on the interstate, good buddy?', category: 'location' },
    { title: 'Chicken Coop Open', phrase: 'Heads up drivers, chicken coop scale house is open and pulling trucks in.', category: 'weigh' },
    { title: '10-4 Loud & Proud', phrase: '10-4 good buddy, hearing you wall to wall and tree top tall!', category: 'roger' },
    { title: 'Alligator Warning', phrase: 'Big alligator tire tread in the granny lane, watch your drive tires!', category: 'hazard' },
    { title: 'Hammer Down', phrase: 'Clean shot all the way to the state line drivers, put the hammer down!', category: 'speed' },
    { title: '10-33 Emergency', phrase: '10-33 Emergency traffic! Rollover accident on the shoulder, clear the channel!', category: 'emergency' },
  ];

  const filteredCodes = TEN_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSlang = CB_SLANG_DICTIONARY.filter(
    (s) =>
      s.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
      {/* Tab Navigation */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Quick Dispatch
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'codes'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            10-Codes ({TEN_CODES.length})
          </button>
          <button
            onClick={() => setActiveTab('slang')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'slang'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            CB Slang ({CB_SLANG_DICTIONARY.length})
          </button>
        </div>

        {activeTab !== 'quick' && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 w-36 md:w-48"
            />
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
        {activeTab === 'quick' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickPhrases.map((item, idx) => (
              <button
                key={idx}
                disabled={disabled}
                onClick={() => onTransmitPhrase(item.phrase)}
                className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-amber-500/60 hover:bg-amber-500/10 text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    {item.title}
                  </span>
                  <Send className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-xs text-neutral-300 leading-snug font-mono line-clamp-2">
                  "{item.phrase}"
                </p>
                <div className="mt-2 text-[10px] text-neutral-400 font-sans">
                  Click to key mic & transmit
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="space-y-2.5">
            {filteredCodes.map((code, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-850 px-2 py-0.5 rounded border border-neutral-700">
                      {code.code}
                    </span>
                    <span className="text-xs font-semibold text-neutral-200">
                      {code.meaning}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 italic mt-1 font-mono">
                    "{code.example}"
                  </p>
                </div>

                <button
                  disabled={disabled}
                  onClick={() => onTransmitPhrase(code.example)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                  title="Broadcast this code"
                >
                  Broadcast
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'slang' && (
          <div className="space-y-2.5">
            {filteredSlang.map((slang, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">
                      {slang.term}
                    </span>
                    <span className="text-xs text-neutral-300">
                      — {slang.meaning}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 italic mt-1 font-mono">
                    "{slang.context}"
                  </p>
                </div>

                <button
                  disabled={disabled}
                  onClick={() => onTransmitPhrase(slang.context)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                  title="Broadcast phrase using this slang"
                >
                  Broadcast
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
