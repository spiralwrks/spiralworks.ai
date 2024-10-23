import React, { useState, useEffect } from 'react';
import { useDiscordWebhook } from '../utils/webhook';
import logoImage from '../assets/sprworks_black.png';

function ReadingGroup() {
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
          At <img src={logoImage} alt="logo" /> <b>Spiral Works</b> we believe in pushing the boundaries of artificial intelligence by exploring computational creativity and interdisciplinary approaches to generalization. The <b>Spiral Works Reading Group</b> is an open forum for researchers, enthusiasts, and innovators to explore the intersections of mathematics, philosophy, psychology, and computer science in AI.
        </p>
        <p className="content-1">
          In our reading group, we aim to:
        </p>
        <ul className="content-1">
          <li>Delve into cutting-edge research that focuses on <b>generalization in AI</b>, while drawing from longstanding mathematical traditions.</li>
          <li>Explore how <b>consilience between disciplines</b> can help us develop more robust AI models.</li>
          <li>Engage in collaborative discussions on theories that can unify emerging phenomena in AI through the lens of <b>mathematics, philosophy, and cognitive sciences</b>.</li>
        </ul>
        <p className="content-1">
          If you are passionate about understanding the <b>philosophical underpinnings of AI</b>, <b>mathematical structures for generalization</b>, or simply want to collaborate with like-minded individuals, our reading group provides the platform to do so.
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