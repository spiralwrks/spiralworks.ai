# Spiral Works Website

## Technology Stack

- **Frontend**: React 18 with React Router DOM 6
- **Styling**: Styled Components + CSS
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: GSAP + Framer Motion
- **Blog**: React Markdown with GFM, Math (KaTeX), and Raw HTML support
- **Deployment**: GitHub Pages

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/spiralwrks/spiralworks.ai.git
   cd spiralworks.ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000` to view the website.

## Available Scripts

### Development
- `npm start`: Start development server (runs on localhost:3000 with source maps disabled)
- `npm test`: Run Jest tests
- `npm run build`: Build for production (source maps disabled)

### Blog Management
- `npm run sync-blog`: Sync blog content from external sources
- `npm run predeploy`: Full deployment prep (sync blog + build)
- `npm run deploy`: Deploy to GitHub Pages

## Core Structure
```
src/
├── components/           # React components
│   ├── Blog/            # Blog system components
│   ├── Galaxy.js        # Three.js galaxy background
│   ├── Home.js          # Landing page
│   └── Layout.js        # Main layout wrapper
├── styles/              # CSS files
├── utils/
│   └── spiral.js        # Three.js galaxy generation
└── assets/fonts/        # Custom Chillax font family
```

## Deployment

The site automatically deploys to GitHub Pages. For manual deployment:

```bash
npm run predeploy  # Sync blog content and build
npm run deploy     # Deploy to GitHub Pages
```

