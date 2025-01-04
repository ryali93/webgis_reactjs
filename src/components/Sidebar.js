// src/components/Sidebar.js
import React, { useState } from 'react';
import '../styles/Sidebar.css';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Botón de colapsar/expandir */}
      <button className="toggle-button" onClick={toggleSidebar}>
        {collapsed ? '>' : '<'}
      </button>

      {/* Lista de proyectos */}
      <div className="project-list">
        <h3>{!collapsed ? 'Projects' : ''}</h3>
        <ul>
          <li>
            <button>{collapsed ? 'P1' : 'Project 1'}</button>
          </li>
          <li>
            <button>{collapsed ? 'P2' : 'Project 2'}</button>
          </li>
          <li>
            <button>{collapsed ? 'P3' : 'Project 3'}</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
