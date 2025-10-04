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
      abstract: "We establish \"combinatorial creativity\" as an entirely new category of AI generalization that goes far beyond existing frameworks. Unlike traditional generalization which has fixed correct answers, we show that combinatorial creativity is open-ended and evaluated on degrees of novelty and utility, mirroring how humans actually create and discover. By systematically studying this new form of generalization, we reveal fundamental architectural insights (optimal width-to-depth ratios) and discover a persistent novelty-utility tradeoff that suggests current scaling approaches may be insufficient for creative tasks. Our work represents a paradigm shift from viewing creativity as a fuzzy human trait to understanding it as a measurable, systematic form of generalization, opening entirely new research directions for building AI systems capable of genuine scientific discovery and innovation.",
      keywords: ["Combinatorial Creativity", "Generalization", "AI Capabilities"]
    },
    {
      id: 2,
      title: "Transformational Creativity in Science: A Graphical Theory",
      authors: "Samuel Schapiro, Jonah Black, Lav R. Varshney",
      year: "2025",
      venue: "ICCC 2025",
      arxivId: "2504.18687",
      alphaXivUrl: "https://www.alphaxiv.org/overview/2504.18687v2",
      abstract: "We present a formal graphical theory that fundamentally reframes how transformational scientific creativity occurs, proving that modifications to the foundational axioms of a conceptual space have the greatest transformative potential. By modeling scientific conceptual spaces as directed acyclic graphs where axioms are sink nodes and rules depend on these foundational assumptions, we demonstrate mathematically why paradigm shifts like Einstein's relativity, the Copernican revolution, and non-Euclidean geometry were so revolutionary: they transformed the very axioms upon which entire scientific domains were built. Our framework not only provides the first rigorous formalization of Boden's insight about \"enabling constraints\" and Kuhn's structure of scientific revolutions, but also opens a promising pathway toward building AI super-scientists capable of making transformative breakthroughs by explicitly modeling and manipulating the dependency structures that govern scientific knowledge. This work provides the first formal treatment of the notion that the most impactful scientific discoveries restructure the fundamental assumptions that make entire classes of artifacts and theories possible.",
      keywords: ["Computational Creativity", "Scientific Creativity", "Paradigm Shifts"],
      award: {
        title: "Best Short Paper Award",
        conference: "ICCC 2025",
        category: "Scientific Creativity Research"
      }
    },
    {
      id: 3,
      title: "Spark: A System for Scientifically Creative Idea Generation",
      authors: "Aishik Sanyal, Samuel Schapiro, Sumuk Shashidhar, Royce Moon, Lav R. Varshney, Dilek Hakkani-Tur",
      year: "2025",
      venue: "ICCC 2025",
      arxivId: "2504.20090",
      alphaXivUrl: "https://www.alphaxiv.org/overview/2504.20090v2",
      abstract: "We demonstrate through SPARK that large language models can be effectively combined with computational creativity principles to generate and evaluate scientific research ideas at scale. Our system integrates three key components: literature retrieval through XPLOR, structured idea generation using LLMs, and automated peer review through our JUDGE model trained on 600K OpenReview papers, to create a unified workflow for scientific ideation. We show that specialized training on academic review data enables more rigorous evaluation of research proposals compared to general-purpose LLMs, while our retrieval-augmented approach grounds idea generation in existing literature to improve novelty and feasibility. Most significantly, we establish that AI systems can move beyond simple text generation to engage in the foundational creative processes of science, though we acknowledge current limitations in generating truly transformational ideas that restructure entire conceptual spaces. By releasing our annotated dataset and demonstrating scalable idea evaluation, we provide the computational creativity community with both practical tools and a framework for exploring how AI can augment human scientific discovery while maintaining the critical assessment standards essential to research quality.",
      keywords: ["Computational Creativity", "LLMs", "Scientific Idea Generation"]
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
