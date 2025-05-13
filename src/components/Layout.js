import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/navbar.css';
import Galaxy from './Galaxy';

function Layout() {
  return (
    <div className="app-container">
      <div className="canvas-container">
        <Galaxy />
      </div>
      <div className="content-wrapper">
        <nav className="nav-bar">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <span>Home</span>
          </NavLink>
          <div className="nav-link coming-soon">
            <span>Blog</span>
            <div className="tooltip">Coming Soon</div>
          </div>
        </nav>

        <Outlet />

        <footer className="footer">
          &copy; 2025 Spiral Works, Inc. All Rights Reserved
        </footer>
      </div>
    </div>
  );
}

export default Layout;