// Gymnastics Skills Database
// Restructured with compatible categories that avoid impossible combinations

export const config = {
  id: 'gymnastics',
  name: 'Gymnastics',
  shortName: 'GymDoku',
  emoji: '🤸',
};

// Skills database - organized by apparatus
const SKILLS = [
  // =====================
  // FLOOR EXERCISE
  // =====================
  
  // Basic skills
  { id: 'handstand', name: 'Handstand', apparatus: 'floor', type: 'acrobatic', group: 'static' },
  { id: 'forward-roll', name: 'Forward Roll', apparatus: 'floor', type: 'acrobatic', group: 'tumbling', direction: 'forward' },
  { id: 'backward-roll', name: 'Backward Roll', apparatus: 'floor', type: 'acrobatic', group: 'tumbling', direction: 'backward' },
  { id: 'cartwheel', name: 'Cartwheel', apparatus: 'floor', type: 'acrobatic', group: 'tumbling' },
  { id: 'roundoff', name: 'Roundoff', apparatus: 'floor', type: 'acrobatic', group: 'tumbling' },
  { id: 'bridge', name: 'Bridge', apparatus: 'floor', type: 'acrobatic', group: 'flexibility' },
  { id: 'splits', name: 'Splits', apparatus: 'floor', type: 'dance', group: 'flexibility' },
  
  // Handsprings
  { id: 'front-handspring', name: 'Front Handspring', apparatus: 'floor', type: 'acrobatic', group: 'tumbling', direction: 'forward' },
  { id: 'back-handspring', name: 'Back Handspring', apparatus: 'floor', type: 'acrobatic', group: 'tumbling', direction: 'backward' },
  
  // Walkovers
  { id: 'front-walkover', name: 'Front Walkover', apparatus: 'floor', type: 'acrobatic', group: 'walkover', direction: 'forward' },
  { id: 'back-walkover', name: 'Back Walkover', apparatus: 'floor', type: 'acrobatic', group: 'walkover', direction: 'backward' },
  
  // Aerials
  { id: 'front-aerial', name: 'Front Aerial', apparatus: 'floor', type: 'acrobatic', group: 'aerial', direction: 'forward' },
  { id: 'side-aerial', name: 'Side Aerial', apparatus: 'floor', type: 'acrobatic', group: 'aerial' },
  
  // Forward saltos
  { id: 'front-tuck', name: 'Front Tuck', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'tucked' },
  { id: 'front-pike', name: 'Front Pike', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'piked' },
  { id: 'front-layout', name: 'Front Layout', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'layout' },
  { id: 'front-full', name: 'Front Full', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'layout', twist: true },
  { id: 'double-front-tuck', name: 'Double Front Tuck', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'tucked', multiflip: true },
  { id: 'double-front-pike', name: 'Double Front Pike', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'piked', multiflip: true },
  
  // Backward saltos
  { id: 'back-tuck', name: 'Back Tuck', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'tucked' },
  { id: 'back-pike', name: 'Back Pike', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'piked' },
  { id: 'back-layout', name: 'Back Layout', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout' },
  { id: 'whip-back', name: 'Whip Back', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout' },
  { id: 'back-full', name: 'Full Twist', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'back-1-5', name: '1.5 Twist', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'double-full', name: 'Double Full', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'triple-full', name: 'Triple Full', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'double-back-tuck', name: 'Double Back Tuck', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'tucked', multiflip: true },
  { id: 'double-back-pike', name: 'Double Back Pike', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'piked', multiflip: true },
  { id: 'double-back-layout', name: 'Double Back Layout', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout', multiflip: true },
  { id: 'full-in', name: 'Full-In Back Out', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'tucked', multiflip: true, twist: true },
  { id: 'double-double', name: 'Double Double', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'tucked', multiflip: true, twist: true, namedSkill: true },
  { id: 'triple-double', name: 'Triple Double (Biles II)', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'tucked', multiflip: true, twist: true, namedSkill: true },
  
  // Arabian (half turn into forward flip)
  { id: 'arabian', name: 'Arabian', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'tucked', twist: true },
  { id: 'arabian-double', name: 'Arabian Double Front', apparatus: 'floor', type: 'acrobatic', group: 'salto', direction: 'forward', position: 'piked', multiflip: true, twist: true },
  
  // Dance - Leaps
  { id: 'split-leap', name: 'Split Leap', apparatus: 'floor', type: 'dance', group: 'leap' },
  { id: 'switch-leap', name: 'Switch Leap', apparatus: 'floor', type: 'dance', group: 'leap' },
  { id: 'switch-half', name: 'Switch Half', apparatus: 'floor', type: 'dance', group: 'leap', twist: true },
  { id: 'switch-ring', name: 'Switch Ring', apparatus: 'floor', type: 'dance', group: 'leap' },
  { id: 'ring-leap', name: 'Ring Leap', apparatus: 'floor', type: 'dance', group: 'leap' },
  { id: 'tour-jete', name: 'Tour Jeté', apparatus: 'floor', type: 'dance', group: 'leap', twist: true },
  { id: 'sissone', name: 'Sissone', apparatus: 'floor', type: 'dance', group: 'leap' },
  { id: 'straddle-jump', name: 'Straddle Jump', apparatus: 'floor', type: 'dance', group: 'jump' },
  { id: 'pike-jump', name: 'Pike Jump', apparatus: 'floor', type: 'dance', group: 'jump' },
  { id: 'tuck-jump', name: 'Tuck Jump', apparatus: 'floor', type: 'dance', group: 'jump' },
  { id: 'sheep-jump', name: 'Sheep Jump', apparatus: 'floor', type: 'dance', group: 'jump' },
  { id: 'popa', name: 'Popa', apparatus: 'floor', type: 'dance', group: 'leap', namedSkill: true },
  
  // Dance - Turns
  { id: 'full-turn', name: 'Full Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },
  { id: 'double-turn', name: 'Double Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },
  { id: 'triple-turn', name: 'Triple Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },
  { id: 'wolf-turn', name: 'Wolf Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },
  { id: 'double-wolf', name: 'Double Wolf Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },
  { id: 'l-turn', name: 'L Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },
  { id: 'y-turn', name: 'Y Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },
  { id: 'illusion-turn', name: 'Illusion Turn', apparatus: 'floor', type: 'dance', group: 'turn', twist: true },

  // =====================
  // BALANCE BEAM
  // =====================
  
  // Basic/Mounts
  { id: 'beam-handstand', name: 'Handstand (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'static' },
  { id: 'beam-cartwheel', name: 'Cartwheel (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'tumbling' },
  { id: 'beam-bhs', name: 'Back Handspring (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'tumbling', direction: 'backward' },
  
  // Walkovers on beam
  { id: 'beam-front-walkover', name: 'Front Walkover (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'walkover', direction: 'forward' },
  { id: 'beam-back-walkover', name: 'Back Walkover (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'walkover', direction: 'backward' },
  
  // Aerials on beam
  { id: 'beam-front-aerial', name: 'Front Aerial (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'aerial', direction: 'forward' },
  { id: 'beam-side-aerial', name: 'Side Aerial (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'aerial' },
  
  // Saltos on beam
  { id: 'beam-back-tuck', name: 'Back Tuck (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'tucked' },
  { id: 'beam-back-layout', name: 'Back Layout (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout' },
  { id: 'beam-back-full', name: 'Standing Full (Beam)', apparatus: 'beam', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'onodi', name: 'Onodi', apparatus: 'beam', type: 'acrobatic', group: 'salto', direction: 'backward', twist: true, namedSkill: true },
  { id: 'gainer-back', name: 'Gainer Back Tuck', apparatus: 'beam', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'tucked' },
  { id: 'gainer-layout', name: 'Gainer Layout', apparatus: 'beam', type: 'acrobatic', group: 'salto', direction: 'backward', position: 'layout' },
  { id: 'korbut-flip', name: 'Korbut Flip', apparatus: 'beam', type: 'acrobatic', group: 'salto', direction: 'backward', namedSkill: true },
  
  // Dance on beam
  { id: 'beam-split-leap', name: 'Split Leap (Beam)', apparatus: 'beam', type: 'dance', group: 'leap' },
  { id: 'beam-switch-leap', name: 'Switch Leap (Beam)', apparatus: 'beam', type: 'dance', group: 'leap' },
  { id: 'beam-ring-leap', name: 'Ring Leap (Beam)', apparatus: 'beam', type: 'dance', group: 'leap' },
  { id: 'beam-sheep-jump', name: 'Sheep Jump (Beam)', apparatus: 'beam', type: 'dance', group: 'jump' },
  { id: 'beam-full-turn', name: 'Full Turn (Beam)', apparatus: 'beam', type: 'dance', group: 'turn', twist: true },
  { id: 'beam-double-turn', name: 'Double Turn (Beam)', apparatus: 'beam', type: 'dance', group: 'turn', twist: true },
  { id: 'beam-wolf-turn', name: 'Wolf Turn (Beam)', apparatus: 'beam', type: 'dance', group: 'turn', twist: true },
  
  // Beam dismounts
  { id: 'beam-roundoff-dismount', name: 'Roundoff Dismount', apparatus: 'beam', type: 'dismount', group: 'salto' },
  { id: 'beam-back-tuck-dismount', name: 'Back Tuck Dismount', apparatus: 'beam', type: 'dismount', group: 'salto', direction: 'backward', position: 'tucked' },
  { id: 'beam-back-full-dismount', name: 'Full Twist Dismount', apparatus: 'beam', type: 'dismount', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'beam-double-twist-dismount', name: 'Double Twist Dismount', apparatus: 'beam', type: 'dismount', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'beam-double-back-dismount', name: 'Double Back Dismount', apparatus: 'beam', type: 'dismount', group: 'salto', direction: 'backward', position: 'tucked', multiflip: true },
  { id: 'beam-double-pike-dismount', name: 'Double Pike Dismount', apparatus: 'beam', type: 'dismount', group: 'salto', direction: 'backward', position: 'piked', multiflip: true },
  { id: 'beam-full-in-dismount', name: 'Full-In Dismount', apparatus: 'beam', type: 'dismount', group: 'salto', direction: 'backward', multiflip: true, twist: true },
  { id: 'beam-gainer-full-dismount', name: 'Gainer Full Dismount', apparatus: 'beam', type: 'dismount', group: 'salto', direction: 'backward', position: 'layout', twist: true },

  // =====================
  // UNEVEN BARS
  // =====================
  
  // Basic swings
  { id: 'kip', name: 'Kip', apparatus: 'bars', type: 'swing', group: 'swing' },
  { id: 'glide-kip', name: 'Glide Kip', apparatus: 'bars', type: 'swing', group: 'swing' },
  { id: 'cast', name: 'Cast', apparatus: 'bars', type: 'swing', group: 'swing' },
  { id: 'cast-handstand', name: 'Cast to Handstand', apparatus: 'bars', type: 'swing', group: 'swing' },
  { id: 'giant', name: 'Giant Swing', apparatus: 'bars', type: 'swing', group: 'swing' },
  { id: 'giant-full', name: 'Giant Full', apparatus: 'bars', type: 'swing', group: 'swing', twist: true },
  
  // Circles
  { id: 'clear-hip', name: 'Clear Hip Circle', apparatus: 'bars', type: 'swing', group: 'circle' },
  { id: 'clear-hip-handstand', name: 'Clear Hip to Handstand', apparatus: 'bars', type: 'swing', group: 'circle' },
  { id: 'stalder', name: 'Stalder Circle', apparatus: 'bars', type: 'swing', group: 'circle' },
  { id: 'stalder-handstand', name: 'Stalder to Handstand', apparatus: 'bars', type: 'swing', group: 'circle' },
  { id: 'toe-on', name: 'Toe-On Circle', apparatus: 'bars', type: 'swing', group: 'circle' },
  { id: 'toe-shoot', name: 'Toe Shoot', apparatus: 'bars', type: 'swing', group: 'circle' },
  
  // Pirouettes
  { id: 'pirouette', name: 'Pirouette', apparatus: 'bars', type: 'swing', group: 'pirouette', twist: true },
  { id: 'blind-change', name: 'Blind Change', apparatus: 'bars', type: 'swing', group: 'pirouette', twist: true },
  { id: 'healy', name: 'Healy', apparatus: 'bars', type: 'swing', group: 'pirouette', twist: true, namedSkill: true },
  
  // Releases
  { id: 'pak-salto', name: 'Pak Salto', apparatus: 'bars', type: 'release', group: 'release', direction: 'backward', namedSkill: true },
  { id: 'bail', name: 'Bail', apparatus: 'bars', type: 'release', group: 'release', direction: 'backward' },
  { id: 'tkachev', name: 'Tkachev', apparatus: 'bars', type: 'release', group: 'release', direction: 'backward', namedSkill: true },
  { id: 'jaeger', name: 'Jaeger', apparatus: 'bars', type: 'release', group: 'release', direction: 'forward', namedSkill: true },
  { id: 'gienger', name: 'Gienger', apparatus: 'bars', type: 'release', group: 'release', direction: 'backward', twist: true, namedSkill: true },
  { id: 'deltchev', name: 'Deltchev', apparatus: 'bars', type: 'release', group: 'release', direction: 'backward', namedSkill: true },
  { id: 'shaposhnikova', name: 'Shaposhnikova', apparatus: 'bars', type: 'release', group: 'release', direction: 'forward', namedSkill: true },
  { id: 'church', name: 'Church', apparatus: 'bars', type: 'release', group: 'release', direction: 'forward', namedSkill: true },
  { id: 'hindorff', name: 'Hindorff', apparatus: 'bars', type: 'release', group: 'release', direction: 'backward', namedSkill: true },
  { id: 'ray', name: 'Ray', apparatus: 'bars', type: 'release', group: 'release', direction: 'forward', namedSkill: true },
  { id: 'maloney', name: 'Maloney', apparatus: 'bars', type: 'release', group: 'release', direction: 'forward', namedSkill: true },
  
  // Bar dismounts
  { id: 'flyaway', name: 'Flyaway', apparatus: 'bars', type: 'dismount', group: 'salto', direction: 'backward', position: 'layout' },
  { id: 'flyaway-full', name: 'Full Twisting Flyaway', apparatus: 'bars', type: 'dismount', group: 'salto', direction: 'backward', position: 'layout', twist: true },
  { id: 'double-flyaway', name: 'Double Back Dismount', apparatus: 'bars', type: 'dismount', group: 'salto', direction: 'backward', position: 'tucked', multiflip: true },
  { id: 'double-layout-dismount', name: 'Double Layout Dismount', apparatus: 'bars', type: 'dismount', group: 'salto', direction: 'backward', position: 'layout', multiflip: true },
  { id: 'bars-full-in', name: 'Full-In Dismount', apparatus: 'bars', type: 'dismount', group: 'salto', direction: 'backward', multiflip: true, twist: true },
  { id: 'double-front-dismount', name: 'Double Front Dismount', apparatus: 'bars', type: 'dismount', group: 'salto', direction: 'forward', position: 'tucked', multiflip: true },

  // =====================
  // VAULT
  // =====================
  
  // Handspring family (forward onto table, forward off)
  { id: 'handspring-vault', name: 'Handspring Vault', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', family: 'handspring' },
  { id: 'handspring-front', name: 'Handspring Front Tuck', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'tucked', family: 'handspring' },
  { id: 'handspring-front-pike', name: 'Handspring Front Pike', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'piked', family: 'handspring' },
  { id: 'handspring-full', name: 'Handspring Full', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'layout', twist: true, family: 'handspring' },
  { id: 'handspring-1-5', name: 'Handspring 1.5', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'layout', twist: true, family: 'handspring' },
  { id: 'handspring-double-front', name: 'Handspring Double Front', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'tucked', multiflip: true, family: 'handspring' },
  { id: 'rudi', name: 'Rudi', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'layout', twist: true, family: 'handspring', namedSkill: true },
  { id: 'cheng', name: 'Cheng', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'layout', twist: true, multiflip: false, family: 'handspring', namedSkill: true },
  { id: 'produnova', name: 'Produnova', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'forward', position: 'tucked', multiflip: true, family: 'handspring', namedSkill: true },
  
  // Tsukahara family (1/4-1/2 turn on, backward salto off)
  { id: 'tsukahara', name: 'Tsukahara', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'tucked', family: 'tsukahara', namedSkill: true },
  { id: 'tsukahara-pike', name: 'Tsukahara Pike', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'piked', family: 'tsukahara' },
  { id: 'tsukahara-layout', name: 'Tsukahara Layout', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', family: 'tsukahara' },
  { id: 'tsukahara-full', name: 'Tsukahara Full', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', twist: true, family: 'tsukahara' },
  { id: 'tsukahara-1-5', name: 'Tsukahara 1.5', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', twist: true, family: 'tsukahara' },
  { id: 'tsukahara-double', name: 'Tsukahara Double', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'tucked', multiflip: true, family: 'tsukahara' },
  { id: 'kasamatsu', name: 'Kasamatsu', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', twist: true, family: 'tsukahara', namedSkill: true },
  
  // Yurchenko family (roundoff entry, backward salto off)
  { id: 'yurchenko', name: 'Yurchenko', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'tucked', family: 'yurchenko', namedSkill: true },
  { id: 'yurchenko-pike', name: 'Yurchenko Pike', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'piked', family: 'yurchenko' },
  { id: 'yurchenko-layout', name: 'Yurchenko Layout', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', family: 'yurchenko' },
  { id: 'yurchenko-half', name: 'Yurchenko Half', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', twist: true, family: 'yurchenko' },
  { id: 'yurchenko-full', name: 'Yurchenko Full', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', twist: true, family: 'yurchenko' },
  { id: 'yurchenko-1-5', name: 'Yurchenko 1.5', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', twist: true, family: 'yurchenko' },
  { id: 'yurchenko-double', name: 'Yurchenko Double', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'tucked', multiflip: true, family: 'yurchenko' },
  { id: 'amanar', name: 'Amanar', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'layout', twist: true, family: 'yurchenko', namedSkill: true },
  { id: 'biles-vault', name: 'Biles (Vault)', apparatus: 'vault', type: 'vault', group: 'vault', direction: 'backward', position: 'piked', multiflip: true, family: 'yurchenko', namedSkill: true },
];

// Build lookup maps
const skillsByName = new Map();
SKILLS.forEach(skill => {
  skillsByName.set(skill.name.toLowerCase(), skill);
  // Also add without parenthetical
  const simpleName = skill.name.replace(/\s*\([^)]*\)\s*/g, '').toLowerCase();
  if (!skillsByName.has(simpleName)) {
    skillsByName.set(simpleName, skill);
  }
});

// =====================
// CATEGORIES - Designed to avoid impossible combinations
// =====================
export const CATEGORIES = {
  // Apparatus - all have multiple skill types
  apparatus: [
    { id: 'floor', label: 'Floor', filter: (s) => s.apparatus === 'floor' },
    { id: 'beam', label: 'Beam', filter: (s) => s.apparatus === 'beam' },
    { id: 'bars', label: 'Bars', filter: (s) => s.apparatus === 'bars' },
    { id: 'vault', label: 'Vault', filter: (s) => s.apparatus === 'vault' },
  ],
  
  // Direction - works with floor tumbling AND vault
  direction: [
    { id: 'forward', label: 'Forward', filter: (s) => s.direction === 'forward' },
    { id: 'backward', label: 'Backward', filter: (s) => s.direction === 'backward' },
  ],
  
  // Body position - works with floor saltos AND vault
  position: [
    { id: 'tucked', label: 'Tucked', filter: (s) => s.position === 'tucked' },
    { id: 'piked', label: 'Piked', filter: (s) => s.position === 'piked' },
    { id: 'layout', label: 'Layout', filter: (s) => s.position === 'layout' },
  ],
  
  // Skill characteristics - cross-apparatus
  characteristics: [
    { id: 'twist', label: 'Has Twist', filter: (s) => s.twist === true },
    { id: 'multiflip', label: 'Double/Triple', filter: (s) => s.multiflip === true },
    { id: 'named', label: 'Named Skill', filter: (s) => s.namedSkill === true },
  ],
  
  // Skill type - grouped to ensure validity
  skillType: [
    { id: 'acrobatic', label: 'Acrobatic', filter: (s) => s.type === 'acrobatic' || s.type === 'vault' },
    { id: 'dance', label: 'Dance', filter: (s) => s.type === 'dance' },
    { id: 'swing', label: 'Swing', filter: (s) => s.type === 'swing' },
    { id: 'release', label: 'Release', filter: (s) => s.type === 'release' },
    { id: 'dismount', label: 'Dismount', filter: (s) => s.type === 'dismount' },
  ],
  
  // Vault families
  vaultFamily: [
    { id: 'yurchenko', label: 'Yurchenko', filter: (s) => s.family === 'yurchenko' },
    { id: 'tsukahara', label: 'Tsukahara', filter: (s) => s.family === 'tsukahara' },
    { id: 'handspring', label: 'Handspring', filter: (s) => s.family === 'handspring' },
  ],
};

// Define which category groups are INCOMPATIBLE with each other
// If cat1 is from group A and cat2 is from group B and they're incompatible, skip
const INCOMPATIBLE_PAIRS = [
  // Vault + Dance = impossible (vault has no dance elements)
  { cat1: 'vault', cat2: 'dance' },
  // Vault + Swing = impossible
  { cat1: 'vault', cat2: 'swing' },
  // Vault + Release = impossible
  { cat1: 'vault', cat2: 'release' },
  // Bars + Dance = impossible (bars have no dance elements)
  { cat1: 'bars', cat2: 'dance' },
  // Vault families only apply to vault
  { cat1: 'floor', cat2: 'yurchenko' },
  { cat1: 'floor', cat2: 'tsukahara' },
  { cat1: 'floor', cat2: 'handspring' },
  { cat1: 'beam', cat2: 'yurchenko' },
  { cat1: 'beam', cat2: 'tsukahara' },
  { cat1: 'beam', cat2: 'handspring' },
  { cat1: 'bars', cat2: 'yurchenko' },
  { cat1: 'bars', cat2: 'tsukahara' },
  { cat1: 'bars', cat2: 'handspring' },
];

// Check if two categories are incompatible
function areCategoriesIncompatible(cat1Id, cat2Id) {
  return INCOMPATIBLE_PAIRS.some(pair => 
    (pair.cat1 === cat1Id && pair.cat2 === cat2Id) ||
    (pair.cat1 === cat2Id && pair.cat2 === cat1Id)
  );
}

// Get skill by name
export async function getCardByName(name) {
  const searchName = name.toLowerCase().trim();
  
  // Direct match
  if (skillsByName.has(searchName)) {
    return skillsByName.get(searchName);
  }
  
  // Partial match
  const skill = SKILLS.find(s => 
    s.name.toLowerCase().includes(searchName) ||
    s.id.includes(searchName.replace(/\s+/g, '-'))
  );
  
  return skill || null;
}

// Check if skill matches a category
export async function cardMatchesCategory(skill, category) {
  if (!skill || !category) return false;
  if (category.filter) {
    return category.filter(skill);
  }
  return false;
}

// Check if valid skill exists for category combination
export async function checkValidCardExists(cat1, cat2) {
  // First check if these categories are incompatible
  if (areCategoriesIncompatible(cat1.id, cat2.id)) {
    return false;
  }
  
  // Then check if any skill matches both
  return SKILLS.some(skill => {
    const matches1 = cat1.filter ? cat1.filter(skill) : false;
    const matches2 = cat2.filter ? cat2.filter(skill) : false;
    return matches1 && matches2;
  });
}

// Get all skills
export function getAllCards() {
  return SKILLS;
}

// Get categories object
export function getCategories() {
  return CATEGORIES;
}

// Get all categories as flat array
export function getAllCategories() {
  return [
    ...CATEGORIES.apparatus,
    ...CATEGORIES.direction,
    ...CATEGORIES.position,
    ...CATEGORIES.characteristics,
    ...CATEGORIES.skillType,
    ...CATEGORIES.vaultFamily,
  ];
}

// Fallback categories guaranteed to work together
export function getFallbackCategories() {
  return {
    rowCategories: [
      CATEGORIES.apparatus[0],  // Floor
      CATEGORIES.apparatus[1],  // Beam  
      CATEGORIES.apparatus[3],  // Vault
    ],
    colCategories: [
      CATEGORIES.direction[0],  // Forward
      CATEGORIES.direction[1],  // Backward
      CATEGORIES.characteristics[0],  // Has Twist
    ],
  };
}

// Get skill image - placeholder
export function getCardImage(skill) {
  return null;
}

// Search for skills
export async function searchCards(query) {
  const q = query.toLowerCase().trim();
  return SKILLS.filter(s => 
    s.name.toLowerCase().includes(q) ||
    s.id.includes(q)
  ).slice(0, 10);
}