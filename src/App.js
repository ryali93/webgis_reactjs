// src/App.js
import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import RightSidebar from './components/RightSidebar';

import createMap from './components/Map';
import './App.css';

function App() {
  const [map, setMap] = useState(null);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(400); // Ancho inicial del sidebar derecho
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false); // Estado de colapso del sidebar derecho

  useEffect(() => {
    const mapInstance = createMap();
    setMap(mapInstance);
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar />
        <div
          className="main-content"
          style={{
            marginRight: rightSidebarCollapsed ? '50px' : `${rightSidebarWidth}px`, // Ajustar el espacio para el mapa
          }}
        >
          <Sidebar />
          {map && <MapContainer map={map} />}
        </div>
        <RightSidebar
          isCollapsed={rightSidebarCollapsed}
          onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          onWidthChange={setRightSidebarWidth}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
