const CryptoJS = require('crypto-js');
const crypto = require('crypto');

// Generate random keys
const encryptionKey = crypto.randomBytes(32).toString('hex');
const publicKey = crypto.randomBytes(32).toString('hex');

// Your Discord webhook URL - I'm using REDACTED here since you should generate a new one
const webhookUrl = 'https://discord.com/api/webhooks/1328031147606937600/7oH-64-vjhVuYaPxdlnTwDMYJuVgc8T9JJbKSB2diehwtcVcKl9ABJ6zUHnmnEIv96vj';

// Encrypt the webhook URL
const encryptedWebhookUrl = CryptoJS.AES.encrypt(webhookUrl, encryptionKey).toString();

console.log('Add these to your .env file:');
console.log(`REACT_APP_ENCRYPTED_WEBHOOK_URL=${encryptedWebhookUrl}`);
console.log(`REACT_APP_PUBLIC_KEY=${publicKey}`);
console.log(`REACT_APP_ENCRYPTION_KEY=${encryptionKey}`); 