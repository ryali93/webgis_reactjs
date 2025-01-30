import React, { useState, useRef, useEffect } from 'react';
import '../styles/BottomCanvas.css';
import TsVis from '../vis/TsVis';
import GraphVis from '../vis/GraphVis';
import InSAR from '../vis/InSAR';

function BottomCanvas({ onHeightChange, 
                        onToggle, 
                        isCollapsed,  
                        rightSidebarWidth, 
                        timeSeriesData, 
                        multitemporalImages, 
                        timeSeriesInSAR }) {
  
  const downbarRef = useRef(null);
  const isDragging = useRef(false);
  const [height, setHeight] = useState(60); // TODO
  const [activeTab, setActiveTab] = useState('Vis1'); // Tab activa por defecto

  // Definir las pestañas y su contenido
  const vis = {
    Vis1: { label: 'Image Collection', content: TsVis },
    Vis2: { label: 'Time Series Graph', content: GraphVis, canvasId : 'graphVisCanvas'},
    Vis3: { label: 'InSAR Graph', content: InSAR, canvasId : 'inSARCanvas'} 
  };

  const getPropsForActiveTab = () => {
    if (activeTab === 'Vis1') {
      return  multitemporalImages;
    } else if (activeTab === 'Vis2') {
      return {timeSeriesData, canvasId: vis[activeTab].canvasId};
    } else if (activeTab === 'Vis3') {
      return {timeSeriesInSAR, canvasId: vis[activeTab].canvasId};
    }
    return {};
  };

  // Iniciar el arrastre
  const startDragging = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', onDragging);
    document.addEventListener('mouseup', stopDragging);
  };

  const onDragging = (e) => {
    if (!isDragging.current || isCollapsed) return;

    const newHeight = window.innerHeight - e.clientY;
    if (newHeight >= 60 && newHeight <= 400) { // Limitar la altura
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


  const handleToggle = () => {
    onToggle();
    if (isCollapsed) {
      setHeight(400);
    } else {
      setHeight(60);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (isCollapsed) {
      handleToggle(); // Expandir el BottomCanvas al hacer clic en una pestaña
    }
  };

  return (
    <div
      ref={downbarRef}
      className={`bottomCanvas ${isCollapsed ? 'collapsed' : ''}`}
      style={{ height: `${isCollapsed ? '60px' : `${height}px`}`, 
               width: `calc(100% - ${rightSidebarWidth}px)` }}
    >
      <div className="bottomToggle-wrapper">
        <button className="bottomToggle-button" onClick={handleToggle}>
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>
      <div
        className="downslicer"
        onMouseDown={startDragging}
        title="Arrastra para redimensionar"
      ></div>
      <div className="tabs">
        {Object.keys(vis).map((tab) => (
          <button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => handleTabClick(tab)}
        >
          {vis[tab].label}
        </button>
        ))}
      </div>
      {!isCollapsed && (
        <div className="bottomCanvas-content">
          <div className="toolBottom-content">
            {React.createElement(vis[activeTab].content, getPropsForActiveTab())} 
          </div>
        </div>
      )}
    </div>
  );
}


export default BottomCanvas;