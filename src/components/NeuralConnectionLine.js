import React, { useRef, useEffect, useState } from 'react';

const NeuralConnectionLine = ({ 
  fromElement, 
  toNetworkCenter = { x: 0.5, y: 0.5 }, 
  delay = 0,
  duration = 3000 
}) => {
  const lineRef = useRef();
  const [line, setLine] = useState({ x1: 0, y1: 0, x2: 0, y2: 0, length: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateLine = () => {
      if (!fromElement.current || !lineRef.current) return;

      const fromRect = fromElement.current.getBoundingClientRect();
      const containerRect = lineRef.current.parentElement.getBoundingClientRect();
      
      // From element center
      const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
      
      // To network center (relative to viewport)
      const toX = containerRect.width * toNetworkCenter.x;
      const toY = containerRect.height * toNetworkCenter.y;
      
      const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
      const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);
      
      setLine({ 
        x1: fromX, 
        y1: fromY, 
        x2: toX, 
        y2: toY, 
        length: length,
        angle: angle 
      });
    };

    calculateLine();
    
    // Recalculate on window resize
    const handleResize = () => calculateLine();
    window.addEventListener('resize', handleResize);
    
    // Show line after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [fromElement, toNetworkCenter, delay]);

  return (
    <div
      ref={lineRef}
      className={`neural-connection-line ${isVisible ? 'visible' : ''}`}
      style={{
        position: 'absolute',
        left: line.x1 + 'px',
        top: line.y1 + 'px',
        width: line.length + 'px',
        height: '1px',
        transformOrigin: '0 50%',
        transform: `rotate(${line.angle}deg)`,
        background: `linear-gradient(90deg, 
          transparent, 
          rgba(166, 77, 255, 0.3) 20%, 
          rgba(166, 77, 255, 0.6) 50%, 
          rgba(166, 77, 255, 0.3) 80%, 
          transparent
        )`,
        opacity: 0,
        animation: isVisible ? `connectionAppear ${duration}ms ease-out forwards, connectionPulse 4s ease-in-out infinite ${duration}ms` : 'none',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {/* Animated data packet */}
      {isVisible && (
        <div
          className="data-packet"
          style={{
            position: 'absolute',
            top: '-2px',
            left: '0px',
            width: '4px',
            height: '4px',
            background: 'var(--primary-color)',
            borderRadius: '50%',
            boxShadow: '0 0 8px var(--primary-color)',
            animation: `packetFlow ${duration * 2}ms linear infinite ${duration}ms`
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes connectionAppear {
          from {
            opacity: 0;
            transform: rotate(${line.angle}deg) scaleX(0);
          }
          to {
            opacity: 0.6;
            transform: rotate(${line.angle}deg) scaleX(1);
          }
        }
        
        @keyframes connectionPulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes packetFlow {
          0% {
            left: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NeuralConnectionLine;