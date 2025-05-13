import React, { useState, useEffect } from 'react';
import { submitWaitlistData, generateCSRFToken } from '../utils/waitlistService';

function WaitlistSignup() {
  const [formData, setFormData] = useState({ name: '', email: '', organization: '' });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Generate CSRF token on component mount and track form view
  useEffect(() => {
    setCsrfToken(generateCSRFToken());

    // Track form view for conversion tracking
    if (window.gtag) {
      window.gtag('event', 'waitlist_form_view', {
        'event_category': 'engagement',
        'event_label': 'Waitlist Form Viewed'
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) return false;
    if (!formData.email || !formData.email.includes('@')) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmissionStatus('validation_error');
      return;
    }

    setSubmissionStatus('loading');

    try {
      // Call our secure service with CSRF protection
      const result = await submitWaitlistData({
        ...formData,
        csrfToken
      });

      if (result.success) {
        // Track successful submission for conversion tracking
        if (window.gtag) {
          window.gtag('event', 'waitlist_submission', {
            'event_category': 'conversion',
            'event_label': 'Waitlist Form Submitted'
          });
        }

        // Reset form and show success message
        setFormData({ name: '', email: '', organization: '' });
        setSubmissionStatus('success');
        setShowModal(true);
        // Generate a new CSRF token for next submission
        setCsrfToken(generateCSRFToken());
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionStatus('error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="waitlist-signup">
      <h3 className="waitlist-title">Join Our Public Beta</h3>
      <p className="waitlist-description">Sign up to be among the first to test our research OS!</p>
      
      <form className="waitlist-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="organization" className="optional">Organization (Optional)</label>
          <input
            id="organization"
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Enter your organization"
          />
        </div>

        <div className="form-group">
          <button type="submit" className="waitlist-button" disabled={submissionStatus === 'loading'}>
            {submissionStatus === 'loading' ? 'Signing Up...' : 'Join Waitlist'}
          </button>
        </div>
      </form>
      
      {submissionStatus === 'validation_error' && 
        <p className="error-message">Please fill in all required fields with valid information.</p>
      }
      
      {submissionStatus === 'error' && 
        <p className="error-message">There was an error submitting your request. Please try again.</p>
      }

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <h2>Thank you for joining our waitlist!</h2>
            <p>We'll contact you when we're ready to onboard beta testers.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WaitlistSignup;