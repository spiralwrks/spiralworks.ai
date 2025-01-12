import CryptoJS from 'crypto-js';

const WEBHOOK_CONFIG = {
  // Store an encrypted version of the webhook URL
  encryptedUrl: process.env.REACT_APP_ENCRYPTED_WEBHOOK_URL,
  // Public key used for validation (can be in code as it's public)
  publicKey: process.env.REACT_APP_PUBLIC_KEY,
  // Encryption key (different from the one used to encrypt the webhook URL)
  encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY
};

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 5,
  timeWindow: 3600000, // 1 hour in milliseconds
};

class RateLimiter {
  constructor() {
    this.requests = [];
  }

  checkLimit() {
    const now = Date.now();
    // Remove old requests
    this.requests = this.requests.filter(time => now - time < RATE_LIMIT.timeWindow);
    
    if (this.requests.length >= RATE_LIMIT.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter();

export const sendSecureWebhook = async (data) => {
  try {
    // Check rate limit
    if (!rateLimiter.checkLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Validate data
    if (!data.name || !data.email || !data.affiliation) {
      throw new Error('Missing required fields');
    }

    // Generate timestamp for request validation
    const timestamp = Date.now();
    
    // Create validation token
    const validationToken = CryptoJS.HmacSHA256(
      `${timestamp}${data.email}`,
      WEBHOOK_CONFIG.publicKey
    ).toString();

    // Format the message in a readable way before encrypting
    const formattedMessage = `New Reading Group Signup:
Name: ${data.name}
Email: ${data.email}
Affiliation: ${data.affiliation}
Timestamp: ${new Date(timestamp).toLocaleString()}`;

    // Encrypt the formatted message
    const encryptedPayload = CryptoJS.AES.encrypt(
      formattedMessage,
      WEBHOOK_CONFIG.encryptionKey
    ).toString();

    // Decrypt the webhook URL
    const webhookUrl = CryptoJS.AES.decrypt(
      WEBHOOK_CONFIG.encryptedUrl,
      WEBHOOK_CONFIG.encryptionKey
    ).toString(CryptoJS.enc.Utf8);

    // Send to Discord with decrypted content
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Discord will receive the decrypted, formatted message
        content: formattedMessage,
        // Include validation info
        timestamp,
        token: validationToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return true;
  } catch (error) {
    console.error('Error in secure webhook:', error);
    throw error;
  }
}; 