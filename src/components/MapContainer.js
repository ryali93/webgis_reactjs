// src/components/MapContainer.js
import React, { useEffect, useRef } from 'react';
import '../styles/MapContainer.css';

function MapContainer({ map }) {
  const mapRef = useRef();

  useEffect(() => {
    if (map) {
      map.setTarget(mapRef.current);
      map.updateSize(); // Actualizar el tamaño al inicializar
    }

    return () => {
      if (map) {
        map.setTarget(null);
      }
    };
  }, [map]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="ol-map" />
    </div>
  );
}

export default MapContainer;
