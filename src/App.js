// src/App.js
import React, { useState, useEffect } from 'react';
import createMap from './components/Map';
import MapContainer from './components/MapContainer';
import RightSidebar from './components/RightSidebar';
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
  const [timeSeriesInSAR, setTimeSeriesInSAR] = useState(null);

  const [timeSeriesData, setTimeSeriesData] = useState(null); // Estado para almacenar los datos de la serie temporal
  const [multitemporalImages, setMultitemporalImages] = useState(null); // Estado para almacenar las imágenes multitemporales

  const [rightSidebarWidth, setRightSidebarWidth] = useState(400);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const [bottomCanvasHeight, setBottomCanvasHeight] = useState(null); // Altura inicial del BottomCanvasHeight
  const [bottomCanvasCollapsed, setBottomCanvasCollapsed] = useState(true); // Estado de colapso del BottomCanvas

  // const [leftSidebarWidth, setLeftSidebarWidth] = useState(0); // Ancho inicial del sidebar izquierdo
  // const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true); // Estado de colapso del sidebar izquierdo

  useEffect(() => {
    // Ajustar la altura del contenedor del mapa cuando cambia la altura del BottomCanvas
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
      mapContainer.style.height = `calc(100% - ${bottomCanvasHeight}px)`;
      mapContainer.style.transition = 'bottom 0.3s ease, top 0.3s ease, left 0.3s ease, right 0.3s ease';
    }
  }, [bottomCanvasHeight, rightSidebarCollapsed, rightSidebarWidth]); //, leftSidebarCollapsed, leftSidebarWidth

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
    setRightSidebarWidth(!rightSidebarCollapsed ? 50 : 400); // Ajusta el ancho según el estado de colapso
  };

  // const toggleLeftSidebar = () => {
  //   setLeftSidebarCollapsed(!leftSidebarCollapsed);
  //   setLeftSidebarWidth(!leftSidebarCollapsed ? 50 : 250); // Ajusta el ancho según el estado de colapso
  // };

  const toggleBottomCanvas = () => {
    setBottomCanvasCollapsed(!bottomCanvasCollapsed);
    setBottomCanvasHeight(bottomCanvasCollapsed ? 60 : 400); // Ajusta la altura según el estado de colapso
  };

  useEffect(() => {
    // 1) Creamos el mapa
    const { map, addDrawInteraction, clearGeometries, addTileLayer } = createMap((coordinates) => {
      console.log('[App.js] onDrawEndCallback => coordinates:', coordinates);
        setGeometry(coordinates);
      },
      (insarData) => {
        console.log('[App.js] onMapClickCallback => insarData:', insarData);
        setTimeSeriesInSAR(insarData);
      }
    );

    setMapInstance(map); // 2) Guardamos la instancia del mapa en el state
    setDrawFn(() => addDrawInteraction); // 3) Guardamos la referencia a la función de dibujado
    setClearFn(() => clearGeometries); // 4) Guardamos la referencia a clearGeometries
    setAddTileLayerFn(() => addTileLayer); // (por ejemplo)
  }, []);

  useEffect(() => {
    if (mapInstance) {
      mapInstance.updateSize();
    }
  }, [rightSidebarCollapsed, rightSidebarWidth, bottomCanvasHeight, mapInstance]); //leftSidebarCollapsed, leftSidebarWidth,

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
        {/* <Sidebar
          isCollapsed={leftSidebarCollapsed}
          onToggle={toggleLeftSidebar}
          onWidthChange={setLeftSidebarWidth}
        /> */}
          {mapInstance && <MapContainer map={mapInstance} />}

        <RightSidebar
          isCollapsed={rightSidebarCollapsed}
          onToggle={toggleRightSidebar}
          onWidthChange={setRightSidebarWidth}

          addDrawInteraction={drawFn} // Le pasamos la función del draw al sidebar
          clearGeometries={clearFn} // Le pasamos la función de limpiar geometrías al sidebar
          geometry={geometry} // Pasamos la geometría al sidebar
          addTileLayerFn={addTileLayerFn} // Pasamos la función de añadir capa al sidebar
          setTimeSeriesData={setTimeSeriesData} // Pasamos la función para añadir datos de la serie temporal
          setMultitemporalImages={setMultitemporalImages} // Pasamos la función para añadir imágenes multitemporales
        />

        <BottomCanvas
          onHeightChange={setBottomCanvasHeight}
          onToggle={toggleBottomCanvas}
          isCollapsed={bottomCanvasCollapsed}
          rightSidebarWidth={rightSidebarWidth}
          timeSeriesData={timeSeriesData} // Pasamos los datos de la serie temporal al BottomCanvas
          multitemporalImages={multitemporalImages} // Pasamos las imágenes multitemporales al BottomCanvas
          timeSeriesInSAR={timeSeriesInSAR} // Pasamos los datos de la serie temporal de InSAR al BottomCanvas
        />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;