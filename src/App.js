// src/App.js
import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import RightSidebar from './components/RightSidebar';
import DownBar from './components/DownBar';

import createMap from './components/Map';
import './App.css';

function App() {
  const [map, setMap] = useState(null);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(400); // Ancho inicial del sidebar derecho
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(250); // Ancho inicial del sidebar izquierdo
  const [downBarHeight, setDownBarHeight] = useState(200); // Altura inicial del downbar
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false); // Estado de colapso del sidebar derecho
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false); // Estado de colapso del sidebar izquierdo

  useEffect(() => {
    const mapInstance = createMap();
    setMap(mapInstance);
  }, []);

  const handleRightSidebarToggle = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
    setRightSidebarWidth(!rightSidebarCollapsed ? 50 : 400); // Ajusta el ancho según el estado de colapso
  };

  const handleLeftSidebarToggle = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
    setLeftSidebarWidth(!leftSidebarCollapsed ? 50 : 250); // Ajusta el ancho según el estado de colapso
  };


  useEffect(() => {
    if (map) {
      map.updateSize(); // Actualiza el tamaño del mapa
    }
  }, [rightSidebarCollapsed, rightSidebarWidth, 
      leftSidebarCollapsed, leftSidebarWidth, map]);

  return (
    <ErrorBoundary>
      <div className="App">
      <Navbar />
        <div
          className="main-content"
          style={{
            marginRight: rightSidebarCollapsed ? '50px' : `${rightSidebarWidth}px`, // Ajustar el espacio para el mapa
            transition: 'margin-right 0.3s ease', // Suavizar la transición
          }}
        >        
          
          <Sidebar onToggle={handleLeftSidebarToggle} />
          {map && <MapContainer map={map} />}

          <RightSidebar
          isCollapsed={rightSidebarCollapsed}
          onToggle={handleRightSidebarToggle}
          onWidthChange={setRightSidebarWidth}
          />

          <DownBar
          onHeightChange={setDownBarHeight}
          leftSidebarWidth={leftSidebarWidth}
          rightSidebarWidth={rightSidebarWidth}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
