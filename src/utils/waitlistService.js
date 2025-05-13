/**
 * Waitlist Service - Client module for waitlist functionality
 * 
 * This module provides a secure interface for users to sign up for the waitlist.
 * It handles client-side validation, CSRF protection, and communicates with
 * server-side Firebase Cloud Functions.
 */

import CryptoJS from 'crypto-js';
import { submitWaitlistSignup } from './api';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 5,
  timeWindow: 3600000, // 1 hour in milliseconds
};

// Local storage key for fallback
const WAITLIST_STORAGE_KEY = 'waitlist-signups';

// In-memory rate limiter as a fallback mechanism
class RateLimiter {
  constructor() {
    this.requests = new Map(); // Map of IP -> array of timestamps
    this.cleanupInterval = setInterval(() => this.cleanup(), RATE_LIMIT.timeWindow);
  }

  checkLimit(identifier) {
    const now = Date.now();
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }
    
    const requestTimes = this.requests.get(identifier);
    // Remove old requests outside the time window
    const recentRequests = requestTimes.filter(time => now - time < RATE_LIMIT.timeWindow);
    
    if (recentRequests.length >= RATE_LIMIT.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
  
  cleanup() {
    const now = Date.now();
    
    for (const [key, times] of this.requests.entries()) {
      const recentTimes = times.filter(time => now - time < RATE_LIMIT.timeWindow);
      
      if (recentTimes.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentTimes);
      }
    }
  }
  
  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Generate a CSRF token for form protection
 * @returns {string} Generated token
 */
export const generateCSRFToken = () => {
  const token = CryptoJS.lib.WordArray.random(16).toString();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Verify a CSRF token against the stored one
 * @param {string} token - Token to verify
 * @returns {boolean} Whether token is valid
 */
export const verifyCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token === storedToken;
};

/**
 * Submit waitlist data securely to the server
 * Uses server-side validation with client-side fallbacks
 * @param {Object} data - Waitlist signup data with name, email, organization
 * @returns {Promise<Object>} Submission result
 */
export const submitWaitlistData = async (data) => {
  try {
    // Client-side validation (duplicated on server for security)
    if (!verifyCSRFToken(data.csrfToken)) {
      throw new Error('Invalid security token. Please refresh and try again.');
    }
    
    if (!data.name || !data.email) {
      throw new Error('Missing required fields');
    }
    
    if (!validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    
    try {
      // Primary path: Submit through secure API
      await submitWaitlistSignup(
        {
          name: data.name,
          email: data.email,
          organization: data.organization || '',
        },
        data.csrfToken
      );

      return { success: true };
    } catch (apiError) {
      console.warn('API submission failed, using fallback mechanism', apiError);
      
      // Fallback path: Use local rate limiting
      const clientIP = await getClientIP();
      if (!rateLimiter.checkLimit(clientIP)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      // Store entry locally for later sync
      const waitlistEntry = {
        name: data.name,
        email: data.email.toLowerCase(),
        organization: data.organization || 'Not provided',
        createdAt: new Date().toISOString(),
        ipAddress: clientIP,
        source: 'website-waitlist-local',
        userAgent: navigator.userAgent
      };
      
      storeInLocalStorage(waitlistEntry);
      
      // Try to send Discord notification directly as a last resort
      await sendDiscordNotification(waitlistEntry);
      
      return { success: true, fallback: true };
    }
  } catch (error) {
    console.error('Error submitting waitlist data:', error);
    throw error;
  }
};

/**
 * Store waitlist entry in local storage for fallback
 * @param {Object} data - Entry data
 */
const storeInLocalStorage = (data) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(WAITLIST_STORAGE_KEY) || '[]');
    existingData.push(data);
    localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(existingData));
    console.log('Entry stored in local storage for later sync');
  } catch (error) {
    console.error('Error storing in localStorage:', error);
  }
};

/**
 * Send Discord webhook notification
 * @param {Object} data - Waitlist entry data
 * @returns {Promise<boolean>} Notification result
 */
const sendDiscordNotification = async (data) => {
  try {
    const DISCORD_WEBHOOK_URL = process.env.REACT_APP_DISCORD_WEBHOOK_URL;
    if (!DISCORD_WEBHOOK_URL) {
      console.log('Discord webhook URL not configured');
      return false;
    }
    
    const payload = {
      username: "Spiral Works Waitlist Bot",
      avatar_url: "https://spiralworks.ai/favicon.ico",
      embeds: [{
        title: "New Public Beta Signup!",
        color: 0x8622c9, // Purple color matching the theme
        fields: [
          {
            name: "Name",
            value: data.name,
            inline: true
          },
          {
            name: "Email",
            value: data.email,
            inline: true
          },
          {
            name: "Organization",
            value: data.organization || 'Not provided',
            inline: true
          },
          {
            name: "Time",
            value: new Date(data.createdAt || Date.now()).toLocaleString(),
            inline: false
          },
          {
            name: "Source",
            value: data.source || 'website-waitlist',
            inline: false
          }
        ],
        footer: {
          text: "Spiral Works Waitlist System"
        },
        timestamp: data.createdAt || new Date().toISOString()
      }]
    };
    
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return false;
  }
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} Is email valid
 */
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

/**
 * Get client IP address for rate limiting
 * @returns {Promise<string>} IP address
 */
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
};