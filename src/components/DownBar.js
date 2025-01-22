import React, { useState, useRef, useEffect } from 'react';
import '../styles/DownBar.css';
import TsVis from '../vis/TsVis';
import GraphVis from '../vis/GraphVis';

function DownBar({ onHeightChange, leftSidebarWidth, rightSidebarWidth }) {
  const downbarRef = useRef(null);
  const isDragging = useRef(false);
  const [height, setHeight] = useState(200);
  const [activeTab, setActiveTab] = useState('Vis1'); // Tab activa por defecto

  const vis = {
    Vis1: { label: 'Time Series Graph', content: TsVis },
    Vis2: { label: 'Image Collecion', content: GraphVis }
  };

  const startDragging = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', onDragging);
    document.addEventListener('mouseup', stopDragging);
  };

  const onDragging = (e) => {
    if (!isDragging.current) return;

    const newHeight = window.innerHeight - e.clientY;
    if (newHeight >= 50 && newHeight <= 600) {
      setHeight(newHeight);
      onHeightChange(newHeight);
    }
  };

  const stopDragging = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onDragging);
    document.removeEventListener('mouseup', stopDragging);
  };

  useEffect(() => {
    onHeightChange(height);
  }, [height, onHeightChange]);

  return (
    <div
      ref={downbarRef}
      className="downbar"
      style={{ height: `${height}px`, left: `${leftSidebarWidth}px`, right: `${rightSidebarWidth}px` }}
    >
      <div
        className="downslicer"
        onMouseDown={startDragging}
        title="Arrastra para redimensionar"
      ></div>
      <div className="downbar-content">
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
    </div>
  );
};

export default DownBar;