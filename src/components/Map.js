// src/components/Map.js
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultInteractions } from 'ol/interaction';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import CustomLayerSwitcher from '../tools/Ol-ext';

import Draw, { createRegularPolygon } from 'ol/interaction/Draw';

import Group from 'ol/layer/Group';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';
import OlSourceXYZ from 'ol/source/XYZ';
import OlControlScaleLine from 'ol/control/ScaleLine';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { baseLayers, egmsLayers } from '../services/MapLayers';

import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';

import '../styles/Map.css'

function createMap(onDrawEndCallback) {
  // Mapa
  const map = new OlMap({
    interactions: defaultInteractions({ doubleClickZoom: false }),
    view: new OlView({
      center: fromLonLat([-3.7038, 40.4168]), // Madrid
      zoom: 6,
    }),
    layers: [baseLayers, egmsLayers],
  });

  // Vector layer
  const source = new VectorSource();
  const vector = new VectorLayer({ source });
  map.addLayer(vector);

  // Controles
  map.addControl(new OlControlScaleLine());
  // map.addControl(new LayerSwitcher());
  map.addControl(new CustomLayerSwitcher());
  
  let draw; // Mantendremos la interacción actual

  // Función que se devolverá al padre (App.js)
  function addDrawInteraction(type) {
    console.log('[Map.js] addDrawInteraction called with type:', type);

    // Quitar interacción previa, si existía
    if (draw) {
      map.removeInteraction(draw);
      draw = null;
    }

    source.clear(); // Limpiar la capa vectorial

    // Crear una nueva interacción de dibujo
    draw = new Draw({
      source,
      type: (type === 'Rectangle') ? 'Circle' : type,
      geometryFunction: (type === 'Rectangle') ? createRegularPolygon(4) : undefined
    });
    map.addInteraction(draw);

    // Escuchamos el evento drawend
    draw.on('drawend', (evt) => {
      const geometry = evt.feature.getGeometry();

      if (onDrawEndCallback) {
        onDrawEndCallback(geometry);
      }

      // Eliminar la interacción de dibujo después de dibujar
      map.removeInteraction(draw);
      draw = null;
    });
  }

  function clearGeometries() {
    console.log('[Map.js] clearGeometries called');
    source.clear(); // Limpia todas las geometrías
  }

  function addTileLayer(url) {
    const tileLayer = new OlLayerTile({
      source: new OlSourceXYZ({ url }),
      title: 'S2',
      type: 'base',
      visible: false,
    })
    map.addLayer(tileLayer);
  }
  return { map, addDrawInteraction, clearGeometries, addTileLayer };
}

export default createMap;
