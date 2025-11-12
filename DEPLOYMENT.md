# Deployment Guide - Addison and Camryn's Fish in a Bowl

## Deploy to Vercel (Recommended - Easiest!)

Vercel is the easiest way to deploy React apps. It's free and takes just a few minutes.

### Step 1: Push to GitHub

1. Go to [GitHub](https://github.com) and create a new repository called "fish-in-a-bowl"

2. In your project folder, run:
```bash
git init
git add .
git commit -m "Initial commit - Fish in a Bowl"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fish-in-a-bowl.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)

2. Sign up or log in (you can use your GitHub account)

3. Click "Add New..." → "Project"

4. Click "Import" next to your fish-in-a-bowl repository

5. Vercel will automatically detect it's a React app:
   - Framework Preset: Create React App
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: build

6. Click "Deploy"

7. Wait 1-2 minutes and your game is live! 🎉

You'll get a URL like: `https://fish-in-a-bowl.vercel.app`

### Step 3: Custom Domain (Optional)

1. In Vercel dashboard, go to your project

2. Click "Settings" → "Domains"

3. Add your custom domain or use the free Vercel domain

## Deploy to Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)

2. Sign up or log in

3. Click "Add new site" → "Import an existing project"

4. Connect to your GitHub repository

5. Configure:
   - Build command: `npm run build`
   - Publish directory: `build`

6. Click "Deploy"

## Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
"homepage": "https://YOUR_USERNAME.github.io/fish-in-a-bowl",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```bash
npm run deploy
```

4. Enable GitHub Pages in repository settings (source: gh-pages branch)

## Local Development

Before deploying, you can test locally:

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Troubleshooting

### Build fails on Vercel/Netlify
- Make sure all dependencies are in package.json
- Check Node version (should be 14+)
- Clear cache and redeploy

### Cards not showing
- Check browser console for errors
- Verify cards.js is in src/data/ folder
- Check import statement in App.js

### Styling issues
- Clear browser cache
- Check that all CSS files are imported
- Verify responsive breakpoints

## Environment Variables

This project doesn't use environment variables, but if you add any:

1. In Vercel: Settings → Environment Variables
2. In Netlify: Site settings → Build & deploy → Environment

## Updates

To update your deployed site:

1. Make changes locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Update game"
git push
```

3. Vercel/Netlify will automatically redeploy!

## Performance Tips

- The app is already optimized for production builds
- Consider adding service worker for offline support
- Images should be optimized (currently using emoji - perfect!)
- Bundle size is minimal (~50KB gzipped)

## Monitoring

Both Vercel and Netlify provide:
- Analytics
- Performance monitoring
- Build logs
- Error tracking

Access these in your dashboard.

---

Need help? Check the README.md or create an issue on GitHub!
