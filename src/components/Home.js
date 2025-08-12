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
          <h1 className="hero-title">Towards Creative Superintelligence.</h1>
        </div>
      </div>
    </>
  );
}

export default Home;
