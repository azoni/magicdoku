# Magicdoku

A daily Magic: The Gathering puzzle game inspired by Pokedoku. Guess cards that match both the row and column criteria!

## How It Works

- Every day, a new puzzle is generated using a seeded random number based on the date
- The grid has 3 row categories and 3 column categories (colors, card types, creature types, mana values, etc.)
- Players must name MTG cards that match both criteria for each cell
- Card validation is done via the [Scryfall API](https://scryfall.com/docs/api)
- Progress is saved to localStorage, so you can come back and finish later
- Share your results with friends!

## Categories Include

- **Colors**: White, Blue, Black, Red, Green, Colorless, Multicolor
- **Card Types**: Creature, Instant, Sorcery, Enchantment, Artifact, Planeswalker, Land
- **Creature Types**: Human, Elf, Goblin, Zombie, Dragon, Angel, Demon, Vampire, Wizard, etc.
- **Mana Value**: MV=0, MV=1, MV=2, MV=3, MV≥4, MV≥6
- **Rarity**: Common, Uncommon, Rare, Mythic
- **Keywords**: Flying, Trample, Deathtouch, Lifelink, Haste, Vigilance, First Strike, Flash
- **Stats**: Power ≥ 4, Power = 1, Toughness ≥ 5, Toughness = 1

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

### Option 1: Drag and Drop
1. Run `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `build` folder to deploy

### Option 2: GitHub Integration
1. Push this repo to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repo
5. Build settings are auto-detected from `netlify.toml`
6. Click "Deploy site"

### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Tech Stack

- React 18
- Scryfall API for card data
- CSS (no external UI libraries)
- localStorage for game state persistence

## Credits

- Card data from [Scryfall](https://scryfall.com)
- Inspired by [Pokedoku](https://pokedoku.com)

## License

MIT
