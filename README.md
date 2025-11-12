# Addison and Camryn's Fish in a Bowl

**Act it out, guess it fast - make some memories that last!**

A fun, interactive charades game for kids and families with 100 cards featuring activities, animals, and popular characters!

## Features

- 🎭 100 family-friendly charades cards
- ⭐ 3 difficulty levels (Easy, Medium, Hard)
- 💡 Helpful hints and acting suggestions for each card
- 🎨 Beautiful, colorful interface
- 📱 Fully responsive - works on phones, tablets, and computers
- 🔄 Random card selection with no repeats until deck is complete

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/fish-in-a-bowl.git
cd fish-in-a-bowl
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Deployment to Vercel

### Quick Deploy

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com)

3. Click "New Project"

4. Import your GitHub repository

5. Vercel will auto-detect it's a React app and configure everything

6. Click "Deploy"

That's it! Your game will be live in minutes.

### Manual Deployment

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy.

## How to Play

1. **Choose Difficulty**: Select Easy (⭐), Medium (⭐⭐), Hard (⭐⭐⭐), or All Cards
2. **Start Playing**: Click "Start Playing!"
3. **Act It Out**: One player draws a card and acts it out without talking
4. **Guess**: Other players try to guess what's being acted out
5. **Next Card**: Click "Next Card" when ready for a new challenge

## Project Structure

```
fish-in-a-bowl/
├── public/
│   └── index.html
├── src/
│   ├── data/
│   │   └── cards.js          # All 100 game cards
│   ├── App.js                # Main game component
│   ├── App.css               # Styles
│   ├── index.js              # Entry point
│   └── index.css
├── package.json
└── README.md
```

## Card Categories

### Actions & Activities (Cards 1-50)
- Daily activities (brushing teeth, eating pizza)
- Animals (cat, dog, monkey)
- Games and internet culture (Minecraft, Roblox, Skibidi Toilet)
- Physical activities (swimming, dancing, jumping)

### Characters & Pop Culture (Cards 51-100)
- Cartoon characters (Bluey, Peppa Pig)
- Movie characters (Elsa, Spider-Man, Mario)
- TV shows (Miraculous Ladybug, Steven Universe)
- Video game characters (Sonic, Pikachu)

## Customization

### Adding New Cards

Edit `src/data/cards.js` and add new card objects:

```javascript
{
  "id": 101,
  "name": "Your Card Name",
  "difficulty": 2,
  "definition": "Description and acting hints!"
}
```

### Changing Colors

Edit the CSS variables in `src/App.css` to customize the color scheme.

## Technologies Used

- React 18
- CSS3
- Create React App

## License

This project is open source and available for personal and educational use.

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

- Designed for family fun and kid-friendly entertainment
- Inspired by classic charades with modern pop culture references

---

Made with ❤️ for families and kids
