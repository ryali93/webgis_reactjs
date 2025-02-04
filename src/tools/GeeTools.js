// src/tools/Tools.js
import React, { useEffect, useRef, useState } from 'react';
import { MdSatelliteAlt } from "react-icons/md";
import { post_mapid, post_time_series, display_img } from '../services/GeeServices';
import flatpickr from 'flatpickr';
import '../styles/Tools.css';
import 'flatpickr/dist/flatpickr.css';

const vis_s2 = {"bands":["B4","B3","B2"],"max":[3000],"min":[0]}

export function GeeToolContent({ addDrawInteraction, clearGeometries, geometry, addTileLayerFn, setTimeSeriesData, setMultitemporalImages }) {
  const [dateRange, setDateRange] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]); // Guardar los índices seleccionados

  const indices = [
    {id: "NDVI", name: "NDVI", description: "Normalized Difference Vegetation Index", vis: {"bands":["B8","B4","B3"],"max":[1],"min":[-0.4], colors: "#0c0c0c, #bfbfbf, #dbdbdb, #eaeaea, #fff9cc, #ede8b5, #ddd89b, #ccc682, #bcb76b, #afc160, #a3cc59, #91bf51, #7fb247, #70a33f, #609635, #4f892d, #3f7c23, #306d1c, #216011, #0f540a, #004400"} },
    {id: "NDWI", name: "NDWI", description: "Normalized Difference Water Index", vis: {"bands":["B8","B11","B12"],"max":[0.15],"min":[-0.1], colors: "#008000, #FFFFFF, #0000CC"} },
    {id: "NDMI", name: "NDMI", description: "Normalized Difference Moisture Index", vis: {"bands":["B8","B11","B8A"],"max":[0.8],"min":[-0.8], colors: "#800000, #ff0000, #ffff00, #00ffff, #0000ff, #000080"} },
    {id: "EVI", name: "EVI", description: "Enhanced Vegetation Index", vis: {"bands":["B8","B4","B3"],"max":[1],"min":[-0.4], colors: "#0c0c0c, #bfbfbf, #dbdbdb, #eaeaea, #fff9cc, #ede8b5, #ddd89b, #ccc682, #bcb76b, #afc160, #a3cc59, #91bf51, #7fb247, #70a33f, #609635, #4f892d, #3f7c23, #306d1c, #216011, #0f540a, #004400"} },
    {id: "SAVI", name: "SAVI", description: "Soil Adjusted Vegetation Index", vis: {"bands":["B8","B4","B3"],"max":[1],"min":[-0.4], colors: "#0c0c0c, #bfbfbf, #dbdbdb, #eaeaea, #fff9cc, #ede8b5, #ddd89b, #ccc682, #bcb76b, #afc160, #a3cc59, #91bf51, #7fb247, #70a33f, #609635, #4f892d, #3f7c23, #306d1c, #216011, #0f540a, #004400"} },
    {id: "NBR", name: "NBR", description: "Normalized Burn Ratio", vis: {"bands":["B12","B8","B4"],"max":[0],"min":[-0.5], colors: "#662506, #993404, #cc4c02, #ec7014, #fe9929, #fec44f, #fee391, #fff7bc, #ffffe5"} },
    {id: "GNDVI", name: "GNDVI", description: "Green Normalized Difference Vegetation Index", vis: {"bands":["B8","B3","B2"],"max":[0.5],"min":[-0.5], colors: "#0c0c0c, #bfbfbf, #dbdbdb, #eaeaea, #fff9cc, #ede8b5, #ddd89b, #ccc682, #bcb76b, #afc160, #a3cc59, #91bf51, #7fb247, #70a33f, #609635, #4f892d, #3f7c23, #306d1c, #216011, #0f540a, #004400"} },
  ];

  useEffect(() => {
    flatpickr('#calendar-range', {
      mode: "range",
      onChange: (selectedDates) => {
        setDateRange(selectedDates.map(d => d.toISOString().split('T')[0]));
      }
    });
  }, []);

  // Maneja selección/deselección de índices (multi-select)
  const handleSelectIndices = (indice) => {
    setSelectedIndices((prev) => {
      if (prev.includes(indice.id)) {
        // Si ya estaba seleccionado, lo quitamos
        return prev.filter((i) => i !== indice.id);
      } else {
        // Si no estaba, lo agregamos
        return [...prev, indice.id];
      }
    });
  };

  const handleGeometrySelection = (type) => {
    console.log("[GeeToolContent] handleGeometrySelection called with type:", type);
    if (addDrawInteraction) {
        addDrawInteraction(type);
    } else {
        console.error('[GeeToolContent] addDrawInteraction is not defined!');
    }
  };

  const clearGeometry = () => {
    console.log('[GeeToolContent] clearGeometry called');
    if (clearGeometries) {
        clearGeometries(); // Llama a la función para limpiar geometrías en el mapa
    } else {
        console.error('[GeeToolContent] clearGeometries is not defined!');
    }
  };

  const handleRun = async () => {
    if (dateRange.length !== 2) {
      console.error('Please select a valid date range.');
      return;
    }
    if (!geometry) {
      console.error('Please select a valid geometry.');
      return;
    }
    if (selectedIndices.length === 0) {
      console.error('Please select at least one index.');
      return;
    }

    const requestDataTimeSeries = {
      idName: "COPERNICUS/S2_SR_HARMONIZED",
      geometry: geometry,
      indices: selectedIndices.join(','),
      reducer: "mean",
      start_date: dateRange[0],
      end_date: dateRange[1],
      cloud_cover: "80",
    }

    const requestDataMapId = {
      idName: "COPERNICUS/S2_SR_HARMONIZED",
      geometry: geometry,
      bands: selectedIndices.join(','),
      gee_type: "image_collection",
      scale: "10",
      start_date: dateRange[0],
      end_date: dateRange[1],
      vis: vis_s2,
      cloud_cover: "80",
    }

    const requestURLDisplay = {
      id: "COPERNICUS/S2_SR_HARMONIZED",
      geometry: geometry,
      indices: selectedIndices.join(','),
      scale: "10",
      start_date: dateRange[0],
      end_date: dateRange[1],
      cloud_cover: "80",
    }
    
    console.log('[GeeTool:TimeSeries] Sending data:', requestDataTimeSeries);
    var time_series = await post_time_series(requestDataTimeSeries);
    setTimeSeriesData(time_series);
    console.log('[GeeTool:TimeSeries] Result:', time_series);        // Pasar los resultados al estado de App.js 
    // var mapid = await post_mapid(requestDataMapId);
    
    // Muestra los resultados en la consola
    console.log('[GeeTool:TimeSeries] Result:', time_series);
    console.log('[GeeTool:MapId] Result:', mapid);
    
    if (geometry.getType() === "Point") {
      const urls = await display_img(requestURLDisplay);     
      setMultitemporalImages(urls);
      console.log('[GeeTool:Display] Result:', urls); // SOLO FUNCIONA CON PUNTOS

    }else{
      var mapid = await post_mapid(requestDataMapId);   
      // Muestra los resultados en la consola    
      console.log('[GeeTool:MapId] Result:', mapid); // SOLO FUNCIONA CON POLÍGONOS   
      addTileLayerFn(mapid);
    }
  };

  return (
    <div>
      <h4>Google Earth Engine Tool</h4>

      <div className="drawContainer">
        <div className="drawButtons">
          <button onClick={() => handleGeometrySelection('Point')} className="drawButton" id="drawPoint" title="Point" />
          <button onClick={() => handleGeometrySelection('Rectangle')} className="drawButton" id="drawRectangle" title="Rectangle" />
          <button onClick={() => handleGeometrySelection('Polygon')} className="drawButton" id="drawPolygon" title="Polygon" />
          <button onClick={clearGeometry} className="drawButton" id="drawClear" title="Clear geometry" />
        </div>
      </div>

      <br />

      <div className="group">
        <input type="text" id="calendar-range" />
        <span className="bar"></span>
        <label className="input-label">Range of dates</label>
      </div>

      <h5>Select indices:</h5>
      <ul className="indices-list">
        {indices.map((indice) => {
          // Verificamos si este índice está seleccionado
          const isSelected = selectedIndices.includes(indice.id);
          return (
            <li
              key={indice.id}
              className={`indice-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectIndices(indice)}
              style={{ cursor: 'pointer', marginBottom: '8px' }}
            >
              {/* Nombre en negrita */}
              <strong>{indice.name}</strong>{' '}
              {/* Descripción con tipografía pequeña y color gris */}
              <span style={{ fontSize: '0.85em', color: 'black' }}>
                {indice.description}
              </span>

              {/* Si está seleccionado, mostramos una 'leyenda' de ejemplo */}
              {isSelected && (
                <div className="indice-legend" style={{ marginTop: '4px' }}>
                  {/* <p style={{ fontSize: '0.8em' }}>Legend for {indice.id}</p> */}
                  <div
                    style={{
                      width: '320px',
                      height: '15px',
                      background: 'linear-gradient(to right, ' + indice.vis.colors + ')',
                      
                    }}
                  />
                  {/* Add values range */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '0.8em' }}>Min: {indice.vis.min[0]}</p>
                    <p style={{ fontSize: '0.8em' }}>Max: {indice.vis.max[0]}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      
      <button onClick={handleRun} className="runButton">Run</button>
    </div>
  );
}

const GeeTools = {
  label: 'GEE',
  icon: <MdSatelliteAlt />,
  content: GeeToolContent,
};

export default GeeTools;