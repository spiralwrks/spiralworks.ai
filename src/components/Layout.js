import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import StarBorder from './StarBorder';
import '../styles/navbar.css';

function Layout() {
  const location = useLocation();

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src="/icons/apple-touch-icon.png" alt="Spiral Works" className="logo-icon" />
            <span className="logo-text">Spiral Works</span>
          </div>
          
          <div className="navbar-menu">
            <Link 
              to="/" 
              className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}
            >
              About
            </Link>
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
