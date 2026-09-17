# PAATA - Music Player

A modern, professional music player built with Next.js and Jio Saavn API.

## Features

- 🎵 Search and play music from Jio Saavn
- 🎨 Clean, professional UI
- 📱 Fully responsive design
- ⚡ Fast and lightweight
- 🔧 Easy to deploy on Netlify

## Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone/Download this project**
```bash
git clone <your-repo>
cd paata
```

2. **Install dependencies**
```bash
npm install
```

3. **Run locally**
```bash
npm run dev
```
Open `http://localhost:3000` in your browser

4. **Build for production**
```bash
npm run build
npm start
```

## Deploy on Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repo
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Click Deploy

That's it! Your music player is live.

## File Structure

```
paata/
├── app/
│   ├── api/search/route.ts    # Search endpoint
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page
│   └── globals.css             # Global styles
├── lib/
│   └── jiosaavn.ts             # Jio Saavn API integration
├── package.json
├── next.config.js
├── tsconfig.json
├── netlify.toml                # Netlify config
└── README.md
```

## Technologies

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS3
- **API**: Jio Saavn
- **Hosting**: Netlify

## Notes

- Audio streaming requires a valid Jio Saavn API response
- Some songs may not have playable URLs depending on licensing
- The app respects Jio Saavn's terms of service

## License

MIT
