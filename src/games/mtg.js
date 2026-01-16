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
    { id: 'white', label: 'White', query: 'c:w', colorClass: 'color-W' },
    { id: 'blue', label: 'Blue', query: 'c:u', colorClass: 'color-U' },
    { id: 'black', label: 'Black', query: 'c:b', colorClass: 'color-B' },
    { id: 'red', label: 'Red', query: 'c:r', colorClass: 'color-R' },
    { id: 'green', label: 'Green', query: 'c:g', colorClass: 'color-G' },
    { id: 'colorless', label: 'Colorless', query: 'c:c', colorClass: 'color-C' },
    { id: 'multicolor', label: 'Multicolor', query: 'c>=2', colorClass: 'color-M' },
  ],
  types: [
    { id: 'creature', label: 'Creature', query: 't:creature' },
    { id: 'instant', label: 'Instant', query: 't:instant' },
    { id: 'sorcery', label: 'Sorcery', query: 't:sorcery' },
    { id: 'enchantment', label: 'Enchantment', query: 't:enchantment' },
    { id: 'artifact', label: 'Artifact', query: 't:artifact' },
    { id: 'planeswalker', label: 'Planeswalker', query: 't:planeswalker' },
    { id: 'land', label: 'Land', query: 't:land' },
  ],
  creatureTypes: [
    { id: 'human', label: 'Human', query: 't:human' },
    { id: 'elf', label: 'Elf', query: 't:elf' },
    { id: 'goblin', label: 'Goblin', query: 't:goblin' },
    { id: 'zombie', label: 'Zombie', query: 't:zombie' },
    { id: 'dragon', label: 'Dragon', query: 't:dragon' },
    { id: 'angel', label: 'Angel', query: 't:angel' },
    { id: 'vampire', label: 'Vampire', query: 't:vampire' },
    { id: 'wizard', label: 'Wizard', query: 't:wizard' },
    { id: 'warrior', label: 'Warrior', query: 't:warrior' },
    { id: 'spirit', label: 'Spirit', query: 't:spirit' },
  ],
  manaValue: [
    { id: 'mv1', label: 'MV = 1', query: 'mv=1' },
    { id: 'mv2', label: 'MV = 2', query: 'mv=2' },
    { id: 'mv3', label: 'MV = 3', query: 'mv=3' },
    { id: 'mv4plus', label: 'MV ≥ 4', query: 'mv>=4' },
    { id: 'mv6plus', label: 'MV ≥ 6', query: 'mv>=6' },
  ],
  rarity: [
    { id: 'common', label: 'Common', query: 'r:common' },
    { id: 'uncommon', label: 'Uncommon', query: 'r:uncommon' },
    { id: 'rare', label: 'Rare', query: 'r:rare' },
    { id: 'mythic', label: 'Mythic', query: 'r:mythic' },
  ],
  keywords: [
    { id: 'flying', label: 'Flying', query: 'keyword:flying' },
    { id: 'trample', label: 'Trample', query: 'keyword:trample' },
    { id: 'deathtouch', label: 'Deathtouch', query: 'keyword:deathtouch' },
    { id: 'lifelink', label: 'Lifelink', query: 'keyword:lifelink' },
    { id: 'haste', label: 'Haste', query: 'keyword:haste' },
    { id: 'flash', label: 'Flash', query: 'keyword:flash' },
  ],
  stats: [
    { id: 'power4plus', label: 'Power ≥ 4', query: 'pow>=4' },
    { id: 'power1', label: 'Power = 1', query: 'pow=1' },
    { id: 'toughness5plus', label: 'Toughness ≥ 5', query: 'tou>=5' },
  ],
};

// Load custom categories from localStorage
function getCategories() {
  const saved = localStorage.getItem('tcgdoku-admin-mtg');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved categories:', e);
    }
  }
  return CATEGORIES;
}

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
  if (card.image_uris?.small) return card.image_uris.small;
  if (card.card_faces?.[0]?.image_uris?.small) return card.card_faces[0].image_uris.small;
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