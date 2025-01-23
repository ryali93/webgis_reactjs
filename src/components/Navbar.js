// src/components/Navbar.js
import React from 'react';
import '../styles/Navbar.css';
// import '../styles/Navbar_naxatw.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Navbar() {
  return (
    <nav className="header">
      <div className="navbar-left">
        <ArrowBackIcon />
        <div className="draw-icons-wrapper">
          <div className="darwing-icons">
            <img src="https://data.geonadir.com/assets/Icons-e3443da7.svg" alt="Pan" />
          </div>
          <div className="darwing-icons">
            <img src="https://data.geonadir.com/assets/Icons1-de5dad24.svg" alt="Select" />
          </div>
          <div className="darwing-icons">
            <img src="https://data.geonadir.com/assets/Icons4-49204475.svg" alt="Draw" />
          </div>
          <div className="darwing-icons">
            <img src="https://data.geonadir.com/assets/Icons10-a4a64d90.svg" alt="Edit" />
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <h1>Proyecto Prueba</h1>
      </div>

      <div className="navbar-right">
        <button className="user-btn" tooltip="ryali93 (you)">R</button>
      </div>
    </nav>
  );
}

export default Navbar;
