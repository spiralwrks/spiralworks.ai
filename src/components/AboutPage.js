import React, { useState, useEffect, useRef, Suspense } from 'react';
import './FibonacciText.css';

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
      <Suspense fallback={<div />}>
        <DataFlowNetwork />
      </Suspense>
      
      {/* Mission - Top left ambient zone */}
      {animationPhase >= 2 && (
        <div ref={challengeRef} className="ambient-top-left">
          <Suspense fallback={<div />}>
            <FibonacciText
              text="Who We Are"
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
            Spiral Works is an AI research organization bridging theory and practice to build creative AI systems
            that can automate AI R&D.
            <br /><br />
            Our systems are grounded in peer-reviewed research that unifies philosophy, cognitive science, and computer science.

          </div>
        </div>
      )}
      
      {/* Solution - Bottom right ambient zone */}
      {animationPhase >= 3 && (
        <div ref={solutionRef} className="ambient-bottom-right">
          <Suspense fallback={<div />}>
            <FibonacciText
              text="What We're Building"
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
            We're building the first universal operating system for AI R&D—automating literature review, idea generation, experiment 
            design and execution, and paper writing. 
            <br /><br />
            This includes plug-and-play ML infrastructure integrations and governance tracking for data, experiments, and metadata.
           </div>
        </div>
      )}

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
