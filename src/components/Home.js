import React from 'react';
import Galaxy from './Galaxy';
import StarryBackground from './StarryBackground';

function Home() {

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section dither-background">
        <StarryBackground />
        <div className="hero-galaxy">
          <Galaxy />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Spiral Works</h1>
          <p className="hero-tagline">Towards Creative Superintelligence.</p>
        </div>
      </div>
    </>
  );
}

export default Home;
