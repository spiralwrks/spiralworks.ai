# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Start development server (runs on localhost:3000 with source maps disabled)
- `npm run build` - Build for production (source maps disabled)
- `npm test` - Run Jest tests
- `npm run sync-blog` - Sync blog content from external sources
- `npm run predeploy` - Full deployment prep (sync blog + build)
- `npm run deploy` - Deploy to GitHub Pages

### Blog Management
- Blog functionality is currently disabled in routing but components exist
- Use `npm run sync-blog` to pull blog content via `scripts/syncBlogContent.js`
- Blog components are in `src/components/Blog/` but commented out in routing

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with React Router DOM 6 for routing
- **Styling**: Styled Components + CSS with theme system (light/dark modes)
- **3D Graphics**: Three.js with React Three Fiber for galaxy animations
- **Animations**: GSAP + Framer Motion for UI animations
- **Deployment**: GitHub Pages

### Key Components Structure
```
src/
├── components/           # React components
│   ├── Blog/            # Blog system (currently disabled)
│   ├── Galaxy.js        # Three.js galaxy background
│   ├── Home.js          # Landing page
│   ├── Layout.js        # Main layout wrapper
│   └── [UI components]  # ScrollReveal, StarBorder, Stepper
├── context/
│   └── ThemeContext.js  # Global theme management (light/dark)
├── styles/              # CSS files with theme variables
├── utils/
│   └── spiral.js        # Three.js galaxy generation utilities
└── assets/fonts/        # Custom Chillax font family
```

### Routing Architecture
- Uses HashRouter for GitHub Pages compatibility
- Main routes: `/` (Home), `/about` (About page)
- Blog routes exist but are commented out
- All routes wrapped in Layout component with ThemeProvider

### Three.js Galaxy System
- Custom galaxy generation in `src/utils/spiral.js`
- Mobile-responsive particle counts (45k mobile, 90k desktop)
- Object pooling for performance
- Automatic cleanup and resize handling
- Spiral galaxy with 12 branches, color gradients, and rotation animation

### Theme System
- Context-based theme management (ThemeContext)
- CSS custom properties for theme variables
- Persistent theme preference in localStorage
- Default theme is dark mode

## Important Development Notes

### Performance Optimizations
- Source maps disabled in production (`GENERATE_SOURCEMAP=false`)
- Mobile-optimized Three.js parameters
- Object pooling for 3D graphics
- Pixel ratio capping for high-DPI displays

### Font System
- Custom Chillax font family in `src/assets/fonts/`
- CSS imports in `src/styles/chillax.css`

## Typical Development Workflow
1. `npm start` for development
3. `npm run sync-blog` when updating blog content
4. `npm run build` before deployment
5. Use `npm run deploy` for GitHub Pages deployment

