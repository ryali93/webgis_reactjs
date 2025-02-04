// src/components/Map.js
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceXYZ from 'ol/source/XYZ';
import OlControlScaleLine from 'ol/control/ScaleLine';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import CustomLayerSwitcher from '../tools/Ol-ext';
import Draw, { createRegularPolygon } from 'ol/interaction/Draw';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultInteractions } from 'ol/interaction';

import { get_data_by_id, get_metadata_by_id } from '../services/InsarServices';

import { baseLayers, egmsLayers } from '../services/MapLayers';

import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import '../styles/Map.css'

function createMap(onDrawEndCallback, onMapClickCallback) {
  // Mapa
  const map = new OlMap({
    interactions: defaultInteractions({ doubleClickZoom: false }),
    view: new OlView({
      center: fromLonLat([-3.7038, 40.4168]), // Madrid
      zoom: 6,
    }),
    layers: [baseLayers, egmsLayers], // , cogLayer
  });
  
  // Vector layer
  const source = new VectorSource();
  const vector = new VectorLayer({ source });
  map.addLayer(vector);

  // Controles
  map.addControl(new OlControlScaleLine());
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
      visible: true,
    })
    map.addLayer(tileLayer);
  }

  // Escuchar clics en el mapa para obtener información de las capas
  map.on('singleclick', async (evt) => {
    const viewResolution = map.getView().getResolution();
    const clickedCoordinate = evt.coordinate;

    // Verifica las capas interesadas
    const layersToQuery = egmsLayers.getLayers().getArray().filter((layer) =>
      ['ortho_east_view', 'ortho_up_view'].includes(layer.get('id')) && layer.getVisible()
    );

    for (const layer of layersToQuery) {
      const source = layer.getSource();
      const url_insar = source.getFeatureInfoUrl(
        clickedCoordinate,
        viewResolution,
        'EPSG:3857', // Sistema de referencia espacial
        {
          INFO_FORMAT: 'application/json', // Formato de respuesta
          FEATURE_COUNT: 1, // Máximo de características devueltas
        }
      );

      if (url_insar) {
        try {
          const response_insar = await fetch(url_insar);
          const data_insar_geo = await response_insar.json();

          const id_insar = data_insar_geo.features[0].properties.id
          console.log(`[Map.js] ID del objeto "${layer.get('id')}"`, id_insar);

          const requestDataInsar = {
            id_insar: id_insar,
            table: layer.get('id')
          }
          const data_insar_ts = await get_data_by_id(requestDataInsar);
          console.log(data_insar_ts);
          const metadata_insar = await get_metadata_by_id(requestDataInsar);
          console.log(metadata_insar);

          // Llama al callback con los datos obtenidos
          if (onMapClickCallback) {
            console.log("[Map.js] Llamando a onMapClickCallback");
            onMapClickCallback({ data_insar_ts, metadata_insar });
          }

        } catch (error) {
          console.error(`[Map.js] Error consultando la capa "${layer.get('title')}"`, error);
        }
      }
    }
  });

  return { map, addDrawInteraction, clearGeometries, addTileLayer };
}

export default createMap;
