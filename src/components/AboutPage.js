import React, { useState, useEffect, useRef, Suspense } from 'react';
import './FibonacciText.css';
import StarryBackground from './StarryBackground';

// Lazy load heavy components
const DataFlowNetwork = React.lazy(() => import('./DataFlowNetwork'));
const FibonacciText = React.lazy(() => import('./FibonacciText'));

function AboutPage() {
  const [animationPhase, setAnimationPhase] = useState(0);
  
  // Refs for connection lines
  const challengeRef = useRef();
  const solutionRef = useRef();

  useEffect(() => {
    // Much faster text loading - no delays
    const timer1 = setTimeout(() => setAnimationPhase(1), 0);    // Immediate
    const timer2 = setTimeout(() => setAnimationPhase(2), 300);  // Challenge text
    const timer3 = setTimeout(() => setAnimationPhase(3), 600);  // Solution text  
    const timer4 = setTimeout(() => setAnimationPhase(4), 900);  // Final text
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="about-section" style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      width: '100%',
      overflow: 'hidden'
    }}>
      <StarryBackground />
      <Suspense fallback={<div />}>
        <DataFlowNetwork />
      </Suspense>
      
      {/* Central content container */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        maxWidth: '800px',
        width: '90%',
        zIndex: 10
      }}>
        {animationPhase >= 2 && (
          <div ref={challengeRef}>
            <Suspense fallback={<div />}>
              <FibonacciText
                text="Founders' Manifesto"
                className="subtitle"
                delay={0}
                duration={800}
              />
            </Suspense>
            <div style={{ 
              marginTop: '1rem', 
              color: 'var(--text-color)', 
              opacity: 0.9,
              lineHeight: 1.6,
              fontSize: '1rem',
              animation: 'fadeIn 0.6s ease-out 0.2s both'
            }}>
              sample text sample text sample text
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for fade in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 0.9;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AboutPage;
