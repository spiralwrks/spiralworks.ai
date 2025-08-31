import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StarryBackground from './StarryBackground';
import '../styles/Research.css';

gsap.registerPlugin(ScrollTrigger);

function Research() {
  const papersRef = useRef([]);
  const heroRef = useRef(null);

  const copyBibtex = (paper) => {
    const bibtex = `@article{${paper.authors.split(',')[0].split(' ').pop().toLowerCase()}${paper.year},
  title={${paper.title}},
  author={${paper.authors}},
  journal={arXiv preprint arXiv:${paper.arxivId}},
  year={${paper.year}}
}`;
    navigator.clipboard.writeText(bibtex);
    alert('BibTeX citation copied to clipboard!');
  };

  const papers = [
    {
      id: 1,
      title: "Spark: A System for Scientifically Creative Idea Generation",
      authors: "Aishik Sanyal, Samuel Schapiro, Sumuk Shashidhar, Royce Moon, Lav R. Varshney, Dilek Hakkani-Tur",
      year: "2025",
      venue: "ICCC 2025",
      arxivId: "2504.20090",
      abstract: "Recently, large language models (LLMs) have shown promising abilities to generate novel research ideas in science, a direction which coincides with many foundational principles in computational creativity (CC). We present Spark, an innovative idea generation system that leverages these capabilities.",
      keywords: ["Computational Creativity", "LLMs", "Information Retrieval"],
      highlights: [
        "Developed Spark, an innovative idea generation system leveraging computational creativity principles",
        "Coupled retrieval-augmented idea generation using large language models for scientific research",
        "Created and trained Judge, a specialized reviewer model for evaluating scientific ideas",
        "Released an annotated dataset for training idea evaluation models"
      ]
    },
    {
      id: 2,
      title: "Transformational Creativity in Science: A Graphical Theory",
      authors: "Samuel Schapiro, Jonah Black, Lav R. Varshney",
      year: "2025",
      venue: "ICCC 2025",
      arxivId: "2504.18687",
      abstract: "Creative processes are typically divided into three types: combinatorial, exploratory, and transformational. Here, we provide a graphical theory of transformational scientific creativity, synthesizing Boden's insight that transformational creativity arises from changes in the 'enabling constraints' of a conceptual space and Kuhn's structure of scientific revolutions.",
      keywords: ["Scientific Creativity", "Conceptual Spaces", "Paradigm Shifts"],
      highlights: [
        "Developed a novel graphical theory of transformational scientific creativity",
        "Synthesized foundational ideas from Margaret Boden and Thomas Kuhn's work",
        "Mathematically proved that modifications to axioms have the most transformative potential",
        "Illustrated historical instances of transformational creativity using theoretical framework"
      ],
      award: {
        title: "Best Paper Award",
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
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handlePaperLeave = (index) => {
    const paper = papersRef.current[index];
    if (paper) {
      gsap.to(paper, {
        scale: 1,
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
          <h1 className="research-title">Research</h1>
          <p className="research-subtitle">
            Advancing the Frontier of Creative AI
          </p>
          <div className="research-stats">
            <div className="stat-item">
              <span className="stat-number">10+</span>
              <span className="stat-label">Research Fellows</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">20M</span>
              <span className="stat-label">Pages of Scientific Data Analyzed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Types of Creativity Modeled</span>
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
                <p className="paper-venue">Accepted at {paper.venue}</p>
              )}
              
              <p className="paper-abstract">{paper.abstract}</p>

              <div className="paper-highlights">
                <h3 className="highlights-title">Key Contributions</h3>
                <ul className="highlights-list">
                  {paper.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>

              <div className="paper-links">
                <a 
                  href={`https://arxiv.org/abs/${paper.arxivId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-link arxiv-link"
                >
                  <svg className="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Read on arXiv
                </a>
                <button 
                  className="paper-link cite-link"
                  onClick={() => copyBibtex(paper)}
                >
                  <svg className="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-4h-6v2h6v-2zm0-4h-6v2h6V7zm0 8h-6v2h6v-2z" />
                  </svg>
                  Cite
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="research-footer">
        <div className="footer-content">
          <h2 className="footer-title">Collaborate With Us</h2>
          <p className="footer-text">
            We're always looking for talented researchers and engineers to join our mission
            of advancing creative superintelligence.
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