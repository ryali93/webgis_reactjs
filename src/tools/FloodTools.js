import React, { useEffect, useState } from 'react';
import { MdFlood } from "react-icons/md";
import flatpickr from 'flatpickr';
import '../styles/Tools.css';
import 'flatpickr/dist/flatpickr.css';
import { get_flood } from '../services/GeeServices';

export function FloodToolContent( {addDrawInteraction, clearGeometries, geometry, addTileLayerFn} ) {
    const [dateEval, setDate] = useState([]);

    useEffect(() => {
        flatpickr('#calendar-range', {
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    const fechaFormateada = selectedDates[0].toISOString().slice(0, 10);
                    setDate(fechaFormateada);
                }
            }
        });
    }, []);
    
    const handleGeometrySelection = (type) => {
        console.log("[FloodToolContent] handleGeometrySelection called with type:", type);
        if (addDrawInteraction) {
            addDrawInteraction(type);
        } else {
            console.error('[FloodToolContent] addDrawInteraction is not defined!');
        }
    };

    const clearGeometry = () => {
        console.log('[FloodToolContent] clearGeometry called');
        if (clearGeometries) {
            clearGeometries(); // Llama a la función para limpiar geometrías en el mapa
        } else {
            console.error('[FloodToolContent] clearGeometries is not defined!');
        }
    };

    const handleRun = async () => {
        if (!geometry) {
            console.error('Please select a valid geometry.');
            return;
        }
    
        // Calcular start_date y end_date basados en dateEval
        const date = new Date(dateEval);
        const start_date = new Date(date);
        start_date.setDate(date.getDate() - 10); // 10 días antes
    
        const end_date = new Date(date);
        end_date.setDate(date.getDate() + 10); // 10 días después
    
        // Formatear las fechas como YYYY-MM-DD
        const formatDate = (date) => date.toISOString().slice(0, 10);
        const formattedStartDate = formatDate(start_date);
        const formattedEndDate = formatDate(end_date);
    
        const requestFlood = {
            geometry: geometry,
            date_eval: dateEval,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
        };
    
        const response = await get_flood(requestFlood);
        const mapid = response["url_xyz"]["urlFormat"]
    
        addTileLayerFn(mapid);
    };

    return (
        <div>
        <h4>Flood Tool</h4>

        <div className="drawContainer">
            <div className="drawButtons">
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

        <button onClick={handleRun} className="runButton">Run</button>
        </div>
    );
}

const FloodTools = {
    label: 'Flood',
    icon: <MdFlood />,
    content: FloodToolContent,
};

export default FloodTools;
