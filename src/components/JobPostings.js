import React, { useState } from 'react';
import JobApplicationForm from './JobApplicationForm';
import StarryBackground from './StarryBackground';
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
      'Strong engineering skills in Python, PyTorch/TensorFlow, and distributed computing architectures',
      'Experience deploying ML models at scale and optimizing inference pipelines',
      'Background in philosophy of mind, cognitive science, or neuroscience - we believe understanding intelligence requires questioning what intelligence means',
      'Track record of challenging conventional approaches and reimagining what\'s possible rather than iterating on what exists',
      'Deep interest in the human experience and how technology can amplify rather than replace human creativity'
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
      'PhD or equivalent research experience in ML/AI with publications at top-tier venues',
      'Deep technical expertise in statistical learning theory, optimization, and neural architectures',
      'Serious interest in cognitive science, psychology, or philosophy - particularly creativity and scientific intelligence',
      'History of paradigm-shifting research that questions fundamental assumptions rather than making incremental improvements',
      'Ability to see AI research as both rigorous science and creative art, balancing mathematical precision with philosophical inquiry'
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
      'Full-stack engineering expertise with deep understanding of ML systems and production deployments',
      'Experience with system integration, API design, and building scalable client solutions',
      'Background in behavioral psychology, anthropology, or human-computer interaction - understanding people is as important as understanding code',
      'Natural inclination to question "why" before "how" - seeing technology deployment as a human and philosophical challenge',
      'Ability to translate between technical complexity and human meaning, making the mysterious accessible without losing its magic'
    ]
  },
  {
    id: 4,
    title: 'Head of Marketing & GTM',
    department: 'External Development',
    location: 'New York City, NY',
    type: 'Full-time',
    description: 'Lead our go-to-market strategy and shape how the world understands creative superintelligence. You will craft narratives that bridge cutting-edge AI research with human imagination, building movements rather than campaigns.',
    requirements: [
      'Proven track record leading marketing and GTM at technical startups, ideally in AI/ML or deep tech spaces',
      'Experience building category-defining narratives and community-driven growth strategies',
      'Background in philosophy, literature, or cultural studies - marketing AI requires understanding both technology and the human stories it enables',
      'Ability to see marketing as cultural architecture rather than demand generation - building belief systems, not just pipelines',
      'Deep curiosity about consciousness, creativity, and what it means to augment rather than automate human intelligence'
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
