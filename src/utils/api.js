/**
 * API client for secure server communication
 * 
 * This module provides secure interfaces to the server-side Firebase functions.
 * It handles authentication, request formatting, and response processing.
 */
import { auth, functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

// API base URL - uses emulator in development if available
const API_BASE_URL = process.env.NODE_ENV === 'development' && process.env.REACT_APP_FUNCTIONS_EMULATOR
  ? 'http://localhost:5001/spiralworks-website/us-central1/api'
  : 'https://us-central1-spiralworks-website.cloudfunctions.net/api';

// Direct Firebase callable functions
const submitWaitlistEntryCallable = httpsCallable(functions, 'submitWaitlistEntry');

/**
 * Helper function to handle API requests
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise} API response
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add auth token for admin endpoints
    if (endpoint.startsWith('/admin')) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Authentication required for admin endpoints');
      }
      
      const idToken = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${idToken}`;
    }
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Parse response
    const data = await response.json();
    
    // Handle errors
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Submit a waitlist signup
 * @param {Object} formData - Form data with name, email, organization
 * @param {string} csrfToken - CSRF protection token
 * @returns {Promise} Signup result
 */
export const submitWaitlistSignup = async (formData, csrfToken) => {
  try {
    // Try the direct Firebase callable function first (most secure)
    const result = await submitWaitlistEntryCallable({
      ...formData,
      csrfToken,
    });
    
    return result.data;
  } catch (callableError) {
    console.warn('Callable function failed, falling back to REST API:', callableError);
    
    // Fall back to REST API if callable fails
    return apiRequest('/waitlist/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        csrfToken,
      }),
    });
  }
};

/**
 * Get waitlist entries (admin only)
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise} Waitlist entries
 */
export const getWaitlistEntries = async (maxResults = 100) => {
  return apiRequest(`/admin/waitlist?maxResults=${maxResults}`);
};

/**
 * Delete a waitlist entry (admin only)
 * @param {string} entryId - Entry ID to delete
 * @returns {Promise} Delete result
 */
export const deleteWaitlistEntry = async (entryId) => {
  return apiRequest(`/admin/waitlist/${entryId}`, {
    method: 'DELETE',
  });
};

/**
 * Clear all waitlist entries (admin only)
 * @param {string} confirmationCode - Required confirmation code
 * @returns {Promise} Clear result
 */
export const clearAllWaitlistEntries = async (confirmationCode) => {
  return apiRequest('/admin/waitlist/clear-all', {
    method: 'POST',
    body: JSON.stringify({
      confirmationCode,
    }),
  });
};