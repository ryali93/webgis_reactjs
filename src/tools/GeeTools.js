// src/tools/Tools.js

import React, { useEffect, useState } from 'react';
import { MdSatelliteAlt } from "react-icons/md";
import flatpickr from 'flatpickr';
import '../styles/Tools.css';
import 'flatpickr/dist/flatpickr.css';
import { GeeFunction } from '../services/GeeServices';

export function GeeToolContent({ addDrawInteraction, clearGeometries, geometry }) {
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    flatpickr('#calendar-range', {
      mode: "range",
      onChange: (selectedDates) => {
        setDateRange(selectedDates.map(d => d.toISOString().split('T')[0]));
      }
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

  const handleRun = () => {
    if (dateRange.length !== 2) {
      console.error('Please select a valid date range.');
      return;
    }
    if (!geometry) {
      console.error('Please select a valid geometry.');
      return;
    }

    const requestData = {
      "geometry": geometry,
      "dateRange": dateRange,
    }

    console.log('[GeeToolContent] Sending data:', requestData);
    GeeFunction(requestData);
  };

  return (
    <div>
      <h4>Google Earth Engine Tool</h4>

      <div className="drawContainer">
        <div className="drawButtons">
          <button onClick={() => handleGeometrySelection('Point')} className="drawButton" id="drawPoint" title="Point" />
          <button onClick={() => handleGeometrySelection('Rectangle')} className="drawButton" id="drawRectangle" title="Rectangle" />
          <button onClick={() => handleGeometrySelection('Polygon')} className="drawButton" id="drawPolygon" title="Polygon" />
          {/* <button onClick={() => setGeometry('')} className="drawButton" id="drawClear" title="Clear geometry" /> */}
          <button onClick={clearGeometry} className="drawButton" id="drawClear" title="Clear geometry" />
        </div>
      </div>

      <br />

      <div className="group">
        <input type="text" id="calendar-range" />
        <span className="bar"></span>
        <label className="input-label">Range of dates</label>
      </div>

      <br />
      
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