import React, { useState } from 'react';
import JobApplicationForm from './JobApplicationForm';
import StarryBackground from './StarryBackground';
import '../styles/jobpostings.css';

const jobListings = [
  {
    id: 1,
    title: 'AI Engineer',
    department: 'Model Development',
    location: 'New York City, NY',
    type: 'Full-time',
    description: 'We are looking for a talented AI Engineer to join our team and help build frontier pushing AI systems. You will work on designing, implementing, and deploying AI models at scale.',
    requirements: [
      'Strong engineering skills in Python, PyTorch/TensorFlow, distributed computing architectures, deploying AI models at scale, & optimizing inference pipelines',
      'Maintaining clean, minimal codebases with an emphasis on simplicity and debloat over unnecessary complexity',
      'Background in philosophy of mind, cognitive science, or neuroscience - we believe understanding intelligence requires questioning what intelligence means',
      'Track record of challenging conventional approaches and reimagining what\'s possible rather than iterating on what exists',
      'Deep interest in the human experience and how technology can amplify rather than replace human creativity'
    ]
  },
  {
    id: 2,
    title: 'AI Scientist',
    department: 'Research Development',
    location: 'New York City, NY',
    type: 'Full-time',
    description: 'Join our research team to push the boundaries of AI. You will conduct research, develop novel algorithms, and publish findings while working on real-world applications.',
    requirements: [
      'PhD or equivalent research experience in AI with publications at top-tier venues',
      'Deep technical expertise in statistical learning theory, optimization, and neural architectures',
      'Serious interest in cognitive science, psychology, or philosophy - particularly creativity and scientific intelligence',
      'History of paradigm-shifting research that questions fundamental assumptions rather than making incremental improvements',
      'Ability to see AI research as both rigorous science and creative art, balancing mathematical precision with philosophical inquiry'
    ]
  },
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
      <StarryBackground />
      <div className="job-postings-header">
        <h1>Join Our Team</h1>
        <p>We're building towards creative superintelligence. Come shape it with us.</p>
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
