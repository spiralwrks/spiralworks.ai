import React from 'react';
import WaitlistSignup from './WaitlistSignup';

function WaitlistPage() {

  return (
    <div className="waitlist-page">
      <div className="waitlist-page-container">
        <div className="waitlist-page-content">
          <h1 className="waitlist-page-title">Cosmos v1.0 Beta Program</h1>
          <p className="waitlist-page-subtitle">
            Join our beta program to pilot Cosmos, our OS for AI R&D, and evolve it with us!
          </p>
          <WaitlistSignup />
        </div>
      </div>
    </div>
  );
}

export default WaitlistPage;
