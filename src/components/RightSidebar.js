import React, { useState } from 'react';
import '../styles/RightSidebar.css';
import GeeTools from '../tools/GeeTools';
import VhrTools from '../tools/VhrTools';
import InsarTools from '../tools/InsarTools';

function RightSidebar({ isCollapsed, onToggle }) {
  const [activeTab, setActiveTab] = useState('Tool1'); // Tab activa por defecto

  // Herramientas disponibles
  const tools = {
    Tool1: GeeTools,
    Tool2: VhrTools,
    Tool3: InsarTools,
  };

  const activateTab = (tab) => {
    setActiveTab(tab); // Activa la pestaña seleccionada
    if (isCollapsed) {
      onToggle(); // Expande el sidebar si está colapsado
    }
  };

  return (
    <div className={`right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="toggle-wrapper">
        <button className="toggle-button" onClick={onToggle}>
          {isCollapsed ? '>' : '<'}
        </button>
      </div>
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
          <div className="tool-content">
            {React.createElement(tools[activeTab].content)} {/* Renderiza el componente */}
          </div>
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
