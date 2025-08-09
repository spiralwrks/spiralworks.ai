import React, { useState, useEffect, useRef, Suspense } from 'react';
import './FibonacciText.css';
import StarryBackground from './StarryBackground';
import signaturesImg from '../assets/sigs.webp';

// Lazy load heavy components
const DataFlowNetwork = React.lazy(() => import('./DataFlowNetwork'));
const FibonacciText = React.lazy(() => import('./FibonacciText'));

function AboutPage() {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for connection lines
  const challengeRef = useRef();

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Much faster text loading - no delays
    const timer1 = setTimeout(() => setAnimationPhase(1), 0);    // Immediate
    const timer2 = setTimeout(() => setAnimationPhase(2), 300);  // Challenge text
    const timer3 = setTimeout(() => setAnimationPhase(3), 600);  // Solution text  
    const timer4 = setTimeout(() => setAnimationPhase(4), 900);  // Final text
    
    return () => {
      window.removeEventListener('resize', checkMobile);
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
      overflowY: 'auto'
    }}>
      <StarryBackground />
      
      {/* Central content container */}
      <div style={{
        position: 'relative',
        paddingTop: isMobile ? '3rem' : '4rem', // Add a bit more gap on mobile
        paddingBottom: '2rem',
        margin: '0 auto', // Remove negative margin
        textAlign: 'center',
        maxWidth: '1000px',
        width: isMobile ? '100%' : '90%',
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
            
            {/* Network animation positioned between title and content */}
            <div style={{ height: '200px', margin: '2rem 0', position: 'relative' }}>
              <Suspense fallback={<div />}>
                <DataFlowNetwork />
              </Suspense>
            </div>
<div style={{ 
  marginTop: '1rem', 
  color: 'var(--text-color)', 
  opacity: 0.9,
  lineHeight: 1.6,
  fontSize: '1rem',
  animation: 'fadeIn 0.6s ease-out 0.2s both',
  textAlign: 'left',
  maxWidth: '800px',
  margin: '1rem auto 0 auto',
  paddingLeft: isMobile ? '1rem' : '0',
  paddingRight: isMobile ? '1rem' : '0'
}}>
  <div style={{ 
    background: 'rgba(128, 128, 128, 0.1)', 
    backdropFilter: 'blur(10px)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '12px', 
    padding: '1.5rem', 
    margin: '2rem 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }}>
    <p style={{ margin: 0 }}>Almost always the men who achieve these fundamental inventions of a new paradigm… being little committed by prior practice to the traditional rules of normal science, are particularly likely to see that <strong>those rules no longer define a playable game and to conceive another set that can replace them.</strong> – Thomas S. Kuhn<sup>1</sup></p>
  </div>
  
  <p>For centuries, thinkers have distinguished between a <em>logic of discovery</em> and a <em>logic of justification</em>. One is the wild birth of an idea: mystic, unpredictable, and unexplainable. Unsurprisingly, modern science has fixated on the latter: the tidy proof or routine attempt at empirical falsification<sup>4,5</sup>. The result? Discovery and creativity have been relegated to the confines of psychology<sup>2</sup>, treated as metaphysical phenomena rather than mathematical or computational regularities.</p>
  
  <p><strong>Today, we’re here to change that.</strong></p>
  
  <div style={{ 
    background: 'rgba(128, 128, 128, 0.1)', 
    backdropFilter: 'blur(10px)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '12px', 
    padding: '1.5rem', 
    margin: '2rem 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }}>
    <p style={{ margin: 0 }}>"The innovators of the eighteenth and nineteenth centuries were often polymaths…" – Alex Karp<sup>3</sup></p>
  </div>
  
  <p>Before specialization became the norm, discovery thrived at intersections. Mary Somerville moved from astronomy to mathematics with no need to “switch fields.” Faraday moved from chemistry to physics without permission. These thinkers crossed boundaries freely because they recognized them for what they often were: an administrative convenience for humans<sup>5</sup>. AI systems are unbounded by these limitations, and also many more—working memory, computational horsepower, and breadth of knowledge.</p>
  
  <p>Yet these systems, despite being incredibly powerful, are also very brittle. They make factual errors. Unrealistic assumptions. They hallucinate. They ignore scientific best practices. The list goes on. As a result, scientists remain hesitant to outsource their most important research tasks to AI in fear of wasting time, energy, and money.</p>
  
  <p><strong>At Spiral Works, our polymathic team develops robust AI for scientific research, pushing the boundaries of intelligence itself — human and machine.</strong> We believe the next wave of discovery will come from dissolving disciplinary silos. From letting insights in one domain ignite revolutions in another. Above all, from refusing to play by the <em>narrow</em> rules of “normal science.”</p>
  
  <p>Some view large language models as mere assistants. We view them more optimistically. They are co-inventors. They hold the power to surface new patterns, analogies, and hypotheses across every discipline. In short, they are engines of the <em>logic of discovery</em>—but only if wielded carefully.</p>
  
  <div style={{ 
    background: 'rgba(128, 128, 128, 0.1)', 
    backdropFilter: 'blur(10px)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '12px', 
    padding: '1.5rem', 
    margin: '2rem 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }}>
    <p style={{ margin: 0 }}>"Science grows by a more revolutionary method than accumulation – by a method which destroys, changes, and alters the whole thing." – Karl Popper<sup>5</sup></p>
  </div>
  
  <p>We reject incrementalism. We embrace bold conjecture but also fearless refutation. When the time comes, we would rather rewrite the language of a field than simply add to it. Spiral Works is a place where ideological meritocracy reigns supreme and philosophical rigor bleeds into all we think, build, and say.</p>
  
  <p>We choose breadth over narrowness, and depth where it strategically matters. We have the courage to start over when necessary, but also the resolve to persevere through challenges.</p>
  
  <p><strong>We are not here to maintain the status quo — we are here to redefine the possible.</strong></p>
  
  <p><strong>Here’s to a new kind of science.</strong></p>

  <p style={{ marginTop: '3rem' }}>Founders, Spiral Works </p>
                  
  <p>Royce Moon, Samuel Schapiro, &amp; Peter Graham</p>

  <div style={{ marginTop: '1rem', textAlign: 'left' }}>
    <img 
      src={signaturesImg} 
      alt="Signatures of Royce Moon, Samuel Schapiro, and Peter Graham" 
      style={{ 
        maxWidth: '45%', 
        height: 'auto',
        opacity: 0.9
      }} 
    />
  </div>

  <p>Reach out at join@spiralworks.ai</p>
  
  <hr style={{ 
    margin: '3rem 0 2rem 0', 
    border: 'none', 
    borderTop: '1px solid var(--text-color)', 
    opacity: 0.3 
  }} />
  
  <small>
    <sup>1</sup> The Structure of Scientific Revolutions, Thomas Kuhn<br />
    <sup>2</sup> The Foundations of Scientific Inference, Wesley Salmon<br />
    <sup>3</sup> The Technological Republic, Alex Karp<br />
    <sup>4</sup> The Logic of Scientific Discovery, Karl Popper<br />
    <sup>5</sup> Conjectures and Refutations: The Growth of Scientific Knowledge, Karl Popper
  </small>
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
