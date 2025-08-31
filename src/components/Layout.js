import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

function Layout() {
  const location = useLocation();

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src="/icons/apple-touch-icon.png" alt="Spiral Works" className="logo-icon" />
            <span className="logo-text">Spiral Works</span>
          </Link>
          
          <div className="navbar-menu">
            <Link 
              to="/manifesto" 
              className={`navbar-link ${location.pathname === '/manifesto' ? 'active' : ''}`}
            >
              Manifesto
            </Link>
            <Link 
              to="/careers" 
              className={`navbar-link ${location.pathname === '/careers' ? 'active' : ''}`}
            >
              Careers
            </Link>
            <Link 
              to="/research" 
              className={`navbar-link ${location.pathname === '/research' ? 'active' : ''}`}
            >
              Research
            </Link>
            <a 
              href="https://form.typeform.com/to/cHdJn1Ng"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-link"
            >
              Beta
            </a>
            <span className="navbar-link disabled">
              Blog
              <span className="tooltip">Coming Soon</span>
            </span>
          </div>
          
        </div>
      </nav>

      <Outlet />

      <footer className="footer">
        &copy; 2025 Spiral Works, Inc. All Rights Reserved
      </footer>
    </div>
  );
}

export default Layout;
