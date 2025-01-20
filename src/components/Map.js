// src/components/Map.js
import ol from 'ol';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import Group from 'ol/layer/Group';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import OlSourceXYZ from 'ol/source/XYZ';
import OlControlScaleLine from 'ol/control/ScaleLine';
import { fromLonLat } from 'ol/proj';
import LayerSwitcher from 'ol-layerswitcher';

import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

function createMap() {
  const baseLayers = new Group({
    title: 'Basemaps',
    layers: [
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
    ],
  });

  // Overlay Layers
  const overlayLayers = new Group({
    title: 'Overlays',
    layers: [
      new OlLayerTile({
        source: new OlSourceXYZ({
          url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        }),
        title: 'Humanitarian',
        visible: false,
        opacity: 0.7,
      }),
    ],
  });

  const map = new OlMap({
    view: new OlView({
      center: fromLonLat([-3.7038, 40.4168]), // Madrid
      zoom: 6,
    }),
    layers: [baseLayers],
  });

  // Set a layer switcher control
  const layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group',
    startActive: true, // Start open
  });

  // Set a scale line control
  var scale = new OlControlScaleLine();

  map.addControl(layerSwitcher);
  map.addControl(scale);

  
  return map;
}

export default createMap;
