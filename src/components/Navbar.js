// src/components/Navbar.js
import React from 'react';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="header">
      <div className="navbar-left">
        <a href="https://roadeye.tidop.es/" target="_blank" rel="noreferrer">
          <img
            src="logo_roadeye.svg"
            alt="Roadeye"
            height="60"
            width="80" />
        </a>
        <a href="https://apifabricacion.com/es/" target="_blank" rel="noreferrer">
          <img
            src="logo_api.svg"
            alt="API Fabricación"
            height="40"
            width="40" />
        </a>
        <a href="https://tidop.usal.es/" target="_blank" rel="noreferrer">
          <img
            src="logo_tidop.svg"
            alt="TIDOP"
            height="60"
            width="80" />
        </a>
      </div>

      <div className="navbar-center">
        <h1>ROADEYE</h1>
      </div>

      <div className="navbar-right">
        <button className="user-btn" tooltip="ryali93 (you)">R</button>
      </div>
    </nav>
  );
}

export default Navbar;
