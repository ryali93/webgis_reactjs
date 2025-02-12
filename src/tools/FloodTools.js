import React, { useEffect, useState } from 'react';
import { MdFlood } from "react-icons/md";
import flatpickr from 'flatpickr';
import '../styles/Tools.css';
import 'flatpickr/dist/flatpickr.css';
import { get_flood } from '../services/GeeServices';
import { fromLonLat } from 'ol/proj';

export function FloodToolContent( {addDrawInteraction, clearGeometries, geometry, addTileLayerFn, mapInstance} ) {
    const [dateEval, setDate] = useState([]);
    const [selectedExample, setSelectedExample] = useState(null);
    const [flatpickrInstance, setFlatpickrInstance] = useState(null);

    const examples = [
        { 
            id: 1, 
            name: "1: Las Navas del Marqués - Ávila (2019-08-26)", 
            date: "2019-08-26", 
            geometry: { type: "Polygon", coordinates: [-4.327, 40.604], zoom: 13 } 
        },
        { 
            id: 2, 
            name: "2: Orihuela - Alicante (2019-09-14)", 
            date: "2019-09-14", 
            geometry: { type: "Rectangle", coordinates: [-1.0356322, 38.1088479], zoom: 13  } 
        },
        { 
            id: 3, 
            name: "3: Catarroja - Valencia (2024-10-29)", 
            date: "2024-10-29", 
            geometry: { type: "Polygon", coordinates: [-0.404, 39.403], zoom: 13  }
        }
    ];

    useEffect(() => {
        const fp = flatpickr('#calendar-range', {
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    const fechaFormateada = selectedDates[0].toISOString().slice(0, 10);
                    setDate(fechaFormateada);
                }
            }
        });
        setFlatpickrInstance(fp);
    }, []);

    const handleSelectExample = (example) => {
        setSelectedExample(example.id);
        setDate(example.date);

        if (flatpickrInstance) {
            flatpickrInstance.setDate(example.date, true);
        }

        if (addDrawInteraction) {
            addDrawInteraction(example.geometry.type);
        }

        if (mapInstance) {
            const view = mapInstance.getView();
            view.setCenter(fromLonLat(example.geometry.coordinates));
            view.setZoom(example.geometry.zoom); // Ajusta el nivel de zoom según lo necesites
        }
    };
    
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

        <p> Select a geometry and a date to evaluate the flood. </p>

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

        <h5>Ejemplos de evaluación:</h5>
        <ul className="examples-list">
            {examples.map((example) => (
                <li 
                    key={example.id} 
                    className={`example-item ${selectedExample === example.id ? 'selected' : ''}`} 
                    onClick={() => handleSelectExample(example)}
                >
                    {example.name}
                </li>
            ))}
        </ul>

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
