// Flesh and Blood Game Configuration
// Uses FaBDB API

const FABDB_API = 'https://api.fabdb.net';

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

// Categories
export const CATEGORIES = {
  classes: [
    { id: 'brute', label: 'Brute', query: 'class=brute', apiParam: { class: 'brute' } },
    { id: 'guardian', label: 'Guardian', query: 'class=guardian', apiParam: { class: 'guardian' } },
    { id: 'ninja', label: 'Ninja', query: 'class=ninja', apiParam: { class: 'ninja' } },
    { id: 'wizard', label: 'Wizard', query: 'class=wizard', apiParam: { class: 'wizard' } },
    { id: 'warrior', label: 'Warrior', query: 'class=warrior', apiParam: { class: 'warrior' } },
    { id: 'mechanologist', label: 'Mechanologist', query: 'class=mechanologist', apiParam: { class: 'mechanologist' } },
    { id: 'runeblade', label: 'Runeblade', query: 'class=runeblade', apiParam: { class: 'runeblade' } },
    { id: 'ranger', label: 'Ranger', query: 'class=ranger', apiParam: { class: 'ranger' } },
    { id: 'illusionist', label: 'Illusionist', query: 'class=illusionist', apiParam: { class: 'illusionist' } },
    { id: 'generic', label: 'Generic', query: 'class=generic', apiParam: { class: 'generic' } },
  ],
  pitch: [
    { id: 'pitch1', label: 'Pitch 1 (Red)', query: 'pitch=1', apiParam: { pitch: '1' }, colorClass: 'pitch-1' },
    { id: 'pitch2', label: 'Pitch 2 (Yellow)', query: 'pitch=2', apiParam: { pitch: '2' }, colorClass: 'pitch-2' },
    { id: 'pitch3', label: 'Pitch 3 (Blue)', query: 'pitch=3', apiParam: { pitch: '3' }, colorClass: 'pitch-3' },
  ],
  types: [
    { id: 'attack', label: 'Attack Action', query: 'keywords=attack', apiParam: { keywords: 'attack action' } },
    { id: 'defense', label: 'Defense Reaction', query: 'keywords=defense', apiParam: { keywords: 'defense reaction' } },
    { id: 'instant', label: 'Instant', query: 'keywords=instant', apiParam: { keywords: 'instant' } },
    { id: 'action', label: 'Action', query: 'keywords=action', apiParam: { keywords: 'action' } },
  ],
  rarity: [
    { id: 'common', label: 'Common', query: 'rarity=C', apiParam: { rarity: 'C' } },
    { id: 'rare', label: 'Rare', query: 'rarity=R', apiParam: { rarity: 'R' } },
    { id: 'majestic', label: 'Majestic', query: 'rarity=M', apiParam: { rarity: 'M' } },
  ],
  keywords: [
    { id: 'goAgain', label: 'Go Again', query: 'keywords=go again', apiParam: { keywords: 'go again' } },
    { id: 'dominate', label: 'Dominate', query: 'keywords=dominate', apiParam: { keywords: 'dominate' } },
    { id: 'intimidate', label: 'Intimidate', query: 'keywords=intimidate', apiParam: { keywords: 'intimidate' } },
  ],
  cost: [
    { id: 'cost0', label: 'Cost 0', query: 'cost=0', apiParam: { cost: '0' } },
    { id: 'cost1', label: 'Cost 1', query: 'cost=1', apiParam: { cost: '1' } },
    { id: 'cost2', label: 'Cost 2', query: 'cost=2', apiParam: { cost: '2' } },
    { id: 'cost3plus', label: 'Cost 3+', query: 'cost=3', apiParam: { cost: '3' } },
  ],
};

// Build query string from category
function buildQueryString(cat1, cat2) {
  const params = new URLSearchParams();
  
  // Helper to add params
  const addParams = (cat) => {
    if (cat.apiParam) {
      Object.entries(cat.apiParam).forEach(([key, value]) => {
        // Keywords need special handling - combine them
        if (key === 'keywords' && params.has('keywords')) {
          params.set('keywords', params.get('keywords') + ' ' + value);
        } else {
          params.set(key, value);
        }
      });
    }
  };
  
  addParams(cat1);
  addParams(cat2);
  
  return params.toString();
}

// API Functions
export async function checkValidCardExists(cat1, cat2) {
  const queryString = buildQueryString(cat1, cat2);
  try {
    const response = await rateLimitedFetch(
      `${FABDB_API}/cards?${queryString}&per_page=1`
    );
    const data = await response.json();
    return data.data && data.data.length > 0;
  } catch (error) {
    console.error('Error checking card validity:', error);
    return false;
  }
}

export async function autocompleteCards(query) {
  if (query.length < 2) return [];
  try {
    const response = await rateLimitedFetch(
      `${FABDB_API}/cards?keywords=${encodeURIComponent(query)}&per_page=10`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error with search:', error);
    return [];
  }
}

export async function getCardByName(name) {
  // For FAB, we already have the full card from autocomplete
  // This is just for compatibility with the interface
  return name; // The card object is already passed
}

export async function cardMatchesCategory(card, category) {
  // Check if card matches the category by searching with card name + category filters
  const cardName = typeof card === 'string' ? card : card.name;
  
  try {
    const params = new URLSearchParams();
    params.set('keywords', cardName);
    
    if (category.apiParam) {
      Object.entries(category.apiParam).forEach(([key, value]) => {
        if (key === 'keywords') {
          // Add to existing keywords
          params.set('keywords', cardName + ' ' + value);
        } else {
          params.set(key, value);
        }
      });
    }
    
    const response = await rateLimitedFetch(
      `${FABDB_API}/cards?${params.toString()}&per_page=10`
    );
    const data = await response.json();
    
    // Check if our card is in the results
    if (data.data) {
      return data.data.some(c => 
        c.name.toLowerCase() === cardName.toLowerCase() ||
        c.name.toLowerCase().includes(cardName.toLowerCase())
      );
    }
    return false;
  } catch (error) {
    console.error('Error checking card match:', error);
    return false;
  }
}

export function getCardImage(card) {
  // FaBDB returns image URL directly
  return card.image || null;
}

export function getCardDisplayInfo(card) {
  return {
    name: card.name,
    set: card.printings?.[0]?.set?.name || '',
  };
}

// Get all categories for puzzle generation
export function getAllCategories() {
  return [
    ...CATEGORIES.classes.slice(0, 6), // Limit to most common classes
    ...CATEGORIES.pitch,
    ...CATEGORIES.types,
    ...CATEGORIES.rarity,
    ...CATEGORIES.cost.slice(0, 3),
  ];
}

// Fallback categories guaranteed to work
export function getFallbackCategories() {
  return {
    rowCategories: [CATEGORIES.classes[0], CATEGORIES.classes[1], CATEGORIES.classes[2]],
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
