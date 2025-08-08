# Spiral Works Website

A React-based website for Spiral Works.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/spiralwrks/spiralworks.ai.git
   git checkout react
   cd spiralworks.ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env to add your Firebase and Discord webhook configurations
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:3000` to view the website.

## Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.
- `npm run deploy`: Deploys the app and Firebase functions.
- `firebase serve`: Runs Firebase function emulators locally.

## Deployment

Push to github:
```shell
$ git add .
$ git commit -m "commit msg"
$ git push -u origin main
```

## Project Structure

- `src/components`: React components
- `src/styles`: CSS stylesheets
- `src/assets`: Images and other static assets
- `src/utils`: Utility functions and service modules
- `src/context`: React context providers
- `functions`: Firebase Cloud Functions for secure backend operations

## Features


