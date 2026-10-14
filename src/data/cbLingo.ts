import { CBSlang, TenCode } from '../types/cb';

export const TEN_CODES: TenCode[] = [
  { code: '10-4', meaning: 'Affirmative / Message received / OK', example: '10-4 good buddy, preciate that info!', category: 'common' },
  { code: '10-9', meaning: 'Repeat transmission / Say again', example: '10-9 on that last transmission, you broke up.', category: 'common' },
  { code: '10-10', meaning: 'Transmission completed / Standing by', example: 'This is Rubber Duck, 10-10 on the side.', category: 'status' },
  { code: '10-13', meaning: 'Advise road and weather conditions', example: 'Break 19, who can give me a 10-13 through Donner Pass?', category: 'status' },
  { code: '10-20', meaning: 'Location ("What is your 20?")', example: 'What is your 20 eastbound on I-80?', category: 'common' },
  { code: '10-23', meaning: 'Stand by / Arrived on scene', example: '10-23 at the Flying J fuel island.', category: 'status' },
  { code: '10-27', meaning: 'Moving to another channel', example: 'Take it up to 2-1 good buddy, 10-27.', category: 'technical' },
  { code: '10-33', meaning: 'EMERGENCY / Distress traffic', example: '10-33 emergency, rollover wreck at mile marker 84!', category: 'emergency' },
  { code: '10-36', meaning: 'Correct time check', example: 'Got a 10-36 out of Central dispatch?', category: 'status' },
  { code: '10-42', meaning: 'Traffic accident reported', example: '10-42 on the westbound shoulder, lanes blocked.', category: 'emergency' },
  { code: '10-77', meaning: 'Estimated Time of Arrival (ETA)', example: 'My 10-77 for the Chicago rail yard is 0600.', category: 'status' },
  { code: '10-100', meaning: 'Restroom / comfort break', example: 'Pulling in for a quick 10-100 and a hot cup of mud.', category: 'common' },
  { code: '10-200', meaning: 'Police / Highway patrol needed', example: 'Need a 10-200 at the rest area eastbound.', category: 'emergency' },
];

export const CB_SLANG_DICTIONARY: CBSlang[] = [
  { term: 'Smokey Bear', meaning: 'State Highway Patrol trooper (named after the ranger hat)', context: 'Watch your speed, got a Smokey Bear in the median at MM 114.' },
  { term: 'Bear in the Air', meaning: 'State police airplane or helicopter using radar/VASP', context: 'Keep it down around 65, they got a bear in the air clocking speeders.' },
  { term: 'Chicken Coop', meaning: 'DOT weigh station / scale house', context: 'The chicken coop at the state line is open and inspecting.' },
  { term: 'Alligator', meaning: 'Shredded retread tire carcass lying in the roadway', context: 'Large alligator in the center lane westbound, mile 204!' },
  { term: 'Four-Wheeler', meaning: 'Standard passenger car or pickup truck (not an 18-wheeler)', context: 'Four-wheeler riding blind spots and cutting folks off.' },
  { term: 'Hammer Down', meaning: 'Full throttle / pedal to the metal / driving fast', context: 'All clear all the way to Joplin, put the hammer down!' },
  { term: 'Ears On', meaning: 'CB radio is turned on and being monitored', context: 'Any drivers eastbound got your ears on tonight?' },
  { term: 'Seat Cover', meaning: 'Attractive passenger or driver in an adjacent vehicle', context: 'Check that blue convertible at your side door, nice seat cover.' },
  { term: 'Kojak with a Kodak', meaning: 'Police officer sitting in stationary patrol using radar gun', context: 'Under the overpass at mile 16, Kojak with a Kodak!' },
  { term: 'Good Buddy', meaning: 'Fellow trucker / road companion / friend', context: 'Preciate that radio check good buddy, have a safe haul.' },
  { term: 'Flip-Flop', meaning: 'The return trip / on the way back', context: 'I will catch you on the flip-flop next Tuesday, driver.' },
  { term: 'Radio Check', meaning: 'Requesting report on signal quality and modulation', context: 'Break one-nine for a radio check, how am I getting out?' },
  { term: 'Double Nickel', meaning: '55 Miles Per Hour (the old national speed limit)', context: 'Keep it at the double nickel through the construction zone.' },
  { term: 'Granny Lane', meaning: 'The far right slow travel lane on a multi-lane highway', context: 'Heavy loads stay in the granny lane going up the grade.' },
  { term: 'Hundred Mile Coffee', meaning: 'Extra strong black truck stop coffee', context: 'Need two cups of hundred-mile coffee to push through Nebraska.' },
  { term: 'Motion Lotion', meaning: 'Diesel fuel', context: 'Stopping at the Petro for some cheap motion lotion.' },
  { term: 'Yard Dog', meaning: 'Terminal hostler tractor moving trailers in the freight yard', context: 'Yard dog is backed up three trailers deep at dock 12.' },
  { term: 'Feeding the Bears', meaning: 'Paying a speeding ticket fine', context: 'Nobody likes feeding the bears, back it off a few notches.' },
];
