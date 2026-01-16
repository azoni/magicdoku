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
    { id: 'brute', label: 'Brute', filter: c => c.classes?.includes('Brute') },
    { id: 'guardian', label: 'Guardian', filter: c => c.classes?.includes('Guardian') },
    { id: 'ninja', label: 'Ninja', filter: c => c.classes?.includes('Ninja') },
    { id: 'wizard', label: 'Wizard', filter: c => c.classes?.includes('Wizard') },
    { id: 'warrior', label: 'Warrior', filter: c => c.classes?.includes('Warrior') },
    { id: 'mechanologist', label: 'Mechanologist', filter: c => c.classes?.includes('Mechanologist') },
    { id: 'runeblade', label: 'Runeblade', filter: c => c.classes?.includes('Runeblade') },
    { id: 'ranger', label: 'Ranger', filter: c => c.classes?.includes('Ranger') },
    { id: 'illusionist', label: 'Illusionist', filter: c => c.classes?.includes('Illusionist') },
    { id: 'generic', label: 'Generic', filter: c => c.classes?.includes('Generic') },
    { id: 'assassin', label: 'Assassin', filter: c => c.classes?.includes('Assassin') },
    { id: 'necromancer', label: 'Necromancer', filter: c => c.classes?.includes('Necromancer') },
  ],
  pitch: [
    { id: 'pitch1', label: 'Red (Pitch 1)', filter: c => c.pitch === 1, colorClass: 'pitch-1' },
    { id: 'pitch2', label: 'Yellow (Pitch 2)', filter: c => c.pitch === 2, colorClass: 'pitch-2' },
    { id: 'pitch3', label: 'Blue (Pitch 3)', filter: c => c.pitch === 3, colorClass: 'pitch-3' },
  ],
  types: [
    { id: 'action', label: 'Action', filter: c => c.types?.includes('Action') },
    { id: 'attackReaction', label: 'Attack Reaction', filter: c => c.types?.includes('Attack Reaction') },
    { id: 'defenseReaction', label: 'Defense Reaction', filter: c => c.types?.includes('Defense Reaction') },
    { id: 'instant', label: 'Instant', filter: c => c.types?.includes('Instant') },
    { id: 'equipment', label: 'Equipment', filter: c => c.types?.includes('Equipment') },
    { id: 'weapon', label: 'Weapon', filter: c => c.types?.includes('Weapon') },
  ],
  subtypes: [
    { id: 'attack', label: 'Attack', filter: c => c.subtypes?.includes('Attack') },
    { id: 'nonAttack', label: 'Non-Attack', filter: c => c.subtypes?.includes('Non-Attack') },
    { id: 'aura', label: 'Aura', filter: c => c.subtypes?.includes('Aura') },
  ],
  rarity: [
    { id: 'common', label: 'Common', filter: c => c.rarity === 'Common' },
    { id: 'rare', label: 'Rare', filter: c => c.rarity === 'Rare' },
    { id: 'majestic', label: 'Majestic', filter: c => c.rarity === 'Majestic' },
    { id: 'legendary', label: 'Legendary', filter: c => c.rarity === 'Legendary' },
    { id: 'superRare', label: 'Super Rare', filter: c => c.rarity === 'Super Rare' },
  ],
  cost: [
    { id: 'cost0', label: 'Cost 0', filter: c => c.cost === 0 },
    { id: 'cost1', label: 'Cost 1', filter: c => c.cost === 1 },
    { id: 'cost2', label: 'Cost 2', filter: c => c.cost === 2 },
    { id: 'cost3plus', label: 'Cost 3+', filter: c => c.cost !== undefined && c.cost >= 3 },
  ],
  power: [
    { id: 'power3plus', label: 'Power 3+', filter: c => c.power !== undefined && c.power >= 3 },
    { id: 'power5plus', label: 'Power 5+', filter: c => c.power !== undefined && c.power >= 5 },
    { id: 'power7plus', label: 'Power 7+', filter: c => c.power !== undefined && c.power >= 7 },
  ],
  defense: [
    { id: 'defense2plus', label: 'Defense 2+', filter: c => c.defense !== undefined && c.defense >= 2 },
    { id: 'defense3plus', label: 'Defense 3+', filter: c => c.defense !== undefined && c.defense >= 3 },
  ],
  keywords: [
    { id: 'goAgain', label: 'Go Again', filter: c => c.keywords?.includes('Go again') },
    { id: 'dominate', label: 'Dominate', filter: c => c.keywords?.includes('Dominate') },
    { id: 'intimidate', label: 'Intimidate', filter: c => c.keywords?.includes('Intimidate') },
    { id: 'combo', label: 'Combo', filter: c => c.keywords?.includes('Combo') },
    { id: 'boost', label: 'Boost', filter: c => c.keywords?.includes('Boost') },
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
  const lowerName = name.toLowerCase().trim();
  
  // Try exact match first (with pitch color)
  let card = playableCards.find(c => getDisplayName(c).toLowerCase() === lowerName);
  
  // Try matching without pitch color
  if (!card) {
    card = playableCards.find(c => c.name.toLowerCase() === lowerName);
  }
  
  // Try partial match
  if (!card) {
    card = playableCards.find(c => 
      c.name.toLowerCase() === lowerName ||
      getDisplayName(c).toLowerCase() === lowerName
    );
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
  // Get image from default or first printing
  if (card.defaultImage) return card.defaultImage;
  if (card.printings && card.printings.length > 0) {
    return card.printings[0].image;
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