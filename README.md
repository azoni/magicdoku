# TCGDoku

Daily trading card game puzzles. Guess cards that match both the row and column criteria!

## Supported Games

### Magic: The Gathering (MTGDoku)
- **API**: [Scryfall](https://scryfall.com/docs/api)
- **Categories**: Colors, card types, creature types, mana value, rarity, keywords, power/toughness

### Flesh and Blood (FABDoku)
- **API**: [FaBDB](https://fabdb.net)
- **Categories**: Classes, pitch values, card types, rarity, cost, keywords

## How It Works

- Every day, a new puzzle is generated using a seeded random number based on the date
- The grid has 3 row categories and 3 column categories
- Players must name cards that match both criteria for each cell
- Card validation is done via each game's respective API
- Progress is saved to localStorage
- Share your results with friends!

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Deploy to Netlify

### Option 1: GitHub Integration
1. Push this repo to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Build settings are auto-detected from `netlify.toml`
6. Click "Deploy site"

### Option 2: Drag and Drop
1. Run `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `build` folder to deploy

## Adding New Games

1. Create a new file in `src/games/` (e.g., `pokemon.js`)
2. Export the required functions:
   - `CATEGORIES` - Category definitions
   - `checkValidCardExists(cat1, cat2)` - Validate card exists for categories
   - `autocompleteCards(query)` - Search for cards
   - `getCardByName(name)` - Get card details
   - `cardMatchesCategory(card, category)` - Check if card matches
   - `getCardImage(card)` - Get card image URL
   - `getCardDisplayInfo(card)` - Get display name/set
   - `getAllCategories()` - All categories for puzzle generation
   - `getFallbackCategories()` - Guaranteed valid categories
   - `config` - Game config (id, name, shortName, accentColor, emoji)
3. Import and add to `games` object in `App.js`
4. Add styling for the new game in `index.css`

## Tech Stack

- React 18
- React Router 6
- Scryfall API (MTG)
- FaBDB API (FAB)
- CSS (no external UI libraries)
- localStorage for persistence

## Credits

- MTG card data from [Scryfall](https://scryfall.com)
- FAB card data from [FaBDB](https://fabdb.net)

## License

MIT
