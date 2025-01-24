import React, { useState, useRef, useEffect } from 'react';
import '../styles/BottomCanvas.css';
// import TsVis from '../vis/TsVis';
// import GraphVis from '../vis/GraphVis';

function BottomCanvas({ onHeightChange, onToggle, isCollapsed, leftSidebarWidth, 
                        rightSidebarWidth }) {
  
  const downbarRef = useRef(null);
  const isDragging = useRef(false);
  const [height, setHeight] = useState(60);
  const [activeTab, setActiveTab] = useState('Vis1'); // Tab activa por defecto

const vis = {
  //   Vis1: { label: 'Image Collection', content: TsVis },
  //   Vis2: { label: 'Time Series Graph', content: GraphVis },
    Vis3: { label: 'Tab 3', content: () => <div>Tab 3 content</div> },
  };

  const startDragging = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', onDragging);
    document.addEventListener('mouseup', stopDragging);
  };

  const onDragging = (e) => {
    if (!isDragging.current || isCollapsed) return;

    const newHeight = window.innerHeight - e.clientY;
    if (newHeight >= 60 && newHeight <= 600) {
      setHeight(newHeight);
      onHeightChange(newHeight);
    }
  };

  const stopDragging = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onDragging);
    document.removeEventListener('mouseup', stopDragging);
  };

  const handleToggle = () => {
    onToggle();
    if (isCollapsed) {
      setHeight(200); // Restablecer la altura cuando se expande
      onHeightChange(200);
    }
  };

  useEffect(() => {
    onHeightChange(height);
  }, [height, onHeightChange]);

  return (
    <div
      ref={downbarRef}
      className={`bottomCanvas ${isCollapsed ? 'collapsed' : ''}`}
      style={{ height: `${isCollapsed ? '60px' : `${height}px`}`, left: `${leftSidebarWidth}px`, right: `${rightSidebarWidth}px` }}
    >
      <div className="toggle-wrapper">
        <button className="toggle-button" onClick={handleToggle}>
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>
      <div
        className="downslicer"
        onMouseDown={startDragging}
        title="Arrastra para redimensionar"
      ></div>
      {!isCollapsed && (
        <div className="bottomCanvas-content">
          <div className="tabs">
            {Object.keys(vis).map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {vis[tab].label}
              </button>
            ))}
          </div>
          <div className="tool-content">
            {React.createElement(vis[activeTab].content)} {/* Renderiza el componente */}
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomCanvas;