import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CBRadioUnit } from './components/CBRadioUnit';
import { HandheldMic } from './components/HandheldMic';
import { HighwayChatterFeed } from './components/HighwayChatterFeed';
import { InterstateMap } from './components/InterstateMap';
import { LingoSoundboard } from './components/LingoSoundboard';
import { AudioRackModal } from './components/AudioRackModal';
import { CB_CHANNELS } from './data/channels';
import { INITIAL_TRANSMISSIONS, CHANNEL_SIMULATED_CHATS, TRUCKER_PERSONAS } from './data/truckers';
import { RadioState, Transmission } from './types/cb';
import { cbAudio } from './utils/audioEngine';
import { generateTruckerResponse, playCBTransmissionSpeech } from './utils/cbSimulation';
import { Radio, Compass, BookOpen, Sliders, Volume2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [radioState, setRadioState] = useState<RadioState>({
    power: true,
    volume: 75,
    squelch: 30, // threshold: 30 closes static, below 25 opens static
    rfGain: 85,
    micGain: 80,
    clarifier: 0,
    channel: 19, // Highway Channel default
    mode: 'CB',
    noiseBlanker: true,
    rogerBeep: true,
    meterMode: 'S/RF',
    quickChannel: '19',
    displayDim: false,
    echoEnabled: false,
    echoDelay: 160,
    echoFeedback: 35,
    isScanning: false,
    isTransmitting: false,
    userHandle: 'Silver Streak',
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'radar' | 'lingo'>('feed');
  const [transmissions, setTransmissions] = useState<Transmission[]>(INITIAL_TRANSMISSIONS);
  const [isReceivingSignal, setIsReceivingSignal] = useState(false);
  const [currentSignalStrength, setCurrentSignalStrength] = useState(0);
  const [audioMeterLevel, setAudioMeterLevel] = useState(0);
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [isAudioRackOpen, setIsAudioRackOpen] = useState(false);

  const activeChannel = CB_CHANNELS.find((c) => c.channel === radioState.channel) || CB_CHANNELS[18];

  // Ref to access current state inside callbacks
  const stateRef = useRef(radioState);
  stateRef.current = radioState;

  // Real-time audio engine update loop
  useEffect(() => {
    cbAudio.updateLevels({
      power: radioState.power,
      volume: radioState.volume,
      squelch: radioState.squelch,
      rfGain: radioState.rfGain,
      noiseBlanker: radioState.noiseBlanker,
      isReceivingSignal: isReceivingSignal,
      isTransmitting: radioState.isTransmitting,
      echoEnabled: radioState.echoEnabled,
      echoDelay: radioState.echoDelay,
      echoFeedback: radioState.echoFeedback,
    });
  }, [
    radioState.power,
    radioState.volume,
    radioState.squelch,
    radioState.rfGain,
    radioState.noiseBlanker,
    isReceivingSignal,
    radioState.isTransmitting,
    radioState.echoEnabled,
    radioState.echoDelay,
    radioState.echoFeedback,
  ]);

  // Audio level polling for analog meter needle bounce
  useEffect(() => {
    let animId: number;
    const poll = () => {
      if (stateRef.current.power) {
        const level = cbAudio.getAudioLevel();
        setAudioMeterLevel(level);
      } else {
        setAudioMeterLevel(0);
      }
      animId = requestAnimationFrame(poll);
    };
    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, []);

  const updateRadioState = useCallback(<K extends keyof RadioState>(key: K, value: RadioState[K]) => {
    setRadioState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle PTT key down (Transmit start)
  const handlePTTDown = useCallback(async () => {
    if (!stateRef.current.power || stateRef.current.isTransmitting) return;

    cbAudio.init();
    cbAudio.playMicKeyDown();
    updateRadioState('isTransmitting', true);
    setIsReceivingSignal(false);
    setCurrentSignalStrength(95); // full RF power out

    // Capture microphone
    await cbAudio.startMicrophoneCapture(stateRef.current.micGain);
  }, [updateRadioState]);

  // Handle PTT key up (Transmit end)
  const handlePTTUp = useCallback(() => {
    if (!stateRef.current.isTransmitting) return;

    cbAudio.stopMicrophoneCapture();
    cbAudio.playMicKeyUp(stateRef.current.rogerBeep);
    updateRadioState('isTransmitting', false);
    setCurrentSignalStrength(0);
  }, [updateRadioState]);

  // Quick text or phrase transmit
  const handleTransmitText = useCallback((text: string) => {
    if (!stateRef.current.power || !text.trim()) return;

    cbAudio.init();
    cbAudio.playMicKeyDown();
    updateRadioState('isTransmitting', true);
    setCurrentSignalStrength(90);

    const newTx: Transmission = {
      id: `user-${Date.now()}`,
      timestamp: new Date(),
      channel: stateRef.current.channel,
      handle: stateRef.current.userHandle,
      rig: 'My Mobile Rig',
      location: 'Interstate 80',
      text: text.trim(),
      signalStrength: 9,
      isUser: true,
      category: 'chatter',
    };

    setTransmissions((prev) => [newTx, ...prev]);

    // End user transmission after 2 seconds
    setTimeout(() => {
      cbAudio.playMicKeyUp(stateRef.current.rogerBeep);
      updateRadioState('isTransmitting', false);
      setCurrentSignalStrength(0);

      // Generate realistic trucker reply
      setTimeout(() => {
        if (!stateRef.current.power) return;
        const response = generateTruckerResponse(
          text,
          stateRef.current.userHandle,
          stateRef.current.channel
        );

        const replyTx: Transmission = {
          id: `reply-${Date.now()}`,
          timestamp: new Date(),
          channel: stateRef.current.channel,
          handle: response.handle,
          rig: response.rig,
          location: response.location,
          text: response.text,
          signalStrength: response.signal,
          isUser: false,
          category: response.category,
        };

        setTransmissions((prev) => [replyTx, ...prev]);
        setActiveTxId(replyTx.id);

        playCBTransmissionSpeech(
          response.text,
          response.persona,
          stateRef.current.rogerBeep,
          () => {
            setIsReceivingSignal(true);
            setCurrentSignalStrength(response.signal * 10);
          },
          () => {
            setIsReceivingSignal(false);
            setCurrentSignalStrength(0);
            setActiveTxId(null);
          }
        );
      }, 1800);
    }, 2000);
  }, [updateRadioState]);

  // Spacebar keyboard listener for PTT
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        handlePTTDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        handlePTTUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePTTDown, handlePTTUp]);

  // Replay audio transmission
  const handleReplayAudio = useCallback((tx: Transmission) => {
    cbAudio.init();
    setActiveTxId(tx.id);
    const persona = TRUCKER_PERSONAS.find((p) => p.handle === tx.handle) || null;

    playCBTransmissionSpeech(
      tx.text,
      persona,
      stateRef.current.rogerBeep,
      () => {
        setIsReceivingSignal(true);
        setCurrentSignalStrength(tx.signalStrength * 10);
      },
      () => {
        setIsReceivingSignal(false);
        setCurrentSignalStrength(0);
        setActiveTxId(null);
      }
    );
  }, []);

  // Channel Scanner loop
  useEffect(() => {
    if (!radioState.isScanning || !radioState.power) return;

    const interval = setInterval(() => {
      setRadioState((prev) => {
        const nextCh = prev.channel >= 40 ? 1 : prev.channel + 1;
        cbAudio.playKnobClick();

        // Check if high-activity channel
        if (nextCh === 19 || nextCh === 9 || nextCh === 6) {
          // Pause momentarily on active traffic
          setCurrentSignalStrength(75);
        } else {
          setCurrentSignalStrength(0);
        }

        return { ...prev, channel: nextCh };
      });
    }, 850);

    return () => clearInterval(interval);
  }, [radioState.isScanning, radioState.power]);

  // Periodic organic highway chatter background generator
  useEffect(() => {
    if (!radioState.power) return;

    const interval = setInterval(() => {
      if (stateRef.current.isTransmitting || stateRef.current.isScanning) return;

      const ch = stateRef.current.channel;
      const chatterList = CHANNEL_SIMULATED_CHATS[ch];
      if (!chatterList || chatterList.length === 0) return;

      const randomItem = chatterList[Math.floor(Math.random() * chatterList.length)];
      const newTx: Transmission = {
        id: `auto-${Date.now()}`,
        timestamp: new Date(),
        channel: ch,
        handle: randomItem.handle,
        rig: randomItem.rig,
        location: `MM ${Math.floor(100 + Math.random() * 120)} I-80`,
        text: randomItem.text,
        signalStrength: randomItem.signal,
        isUser: false,
        category: randomItem.category,
      };

      setTransmissions((prev) => [newTx, ...prev]);
      setActiveTxId(newTx.id);

      const persona = TRUCKER_PERSONAS.find((p) => p.handle === randomItem.handle) || null;
      playCBTransmissionSpeech(
        randomItem.text,
        persona,
        stateRef.current.rogerBeep,
        () => {
          setIsReceivingSignal(true);
          setCurrentSignalStrength(randomItem.signal * 10);
        },
        () => {
          setIsReceivingSignal(false);
          setCurrentSignalStrength(0);
          setActiveTxId(null);
        }
      );
    }, 28000); // every 28 seconds

    return () => clearInterval(interval);
  }, [radioState.power]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar (3-Zone Contract: Brand — 4 Navigation Links — 1 Primary Action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur sticky top-0 z-40">
        {/* Zone 1: Brand title, single line text wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <Radio className="w-5 h-5 text-amber-500" />
          <span className="text-base md:text-lg font-black tracking-tight text-neutral-100 uppercase font-mono">
            Highway 19 Transceiver
          </span>
        </div>

        {/* Zone 2: 4 single-line navigation tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('feed')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'feed' ? 'text-amber-400 font-bold' : 'hover:text-neutral-200'
            }`}
          >
            Interstate Traffic Log
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'radar' ? 'text-amber-400 font-bold' : 'hover:text-neutral-200'
            }`}
          >
            Highway Radar Map
          </button>
          <button
            onClick={() => setActiveTab('lingo')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'lingo' ? 'text-amber-400 font-bold' : 'hover:text-neutral-200'
            }`}
          >
            10-Codes & Slang
          </button>
          <button
            onClick={() => updateRadioState('channel', 19)}
            className="hover:text-neutral-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer font-mono"
          >
            Channel 19 Highway
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAudioRackOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Audio Rack Mods</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Cab Windshield View Hero Banner with Mounted CB Radio */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950">
          {/* Background Truck Windshield Twilight Highway Image */}
          <div className="relative w-full h-[220px] md:h-[280px] overflow-hidden">
            <img
              src="/src/assets/images/highway_cab_view_1791938096647.jpg"
              alt="Highway view from truck cabin at dusk"
              className="w-full h-full object-cover object-top opacity-55 saturate-125"
              referrerPolicy="no-referrer"
            />
            {/* Scrim gradient to blend with the mounted console */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

            {/* Cab Dashboard Overhead Status Bar */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-xs text-neutral-300 font-mono">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-neutral-700/80">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>WESTBOUND INTERSTATE 80 · MM 142</span>
              </div>

              <div className="flex items-center gap-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-neutral-700/80">
                <span>ELEVATION: 4,280 FT</span>
                <span>·</span>
                <span className="text-amber-400">SPEED: 62 MPH</span>
              </div>
            </div>
          </div>

          {/* The CB Radio Transceiver Console (Positioned seamlessly onto the dash) */}
          <div className="relative -mt-20 md:-mt-24 px-3 md:px-8 pb-6 z-20">
            <CBRadioUnit
              state={radioState}
              channels={CB_CHANNELS}
              activeChannel={activeChannel}
              signalStrength={currentSignalStrength}
              audioLevel={audioMeterLevel}
              onUpdateState={updateRadioState}
              onTogglePower={() => {
                cbAudio.init();
                cbAudio.playSwitchToggle();
                updateRadioState('power', !radioState.power);
              }}
              onToggleScan={() => {
                cbAudio.playSwitchToggle();
                updateRadioState('isScanning', !radioState.isScanning);
              }}
            />
          </div>
        </div>

        {/* Handheld Microphone & PTT Station */}
        <HandheldMic
          power={radioState.power}
          isTransmitting={radioState.isTransmitting}
          onPTTDown={handlePTTDown}
          onPTTUp={handlePTTUp}
          micGain={radioState.micGain}
          userHandle={radioState.userHandle}
          onQuickTransmitText={handleTransmitText}
        />

        {/* Secondary Navigation Section (Interstate Traffic Feed, Radar Map, 10-Codes) */}
        <div className="space-y-4">
          {/* Mobile and desktop secondary tab bar */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'feed'
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Interstate Traffic Log</span>
              </button>
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'radar'
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Highway Radar Map</span>
              </button>
              <button
                onClick={() => setActiveTab('lingo')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'lingo'
                    ? 'bg-amber-500 text-neutral-950 shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>10-Codes & Slang</span>
              </button>
            </div>

            <span className="text-xs font-mono text-neutral-500 hidden sm:inline-block">
              FCC CB 26.965 – 27.405 MHz
            </span>
          </div>

          {/* Active Tab Screen */}
          <div className="min-h-[420px]">
            {activeTab === 'feed' && (
              <HighwayChatterFeed
                transmissions={transmissions}
                currentChannel={activeChannel}
                onReplayAudio={handleReplayAudio}
                onQuickRespond={(handle, ch) => {
                  updateRadioState('channel', ch);
                  handleTransmitText(`Break ${ch} for "${handle}", you got your ears on?`);
                }}
                isReceiving={isReceivingSignal}
                activeTransmissionId={activeTxId}
              />
            )}

            {activeTab === 'radar' && (
              <InterstateMap
                currentChannel={radioState.channel}
                onSelectMileMarker={(mm, name) => {
                  handleTransmitText(`Break 19, any drivers near ${name} at mile marker ${mm}?`);
                }}
              />
            )}

            {activeTab === 'lingo' && (
              <LingoSoundboard
                disabled={!radioState.power}
                onTransmitPhrase={handleTransmitText}
              />
            )}
          </div>
        </div>
      </main>

      {/* Audio Rack Modal */}
      <AudioRackModal
        isOpen={isAudioRackOpen}
        onClose={() => setIsAudioRackOpen(false)}
        state={radioState}
        onUpdateState={updateRadioState}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-800/80 py-4 px-6 bg-neutral-950 text-neutral-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-amber-500 font-bold">HIGHWAY 19</span>
          <span>·</span>
          <span>40-Channel Transceiver Simulator</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Web Audio DSP Engine</span>
          <span>·</span>
          <span>Part 95 Compliant Simulation</span>
        </div>
      </footer>
    </div>
  );
}
