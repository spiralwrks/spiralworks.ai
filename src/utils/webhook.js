import { useState } from 'react';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1298088307141513256/rwd6jYfXxVn7swWCeZBnOEmJ89EOcNFIShr8uBTeBYSI9yOY7ONRTaXjL2DmOK89tsC4';

export const useDiscordWebhook = () => {
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const sendToDiscord = async (formData) => {
    setStatus({ loading: true, error: null, success: false });

    const payload = {
      content: `**New Signup!**\nName: ${formData.name}\nEmail: ${formData.email}`,
      username: 'Signup Bot',
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to Discord');
      }

      setStatus({ loading: false, error: null, success: true });
    } catch (error) {
      console.error('Error sending to Discord webhook:', error);
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  return { sendToDiscord, status };
};