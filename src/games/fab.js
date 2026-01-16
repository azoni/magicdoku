// Flesh and Blood Game Configuration
// Uses static JSON from the-fab-cube/flesh-and-blood-cards GitHub repo

const CARDS_URL = 'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/refs/heads/main/json/english/card.json';

// Cache for loaded cards
let cardsCache = null;
let cardsLoading = null;

// Load all cards (cached)
async function loadCards() {
  if (cardsCache) return cardsCache;
  if (cardsLoading) return cardsLoading;
  
  cardsLoading = fetch(CARDS_URL)
    .then(res => res.json())
    .then(cards => {
      cardsCache = cards;
      return cards;
    })
    .catch(err => {
      console.error('Error loading FAB cards:', err);
      cardsLoading = null;
      return [];
    });
  
  return cardsLoading;
}

// Default Categories
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
  ],
  pitch: [
    { id: 'pitch1', label: 'Pitch 1 (Red)', filter: c => c.pitch === 1, colorClass: 'pitch-1' },
    { id: 'pitch2', label: 'Pitch 2 (Yellow)', filter: c => c.pitch === 2, colorClass: 'pitch-2' },
    { id: 'pitch3', label: 'Pitch 3 (Blue)', filter: c => c.pitch === 3, colorClass: 'pitch-3' },
  ],
  types: [
    { id: 'attack', label: 'Attack Action', filter: c => c.types?.some(t => t.includes('Attack')) },
    { id: 'defense', label: 'Defense Reaction', filter: c => c.types?.some(t => t.includes('Defense')) },
    { id: 'instant', label: 'Instant', filter: c => c.types?.includes('Instant') },
    { id: 'action', label: 'Action', filter: c => c.types?.includes('Action') && !c.types?.some(t => t.includes('Attack')) },
  ],
  rarity: [
    { id: 'common', label: 'Common', filter: c => c.rarity === 'Common' || c.rarities?.includes('C') },
    { id: 'rare', label: 'Rare', filter: c => c.rarity === 'Rare' || c.rarities?.includes('R') },
    { id: 'majestic', label: 'Majestic', filter: c => c.rarity === 'Majestic' || c.rarities?.includes('M') },
    { id: 'legendary', label: 'Legendary', filter: c => c.rarity === 'Legendary' || c.rarities?.includes('L') },
  ],
  cost: [
    { id: 'cost0', label: 'Cost 0', filter: c => c.cost === 0 || c.cost === '0' },
    { id: 'cost1', label: 'Cost 1', filter: c => c.cost === 1 || c.cost === '1' },
    { id: 'cost2', label: 'Cost 2', filter: c => c.cost === 2 || c.cost === '2' },
    { id: 'cost3plus', label: 'Cost 3+', filter: c => (parseInt(c.cost) || 0) >= 3 },
  ],
  power: [
    { id: 'power3', label: 'Power 3+', filter: c => (parseInt(c.power) || 0) >= 3 },
    { id: 'power5', label: 'Power 5+', filter: c => (parseInt(c.power) || 0) >= 5 },
    { id: 'power7', label: 'Power 7+', filter: c => (parseInt(c.power) || 0) >= 7 },
  ],
  defense: [
    { id: 'defense2', label: 'Defense 2+', filter: c => (parseInt(c.defense) || 0) >= 2 },
    { id: 'defense3', label: 'Defense 3+', filter: c => (parseInt(c.defense) || 0) >= 3 },
  ],
};

// Load custom categories from localStorage
function getCategories() {
  const saved = localStorage.getItem('tcgdoku-admin-fab');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Re-attach filter functions based on IDs
      Object.keys(parsed).forEach(groupKey => {
        parsed[groupKey] = parsed[groupKey].map(cat => {
          // Find matching default category to get filter function
          const defaultGroup = CATEGORIES[groupKey];
          const defaultCat = defaultGroup?.find(d => d.id === cat.id);
          return {
            ...cat,
            filter: defaultCat?.filter || (() => false),
          };
        });
      });
      return parsed;
    } catch (e) {
      console.error('Error loading saved categories:', e);
    }
  }
  return CATEGORIES;
}

// Check if a card matches a category
function cardMatchesFilter(card, category) {
  if (typeof category.filter === 'function') {
    return category.filter(card);
  }
  return false;
}

// API Functions
export async function checkValidCardExists(cat1, cat2) {
  const cards = await loadCards();
  return cards.some(card => cardMatchesFilter(card, cat1) && cardMatchesFilter(card, cat2));
}

export async function autocompleteCards(query) {
  if (query.length < 2) return [];
  const cards = await loadCards();
  const lowerQuery = query.toLowerCase();
  return cards
    .filter(card => card.name?.toLowerCase().includes(lowerQuery))
    .slice(0, 10);
}

export async function getCardByName(name) {
  const cards = await loadCards();
  return cards.find(card => card.name?.toLowerCase() === name.toLowerCase());
}

export async function cardMatchesCategory(card, category) {
  return cardMatchesFilter(card, category);
}

export function getCardImage(card) {
  // Try to get image from printings
  if (card.printings && card.printings.length > 0) {
    const printing = card.printings[0];
    if (printing.image) return printing.image;
    // Construct image URL from set and identifier
    if (printing.identifier) {
      return `https://storage.googleapis.com/fabmaster/cardfaces/${printing.identifier}.png`;
    }
  }
  // Fallback to card identifier
  if (card.identifier) {
    return `https://storage.googleapis.com/fabmaster/cardfaces/${card.identifier}.png`;
  }
  return null;
}

export function getCardDisplayInfo(card) {
  return {
    name: card.name,
    set: card.printings?.[0]?.set || card.set_printings?.[0] || '',
  };
}

// Get all categories for puzzle generation
export function getAllCategories() {
  const cats = getCategories();
  return [
    ...((cats.classes || []).slice(0, 6)),
    ...(cats.pitch || []),
    ...(cats.types || []),
    ...(cats.rarity || []).slice(0, 3),
    ...(cats.cost || []).slice(0, 3),
  ];
}

// Fallback categories guaranteed to work
export function getFallbackCategories() {
  return {
    rowCategories: [CATEGORIES.classes[0], CATEGORIES.classes[1], CATEGORIES.classes[2]],
    colCategories: [CATEGORIES.pitch[0], CATEGORIES.pitch[1], CATEGORIES.pitch[2]],
  };
}

// Preload cards on module load
loadCards();

// Config export
export const config = {
  id: 'fab',
  name: 'Flesh and Blood',
  shortName: 'FABDoku',
  accentColor: '#dc3545',
  emoji: '⚔️',
};