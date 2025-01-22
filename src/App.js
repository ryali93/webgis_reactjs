// src/App.js
import React, { useState, useEffect } from 'react';
import createMap from './components/Map';
import MapContainer from './components/MapContainer';
import RightSidebar from './components/RightSidebar';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import BottomCanvas from './components/BottomCanvas';

import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [mapInstance, setMapInstance] = useState(null);
  const [drawFn, setDrawFn] = useState(null);
  const [clearFn, setClearFn] = useState(null);
  const [geometry, setGeometry] = useState(null);

  const [rightSidebarWidth, setRightSidebarWidth] = useState(400);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const [leftSidebarWidth, setLeftSidebarWidth] = useState(250); // Ancho inicial del sidebar izquierdo
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true); // Estado de colapso del sidebar izquierdo

  const [bottomCanvasHeight, setBottomCanvasHeight] = useState(200); // Altura inicial del BottomCanvasHeight

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
    setRightSidebarWidth(!rightSidebarCollapsed ? 50 : 400); // Ajusta el ancho según el estado de colapso
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
    setLeftSidebarWidth(!leftSidebarCollapsed ? 50 : 250); // Ajusta el ancho según el estado de colapso
  };

  useEffect(() => {
    // 1) Creamos el mapa
    const { map, addDrawInteraction, clearGeometries } = createMap((coordinates) => {
      console.log('[App.js] onDrawEndCallback => coordinates:', coordinates);
      setGeometry(coordinates);
    });

    setMapInstance(map); // 2) Guardamos la instancia del mapa en el state
    setDrawFn(() => addDrawInteraction); // 3) Guardamos la referencia a la función de dibujado
    setClearFn(() => clearGeometries); // 4) Guardamos la referencia a clearGeometries
  }, []);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.updateSize();
    }
  }, [rightSidebarCollapsed, rightSidebarWidth, 
      leftSidebarCollapsed, leftSidebarWidth,
      mapInstance]);

  return (
    <ErrorBoundary>
      <div className="App">
        <Navbar />
        <div
          className="main-content"
          style={{
            marginRight: rightSidebarCollapsed ? '50px' : `${rightSidebarWidth}px`,
            transition: 'margin-right 0.3s ease',
          }}
        >
          <Sidebar onToggle={toggleLeftSidebar}/>
          {mapInstance && <MapContainer map={mapInstance} />}

        <RightSidebar
          isCollapsed={rightSidebarCollapsed}
          onToggle={toggleRightSidebar}
          onWidthChange={setRightSidebarWidth}

          addDrawInteraction={drawFn} // Le pasamos la función del draw al sidebar
          clearGeometries={clearFn} // Le pasamos la función de limpiar geometrías al sidebar
          geometry={geometry} // Pasamos la geometría al sidebar
        />

        <BottomCanvas
          onHeightChange={setBottomCanvasHeight}
          leftSidebarWidth={leftSidebarWidth}
          rightSidebarWidth={rightSidebarWidth}
        />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;