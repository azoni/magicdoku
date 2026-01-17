// Flesh and Blood Game Configuration
// Uses @flesh-and-blood/cards npm package

import { cards } from '@flesh-and-blood/cards';

// Pitch to color mapping
const PITCH_COLORS = {
  1: 'Red',
  2: 'Yellow', 
  3: 'Blue',
};

// Get display name with pitch color
function getDisplayName(card) {
  if (card.pitch) {
    return `${card.name} (${PITCH_COLORS[card.pitch]})`;
  }
  return card.name;
}

// Default Categories - using actual enum values from the package
export const CATEGORIES = {
  classes: [
    { id: 'brute', label: 'Brute', filter: c => c.classes?.includes('Brute'), group: 'classes' },
    { id: 'guardian', label: 'Guardian', filter: c => c.classes?.includes('Guardian'), group: 'classes' },
    { id: 'ninja', label: 'Ninja', filter: c => c.classes?.includes('Ninja'), group: 'classes' },
    { id: 'wizard', label: 'Wizard', filter: c => c.classes?.includes('Wizard'), group: 'classes' },
    { id: 'warrior', label: 'Warrior', filter: c => c.classes?.includes('Warrior'), group: 'classes' },
    { id: 'mechanologist', label: 'Mechanologist', filter: c => c.classes?.includes('Mechanologist'), group: 'classes' },
    { id: 'runeblade', label: 'Runeblade', filter: c => c.classes?.includes('Runeblade'), group: 'classes' },
    { id: 'ranger', label: 'Ranger', filter: c => c.classes?.includes('Ranger'), group: 'classes' },
    { id: 'illusionist', label: 'Illusionist', filter: c => c.classes?.includes('Illusionist'), group: 'classes' },
    { id: 'generic', label: 'Generic', filter: c => c.classes?.includes('Generic'), group: 'classes' },
    { id: 'assassin', label: 'Assassin', filter: c => c.classes?.includes('Assassin'), group: 'classes' },
    { id: 'necromancer', label: 'Necromancer', filter: c => c.classes?.includes('Necromancer'), group: 'classes' },
  ],
  pitch: [
    { id: 'pitch1', label: 'Red (Pitch 1)', filter: c => c.pitch === 1, colorClass: 'pitch-1', group: 'pitch' },
    { id: 'pitch2', label: 'Yellow (Pitch 2)', filter: c => c.pitch === 2, colorClass: 'pitch-2', group: 'pitch' },
    { id: 'pitch3', label: 'Blue (Pitch 3)', filter: c => c.pitch === 3, colorClass: 'pitch-3', group: 'pitch' },
  ],
  types: [
    { id: 'action', label: 'Action', filter: c => c.types?.includes('Action'), group: 'types' },
    { id: 'attackReaction', label: 'Attack Reaction', filter: c => c.types?.includes('Attack Reaction'), group: 'types' },
    { id: 'defenseReaction', label: 'Defense Reaction', filter: c => c.types?.includes('Defense Reaction'), group: 'types' },
    { id: 'instant', label: 'Instant', filter: c => c.types?.includes('Instant'), group: 'types' },
    { id: 'equipment', label: 'Equipment', filter: c => c.types?.includes('Equipment'), group: 'types' },
    { id: 'weapon', label: 'Weapon', filter: c => c.types?.includes('Weapon'), group: 'types' },
  ],
  subtypes: [
    { id: 'attack', label: 'Attack', filter: c => c.subtypes?.includes('Attack'), group: 'subtypes' },
    { id: 'nonAttack', label: 'Non-Attack', filter: c => c.subtypes?.includes('Non-Attack'), group: 'subtypes' },
    { id: 'aura', label: 'Aura', filter: c => c.subtypes?.includes('Aura'), group: 'subtypes' },
  ],
  rarity: [
    { id: 'common', label: 'Common', filter: c => c.rarity === 'Common', group: 'rarity' },
    { id: 'rare', label: 'Rare', filter: c => c.rarity === 'Rare', group: 'rarity' },
    { id: 'majestic', label: 'Majestic', filter: c => c.rarity === 'Majestic', group: 'rarity' },
    { id: 'legendary', label: 'Legendary', filter: c => c.rarity === 'Legendary', group: 'rarity' },
    { id: 'superRare', label: 'Super Rare', filter: c => c.rarity === 'Super Rare', group: 'rarity' },
  ],
  cost: [
    { id: 'cost0', label: 'Cost 0', filter: c => c.cost === 0, group: 'cost' },
    { id: 'cost1', label: 'Cost 1', filter: c => c.cost === 1, group: 'cost' },
    { id: 'cost2', label: 'Cost 2', filter: c => c.cost === 2, group: 'cost' },
    { id: 'cost3plus', label: 'Cost 3+', filter: c => c.cost !== undefined && c.cost >= 3, group: 'cost' },
  ],
  power: [
    { id: 'power3plus', label: 'Power 3+', filter: c => c.power !== undefined && c.power >= 3, group: 'power' },
    { id: 'power5plus', label: 'Power 5+', filter: c => c.power !== undefined && c.power >= 5, group: 'power' },
    { id: 'power7plus', label: 'Power 7+', filter: c => c.power !== undefined && c.power >= 7, group: 'power' },
  ],
  defense: [
    { id: 'defense2plus', label: 'Defense 2+', filter: c => c.defense !== undefined && c.defense >= 2, group: 'defense' },
    { id: 'defense3plus', label: 'Defense 3+', filter: c => c.defense !== undefined && c.defense >= 3, group: 'defense' },
  ],
  keywords: [
    { id: 'goAgain', label: 'Go Again', filter: c => c.keywords?.includes('Go again'), group: 'keywords' },
    { id: 'dominate', label: 'Dominate', filter: c => c.keywords?.includes('Dominate'), group: 'keywords' },
    { id: 'intimidate', label: 'Intimidate', filter: c => c.keywords?.includes('Intimidate'), group: 'keywords' },
    { id: 'combo', label: 'Combo', filter: c => c.keywords?.includes('Combo'), group: 'keywords' },
    { id: 'boost', label: 'Boost', filter: c => c.keywords?.includes('Boost'), group: 'keywords' },
  ],
};

// Get playable cards only (exclude tokens, heroes for guessing)
function getPlayableCards() {
  return cards.filter(c => 
    !c.types?.includes('Hero') && 
    !c.types?.includes('Token') &&
    !c.types?.includes('Weapon') &&
    c.name
  );
}

// Load custom categories - merge Firebase data with local filter functions
function getCategories() {
  const saved = localStorage.getItem('tcgdoku-categories-fab');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Re-attach filter functions based on IDs
      Object.keys(parsed).forEach(groupKey => {
        if (CATEGORIES[groupKey]) {
          parsed[groupKey] = parsed[groupKey].map(cat => {
            const defaultCat = CATEGORIES[groupKey]?.find(d => d.id === cat.id);
            return {
              ...cat,
              filter: defaultCat?.filter || (() => false),
            };
          });
        }
      });
      return parsed;
    } catch (e) {
      console.error('Error parsing saved categories:', e);
    }
  }
  return CATEGORIES;
}

// Initialize: try to load categories from Firebase into localStorage
async function initCategories() {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    const docRef = doc(db, 'categories', 'fab');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().categories) {
      const data = docSnap.data().categories;
      localStorage.setItem('tcgdoku-categories-fab', JSON.stringify(data));
      console.log('FAB categories loaded from Firebase');
    } else {
      console.log('No FAB categories in Firebase, using defaults');
    }
  } catch (error) {
    console.log('Firebase unavailable, using default categories');
  }
}

// Load on module init (non-blocking)
initCategories();

// Check if a card matches a category
function cardMatchesFilter(card, category) {
  if (typeof category.filter === 'function') {
    return category.filter(card);
  }
  return false;
}

// API Functions
export async function checkValidCardExists(cat1, cat2) {
  const playableCards = getPlayableCards();
  return playableCards.some(card => cardMatchesFilter(card, cat1) && cardMatchesFilter(card, cat2));
}

export async function autocompleteCards(query) {
  // Not used anymore but kept for interface
  return [];
}

export async function getCardByName(name) {
  const playableCards = getPlayableCards();
  let lowerName = name.toLowerCase().trim();
  
  // Parse pitch color from input: "bare fangs red", "bare fangs (yellow)", "bare fangs blue"
  let targetPitch = null;
  const colorPatterns = [
    { pattern: /\s*\(red\)\s*$/i, pitch: 1 },
    { pattern: /\s*\(yellow\)\s*$/i, pitch: 2 },
    { pattern: /\s*\(blue\)\s*$/i, pitch: 3 },
    { pattern: /\s+red$/i, pitch: 1 },
    { pattern: /\s+yellow$/i, pitch: 2 },
    { pattern: /\s+blue$/i, pitch: 3 },
  ];
  
  for (const { pattern, pitch } of colorPatterns) {
    if (pattern.test(lowerName)) {
      targetPitch = pitch;
      lowerName = lowerName.replace(pattern, '').trim();
      break;
    }
  }
  
  // Try exact match first (with pitch color in display name)
  let card = playableCards.find(c => getDisplayName(c).toLowerCase() === name.toLowerCase().trim());
  
  // If no exact match and we have a target pitch, find card with that pitch
  if (!card && targetPitch) {
    card = playableCards.find(c => 
      c.name.toLowerCase() === lowerName && c.pitch === targetPitch
    );
  }
  
  // If still no match, try matching by base name (returns first match)
  if (!card) {
    card = playableCards.find(c => c.name.toLowerCase() === lowerName);
  }
  
  // Return card with display name added
  if (card) {
    return {
      ...card,
      name: getDisplayName(card), // Override name with display name including pitch
      baseName: card.name, // Keep original name available
    };
  }
  
  return null;
}

export async function cardMatchesCategory(card, category) {
  return cardMatchesFilter(card, category);
}

export function getCardImage(card) {
  // Use defaultImage or first printing identifier
  const imageId = card.defaultImage || card.printings?.[0]?.identifier;
  if (imageId) {
    // Clean up the image ID (remove any .width-450 suffix if present)
    const cleanId = imageId.replace('.width-450', '');
    // Use dhhim4ltzu1pj.cloudfront.net which is the FaBDB CDN
    return `https://dhhim4ltzu1pj.cloudfront.net/media/images/${cleanId}.width-450.png`;
  }
  return null;
}

export function getCardDisplayInfo(card) {
  return {
    name: getDisplayName(card),
    set: card.sets?.[0] || '',
  };
}

// Get all categories for puzzle generation
export function getAllCategories() {
  const cats = getCategories();
  return [
    ...((cats.classes || []).slice(0, 6)),
    ...(cats.pitch || []),
    ...(cats.types || []).slice(0, 4),
    ...(cats.subtypes || []).slice(0, 2),
    ...(cats.rarity || []).slice(0, 3),
    ...(cats.cost || []).slice(0, 3),
  ];
}

// Fallback categories guaranteed to work
export function getFallbackCategories() {
  return {
    rowCategories: [CATEGORIES.classes[0], CATEGORIES.classes[1], CATEGORIES.classes[4]],
    colCategories: [CATEGORIES.pitch[0], CATEGORIES.pitch[1], CATEGORIES.pitch[2]],
  };
}

// Config export
export const config = {
  id: 'fab',
  name: 'Flesh and Blood',
  shortName: 'FABDoku',
  accentColor: '#dc3545',
  emoji: '⚔️',
};