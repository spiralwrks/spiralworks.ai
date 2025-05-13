const CryptoJS = require('crypto-js');
const crypto = require('crypto');

// Generate random keys
const encryptionKey = crypto.randomBytes(32).toString('hex');
const publicKey = crypto.randomBytes(32).toString('hex');

// Your Discord webhook URL - Replace with your own webhook URL
const webhookUrl = 'https://discord.com/api/webhooks/1370811189965230291/bNrdpvFI_HQcmQ_Eg1EJ0aQD14NMiLCWRQ2vIroKeAtQjQGLYtVNl6EDo-1JTQ0C4G0I';

// Encrypt the webhook URL
const encryptedWebhookUrl = CryptoJS.AES.encrypt(webhookUrl, encryptionKey).toString();

console.log('Add these to your .env file:');
console.log(`REACT_APP_ENCRYPTED_WEBHOOK_URL=${encryptedWebhookUrl}`);
console.log(`REACT_APP_PUBLIC_KEY=${publicKey}`);
console.log(`REACT_APP_ENCRYPTION_KEY=${encryptionKey}`); 