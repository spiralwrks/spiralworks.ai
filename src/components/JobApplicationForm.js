import React, { useState } from 'react';
import '../styles/jobapplicationform.css';

function JobApplicationForm({ job, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    resume: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('to', 'join@spiralworks.ai');
      formDataToSend.append('subject', `Job Application: ${job.title} - ${formData.name}`);
      
      const emailBody = `
New job application received:

Position: ${job.title}
Name: ${formData.name}
Email: ${formData.email}
Resume: ${formData.resume ? 'Attached' : 'Not provided'}

Please review the attached resume and contact the candidate.
      `;
      
      formDataToSend.append('body', emailBody);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      // Using a mailto link as a fallback for now
      // In production, you would integrate with an email service
      const mailtoLink = `mailto:join@spiralworks.ai?subject=${encodeURIComponent(`Job Application: ${job.title} - ${formData.name}`)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="application-modal-overlay" onClick={onClose}>
      <div className="application-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Apply for {job.title}</h2>
        
        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="john.doe@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="resume">Resume (PDF, DOC, DOCX) *</label>
            <input
              type="file"
              id="resume"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              required
            />
            {formData.resume && (
              <p className="file-selected">Selected: {formData.resume.name}</p>
            )}
          </div>

          {submitStatus === 'success' && (
            <div className="status-message success">
              Application submitted successfully! We'll be in touch soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="status-message error">
              There was an error submitting your application. Please try again or email directly to join@spiralworks.ai
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobApplicationForm;