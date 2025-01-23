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
  const [addTileLayerFn, setAddTileLayerFn] = useState(null);

  const [rightSidebarWidth, setRightSidebarWidth] = useState(400);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const [leftSidebarWidth, setLeftSidebarWidth] = useState(50); // Ancho inicial del sidebar izquierdo
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true); // Estado de colapso del sidebar izquierdo

  const [bottomCanvasHeight, setBottomCanvasHeight] = useState(200); // Altura inicial del BottomCanvasHeight
  const [bottomCanvasCollapsed, setBottomCanvasCollapsed] = useState(true); // Estado de colapso del BottomCanvas

  useEffect(() => {
    // Ajustar la altura del contenedor del mapa cuando cambia la altura del BottomCanvas
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.style.height = `calc(100% - ${bottomCanvasHeight}px)`;
      mapContainer.style.left = `${leftSidebarCollapsed ? '50px' : `${leftSidebarWidth}px`}`;
      mapContainer.style.transition = 'bottom 0.3s ease, top 0.3s ease, left 0.3s ease, right 0.3s ease';
    }
  }, [bottomCanvasHeight, leftSidebarCollapsed, leftSidebarWidth]);

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
    setRightSidebarWidth(!rightSidebarCollapsed ? 50 : 400); // Ajusta el ancho según el estado de colapso
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
    setLeftSidebarWidth(!leftSidebarCollapsed ? 50 : 250); // Ajusta el ancho según el estado de colapso
  };

  const toggleBottomCanvas = () => {
    setBottomCanvasCollapsed(!bottomCanvasCollapsed);
    setBottomCanvasHeight(bottomCanvasHeight === 60 ? 200 : 60); // Cambia la altura del BottomCanvas

  }

  useEffect(() => {
    // 1) Creamos el mapa
    const { map, addDrawInteraction, clearGeometries, addTileLayer } = createMap((coordinates) => {
      console.log('[App.js] onDrawEndCallback => coordinates:', coordinates);
      setGeometry(coordinates);
    });

    setMapInstance(map); // 2) Guardamos la instancia del mapa en el state
    setDrawFn(() => addDrawInteraction); // 3) Guardamos la referencia a la función de dibujado
    setClearFn(() => clearGeometries); // 4) Guardamos la referencia a clearGeometries
    setAddTileLayerFn(() => addTileLayer); // (por ejemplo)
  }, []);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.updateSize();
    }
  }, [rightSidebarCollapsed, rightSidebarWidth, 
      leftSidebarCollapsed, leftSidebarWidth,
      bottomCanvasHeight, mapInstance]);

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
        <Sidebar
          isCollapsed={leftSidebarCollapsed}
          onToggle={toggleLeftSidebar}
          onWidthChange={setLeftSidebarWidth}
        />
        <div 
        className="map-container">
          {mapInstance && <MapContainer map={mapInstance} />}
        </div>
        <BottomCanvas
          onHeightChange={setBottomCanvasHeight}
          onToggle={toggleBottomCanvas}
          isCollapsed={bottomCanvasCollapsed}
          leftSidebarWidth={leftSidebarWidth}
          rightSidebarWidth={rightSidebarWidth}
        />
      </div>
      <RightSidebar
        isCollapsed={rightSidebarCollapsed}
        onToggle={toggleRightSidebar}
        onWidthChange={setRightSidebarWidth}
        addDrawInteraction={drawFn} // Le pasamos la función del draw al sidebar
        clearGeometries={clearFn} // Le pasamos la función de limpiar geometrías al sidebar
        geometry={geometry} // Pasamos la geometría al sidebar
        addTileLayerFn={addTileLayerFn} // Pasamos la función de añadir capa al sidebar
      />
    </div>
  </ErrorBoundary>
);
}

export default App;