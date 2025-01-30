// src/components/RightSidebar.js
import React, { useState , useEffect } from 'react';
import '../styles/RightSidebar.css';

import GeeTools from '../tools/GeeTools';
import VhrTools from '../tools/VhrTools';
import FloodTools from '../tools/FloodTools';

function RightSidebar({
  isCollapsed,
  onToggle,
  onWidthChange,
  addDrawInteraction,
  clearGeometries,
  geometry,
  addTileLayerFn,
  setTimeSeriesData,
  setMultitemporalImages
}) {

  const [activeTab, setActiveTab] = useState('Tool1');

  const tools = {
    Tool1: GeeTools,
    Tool2: FloodTools,
    Tool3: VhrTools,
  };

  const activateTab = (tab) => {
    setActiveTab(tab); 
    if (isCollapsed) {
      onToggle();
    }
  };


const addTimeSeriesData = (timeSeriesData) => {
  console.log('[RightSidebar] addTimeSeriesData:', timeSeriesData);
  setTimeSeriesData(timeSeriesData);
  return timeSeriesData;
  };

const addMultitemporalImages = (multitemporalImages) => {
  const urlsArray = JSON.parse(multitemporalImages);
  setMultitemporalImages(urlsArray);
return multitemporalImages;
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
            {
              React.createElement(tools[activeTab].content, {
                // Pasamos la misma prop, sin renombrar
                addDrawInteraction: (type) => {
                  console.log('[RightSidebar] Child wants to draw:', type);
                  if (addDrawInteraction) {
                    addDrawInteraction(type);
                  } else {
                    console.warn('No addDrawInteraction function found!');
                  }
                },
                clearGeometries: () => {
                  if (clearGeometries) {
                    clearGeometries();
                  } else {
                    console.warn('No clearGeometries function found!');
                  }
                },
                geometry: geometry,
                addTileLayerFn: addTileLayerFn,
                setTimeSeriesData: addTimeSeriesData,
                setMultitemporalImages: addMultitemporalImages
              })
            }
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