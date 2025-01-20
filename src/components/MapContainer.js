import React, { useEffect, useRef, useState } from 'react';
import LayerManager from './LayerManager';
import '../styles/MapContainer.css';

function MapContainer({ map }) {
  const mapRef = useRef();
  const [layerState, setLayerState] = useState({
    baseLayers: []
    // overlayLayers: [],
  });

  useEffect(() => {
    if (map) {
      map.setTarget(mapRef.current);

      // Sincronizar estado inicial de las capas
      const layerManager = map.getLayerManager();
      setLayerState({
        baseLayers: layerManager.baseLayers.map((layer) => ({
          layer,
          visible: layer.getVisible(),
          opacity: layer.getOpacity(),
        }))
        // ,
        // overlayLayers: layerManager.overlayLayers.map((layer) => ({
        //   layer,
        //   visible: layer.getVisible(),
        //   opacity: layer.getOpacity(),
        // })),
      });
    }

    return () => {
      if (map) {
        map.setTarget(null);
      }
    };
  }, [map]);

  const toggleVisibility = (targetLayer) => {
    const newState = { ...layerState };

    for (const layerGroup of ['baseLayers']) { //, 'overlayLayers'
      newState[layerGroup] = newState[layerGroup].map((item) => {
        if (item.layer === targetLayer) {
          item.layer.setVisible(!item.visible);
          return { ...item, visible: !item.visible };
        }
        return item;
      });
    }

    setLayerState(newState);
  };

  const changeOpacity = (targetLayer, value) => {
    const newState = { ...layerState };

    for (const layerGroup of ['baseLayers']) { //, 'overlayLayers'
      newState[layerGroup] = newState[layerGroup].map((item) => {
        if (item.layer === targetLayer) {
          item.layer.setOpacity(value);
          return { ...item, opacity: value };
        }
        return item;
      });
    }

    setLayerState(newState);
  };

  return (
    <div className="map-container">
      <div ref={mapRef} className="ol-map" />
      <LayerManager
        baseLayers={layerState.baseLayers}
        // overlayLayers={layerState.overlayLayers}
        toggleVisibility={toggleVisibility}
        changeOpacity={changeOpacity}
      />
    </div>
  );
}

export default MapContainer;
