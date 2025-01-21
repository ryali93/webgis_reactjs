// src/components/RightSidebar.js
import React, { useState } from 'react';
import '../styles/RightSidebar.css';
import { FaTools, FaSlidersH, FaCalendarAlt } from 'react-icons/fa';

function RightSidebar({ isCollapsed, onToggle }) {
  const [activeTab, setActiveTab] = useState('Tool1'); // Tab activa por defecto

  // Herramientas disponibles
  const tools = {
    Tool1: {
      label: 'Tool 1',
      content: (
        <div>
          <h4>Tool 1</h4>
          <input type="text" placeholder="Enter value" />
          <button>Run Tool 1</button>
        </div>
      ),
      icon: <FaTools />,
    },
    Tool2: {
      label: 'Tool 2',
      content: (
        <div>
          <h4>Tool 2</h4>
          <input type="range" min="0" max="100" />
          <button>Run Tool 2</button>
        </div>
      ),
      icon: <FaSlidersH />,
    },
    Tool3: {
      label: 'Tool 3',
      content: (
        <div>
          <h4>Tool 3</h4>
          <input type="date" />
          <button>Run Tool 3</button>
        </div>
      ),
      icon: <FaCalendarAlt />,
    },
  };

  const activateTab = (tab) => {
    setActiveTab(tab); // Activa la pestaña seleccionada
    if (isCollapsed) {
      onToggle(); // Expande el sidebar si está colapsado
    }
  };

  return (
    <div className={`right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Botón de colapsar/expandir */}
      <div className="toggle-wrapper">
        <button className="toggle-button" onClick={onToggle}>
          {isCollapsed ? '>' : '<'}
        </button>
      </div>
      {/* Contenido */}
      {!isCollapsed ? (
        <div className="sidebar-content">
          <div className="tabs">
            {Object.keys(tools).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => activateTab(tab)}
              >
                {tools[tab].label}
              </button>
            ))}
          </div>
          <div className="tool-content">{tools[activeTab].content}</div>
        </div>
      ) : (
        <div className="collapsed-tools">
          {Object.keys(tools).map((tab) => (
            <button
              key={tab}
              className={`collapsed-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => activateTab(tab)}
              title={tools[tab].label}
            >
              {tools[tab].icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RightSidebar;