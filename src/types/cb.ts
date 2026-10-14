/**
 * Data structures and types for CB Radio Transceiver Simulator
 */

export interface CBChannel {
  channel: number;
  frequency: number; // MHz
  name: string;
  description: string;
  category: 'highway' | 'emergency' | 'dx-skip' | 'calling' | 'local' | 'general';
  activityLevel: 'high' | 'medium' | 'low';
}

export interface TruckerPersona {
  id: string;
  handle: string;
  rig: string; // e.g. "1984 Peterbilt 379", "Kenworth W900"
  homeBase: string; // e.g. "Amarillo, TX"
  mileMarker: number;
  highway: string; // e.g. "I-80 Westbound"
  signalStrength: number; // 1 to 9 (+10 to +30)
  voicePitch: number; // for Web Speech API
  voiceRate: number;
  avatarSeed: string;
  personality: string;
}

export interface Transmission {
  id: string;
  timestamp: Date;
  channel: number;
  handle: string;
  rig?: string;
  location?: string;
  text: string;
  signalStrength: number; // S-meter reading (1 - 9, +10, +20, +30)
  isUser: boolean;
  audioDurationSec?: number;
  category?: 'chatter' | 'smokey' | 'hazard' | 'weigh-station' | 'radio-check' | 'emergency' | 'highway';
}

export interface RadioState {
  power: boolean;
  volume: number; // 0 to 100
  squelch: number; // 0 to 100 (threshold)
  rfGain: number; // 0 to 100
  micGain: number; // 0 to 100
  clarifier: number; // -50 to +50 (fine tune)
  channel: number; // 1 to 40
  mode: 'CB' | 'PA';
  noiseBlanker: boolean; // NB/ANL
  rogerBeep: boolean;
  meterMode: 'S/RF' | 'CAL' | 'SWR';
  quickChannel: '9' | '19' | 'norm';
  displayDim: boolean;
  echoEnabled: boolean;
  echoDelay: number; // ms
  echoFeedback: number; // 0 to 100
  isScanning: boolean;
  isTransmitting: boolean;
  userHandle: string;
}

export interface TenCode {
  code: string;
  meaning: string;
  example: string;
  category: 'common' | 'status' | 'emergency' | 'technical';
}

export interface CBSlang {
  term: string;
  meaning: string;
  context: string;
}

export interface HighwayPoint {
  id: string;
  name: string;
  mileMarker: number;
  type: 'truck-stop' | 'weigh-station' | 'smokey-trap' | 'rest-area' | 'hazard';
  status: string;
  highway: string;
}
