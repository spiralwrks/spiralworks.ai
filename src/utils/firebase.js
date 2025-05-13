import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Access control variables
const ADMIN_EMAIL_DOMAIN = process.env.REACT_APP_ADMIN_EMAIL_DOMAIN || 'spiralworks.ai';
const ADMIN_AUTH_ENABLED = process.env.REACT_APP_ADMIN_AUTH_ENABLED === 'true';

export { db, auth, functions, ADMIN_EMAIL_DOMAIN, ADMIN_AUTH_ENABLED };