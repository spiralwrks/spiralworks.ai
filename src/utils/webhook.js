import { useState } from 'react';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1298088307141513256/rwd6jYfXxVn7swWCeZBnOEmJ89EOcNFIShr8uBTeBYSI9yOY7ONRTaXjL2DmOK89tsC4';

export const useDiscordWebhook = () => {
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const sendToDiscord = async (formData) => {
    setStatus({ loading: true, success: false, error: null });
    const payload = {
      content: `**New Signup!**\nName: ${formData.name}\nAffiliation: ${formData.affiliation}\nEmail: ${formData.email}`,
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

      setStatus({ loading: false, success: true, error: null });
    } catch (error) {
      setStatus({ loading: false, success: false, error: error.message });
    }
  };

  const resetStatus = () => {
    setStatus({ loading: false, success: false, error: null });
  };

  return { sendToDiscord, status, resetStatus };
};