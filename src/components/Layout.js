import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../styles/navbar.css'; // We'll create this file for navbar styles
import Galaxy from './Galaxy';

function Layout() {
  const location = useLocation();

  return (
    <div className="container">
        <div className="canvas-container">
            <Galaxy />
        </div>
      <nav className="nav-bar">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <span>Home</span>
        </Link>
        <Link to="/reading-group" className={`nav-link ${location.pathname === '/reading-group' ? 'active' : ''}`}>
          <span>Reading Group</span>
        </Link>
        <span className="nav-link coming-soon">
          <span>Blog</span>
          <span className="tooltip">COMING SOON</span>
        </span>
      </nav>

      <Outlet />

      <footer className="footer">
        @ 2024 Spiral Works, Inc. All Rights Reserved
      </footer>
    </div>
  );
}

export default Layout;