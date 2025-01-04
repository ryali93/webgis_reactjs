// src/components/MapTools.js
import React, { useState } from 'react';
import '../styles/MapTools.css';

function MapTools({ map }) {
  const [currentBaseMap, setCurrentBaseMap] = useState('osm');

  const changeBaseMap = (type) => {
    if (map) {
      const layers = map.getLayers().getArray();
      layers.forEach((layer) => {
        if (layer.get('type') === 'base') {
          layer.setVisible(layer.get('title') === type);
        }
      });
      setCurrentBaseMap(type);
    }
  };

  const adjustOpacity = (value) => {
    if (map) {
      const layers = map.getLayers().getArray();
      const exampleLayer = layers.find((layer) => layer.get('title') === 'Example Layer');
      if (exampleLayer) {
        exampleLayer.setOpacity(value);
      }
    }
  };

  return (
    <div className="map-tools">
      {/* Botones de zoom */}
      <button onClick={() => map.getView().setZoom(map.getView().getZoom() + 1)}>+</button>
      <button onClick={() => map.getView().setZoom(map.getView().getZoom() - 1)}>-</button>

      {/* Selector de mapas base */}
      <div className="basemap-switcher">
        <button
          className={currentBaseMap === 'osm' ? 'active' : ''}
          onClick={() => changeBaseMap('OSM')}
        >
          OSM
        </button>
        <button
          className={currentBaseMap === 'satellite' ? 'active' : ''}
          onClick={() => changeBaseMap('Satellite')}
        >
          Satellite
        </button>
      </div>

      {/* Control deslizante de opacidad */}
      <div className="opacity-slider">
        <label>Opacity:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => adjustOpacity(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

export default MapTools;
