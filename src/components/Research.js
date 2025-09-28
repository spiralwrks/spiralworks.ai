import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StarryBackground from './StarryBackground';
import '../styles/Research.css';

// Import affiliate logos
import stanfordLogo from '../assets/images/affiliates/stanford.svg';
import mitLogo from '../assets/images/affiliates/mit.svg';
import metaLogo from '../assets/images/affiliates/meta.svg';
import amazonLogo from '../assets/images/affiliates/amazon.svg';
import microsoftLogo from '../assets/images/affiliates/microsoft.svg';
import mistralLogo from '../assets/images/affiliates/mistral.svg';
import huggingfaceLogo from '../assets/images/affiliates/huggingface.svg';
import palantirLogo from '../assets/images/affiliates/palantir.svg';
import harvardLogo from '../assets/images/affiliates/harvard.svg';

gsap.registerPlugin(ScrollTrigger);

function Research() {
  const papersRef = useRef([]);
  const heroRef = useRef(null);


  const papers = [
    {
      id: 1,
      title: "Combinatorial Creativity: A New Frontier in Generalization Abilities",
      authors: "Samuel Schapiro, Sumuk Shashidhar, Alexi Gladstone, Jonah Black, Royce Moon, Dilek Hakkani-Tur, Lav R. Varshney",
      year: "2025",
      venue: "Under Review",
      landingPageUrl: "https://cc.spiralworks.ai",
      abstract: "LLMs are increasingly used for creative tasks, yet we lack proper ways to evaluate and understand their creative abilities. We provide the first systematic evaluation framework for combinatorial creativity (CC), uncovering fundamental limitations that persist even as models scale.",
      keywords: ["Combinatorial Creativity", "Generalization", "AI Capabilities"]
    },
    {
      id: 2,
      title: "Spark: A System for Scientifically Creative Idea Generation",
      authors: "Aishik Sanyal, Samuel Schapiro, Sumuk Shashidhar, Royce Moon, Lav R. Varshney, Dilek Hakkani-Tur",
      year: "2025",
      venue: "ICCC 2025",
      arxivId: "2504.20090",
      alphaXivUrl: "https://www.alphaxiv.org/overview/2504.20090v2",
      abstract: "We present SPARK, a new AI system that integrates literature retrieval and LLM-based idea generation with a specialized JUDGE model for critical evaluation, effectively producing and filtering over 10,000 AI-focused research ideas. We trained the JUDGE model on 600K scientific peer reviews, demonstrating superior critical assessment compared to general-purpose LLMs, addressing the 'agreeableness bias.'",
      keywords: ["Computational Creativity", "LLMs", "Scientific Idea Generation"]
    },
    {
      id: 3,
      title: "Transformational Creativity in Science: A Graphical Theory",
      authors: "Samuel Schapiro, Jonah Black, Lav R. Varshney",
      year: "2025",
      venue: "ICCC 2025",
      arxivId: "2504.18687",
      alphaXivUrl: "https://www.alphaxiv.org/overview/2504.18687v2",
      abstract: "We developed a graphical theory to model transformational creativity in science, demonstrating that modifications to foundational axioms have the most extensive impact on scientific conceptual spaces. We provide a rigorous, formal understanding of how fundamental changes in scientific thought lead to paradigm shifts.",
      keywords: ["Computational Creativity", "Scientific Creativity", "Paradigm Shifts"],
      award: {
        title: "Best Short Paper Award",
        conference: "ICCC 2025",
        category: "Scientific Creativity Research"
      }
    }
  ];

  useEffect(() => {
    // Hero animation
    gsap.fromTo(heroRef.current,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.2,
        ease: "power3.out"
      }
    );

    // Papers animation - simple fade in without scroll trigger
    papersRef.current.forEach((paper, index) => {
      gsap.fromTo(paper,
        { 
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.5 + index * 0.15,
          ease: "power3.out"
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handlePaperHover = (index) => {
    const paper = papersRef.current[index];
    if (paper) {
      gsap.to(paper, {
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handlePaperLeave = (index) => {
    const paper = papersRef.current[index];
    if (paper) {
      gsap.to(paper, {
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  return (
    <div className="research-container">
      <StarryBackground />
      
      <div className="research-hero" ref={heroRef}>
        <div className="research-hero-content">
          <h1 className="research-title">Advancing the Frontier of Creative AI</h1>
        </div>
      </div>

      <div className="affiliates-section">
        <div className="affiliates-container">
          <h2 className="affiliates-title">Research Affiliates From</h2>
          <div className="affiliates-logos">
            <div className="affiliate-logo">
              <img src={stanfordLogo} alt="Stanford University" />
            </div>
            <div className="affiliate-logo">
              <img src={mitLogo} alt="MIT" />
            </div>
            <div className="affiliate-logo">
              <img src={harvardLogo} alt="Harvard University" />
            </div>
            <div className="affiliate-logo">
              <img src={metaLogo} alt="Meta" />
            </div>
            <div className="affiliate-logo">
              <img src={amazonLogo} alt="Amazon" />
            </div>
            <div className="affiliate-logo">
              <img src={microsoftLogo} alt="Microsoft" />
            </div>
            <div className="affiliate-logo">
              <img src={mistralLogo} alt="Mistral AI" />
            </div>
            <div className="affiliate-logo">
              <img src={huggingfaceLogo} alt="Hugging Face" />
            </div>
            <div className="affiliate-logo">
              <img src={palantirLogo} alt="Palantir" />
            </div>
          </div>
        </div>
      </div>

      <div className="papers-section">
        <div className="papers-container">
          {papers.map((paper, index) => (
            <div 
              key={paper.id}
              className="paper-card"
              ref={el => papersRef.current[index] = el}
              onMouseEnter={() => handlePaperHover(index)}
              onMouseLeave={() => handlePaperLeave(index)}
            >
              <div className="paper-header">
                <div className="paper-header-left">
                  <div className="paper-year">{paper.year}</div>
                  {paper.award && (
                    <div className="paper-award">
                      <svg className="award-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.39 7.26L22 9.27l-5.69 4.87L18.18 22 12 17.27 5.82 22l1.87-7.86L2 9.27l7.61-.01L12 2z"/>
                      </svg>
                      <span className="award-text">{paper.award.title} - {paper.award.conference}</span>
                    </div>
                  )}
                </div>
                <div className="paper-keywords">
                  {paper.keywords.map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>

              <h2 className="paper-title">{paper.title}</h2>
              
              <p className="paper-authors">{paper.authors}</p>
              
              {paper.venue && (
                <p className="paper-venue">{paper.venue === "Under Review" ? "Under Review" : `Accepted at ${paper.venue}`}</p>
              )}
              
              <p className="paper-abstract">{paper.abstract}</p>


              <div className="paper-links">
                {paper.landingPageUrl ? (
                  <a
                    href={paper.landingPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-link landing-page-link"
                  >
                    <svg className="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Landing Page
                  </a>
                ) : (
                  <>
                    <a
                      href={paper.alphaXivUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paper-link alphaxiv-link"
                    >
                      <i className="fas fa-file-pdf link-icon"></i>
                      alphaXiv
                    </a>
                    <a
                      href={`https://arxiv.org/abs/${paper.arxivId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paper-link arxiv-link"
                    >
                      <i className="ai ai-arxiv link-icon"></i>
                      arXiv
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="research-footer">
        <div className="footer-content">
          <h2 className="footer-title">Collaborate With Us</h2>
          <p className="footer-text">
            We're always looking for talented researchers and engineers to join our mission of working towards creative superintelligence.
          </p>
          <a href="mailto:join@spiralworks.ai" className="footer-email">
            join@spiralworks.ai
          </a>
        </div>
      </div>
    </div>
  );
}

export default Research;
