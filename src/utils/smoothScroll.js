// Smooth scroll with resistance/momentum effect
class SmoothScroll {
  constructor() {
    this.scrollTop = window.pageYOffset || 0;
    this.targetScroll = this.scrollTop;
    this.ease = 0.15; // Increased for less resistance
    this.isScrolling = false;
    this.raf = null;
    
    this.init();
  }

  init() {
    // Set up scroll listener with proper event binding
    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.update = this.update.bind(this);
    
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    
    // Start animation loop
    this.update();
  }

  onWheel(e) {
    e.preventDefault();
    
    // Add scroll delta
    this.targetScroll += e.deltaY;
    
    // Constrain scroll bounds
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    this.targetScroll = Math.max(0, Math.min(maxScroll, this.targetScroll));
    
    this.isScrolling = true;
  }

  onTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
    this.lastTouchY = this.touchStartY;
  }

  onTouchMove(e) {
    if (!this.lastTouchY) return;
    
    e.preventDefault();
    
    const touchY = e.touches[0].clientY;
    const deltaY = (this.lastTouchY - touchY) * 1.5;
    
    this.targetScroll += deltaY;
    
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    this.targetScroll = Math.max(0, Math.min(maxScroll, this.targetScroll));
    
    this.lastTouchY = touchY;
    this.isScrolling = true;
  }

  update() {
    if (this.isScrolling) {
      // Smooth interpolation
      const diff = this.targetScroll - this.scrollTop;
      this.scrollTop += diff * this.ease;
      
      // Apply scroll
      window.scrollTo(0, this.scrollTop);
      
      // Stop when close enough
      if (Math.abs(diff) < 0.5) {
        this.scrollTop = this.targetScroll;
        this.isScrolling = false;
      }
    }
    
    this.raf = requestAnimationFrame(this.update);
  }

  destroy() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
  }
}

export default SmoothScroll;