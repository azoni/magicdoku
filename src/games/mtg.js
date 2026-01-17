// MTG Game Configuration
// Uses Scryfall API

const SCRYFALL_SEARCH = 'https://api.scryfall.com/cards/search';
const SCRYFALL_AUTOCOMPLETE = 'https://api.scryfall.com/cards/autocomplete';
const SCRYFALL_NAMED = 'https://api.scryfall.com/cards/named';

// Rate limiting
let lastRequest = 0;
const MIN_REQUEST_INTERVAL = 100;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequest;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequest = Date.now();
  return fetch(url);
}

// Default Categories
export const CATEGORIES = {
  colors: [
    { id: 'white', label: 'White', query: 'c:w', colorClass: 'color-W', group: 'colors' },
    { id: 'blue', label: 'Blue', query: 'c:u', colorClass: 'color-U', group: 'colors' },
    { id: 'black', label: 'Black', query: 'c:b', colorClass: 'color-B', group: 'colors' },
    { id: 'red', label: 'Red', query: 'c:r', colorClass: 'color-R', group: 'colors' },
    { id: 'green', label: 'Green', query: 'c:g', colorClass: 'color-G', group: 'colors' },
    { id: 'colorless', label: 'Colorless', query: 'c:c', colorClass: 'color-C', group: 'colors' },
    { id: 'multicolor', label: 'Multicolor', query: 'c>=2', colorClass: 'color-M', group: 'colors' },
  ],
  types: [
    { id: 'creature', label: 'Creature', query: 't:creature', group: 'types' },
    { id: 'instant', label: 'Instant', query: 't:instant', group: 'types' },
    { id: 'sorcery', label: 'Sorcery', query: 't:sorcery', group: 'types' },
    { id: 'enchantment', label: 'Enchantment', query: 't:enchantment', group: 'types' },
    { id: 'artifact', label: 'Artifact', query: 't:artifact', group: 'types' },
    { id: 'planeswalker', label: 'Planeswalker', query: 't:planeswalker', group: 'types' },
    { id: 'land', label: 'Land', query: 't:land', group: 'types' },
  ],
  creatureTypes: [
    { id: 'human', label: 'Human', query: 't:human', group: 'creatureTypes' },
    { id: 'elf', label: 'Elf', query: 't:elf', group: 'creatureTypes' },
    { id: 'goblin', label: 'Goblin', query: 't:goblin', group: 'creatureTypes' },
    { id: 'zombie', label: 'Zombie', query: 't:zombie', group: 'creatureTypes' },
    { id: 'dragon', label: 'Dragon', query: 't:dragon', group: 'creatureTypes' },
    { id: 'angel', label: 'Angel', query: 't:angel', group: 'creatureTypes' },
    { id: 'vampire', label: 'Vampire', query: 't:vampire', group: 'creatureTypes' },
    { id: 'wizard', label: 'Wizard', query: 't:wizard', group: 'creatureTypes' },
    { id: 'warrior', label: 'Warrior', query: 't:warrior', group: 'creatureTypes' },
    { id: 'spirit', label: 'Spirit', query: 't:spirit', group: 'creatureTypes' },
  ],
  manaValue: [
    { id: 'mv1', label: 'MV = 1', query: 'mv=1', group: 'manaValue' },
    { id: 'mv2', label: 'MV = 2', query: 'mv=2', group: 'manaValue' },
    { id: 'mv3', label: 'MV = 3', query: 'mv=3', group: 'manaValue' },
    { id: 'mv4plus', label: 'MV ≥ 4', query: 'mv>=4', group: 'manaValue' },
    { id: 'mv6plus', label: 'MV ≥ 6', query: 'mv>=6', group: 'manaValue' },
  ],
  rarity: [
    { id: 'common', label: 'Common', query: 'r:common', group: 'rarity' },
    { id: 'uncommon', label: 'Uncommon', query: 'r:uncommon', group: 'rarity' },
    { id: 'rare', label: 'Rare', query: 'r:rare', group: 'rarity' },
    { id: 'mythic', label: 'Mythic', query: 'r:mythic', group: 'rarity' },
  ],
  keywords: [
    { id: 'flying', label: 'Flying', query: 'keyword:flying', group: 'keywords' },
    { id: 'trample', label: 'Trample', query: 'keyword:trample', group: 'keywords' },
    { id: 'deathtouch', label: 'Deathtouch', query: 'keyword:deathtouch', group: 'keywords' },
    { id: 'lifelink', label: 'Lifelink', query: 'keyword:lifelink', group: 'keywords' },
    { id: 'haste', label: 'Haste', query: 'keyword:haste', group: 'keywords' },
    { id: 'flash', label: 'Flash', query: 'keyword:flash', group: 'keywords' },
  ],
  stats: [
    { id: 'power4plus', label: 'Power ≥ 4', query: 'pow>=4', group: 'stats' },
    { id: 'power1', label: 'Power = 1', query: 'pow=1', group: 'stats' },
    { id: 'toughness5plus', label: 'Toughness ≥ 5', query: 'tou>=5', group: 'stats' },
  ],
};

// Load custom categories - use localStorage cache, fallback to defaults
function getCategories() {
  const saved = localStorage.getItem('tcgdoku-categories-mtg');
  if (saved) {
    try {
      return JSON.parse(saved);
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
    const docRef = doc(db, 'categories', 'mtg');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().categories) {
      const data = docSnap.data().categories;
      localStorage.setItem('tcgdoku-categories-mtg', JSON.stringify(data));
      console.log('MTG categories loaded from Firebase');
    } else {
      console.log('No MTG categories in Firebase, using defaults');
    }
  } catch (error) {
    console.log('Firebase unavailable, using default categories');
  }
}

// Load on module init (non-blocking)
initCategories();

// API Functions
export async function checkValidCardExists(cat1, cat2) {
  const query = `${cat1.query} ${cat2.query}`;
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_SEARCH}?q=${encodeURIComponent(query)}&unique=cards`
    );
    const data = await response.json();
    return data.total_cards > 0;
  } catch (error) {
    console.error('Error checking card validity:', error);
    return false;
  }
}

export async function autocompleteCards(query) {
  if (query.length < 2) return [];
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_AUTOCOMPLETE}?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error with autocomplete:', error);
    return [];
  }
}

export async function getCardByName(name) {
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_NAMED}?exact=${encodeURIComponent(name)}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error getting card:', error);
    return null;
  }
}

export async function cardMatchesCategory(card, category) {
  const query = `!"${card.name}" ${category.query}`;
  try {
    const response = await rateLimitedFetch(
      `${SCRYFALL_SEARCH}?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.total_cards > 0;
  } catch (error) {
    return false;
  }
}

export function getCardImage(card) {
  // Use art_crop for cleaner grid display (just the artwork, no card frame)
  if (card.image_uris?.art_crop) return card.image_uris.art_crop;
  if (card.card_faces?.[0]?.image_uris?.art_crop) return card.card_faces[0].image_uris.art_crop;
  // Fallback to normal if art_crop unavailable
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
  return null;
}

export function getCardDisplayInfo(card) {
  return {
    name: card.name,
    set: card.set_name,
  };
}

// Get all categories for puzzle generation
export function getAllCategories() {
  const cats = getCategories();
  return [
    ...(cats.colors || []),
    ...(cats.types || []),
    ...(cats.creatureTypes || []),
    ...(cats.manaValue || []),
    ...(cats.rarity || []),
    ...(cats.keywords || []),
    ...(cats.stats || []),
  ];
}

// Fallback categories guaranteed to work
export function getFallbackCategories() {
  return {
    rowCategories: [CATEGORIES.colors[0], CATEGORIES.colors[1], CATEGORIES.colors[3]],
    colCategories: [CATEGORIES.types[0], CATEGORIES.types[3], CATEGORIES.types[4]],
  };
}

// Config export
export const config = {
  id: 'mtg',
  name: 'Magic: The Gathering',
  shortName: 'MTGDoku',
  accentColor: '#f8e45c',
  emoji: '🎴',
};