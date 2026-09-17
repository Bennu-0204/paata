# PAATA - Setup Guide

## What's Included

✅ Clean Next.js project  
✅ Jio Saavn API integration  
✅ Professional UI design  
✅ Responsive for all devices  
✅ Ready for Netlify deployment  

## Quick Start

### Step 1: Local Testing (Optional)
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`

### Step 2: Push to GitHub

1. Create new GitHub repo (public or private)
2. Clone locally or upload files:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/paata.git
git push -u origin main
```

### Step 3: Deploy to Netlify

1. Go to https://netlify.com
2. Sign up/login
3. Click **"New site from Git"**
4. Select your GitHub repo
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Click **Deploy**

Done! Your app is live.

## Project Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main player UI |
| `app/api/search/route.ts` | Search endpoint |
| `lib/jiosaavn.ts` | Jio Saavn API logic |
| `app/globals.css` | All styling |
| `netlify.toml` | Netlify config |
| `package.json` | Dependencies |

## What Each Part Does

**Frontend** (app/page.tsx)
- Search bar
- Results grid with song cards
- Floating player at bottom
- Play/Pause controls

**API** (app/api/search/)
- Receives search query
- Calls Jio Saavn
- Returns songs, albums, playlists

**Styles** (globals.css)
- Dark theme with cyan accents
- Gradient background
- Responsive grid
- Hover effects

## Customization Ideas

### Change Colors
Edit `app/globals.css`:
```css
/* Change cyan (#00d4ff) to your color */
/* Change gradients in .header, .play-btn */
```

### Change Player Name
Edit `app/page.tsx`:
```jsx
<h1>PAATA</h1>  // Change here
```

### Add More Sections
Edit `app/page.tsx` to add:
- Recently played
- Trending songs
- Saved playlists

## Troubleshooting

**Issue**: "npm install fails"  
**Solution**: Delete `package-lock.json` and try again

**Issue**: "Songs don't play"  
**Solution**: Some songs may not have playable URLs due to licensing

**Issue**: "Search returns no results"  
**Solution**: Make sure query has at least 2 characters

## Need Help?

- Check `README.md` for more info
- Netlify has great docs at https://docs.netlify.com
- Next.js docs: https://nextjs.org/docs
