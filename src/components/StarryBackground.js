import React from 'react';
import './StarryBackground.css';

const StarryBackground = () => {
  // Generate truly random star positions 
  const generateRandomStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        top: Math.random() * 200, // Extended range for mobile scroll
        left: Math.random() * 100,
        delay: Math.random() * 3
      });
    }
    return stars;
  };

  const stars = generateRandomStars(500);

  return (
    <div className="starry-background">
      {stars.map((star, index) => (
        <span
          key={index}
          className="star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDelay: `${star.delay}s`
          }}
        >
          *
        </span>
      ))}
    </div>
  );
};

export default StarryBackground;