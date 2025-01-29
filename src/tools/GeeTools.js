// src/tools/Tools.js
import React, { useEffect, useRef, useState } from 'react';
import { MdSatelliteAlt } from "react-icons/md";
import { post_mapid, post_time_series, display_img } from '../services/GeeServices';
import Tagify from '@yaireo/tagify';
import flatpickr from 'flatpickr';
import '@yaireo/tagify/dist/tagify.css';
import '../styles/Tools.css';
import 'flatpickr/dist/flatpickr.css';
import { set } from 'ol/transform';

const vis_s2 = {"bands":["B4","B3","B2"],"max":[3000],"min":[0]}

export function GeeToolContent({ addDrawInteraction, clearGeometries, geometry, addTileLayerFn,
  setTimeSeriesData, setMultitemporalImages}) {
  const [dateRange, setDateRange] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]); // Guardar los índices seleccionados
  const tagifyRef = useRef(); // Referencia para Tagify

  useEffect(() => {
    flatpickr('#calendar-range', {
      mode: "range",
      onChange: (selectedDates) => {
        setDateRange(selectedDates.map(d => d.toISOString().split('T')[0]));
      }
    });
  }, []);

  useEffect(() => {
    const input = tagifyRef.current; // Obtener la referencia del input
    const tagify = new Tagify(input, {
      whitelist: ["NDVI", "NDWI", "NDMI", "EVI", "SAVI", "GNDVI", "NBR"], // Opciones disponibles
      maxTags: 7,
      dropdown: {
        enabled: 1, // Mostrar sugerencias al escribir
        maxItems: 7,
      },
    });

    tagify.on('change', (e) => {
      const selected = e.detail.value ? JSON.parse(e.detail.value) : [];
      setSelectedIndices(selected.map(tag => tag.value)); // Actualizar estado con los índices seleccionados
      console.log('Selected indices:', selected.map(tag => tag.value));
    });
  }, []);

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

    console.log(geometry);

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

    // const {id, geometry, indices, scale, start_date, end_date, cloud_cover} = request.query;
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

      <div className="group">
        <input ref={tagifyRef} name="tags" placeholder="Select indices (e.g., NDVI, NDWI)" />
        <span className="bar"></span>
      </div>
      
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