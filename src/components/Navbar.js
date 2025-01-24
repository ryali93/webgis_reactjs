// src/components/Navbar.js
import React from 'react';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="header">
      <div className="navbar-left">
        {/* Agregar un archivo SVG como logo referenciado y ajustado al espacio que se tiene */}
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
