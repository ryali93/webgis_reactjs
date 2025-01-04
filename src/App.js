// src/App.js
import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import LayerManager from './components/LayerManager';
// import MapTools from './components/MapTools';
// import LayerControls from './components/LayerControls';
import RightSidebar from './components/RightSidebar';

import createMap from './components/Map';
import './App.css';

function App() {
  const [map, setMap] = useState(null);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300); // Ancho inicial del sidebar derecho

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
          style={{ marginRight: `${rightSidebarWidth}px` }} // Ajustar el espacio para el mapa
        >
          <Sidebar />
          {map && <MapContainer map={map} />} {/* Ahora el LayerManager está dentro de MapContainer */}
        </div>
        <RightSidebar onWidthChange={setRightSidebarWidth}>
          <h3>Tools</h3>
          <p>Add your tools here!</p>
          <button>Tool 1</button>
          <button>Tool 2</button>
          <button>Tool 3</button>
        </RightSidebar>
      </div>
    </ErrorBoundary>
  );
}

export default App;