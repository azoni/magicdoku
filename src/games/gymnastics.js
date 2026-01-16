// Gymnastics Skills Database
// Skills are categorized by apparatus, difficulty, element group, etc.

export const config = {
  id: 'gymnastics',
  name: 'Gymnastics',
  shortName: 'GymDoku',
  emoji: '🤸',
};

// Comprehensive skills database
const SKILLS = [
  // === FLOOR EXERCISE (Women's & Men's) ===
  // Tumbling - Backward
  { id: 'back-handspring', name: 'Back Handspring', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'A', group: 'tumbling', direction: 'backward' },
  { id: 'back-tuck', name: 'Back Tuck', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'A', group: 'tumbling', direction: 'backward' },
  { id: 'back-pike', name: 'Back Pike', apparatus: ['floor'], type: 'acrobatic', difficulty: 'B', group: 'tumbling', direction: 'backward' },
  { id: 'back-layout', name: 'Back Layout', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'B', group: 'tumbling', direction: 'backward' },
  { id: 'back-layout-full', name: 'Full Twisting Layout', apparatus: ['floor'], type: 'acrobatic', difficulty: 'C', group: 'tumbling', direction: 'backward' },
  { id: 'back-layout-double', name: 'Double Twisting Layout', apparatus: ['floor'], type: 'acrobatic', difficulty: 'D', group: 'tumbling', direction: 'backward' },
  { id: 'double-back-tuck', name: 'Double Back Tuck', apparatus: ['floor'], type: 'acrobatic', difficulty: 'D', group: 'tumbling', direction: 'backward' },
  { id: 'double-back-pike', name: 'Double Back Pike', apparatus: ['floor'], type: 'acrobatic', difficulty: 'E', group: 'tumbling', direction: 'backward' },
  { id: 'double-back-layout', name: 'Double Back Layout', apparatus: ['floor'], type: 'acrobatic', difficulty: 'E', group: 'tumbling', direction: 'backward' },
  { id: 'full-in', name: 'Full-In Back Out', apparatus: ['floor'], type: 'acrobatic', difficulty: 'E', group: 'tumbling', direction: 'backward' },
  { id: 'double-double', name: 'Double Double', apparatus: ['floor'], type: 'acrobatic', difficulty: 'G', group: 'tumbling', direction: 'backward' },
  { id: 'triple-back', name: 'Triple Back', apparatus: ['floor'], type: 'acrobatic', difficulty: 'H', group: 'tumbling', direction: 'backward' },
  { id: 'biles', name: 'Biles (Double Layout Half)', apparatus: ['floor'], type: 'acrobatic', difficulty: 'J', group: 'tumbling', direction: 'backward', namedAfter: 'Simone Biles' },
  { id: 'biles-ii', name: 'Biles II (Triple Double)', apparatus: ['floor'], type: 'acrobatic', difficulty: 'J', group: 'tumbling', direction: 'backward', namedAfter: 'Simone Biles' },
  
  // Tumbling - Forward
  { id: 'front-handspring', name: 'Front Handspring', apparatus: ['floor', 'vault'], type: 'acrobatic', difficulty: 'A', group: 'tumbling', direction: 'forward' },
  { id: 'front-tuck', name: 'Front Tuck', apparatus: ['floor'], type: 'acrobatic', difficulty: 'A', group: 'tumbling', direction: 'forward' },
  { id: 'front-pike', name: 'Front Pike', apparatus: ['floor'], type: 'acrobatic', difficulty: 'B', group: 'tumbling', direction: 'forward' },
  { id: 'front-layout', name: 'Front Layout', apparatus: ['floor'], type: 'acrobatic', difficulty: 'B', group: 'tumbling', direction: 'forward' },
  { id: 'front-full', name: 'Front Full', apparatus: ['floor'], type: 'acrobatic', difficulty: 'C', group: 'tumbling', direction: 'forward' },
  { id: 'double-front', name: 'Double Front', apparatus: ['floor'], type: 'acrobatic', difficulty: 'E', group: 'tumbling', direction: 'forward' },
  { id: 'double-front-half', name: 'Double Front Half Out', apparatus: ['floor'], type: 'acrobatic', difficulty: 'F', group: 'tumbling', direction: 'forward' },
  { id: 'arabian', name: 'Arabian', apparatus: ['floor'], type: 'acrobatic', difficulty: 'C', group: 'tumbling', direction: 'forward' },
  { id: 'arabian-double', name: 'Arabian Double Front', apparatus: ['floor'], type: 'acrobatic', difficulty: 'F', group: 'tumbling', direction: 'forward' },
  
  // Tumbling - Sideways
  { id: 'cartwheel', name: 'Cartwheel', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'A', group: 'tumbling', direction: 'sideways' },
  { id: 'roundoff', name: 'Roundoff', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'A', group: 'tumbling', direction: 'sideways' },
  { id: 'aerial-cartwheel', name: 'Aerial Cartwheel', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'C', group: 'tumbling', direction: 'sideways' },
  { id: 'side-somersault', name: 'Side Somersault', apparatus: ['floor'], type: 'acrobatic', difficulty: 'D', group: 'tumbling', direction: 'sideways' },
  { id: 'thomas-salto', name: 'Thomas Salto', apparatus: ['floor'], type: 'acrobatic', difficulty: 'F', group: 'tumbling', direction: 'sideways', namedAfter: 'Kurt Thomas' },
  
  // Dance Elements - Leaps
  { id: 'split-leap', name: 'Split Leap', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'A', group: 'leap' },
  { id: 'switch-leap', name: 'Switch Leap', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'C', group: 'leap' },
  { id: 'switch-half', name: 'Switch Leap Half', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'D', group: 'leap' },
  { id: 'ring-leap', name: 'Ring Leap', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'D', group: 'leap' },
  { id: 'sheep-jump', name: 'Sheep Jump', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'C', group: 'leap' },
  { id: 'straddle-jump', name: 'Straddle Jump', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'A', group: 'leap' },
  { id: 'pike-jump', name: 'Pike Jump', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'A', group: 'leap' },
  { id: 'sissone', name: 'Sissone', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'A', group: 'leap' },
  { id: 'tour-jete', name: 'Tour Jeté', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'B', group: 'leap' },
  { id: 'tour-jete-half', name: 'Tour Jeté Half', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'D', group: 'leap' },
  { id: 'cat-leap', name: 'Cat Leap', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'A', group: 'leap' },
  
  // Dance Elements - Turns
  { id: 'full-turn', name: 'Full Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'A', group: 'turn' },
  { id: 'double-turn', name: 'Double Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'B', group: 'turn' },
  { id: 'triple-turn', name: 'Triple Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'C', group: 'turn' },
  { id: 'wolf-turn', name: 'Wolf Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'A', group: 'turn' },
  { id: 'double-wolf', name: 'Double Wolf Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'C', group: 'turn' },
  { id: 'triple-wolf', name: 'Triple Wolf Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'E', group: 'turn' },
  { id: 'illusion-turn', name: 'Illusion Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'C', group: 'turn' },
  { id: 'l-turn', name: 'L Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'B', group: 'turn' },
  { id: 'y-turn', name: 'Y Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'C', group: 'turn' },
  { id: 'attitude-turn', name: 'Attitude Turn', apparatus: ['floor', 'beam'], type: 'dance', difficulty: 'B', group: 'turn' },
  
  // === BALANCE BEAM ===
  // Mounts
  { id: 'jump-to-beam', name: 'Jump to Beam', apparatus: ['beam'], type: 'mount', difficulty: 'A', group: 'mount' },
  { id: 'press-handstand-mount', name: 'Press Handstand Mount', apparatus: ['beam'], type: 'mount', difficulty: 'B', group: 'mount' },
  { id: 'front-aerial-mount', name: 'Front Aerial Mount', apparatus: ['beam'], type: 'mount', difficulty: 'D', group: 'mount' },
  { id: 'round-off-mount', name: 'Round-Off Mount', apparatus: ['beam'], type: 'mount', difficulty: 'C', group: 'mount' },
  
  // Beam Acro
  { id: 'back-walkover', name: 'Back Walkover', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'A', group: 'walkover' },
  { id: 'front-walkover', name: 'Front Walkover', apparatus: ['floor', 'beam'], type: 'acrobatic', difficulty: 'A', group: 'walkover' },
  { id: 'back-limber', name: 'Back Limber', apparatus: ['beam'], type: 'acrobatic', difficulty: 'A', group: 'walkover' },
  { id: 'valdez', name: 'Valdez', apparatus: ['beam'], type: 'acrobatic', difficulty: 'C', group: 'walkover' },
  { id: 'onodi', name: 'Onodi', apparatus: ['beam'], type: 'acrobatic', difficulty: 'D', group: 'tumbling', namedAfter: 'Henrietta Onodi' },
  { id: 'layout-stepout', name: 'Layout Stepout', apparatus: ['beam'], type: 'acrobatic', difficulty: 'C', group: 'tumbling' },
  { id: 'standing-full', name: 'Standing Full', apparatus: ['beam'], type: 'acrobatic', difficulty: 'E', group: 'tumbling' },
  { id: 'gainer-layout', name: 'Gainer Layout', apparatus: ['beam'], type: 'acrobatic', difficulty: 'D', group: 'tumbling' },
  { id: 'gainer-full', name: 'Gainer Full', apparatus: ['beam'], type: 'acrobatic', difficulty: 'E', group: 'tumbling' },
  { id: 'korbut-flip', name: 'Korbut Flip', apparatus: ['beam'], type: 'acrobatic', difficulty: 'E', group: 'tumbling', namedAfter: 'Olga Korbut' },
  
  // Beam Dismounts
  { id: 'round-off-dismount', name: 'Round-Off Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'A', group: 'dismount' },
  { id: 'back-tuck-dismount', name: 'Back Tuck Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'B', group: 'dismount' },
  { id: 'gainer-back-dismount', name: 'Gainer Back Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'C', group: 'dismount' },
  { id: 'double-back-dismount', name: 'Double Back Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'D', group: 'dismount' },
  { id: 'double-pike-dismount', name: 'Double Pike Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'E', group: 'dismount' },
  { id: 'double-twist-dismount', name: 'Double Twist Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'D', group: 'dismount' },
  { id: 'full-in-dismount', name: 'Full-In Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'F', group: 'dismount' },
  { id: 'patterson-dismount', name: 'Patterson Dismount', apparatus: ['beam'], type: 'dismount', difficulty: 'G', group: 'dismount', namedAfter: 'Carly Patterson' },
  
  // === UNEVEN BARS ===
  // Swings & Circles
  { id: 'kip', name: 'Kip', apparatus: ['bars'], type: 'swing', difficulty: 'A', group: 'swing' },
  { id: 'glide-kip', name: 'Glide Kip', apparatus: ['bars'], type: 'swing', difficulty: 'A', group: 'swing' },
  { id: 'giant-swing', name: 'Giant Swing', apparatus: ['bars', 'high-bar'], type: 'swing', difficulty: 'B', group: 'swing' },
  { id: 'clear-hip', name: 'Clear Hip Circle', apparatus: ['bars'], type: 'swing', difficulty: 'B', group: 'swing' },
  { id: 'clear-hip-handstand', name: 'Clear Hip to Handstand', apparatus: ['bars'], type: 'swing', difficulty: 'D', group: 'swing' },
  { id: 'stalder', name: 'Stalder Circle', apparatus: ['bars'], type: 'swing', difficulty: 'C', group: 'swing' },
  { id: 'stalder-handstand', name: 'Stalder to Handstand', apparatus: ['bars'], type: 'swing', difficulty: 'D', group: 'swing' },
  { id: 'toe-on', name: 'Toe-On Circle', apparatus: ['bars'], type: 'swing', difficulty: 'B', group: 'swing' },
  { id: 'toe-shoot', name: 'Toe Shoot', apparatus: ['bars'], type: 'swing', difficulty: 'C', group: 'transition' },
  
  // Releases
  { id: 'flyaway', name: 'Flyaway', apparatus: ['bars'], type: 'release', difficulty: 'A', group: 'release' },
  { id: 'jaeger', name: 'Jaeger', apparatus: ['bars', 'high-bar'], type: 'release', difficulty: 'D', group: 'release', namedAfter: 'Bernd Jaeger' },
  { id: 'gienger', name: 'Gienger', apparatus: ['bars', 'high-bar'], type: 'release', difficulty: 'D', group: 'release', namedAfter: 'Eberhard Gienger' },
  { id: 'tkachev', name: 'Tkachev', apparatus: ['bars', 'high-bar'], type: 'release', difficulty: 'D', group: 'release', namedAfter: 'Alexander Tkachev' },
  { id: 'pak-salto', name: 'Pak Salto', apparatus: ['bars'], type: 'release', difficulty: 'D', group: 'transition', namedAfter: 'Pak Gyong-sil' },
  { id: 'shaposhnikova', name: 'Shaposhnikova', apparatus: ['bars'], type: 'release', difficulty: 'D', group: 'transition', namedAfter: 'Natalia Shaposhnikova' },
  { id: 'ray', name: 'Ray', apparatus: ['bars'], type: 'release', difficulty: 'E', group: 'release', namedAfter: 'Elise Ray' },
  { id: 'church', name: 'Church', apparatus: ['bars'], type: 'release', difficulty: 'E', group: 'release', namedAfter: 'Kayla Church' },
  { id: 'deltchev', name: 'Deltchev', apparatus: ['bars'], type: 'release', difficulty: 'D', group: 'release', namedAfter: 'Stoyan Deltchev' },
  { id: 'kovacs', name: 'Kovacs', apparatus: ['high-bar'], type: 'release', difficulty: 'E', group: 'release', namedAfter: 'Peter Kovacs' },
  { id: 'kolman', name: 'Kolman', apparatus: ['high-bar'], type: 'release', difficulty: 'G', group: 'release', namedAfter: 'Alojz Kolman' },
  
  // Bar Dismounts
  { id: 'flyaway-dismount', name: 'Flyaway Dismount', apparatus: ['bars'], type: 'dismount', difficulty: 'A', group: 'dismount' },
  { id: 'double-back-bars', name: 'Double Back Dismount', apparatus: ['bars', 'high-bar'], type: 'dismount', difficulty: 'D', group: 'dismount' },
  { id: 'double-front-bars', name: 'Double Front Dismount', apparatus: ['bars'], type: 'dismount', difficulty: 'E', group: 'dismount' },
  { id: 'full-twisting-double', name: 'Full Twisting Double Back', apparatus: ['bars', 'high-bar'], type: 'dismount', difficulty: 'E', group: 'dismount' },
  { id: 'double-double-dismount', name: 'Double Double Dismount', apparatus: ['bars'], type: 'dismount', difficulty: 'G', group: 'dismount' },
  
  // === VAULT ===
  { id: 'handspring-vault', name: 'Handspring Vault', apparatus: ['vault'], type: 'vault', difficulty: 'B', group: 'vault' },
  { id: 'handspring-front', name: 'Handspring Front Tuck', apparatus: ['vault'], type: 'vault', difficulty: 'C', group: 'vault' },
  { id: 'tsukahara', name: 'Tsukahara', apparatus: ['vault'], type: 'vault', difficulty: 'C', group: 'vault', namedAfter: 'Mitsuo Tsukahara' },
  { id: 'tsuk-full', name: 'Tsukahara Full', apparatus: ['vault'], type: 'vault', difficulty: 'D', group: 'vault' },
  { id: 'tsuk-double', name: 'Tsukahara Double', apparatus: ['vault'], type: 'vault', difficulty: 'E', group: 'vault' },
  { id: 'yurchenko', name: 'Yurchenko', apparatus: ['vault'], type: 'vault', difficulty: 'C', group: 'vault', namedAfter: 'Natalia Yurchenko' },
  { id: 'yurchenko-full', name: 'Yurchenko Full', apparatus: ['vault'], type: 'vault', difficulty: 'D', group: 'vault' },
  { id: 'yurchenko-double', name: 'Yurchenko Double (Amanar)', apparatus: ['vault'], type: 'vault', difficulty: 'F', group: 'vault', namedAfter: 'Simona Amanar' },
  { id: 'yurchenko-double-pike', name: 'Yurchenko Double Pike', apparatus: ['vault'], type: 'vault', difficulty: 'G', group: 'vault' },
  { id: 'cheng', name: 'Cheng', apparatus: ['vault'], type: 'vault', difficulty: 'F', group: 'vault', namedAfter: 'Cheng Fei' },
  { id: 'produnova', name: 'Produnova', apparatus: ['vault'], type: 'vault', difficulty: 'G', group: 'vault', namedAfter: 'Elena Produnova' },
  { id: 'biles-vault', name: 'Biles (Yurchenko Double Pike)', apparatus: ['vault'], type: 'vault', difficulty: 'H', group: 'vault', namedAfter: 'Simone Biles' },
  { id: 'lopez', name: 'Lopez', apparatus: ['vault'], type: 'vault', difficulty: 'E', group: 'vault', namedAfter: 'Jorge Lopez' },
  { id: 'kasamatsu', name: 'Kasamatsu', apparatus: ['vault'], type: 'vault', difficulty: 'D', group: 'vault', namedAfter: 'Shigeru Kasamatsu' },
  
  // === MEN'S APPARATUS ===
  // Pommel Horse
  { id: 'scissors', name: 'Scissors', apparatus: ['pommel'], type: 'swing', difficulty: 'A', group: 'swing' },
  { id: 'circle', name: 'Circle', apparatus: ['pommel'], type: 'swing', difficulty: 'A', group: 'swing' },
  { id: 'flairs', name: 'Flairs', apparatus: ['pommel', 'floor'], type: 'swing', difficulty: 'C', group: 'swing' },
  { id: 'spindle', name: 'Spindle', apparatus: ['pommel'], type: 'swing', difficulty: 'C', group: 'swing' },
  { id: 'magyar', name: 'Magyar Travel', apparatus: ['pommel'], type: 'swing', difficulty: 'D', group: 'swing', namedAfter: 'Zoltan Magyar' },
  { id: 'sivado', name: 'Sivado', apparatus: ['pommel'], type: 'swing', difficulty: 'D', group: 'swing' },
  { id: 'wu-guonian', name: 'Wu Guonian', apparatus: ['pommel'], type: 'swing', difficulty: 'E', group: 'swing', namedAfter: 'Wu Guonian' },
  
  // Rings
  { id: 'muscle-up', name: 'Muscle Up', apparatus: ['rings'], type: 'strength', difficulty: 'A', group: 'strength' },
  { id: 'iron-cross', name: 'Iron Cross', apparatus: ['rings'], type: 'strength', difficulty: 'B', group: 'strength' },
  { id: 'maltese', name: 'Maltese Cross', apparatus: ['rings'], type: 'strength', difficulty: 'E', group: 'strength' },
  { id: 'inverted-cross', name: 'Inverted Cross', apparatus: ['rings'], type: 'strength', difficulty: 'C', group: 'strength' },
  { id: 'azarian', name: 'Azarian', apparatus: ['rings'], type: 'strength', difficulty: 'D', group: 'strength', namedAfter: 'Albert Azarian' },
  { id: 'planche', name: 'Planche', apparatus: ['rings', 'floor'], type: 'strength', difficulty: 'C', group: 'strength' },
  { id: 'swallow', name: 'Swallow', apparatus: ['rings'], type: 'strength', difficulty: 'D', group: 'strength' },
  { id: 'yamawaki', name: 'Yamawaki', apparatus: ['rings'], type: 'swing', difficulty: 'C', group: 'swing', namedAfter: 'Yamawaki' },
  { id: 'jonasson', name: 'Jonasson', apparatus: ['rings'], type: 'swing', difficulty: 'D', group: 'swing', namedAfter: 'Jonasson' },
  
  // Parallel Bars
  { id: 'swing-handstand', name: 'Swing to Handstand', apparatus: ['p-bars'], type: 'swing', difficulty: 'A', group: 'swing' },
  { id: 'stutz', name: 'Stutz', apparatus: ['p-bars'], type: 'swing', difficulty: 'C', group: 'swing' },
  { id: 'diamidov', name: 'Diamidov', apparatus: ['p-bars'], type: 'swing', difficulty: 'D', group: 'swing', namedAfter: 'Sergei Diamidov' },
  { id: 'healy', name: 'Healy', apparatus: ['p-bars'], type: 'swing', difficulty: 'D', group: 'swing', namedAfter: 'Bart Healy' },
  { id: 'belle', name: 'Belle', apparatus: ['p-bars'], type: 'release', difficulty: 'E', group: 'release' },
  { id: 'bhavsar', name: 'Bhavsar', apparatus: ['p-bars'], type: 'swing', difficulty: 'E', group: 'swing', namedAfter: 'Raj Bhavsar' },
  { id: 'tippelt', name: 'Tippelt', apparatus: ['p-bars'], type: 'release', difficulty: 'E', group: 'release', namedAfter: 'Marcel Tippelt' },
  
  // High Bar
  { id: 'hb-giant', name: 'Giant Swing', apparatus: ['high-bar'], type: 'swing', difficulty: 'A', group: 'swing' },
  { id: 'endo', name: 'Endo', apparatus: ['high-bar'], type: 'swing', difficulty: 'C', group: 'swing', namedAfter: 'Yukio Endo' },
  { id: 'adler', name: 'Adler', apparatus: ['high-bar'], type: 'swing', difficulty: 'D', group: 'swing' },
  { id: 'voronin', name: 'Voronin', apparatus: ['high-bar'], type: 'swing', difficulty: 'C', group: 'swing', namedAfter: 'Mikhail Voronin' },
  { id: 'markelov', name: 'Markelov', apparatus: ['high-bar'], type: 'release', difficulty: 'D', group: 'release', namedAfter: 'Markelov' },
  { id: 'gaylord', name: 'Gaylord', apparatus: ['high-bar'], type: 'release', difficulty: 'E', group: 'release', namedAfter: 'Mitch Gaylord' },
  { id: 'cassina', name: 'Cassina', apparatus: ['high-bar'], type: 'release', difficulty: 'G', group: 'release', namedAfter: 'Igor Cassina' },
];

// Build index for fast lookup
const skillsByName = {};
SKILLS.forEach(skill => {
  skillsByName[skill.name.toLowerCase()] = skill;
  // Also index without special characters
  const simplified = skill.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  skillsByName[simplified] = skill;
});

// Categories for the game
export const CATEGORIES = {
  apparatus: [
    { id: 'floor', label: 'Floor', query: 'floor', colorClass: 'apparatus-floor', filter: (s) => s.apparatus?.includes('floor') },
    { id: 'beam', label: 'Balance Beam', query: 'beam', colorClass: 'apparatus-beam', filter: (s) => s.apparatus?.includes('beam') },
    { id: 'bars', label: 'Uneven Bars', query: 'bars', colorClass: 'apparatus-bars', filter: (s) => s.apparatus?.includes('bars') },
    { id: 'vault', label: 'Vault', query: 'vault', colorClass: 'apparatus-vault', filter: (s) => s.apparatus?.includes('vault') },
    { id: 'pommel', label: 'Pommel Horse', query: 'pommel', colorClass: 'apparatus-pommel', filter: (s) => s.apparatus?.includes('pommel') },
    { id: 'rings', label: 'Rings', query: 'rings', colorClass: 'apparatus-rings', filter: (s) => s.apparatus?.includes('rings') },
    { id: 'p-bars', label: 'Parallel Bars', query: 'p-bars', colorClass: 'apparatus-pbars', filter: (s) => s.apparatus?.includes('p-bars') },
    { id: 'high-bar', label: 'High Bar', query: 'high-bar', colorClass: 'apparatus-hbar', filter: (s) => s.apparatus?.includes('high-bar') },
  ],
  difficulty: [
    { id: 'diff-a', label: 'A Value', query: 'A', colorClass: 'diff-a', filter: (s) => s.difficulty === 'A' },
    { id: 'diff-b', label: 'B Value', query: 'B', colorClass: 'diff-b', filter: (s) => s.difficulty === 'B' },
    { id: 'diff-c', label: 'C Value', query: 'C', colorClass: 'diff-c', filter: (s) => s.difficulty === 'C' },
    { id: 'diff-d', label: 'D Value', query: 'D', colorClass: 'diff-d', filter: (s) => s.difficulty === 'D' },
    { id: 'diff-e', label: 'E Value', query: 'E', colorClass: 'diff-e', filter: (s) => s.difficulty === 'E' },
    { id: 'diff-fg', label: 'F+ Value', query: 'F+', colorClass: 'diff-fg', filter: (s) => ['F', 'G', 'H', 'I', 'J'].includes(s.difficulty) },
  ],
  type: [
    { id: 'type-acro', label: 'Acrobatic', query: 'acrobatic', filter: (s) => s.type === 'acrobatic' },
    { id: 'type-dance', label: 'Dance', query: 'dance', filter: (s) => s.type === 'dance' },
    { id: 'type-swing', label: 'Swing/Circle', query: 'swing', filter: (s) => s.type === 'swing' },
    { id: 'type-release', label: 'Release Move', query: 'release', filter: (s) => s.type === 'release' },
    { id: 'type-strength', label: 'Strength Hold', query: 'strength', filter: (s) => s.type === 'strength' },
    { id: 'type-vault', label: 'Vault', query: 'vault', filter: (s) => s.type === 'vault' },
    { id: 'type-mount', label: 'Mount', query: 'mount', filter: (s) => s.type === 'mount' },
    { id: 'type-dismount', label: 'Dismount', query: 'dismount', filter: (s) => s.type === 'dismount' },
  ],
  group: [
    { id: 'group-tumbling', label: 'Tumbling', query: 'tumbling', filter: (s) => s.group === 'tumbling' },
    { id: 'group-leap', label: 'Leaps/Jumps', query: 'leap', filter: (s) => s.group === 'leap' },
    { id: 'group-turn', label: 'Turns', query: 'turn', filter: (s) => s.group === 'turn' },
    { id: 'group-swing', label: 'Swings', query: 'swing', filter: (s) => s.group === 'swing' },
    { id: 'group-release', label: 'Releases', query: 'release', filter: (s) => s.group === 'release' },
    { id: 'group-strength', label: 'Strength', query: 'strength', filter: (s) => s.group === 'strength' },
    { id: 'group-dismount', label: 'Dismount', query: 'dismount', filter: (s) => s.group === 'dismount' },
  ],
  special: [
    { id: 'named-skill', label: 'Named Skill', query: 'named', filter: (s) => s.namedAfter != null },
    { id: 'backward', label: 'Backward', query: 'backward', filter: (s) => s.direction === 'backward' },
    { id: 'forward', label: 'Forward', query: 'forward', filter: (s) => s.direction === 'forward' },
    { id: 'womens', label: "Women's", query: 'womens', filter: (s) => s.apparatus?.some(a => ['floor', 'beam', 'bars', 'vault'].includes(a)) },
    { id: 'mens', label: "Men's", query: 'mens', filter: (s) => s.apparatus?.some(a => ['floor', 'pommel', 'rings', 'vault', 'p-bars', 'high-bar'].includes(a)) },
  ],
};

// Get skill by name
export async function getCardByName(name) {
  const searchName = name.toLowerCase().trim();
  
  // Direct match
  if (skillsByName[searchName]) {
    return skillsByName[searchName];
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
  
  // Fallback to query matching
  const q = category.query?.toLowerCase();
  if (!q) return false;
  
  if (skill.apparatus?.includes(q)) return true;
  if (skill.difficulty === q.toUpperCase()) return true;
  if (skill.type === q) return true;
  if (skill.group === q) return true;
  
  return false;
}

// Check if valid skill exists for category combination
export async function checkValidCardExists(cat1, cat2) {
  return SKILLS.some(skill => {
    const matches1 = cat1.filter ? cat1.filter(skill) : false;
    const matches2 = cat2.filter ? cat2.filter(skill) : false;
    return matches1 && matches2;
  });
}

// Get all skills (for validation)
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
    ...(CATEGORIES.apparatus || []),
    ...(CATEGORIES.difficulty || []),
    ...(CATEGORIES.type || []),
    ...(CATEGORIES.group || []),
    ...(CATEGORIES.special || []),
  ];
}

// Fallback categories guaranteed to work
export function getFallbackCategories() {
  return {
    rowCategories: [CATEGORIES.apparatus[0], CATEGORIES.apparatus[1], CATEGORIES.apparatus[3]], // Floor, Beam, Vault
    colCategories: [CATEGORIES.difficulty[0], CATEGORIES.difficulty[1], CATEGORIES.difficulty[2]], // A, B, C
  };
}

// Get skill image - using placeholder for now
export function getCardImage(skill) {
  // Could integrate with a gymnastics image API or use skill diagrams
  // For now, return null to use placeholder
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