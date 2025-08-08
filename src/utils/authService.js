import { auth, ADMIN_EMAIL_DOMAIN, ADMIN_AUTH_ENABLED, isFirebaseConfigured } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import CryptoJS from 'crypto-js';

// Authentication state
let currentUser = null;
let isAdmin = false;
let adminToken = null;
const authStateListeners = new Set();

// Security constants
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const ADMIN_TOKEN_KEY = 'spiralworks_admin_token';

/**
 * Initialize authentication listener
 * Sets up Firebase auth state listener and manages admin validation
 */
export const initAuth = () => {
  // Check for existing admin token in localStorage
  tryLoadAdminToken();
  
  // Only set up Firebase auth state listener if configured
  if (isFirebaseConfigured() && auth) {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      isAdmin = validateAdminStatus(user);
      notifyAuthStateListeners();
    });
  } else {
    console.log('Firebase auth not configured - authentication features disabled');
  }
};

/**
 * Sign in with email and password
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise<Object>} Authentication result
 */
export const signIn = async (email, password) => {
  if (!isFirebaseConfigured() || !auth) {
    return { 
      success: false, 
      error: 'Firebase not configured - authentication unavailable' 
    };
  }
  
  try {
    // Remove any existing tokens
    clearAdminToken();
    
    // Attempt Firebase authentication
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Validate admin status
    if (result.user) {
      const adminStatus = validateAdminStatus(result.user);
      
      // Generate and store encrypted admin token if admin
      if (adminStatus) {
        generateAdminToken(result.user);
      }
      
      return {
        success: true,
        isAdmin: adminStatus,
        user: {
          email: result.user.email,
          displayName: result.user.displayName,
          uid: result.user.uid
        }
      };
    }
    
    return { success: false, error: 'Invalid user data' };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      success: false, 
      error: error.message || 'Authentication failed',
      code: error.code
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<boolean>} Sign out success
 */
export const signOut = async () => {
  if (!isFirebaseConfigured() || !auth) {
    clearAdminToken();
    return true;
  }
  
  try {
    await firebaseSignOut(auth);
    clearAdminToken();
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
};

/**
 * Get the current authentication state
 * @returns {Object} Auth state object with user and admin status
 */
export const getAuthState = () => {
  return {
    isAuthenticated: !!currentUser,
    isAdmin,
    user: currentUser ? {
      email: currentUser.email,
      displayName: currentUser.displayName,
      uid: currentUser.uid
    } : null
  };
};

/**
 * Subscribe to auth state changes
 * @param {Function} listener Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAuthState = (listener) => {
  authStateListeners.add(listener);
  
  // Immediately notify with current state
  listener(getAuthState());
  
  // Return unsubscribe function
  return () => {
    authStateListeners.delete(listener);
  };
};

/**
 * Request password reset email
 * @param {string} email User email
 * @returns {Promise<Object>} Reset request result
 */
export const resetPassword = async (email) => {
  if (!isFirebaseConfigured() || !auth) {
    return { 
      success: false, 
      error: 'Firebase not configured - password reset unavailable' 
    };
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error.message || 'Password reset failed',
      code: error.code
    };
  }
};

/**
 * Get admin token for API requests
 * @returns {string|null} Encrypted admin token or null if not admin
 */
export const getAdminToken = () => {
  if (!isAdmin || !adminToken) {
    return null;
  }
  
  return adminToken;
};

// Private helper functions

/**
 * Validate if user has admin privileges
 * @param {Object} user Firebase user object
 * @returns {boolean} Is user an admin
 */
const validateAdminStatus = (user) => {
  // If admin auth is disabled, no users are admins
  if (!ADMIN_AUTH_ENABLED) {
    return false;
  }
  
  // No user, no admin
  if (!user) {
    return false;
  }
  
  // Verify user email belongs to admin domain
  const emailDomain = user.email.split('@')[1];
  if (emailDomain !== ADMIN_EMAIL_DOMAIN) {
    return false;
  }
  
  // In a real implementation, you would check custom claims or a roles collection
  // For the sake of simplicity, we're just using the email domain check
  
  return true;
};

/**
 * Generate encrypted admin token
 * @param {Object} user Firebase user object
 */
const generateAdminToken = (user) => {
  if (!user) return;
  
  const timestamp = Date.now();
  const expiry = timestamp + TOKEN_EXPIRY;
  
  // Create token with user ID, timestamp, and expiry
  const tokenData = {
    uid: user.uid,
    email: user.email,
    timestamp,
    expiry
  };
  
  // Encrypt token with encryption key
  const encryptedToken = CryptoJS.AES.encrypt(
    JSON.stringify(tokenData),
    process.env.REACT_APP_ENCRYPTION_KEY || 'temp-key'
  ).toString();
  
  // Store token in localStorage and memory
  localStorage.setItem(ADMIN_TOKEN_KEY, encryptedToken);
  adminToken = encryptedToken;
};

/**
 * Try to load admin token from localStorage
 */
const tryLoadAdminToken = () => {
  const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  
  if (!storedToken) {
    return;
  }
  
  try {
    // Decrypt token
    const bytes = CryptoJS.AES.decrypt(
      storedToken,
      process.env.REACT_APP_ENCRYPTION_KEY || 'temp-key'
    );
    
    const decryptedToken = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    // Check if token is expired
    if (decryptedToken.expiry < Date.now()) {
      clearAdminToken();
      return;
    }
    
    // Store token in memory
    adminToken = storedToken;
  } catch (error) {
    console.error('Error loading admin token:', error);
    clearAdminToken();
  }
};

/**
 * Clear admin token from localStorage and memory
 */
const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  adminToken = null;
};

/**
 * Notify all auth state listeners
 */
const notifyAuthStateListeners = () => {
  const state = getAuthState();
  authStateListeners.forEach(listener => {
    try {
      listener(state);
    } catch (error) {
      console.error('Error in auth state listener:', error);
    }
  });
};

// Initialize auth on module load
initAuth();