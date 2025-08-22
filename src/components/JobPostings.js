import React, { useState } from 'react';
import JobApplicationForm from './JobApplicationForm';
import '../styles/jobpostings.css';

const jobListings = [
  {
    id: 1,
    title: 'ML Engineer',
    department: 'Product Development',
    location: 'New York City, NY',
    type: 'Full-time',
    description: 'We are looking for a talented ML Engineer to join our team and help build cutting-edge machine learning systems. You will work on designing, implementing, and deploying ML models at scale.',
    requirements: [
      'Strong programming skills in Python and experience with ML frameworks (TensorFlow, PyTorch)',
      'Experience with distributed computing and model deployment',
      'Understanding of deep learning architectures and optimization techniques',
      'BS/MS in Computer Science, Mathematics, or related field',
      'Experience with cloud platforms (AWS, GCP, or Azure)'
    ]
  },
  {
    id: 2,
    title: 'ML Scientist',
    department: 'Research Development',
    location: 'New York City, NY',
    type: 'Full-time',
    description: 'Join our research team to push the boundaries of machine learning. You will conduct research, develop novel algorithms, and publish findings while working on real-world applications.',
    requirements: [
      'PhD in Machine Learning, Computer Science, or related field (or equivalent experience)',
      'Strong publication record in top ML conferences (NeurIPS, ICML, ICLR, etc.)',
      'Deep understanding of statistical learning theory and optimization',
      'Experience with large-scale experimentation and research methodologies',
      'Excellent communication skills for presenting complex ideas'
    ]
  },
  {
    id: 3,
    title: 'Forward Deployed Engineer',
    department: 'Business Development',
    location: 'New York City, NY',
    type: 'Full-time',
    description: 'Be the bridge between our technology and our customers. You will work directly with clients to implement solutions, gather feedback, and ensure successful deployments of our ML systems.',
    requirements: [
      'Strong engineering background with full-stack development experience',
      'Experience with ML/AI systems and understanding of ML pipelines',
      'Excellent client-facing communication and problem-solving skills',
      'Ability to travel to client sites (up to 25%)',
      'Experience with enterprise software deployments and integrations'
    ]
  }
];

function JobPostings() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const handleCloseForm = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
  };

  return (
    <div className="job-postings-container">
      <div className="job-postings-header">
        <h1>Join Our Team</h1>
        <p>We're building the future of AI. Come shape it with us.</p>
      </div>

      <div className="job-listings">
        {jobListings.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <h2>{job.title}</h2>
              <div className="job-meta">
                <span className="job-department">{job.department}</span>
                <span className="job-location">{job.location}</span>
                <span className="job-type">{job.type}</span>
              </div>
            </div>
            
            <div className="job-description">
              <p>{job.description}</p>
            </div>

            <div className="job-requirements">
              <h3>Requirements</h3>
              <ul>
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <button 
              className="apply-button"
              onClick={() => handleApplyClick(job)}
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {showApplicationForm && (
        <JobApplicationForm 
          job={selectedJob}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default JobPostings;