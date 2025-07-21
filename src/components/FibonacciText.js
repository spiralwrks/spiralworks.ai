import React, { useState, useEffect } from 'react';
import './FibonacciText.css';

const FibonacciText = ({ text, delay = 0, duration = 2000, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`fibonacci-text-container ${className}`}
    >
      <h1 
        className={`fibonacci-text ${isVisible ? 'visible' : ''}`}
        style={{
          '--animation-duration': duration + 'ms'
        }}
      >
        {text}
      </h1>
    </div>
  );
};

export default FibonacciText;