import React, { useState } from 'react';
import '../styles/RightSidebar.css';

function RightSidebar({ isCollapsed, onToggle }) {
  const [activeTab, setActiveTab] = useState('Tool1'); // Tab activa por defecto

  // Herramientas disponibles
  const tools = {
    Tool1: (
      <div>
        <h4>Tool 1</h4>
        <input type="text" placeholder="Enter value" />
        <button>Run Tool 1</button>
      </div>
    ),
    Tool2: (
      <div>
        <h4>Tool 2</h4>
        <input type="range" min="0" max="100" />
        <button>Run Tool 2</button>
      </div>
    ),
    Tool3: (
      <div>
        <h4>Tool 3</h4>
        <input type="date" />
        <button>Run Tool 3</button>
      </div>
    ),
  };

  return (
    <div className={`right-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="toggle-wrapper">
        <button className="toggle-button" onClick={onToggle}>
          {isCollapsed ? '<' : '>'}
        </button>
      </div>
      {!isCollapsed && (
        <div className="sidebar-content">
          <div className="tabs">
            {Object.keys(tools).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="tool-content">{tools[activeTab]}</div>
        </div>
      )}
    </div>
  );
}

export default RightSidebar;