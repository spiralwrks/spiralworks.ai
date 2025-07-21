import React, { useState, useEffect } from 'react';
import { submitWaitlistData, generateCSRFToken } from '../utils/waitlistService';
import Stepper, { Step } from './Stepper';

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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.email && formData.email.includes('@');
      case 3:
        return formData.organization.trim().length > 0;
      default:
        return true;
    }
  };

  const handleStepChange = (step) => {
    // Track step changes if needed for analytics
    console.log(`Step changed to: ${step}`);
  };

  const handleFinalSubmit = async () => {
    if (!formData.name.trim() || !formData.email || !formData.email.includes('@') || !formData.organization.trim()) {
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

  if (submissionStatus === 'success' && showModal) {
    return (
      <div className="waitlist-signup">
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <h2>Thank you for joining our waitlist!</h2>
            <p>We'll contact you when we're ready to onboard beta testers.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="waitlist-signup">
      <Stepper
        initialStep={1}
        onStepChange={handleStepChange}
        onFinalStepCompleted={handleFinalSubmit}
        backButtonText="Previous"
        nextButtonText="Continue"
        validateStep={validateStep}
      >
        <Step>
          <h2>What's your name?</h2>
          <p>Let's start with your name so we can personalize your experience.</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
          {formData.name.length > 0 && !validateStep(1) && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Please enter your name</p>}
        </Step>
        
        <Step>
          <h2>Your email address</h2>
          <p>We'll use this to send you beta access and important updates.</p>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
          {formData.email.length > 0 && !validateStep(2) && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Please enter a valid email address</p>}
        </Step>
        
        <Step>
          <h2>Organization</h2>
          <p>Help us understand your background - what organization are you with?</p>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Enter your organization or company"
            required
          />
          {formData.organization.length > 0 && !validateStep(3) && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Please enter your organization</p>}
        </Step>
        
        <Step>
          <h2>Ready to join!</h2>
          <p><span style={{ color: 'white' }}>Name:</span> {formData.name}</p>
          <p><span style={{ color: 'white' }}>Email:</span> {formData.email}</p>
          {formData.organization && <p><span style={{ color: 'white' }}>Organization:</span> {formData.organization}</p>}
          <p>Click "Complete" to finish your beta signup!</p>
          {submissionStatus === 'loading' && <p style={{ color: '#8622c9' }}>Submitting your application...</p>}
          {submissionStatus === 'error' && <p style={{ color: '#ef4444' }}>There was an error. Please try again.</p>}
        </Step>
      </Stepper>
    </div>
  );
}

export default WaitlistSignup;