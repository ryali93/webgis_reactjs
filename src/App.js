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
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300); // Ancho inicial del sidebar derecho
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(250); // Ancho inicial del sidebar izquierdo
  const [downBarHeight, setDownBarHeight] = useState(300); // Altura inicial del sidebar inferior
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  useEffect(() => {
    const mapInstance = createMap();
    setMap(mapInstance);
  }, []);

  const handleLeftSidebarToggle = (collapsed) => {
    setIsLeftSidebarCollapsed(collapsed);
    setLeftSidebarWidth(collapsed ? 50 : 250); // Ajusta el ancho según el estado de colapso
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar />
        <div
          className="main-content"
          style={{ marginRight: `${rightSidebarWidth}px` }} // Ajustar el espacio para el mapa
        >
          <Sidebar onToggle={handleLeftSidebarToggle} />
          {map && <MapContainer map={map} />} {/* Ahora el LayerManager está dentro de MapContainer */}
        </div>
        <RightSidebar onWidthChange={setRightSidebarWidth}>
        </RightSidebar>

        <DownBar 
        onHeightChange={setDownBarHeight}
        leftSidebarWidth={leftSidebarWidth}
        rightSidebarWidth={rightSidebarWidth}
        /> 
      </div>
    </ErrorBoundary>
  );
}

export default App;