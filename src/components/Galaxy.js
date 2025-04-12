// src/components/Galaxy.js
import React, { useEffect, useRef } from 'react';
import { initializeGalaxy } from '../utils/spiral';

function Galaxy() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let cleanup;

    const handleResize = () => {
      if (cleanup) {
        cleanup();
      }
      cleanup = initializeGalaxy(canvasRef);
    };

    handleResize(); // Initialize on mount
    window.addEventListener('resize', handleResize);

    return () => {
      if (cleanup) {
        cleanup();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="webgl" />;
}

export default Galaxy;