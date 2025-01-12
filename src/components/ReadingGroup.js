import React, { useState, useEffect, useContext } from 'react';
import { useDiscordWebhook } from '../utils/webhook';
import { ThemeContext } from '../context/ThemeContext';
import logoBlack from '../assets/sprworks_black.png';
import logoWhite from '../assets/sprworks_white.png';

function ReadingGroup() {
  const { theme } = useContext(ThemeContext);
  const logoImage = theme === 'dark' ? logoWhite : logoBlack;
  const [formData, setFormData] = useState({ name: '', affiliation: '', email: '' });
  const { sendToDiscord, status, resetStatus } = useDiscordWebhook();
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendToDiscord(formData);
  };

  useEffect(() => {
    if (status.success) {
      setFormData({ name: '', affiliation: '', email: '' });
      setShowModal(true);
    }
  }, [status.success]);

  const closeModal = () => {
    setShowModal(false);
    resetStatus(); // Reset the status after closing the modal
  };
  return (
    <div className="pure-g text-container">
      <div className="pure-u-1 pure-u-md-1 reading-group-text">
        <p className="content-1">
          At <img src={logoImage} alt="logo" /> <b>Spiral Works</b>, we host a reading group that explores the intersections of mathematics, philosophy, psychology, computational neuroscience, and computer science in AI.
        </p>
        <p className="content-1">
          Our discussions focus on:
        </p>
        <ul className="content-1">
          <li>Cutting-edge research in <b>AI generalization</b> and its mathematical foundations</li>
          <li>How insights from different disciplines can lead to more <b>robust AI systems</b></li>
          <li>Unifying theories in AI through the lens of <b>mathematics and cognitive sciences</b></li>
        </ul>
        <p className="content-1">
          Join us if you're interested in exploring the theoretical foundations of intelligence or want to collaborate with other like-minded individuals.
        </p>
        
        <form className="elegant-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              id="name" 
              type="text" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
            <label htmlFor="name">Name</label>
          </div>

          <div className="form-group">
            <input 
              id="affiliation" 
              type="text" 
              name="affiliation" 
              value={formData.affiliation}
              onChange={handleChange}
              required 
            />
            <label htmlFor="affiliation">Affiliation</label>
          </div>

          <div className="form-group">
            <input 
              id="email" 
              type="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="form-group">
            <button type="submit" className="submit-button" disabled={status.loading}>
              {status.loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
          </form>
        {status.error && <p className="error-message">There was an error submitting the form. Please try again.</p>}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <h2>Thank you for signing up!</h2>
            <p>We'll be in touch soon with more information about the reading group.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadingGroup;