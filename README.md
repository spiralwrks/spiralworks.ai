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

### Public Beta Waitlist System

The website includes a secure public beta waitlist signup system with the following features:

- Secure form submission with CSRF protection
- Server-side validation of all inputs
- Rate limiting to prevent abuse
- Discord webhook notifications for new signups
- Fallback mechanisms for high availability
- Firestore database storage for waitlist entries

### Admin Functionality

Admin users can manage the waitlist through a secure interface with:

- Role-based access control tied to email domains (@spiralworks.ai)
- Secure API endpoints with proper authentication
- Comprehensive audit logging of all admin actions
- Encrypted tokens for secure sessions
- Two-factor confirmation for destructive operations
- API endpoints for listing, deleting, and managing waitlist entries

### Security Measures

The application implements multiple layers of security:

- Firebase Authentication for admin access
- Firestore security rules for database protection
- Server-side validation of all requests
- CSRF protection for form submissions
- Rate limiting at both client and server levels
- Secure webhook notifications
- Audit logging for security events
- IP address tracking for abuse prevention
- Required domain verification for admin access

### API Endpoints

The backend provides the following secure endpoints:

- **Public endpoints**:
  - `POST /api/waitlist/signup` - Submit waitlist entry
  - Cloud callable function `submitWaitlistEntry` - Alternative submission method

- **Admin-only endpoints** (requires authentication):
  - `GET /api/admin/waitlist` - List all waitlist entries
  - `DELETE /api/admin/waitlist/:entryId` - Delete a specific entry
  - `POST /api/admin/waitlist/clear-all` - Clear all entries (requires confirmation)

## Firebase Configuration

This project uses Firebase for authentication, database, and cloud functions:

1. Create a Firebase project at https://console.firebase.google.com/
2. Upgrade to Blaze (pay-as-you-go) plan - required for Cloud Functions
3. Initialize Firebase in your project:
   ```bash
   firebase login
   firebase init
   ```
   Select Firestore and Functions when prompted

4. Set up Firestore Database:
   - Create the following collections:
     - `waitlist` - For storing waitlist entries
     - `rateLimits` - For tracking rate limiting
     - `adminAuditLogs` - For tracking admin actions

5. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

6. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

7. Set up Authentication:
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Add admin users with @spiralworks.ai email domain

## Discord Webhook Integration

For waitlist signup notifications:

1. Create a Discord server or use an existing one
2. Create a webhook in your desired channel (Server Settings → Integrations → Webhooks)
3. Add the webhook URL to your `.env` file as `REACT_APP_DISCORD_WEBHOOK_URL`

