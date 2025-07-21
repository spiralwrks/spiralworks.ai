import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom"
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    // Handle React elements with mixed content
    if (typeof children === 'string') {
      return children.split(/(\s+)/).map((word, index) => {
        if (word.match(/^\s+$/)) return word;
        return (
          <span className="word" key={index}>
            {word}
          </span>
        );
      });
    } else {
      // For React elements, just return them as-is wrapped in words
      return React.Children.map(children, (child, index) => {
        if (typeof child === 'string') {
          return child.split(/(\s+)/).map((word, wordIndex) => {
            if (word.match(/^\s+$/)) return word;
            return (
              <span className="word" key={`${index}-${wordIndex}`}>
                {word}
              </span>
            );
          });
        }
        return (
          <span className="word" key={index}>
            {child}
          </span>
        );
      }).flat();
    }
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    try {
      const scroller =
        scrollContainerRef && scrollContainerRef.current
          ? scrollContainerRef.current
          : window;

      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        gsap.fromTo(
          el,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          {
            ease: 'none',
            rotate: 0,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top bottom',
              end: rotationEnd,
              scrub: true,
            },
          }
        );

        const wordElements = el.querySelectorAll('.word');
        
        if (wordElements.length > 0) {
          gsap.fromTo(
            wordElements,
            { opacity: baseOpacity, willChange: 'opacity' },
            {
              ease: 'none',
              opacity: 1,
              stagger: 0.05,
              scrollTrigger: {
                trigger: el,
                scroller,
                start: 'top bottom-=20%',
                end: wordAnimationEnd,
                scrub: true,
              },
            }
          );

          if (enableBlur) {
            gsap.fromTo(
              wordElements,
              { filter: `blur(${blurStrength}px)` },
              {
                ease: 'none',
                filter: 'blur(0px)',
                stagger: 0.05,
                scrollTrigger: {
                  trigger: el,
                  scroller,
                  start: 'top bottom-=20%',
                  end: wordAnimationEnd,
                  scrub: true,
                },
              }
            );
          }
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    } catch (error) {
      console.warn('ScrollReveal animation error:', error);
    }
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;