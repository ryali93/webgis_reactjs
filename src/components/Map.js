// src/components/Map.js
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import OlSourceXYZ from 'ol/source/XYZ';
import OlControlScaleLine from 'ol/control/ScaleLine';
import { fromLonLat } from 'ol/proj';

import 'ol/ol.css';

function createMap() {
  const baseLayers = [
    new OlLayerTile({
      source: new OlSourceOsm(),
      title: 'OpenStreetMap',
      type: 'base',
      visible: true,
    }),
    new OlLayerTile({
      source: new OlSourceXYZ({
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      }),
      title: 'Satellite',
      type: 'base',
      visible: false,
    }),
  ];

  const overlayLayers = [
    new OlLayerTile({
      source: new OlSourceOsm(),
      title: 'Overlay Layer',
      opacity: 0.7,
      type: 'overlay',
    }),
  ];

  const map = new OlMap({
    view: new OlView({
      center: fromLonLat([-3.7038, 40.4168]), // Madrid
      zoom: 6,
    }),
    layers: [...baseLayers], //, ...overlayLayers
  });

  // Funciones para gestionar las capas
  map.getLayerManager = () => ({
    baseLayers,
    // overlayLayers,
    toggleLayerVisibility: (layer) => {
      layer.setVisible(!layer.getVisible());
    },
    setLayerOpacity: (layer, opacity) => {
      layer.setOpacity(opacity);
    },
  });

  // Set a scale line control
  var scale = new OlControlScaleLine();
  map.addControl(scale);

  return map;
}

export default createMap;
