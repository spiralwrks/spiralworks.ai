function sendToDiscord(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const name = document.getElementById('name').value;
    const affiliation = document.getElementById('affiliation').value;
    const email = document.getElementById('email').value;

    const webhookURL = 'https://discord.com/api/webhooks/1298088307141513256/rwd6jYfXxVn7swWCeZBnOEmJ89EOcNFIShr8uBTeBYSI9yOY7ONRTaXjL2DmOK89tsC4'; // Replace with your webhook URL

    // Construct the message payload
    const payload = {
        content: `**New Signup!**\nName: ${name}\nAffiliation: ${affiliation}\nEmail: ${email}`,
        username: 'Signup Bot',
    };

    // Send the payload to Discord using Fetch API
    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (response.ok) {
            alert('Signup successful! Thank you for joining.');
        } else {
            alert('Error: Unable to send the signup data. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error sending to Discord webhook:', error);
        alert('There was an error sending your signup information. Please try again later.');
    });

    // Optionally clear the form fields
    document.getElementById('signupForm').reset();
}