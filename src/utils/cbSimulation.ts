import { Transmission, TruckerPersona } from '../types/cb';
import { TRUCKER_PERSONAS, CHANNEL_SIMULATED_CHATS } from '../data/truckers';
import { cbAudio } from './audioEngine';

/**
 * Generates an authentic trucker response to a user's transmission
 */
export function generateTruckerResponse(
  userText: string,
  userHandle: string,
  channel: number
): { handle: string; rig: string; location: string; text: string; category: Transmission['category']; signal: number; persona: TruckerPersona } {
  const lower = userText.toLowerCase();

  // Pick a random trucker persona suited for the highway
  const persona = TRUCKER_PERSONAS[Math.floor(Math.random() * (TRUCKER_PERSONAS.length - 2))];

  let text = '';
  let category: Transmission['category'] = 'chatter';

  if (lower.includes('radio check') || lower.includes('check') || lower.includes('reading') || lower.includes('getting out')) {
    category = 'radio-check';
    const replies = [
      `Loud and clear there "${userHandle}", you're kicking a 10 over 9 on the meter here at mile ${persona.mileMarker}, soundin' loud and proud!`,
      `Got you wall-to-wall and tree-top tall "${userHandle}". Modulation is crisp, put the hammer down!`,
      `Five by nine audio on you, driver! Coming through crystal clear on channel ${channel}. Have a safe ride!`,
    ];
    text = replies[Math.floor(Math.random() * replies.length)];
  } else if (lower.includes('smokey') || lower.includes('bear') || lower.includes('cop') || lower.includes('police') || lower.includes('radar')) {
    category = 'smokey';
    const replies = [
      `Watch your speed "${userHandle}", got Kojak with a Kodak tucked behind the bridge pillar at mile marker 148 median!`,
      `Bear in the air was working eastbound about twenty minutes ago, keep her at the double nickel till the county line.`,
      `Clean shot behind me driver, no county mounties spotted for the last 30 miles. Hammer down!`,
    ];
    text = replies[Math.floor(Math.random() * replies.length)];
  } else if (lower.includes('20') || lower.includes('location') || lower.includes('where are you')) {
    category = 'chatter';
    text = `You got ${persona.handle} here, rolling past mile marker ${persona.mileMarker} on ${persona.highway}. What's your twenty, "${userHandle}"?`;
  } else if (lower.includes('chicken coop') || lower.includes('scale') || lower.includes('weigh')) {
    category = 'weigh-station';
    const replies = [
      `Chicken coop at the state line is open and doing random level-two inspections, driver. Have your logs tidy.`,
      `Scales are rolling green on pre-pass right now, had no trouble getting through five minutes ago.`,
      `Scale house is bypassed right now "${userHandle}", lanes are wide open!`,
    ];
    text = replies[Math.floor(Math.random() * replies.length)];
  } else if (lower.includes('weather') || lower.includes('fog') || lower.includes('rain') || lower.includes('hazard') || lower.includes('gator') || lower.includes('alligator')) {
    category = 'hazard';
    const replies = [
      `Watch out for a big alligator tire carcass in the center lane at mile 156, almost took out my mudflap!`,
      `Getting heavy crosswinds and light fog near the summit pass, ease back a couple notches on the throttle.`,
      `Road is dry and skies are clear out this way, clear sailing!`,
    ];
    text = replies[Math.floor(Math.random() * replies.length)];
  } else if (lower.includes('10-4') || lower.includes('copy') || lower.includes('thanks') || lower.includes('preciate')) {
    category = 'chatter';
    const replies = [
      `10-4 good buddy "${userHandle}", preciate that! We'll catch you on the flip-flop!`,
      `You got it driver. Keep the shiny side up and the rubber on the asphalt!`,
      `10-10 on the side, have a safe run tonight!`,
    ];
    text = replies[Math.floor(Math.random() * replies.length)];
  } else {
    // General conversational trucker reply
    const replies = [
      `10-4 "${userHandle}", hearing you good on channel ${channel}. You stay safe out on that ribbon of asphalt!`,
      `Roger that driver, you take care out there, got your ears on if you need anything down the road.`,
      `Copy that "${userHandle}". Just pulled out of the Flying J myself with a hot cup of mud. Catch you on the flip-flop!`,
    ];
    text = replies[Math.floor(Math.random() * replies.length)];
  }

  return {
    handle: persona.handle,
    rig: persona.rig,
    location: `MM ${persona.mileMarker} ${persona.highway}`,
    text,
    category,
    signal: persona.signalStrength,
    persona,
  };
}

/**
 * Play synthesized trucker transmission using Web Speech API + CB Radio sound effects
 */
export function playCBTransmissionSpeech(
  text: string,
  persona: TruckerPersona | null,
  rogerBeep: boolean,
  onStart: () => void,
  onEnd: () => void
) {
  if (!('speechSynthesis' in window)) {
    onStart();
    setTimeout(() => {
      onEnd();
    }, 2500);
    return;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  // Play opening mic key click
  cbAudio.playMicKeyDown();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = persona?.voiceRate ?? 1.0;
  utterance.pitch = persona?.voicePitch ?? 1.0;

  // Try to find an English voice
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Google') && !v.name.includes('Natural')) || voices[0];
  if (enVoice) {
    utterance.voice = enVoice;
  }

  utterance.onstart = () => {
    onStart();
  };

  utterance.onend = () => {
    // Play closing mic key up + squelch tail burst + roger beep
    cbAudio.playMicKeyUp(rogerBeep);
    onEnd();
  };

  utterance.onerror = () => {
    cbAudio.playMicKeyUp(rogerBeep);
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
}
