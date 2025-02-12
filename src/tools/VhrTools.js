// src/tools/VhrTools.js
import React, { useRef, useEffect, useState } from 'react';
import { ImRoad } from "react-icons/im";
import flatpickr from 'flatpickr';
import '../styles/Tools.css';
import 'flatpickr/dist/flatpickr.css';
import { fromLonLat } from 'ol/proj';
import { get_s2, get_sr, get_builds, get_vis } from '../services/VHRServices';


export function VhrToolContent( {addDrawInteraction, clearGeometries, geometry, imageGroups, setImageGroups, mapInstance} ) {
  const [datesEval, setDates] = useState([]);
  const [selectedExample, setSelectedExample] = useState(null);
  const [flatpickrInstance, setFlatpickrInstance] = useState(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const examples = [
    { 
        id: 1, 
        name: "1: Madrid - Barajas (2020-06-22 a 2020-07-07)", 
        date: "2020-06-22 || 2020-07-07", 
        geometry: { type: "Point", coordinates: [ -3.576, 40.503 ], zoom: 15 }
    },
    { 
        id: 2, 
        name: "2: Vigo - Playa Samil (2023-08-08; 2023-08-23 )", 
        date: "2023-08-08 || 2023-10-23 ", 
        geometry: { type: "Point", coordinates: [ -8.775522, 42.208224 ], zoom: 15 }
    },
    { 
        id: 3, 
        name: "3: Avila - Nissan (2022-05-20; 2022-07-27)", 
        date: "2021-08-20 || 2022-07-21",  // || 2022-07-06 || 2022-07-27
        geometry: { type: "Point", coordinates: [ -4.697, 40.673 ], zoom: 16 }
    },
    { 
        id: 4, 
        name: "4: Avila - Postas (2024-07-19; 2024-08-18)", 
        date: "2024-07-19 || 2024-08-18",  // || 2022-07-06 || 2022-07-27
        geometry: { type: "Point", coordinates: [ -4.70459, 40.6452 ], zoom: 16 }
    }
  ];

  useEffect(() => {
    const fp = flatpickr('#calendar-range', {
        mode: "multiple",
        maxDate: new Date(),
        dateFormat: "Y-m-d",
        conjunction: " || ",
        onChange: (selectedDates) => {
          setDates(selectedDates.map(d => d.toISOString().split('T')[0]).join(' || '));
        }
      });
      setFlatpickrInstance(fp);
    }, []);

  const handleSelectExample = (example) => {
    setSelectedExample(example.id);
    setDates(example.date);

    if (flatpickrInstance) {
        flatpickrInstance.setDate(example.date, true);
    }

    if (addDrawInteraction) {
        addDrawInteraction(example.geometry.type);
    }

    // Centrar el mapa en la coordenada seleccionada
    if (mapInstance) {
      const view = mapInstance.getView();
      view.setCenter(fromLonLat(example.geometry.coordinates));
      view.setZoom(example.geometry.zoom); // Ajusta el nivel de zoom según lo necesites
    }
  };

  const handleGeometrySelection = (type) => {
    console.log("[VHRToolContent] handleGeometrySelection called with type:", type);
    if (addDrawInteraction) {
        addDrawInteraction(type);
    } else {
        console.error('[VHRToolContent] addDrawInteraction is not defined!');
    }
  };

  const clearGeometry = () => {
      console.log('[VHRToolContent] clearGeometry called');
      if (clearGeometries) {
          clearGeometries(); // Llama a la función para limpiar geometrías en el mapa
      } else {
          console.error('[VHRToolContent] clearGeometries is not defined!');
      }
  };

  const handleRun = async (event) => {
    event.preventDefault(); 
    setLoading(true);

    if (!geometry) {
      console.error('Please select a valid geometry.');
      setLoading(false);
      return;
    }

    try {
      const requestVHRs2 = { geometry, fechas: datesEval };
      const folder_s2 = await get_s2(requestVHRs2);
      await get_sr({ folder: folder_s2 });
      await get_builds({ folder: folder_s2 });
      const listImages = await get_vis({ folder: folder_s2 });
      processImages(listImages);
    } catch (error) {
      console.error("Error in processing VHR data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processImages = (listImages) => {
    const groupedImages = listImages.map(item => ({
      date: item.date,
      s2_image: item.s2_image ? `data:image/png;base64,${item.s2_image}` : null,
      sr_image: item.sr_image ? `data:image/png;base64,${item.sr_image}` : null,
      build_image: item.build_image ? `data:image/png;base64,${item.build_image}` : null
    }));
    setImageGroups(groupedImages);
    // preservedData.current = groupedImages;
  };

  // Función para cambiar la imagen en el carrusel
  const nextGroup = () => {
    setCurrentGroupIndex((prevIndex) => (prevIndex + 1) % imageGroups.length);
  };

  const prevGroup = () => {
    setCurrentGroupIndex((prevIndex) => (prevIndex - 1 + imageGroups.length) % imageGroups.length);
  };

  const clearResults = () => {
    setImageGroups([]);
    setCurrentGroupIndex(0);
  };


  return (
    <div>
      <h4>Very High Resolution Tool</h4>

      <div className="drawContainer">
          <div className="drawButtons">
              <button onClick={() => handleGeometrySelection('Point')} className="drawButton" id="drawPoint" title="Point" />
              <button onClick={clearGeometry} className="drawButton" id="drawClear" title="Clear geometry" />
              
          <button onClick={clearResults} className="drawButton" id="clearResults" title="Clear Results">Clear results</button>
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

      {/* {loading && <p className="loading-message">Processing, please wait...</p>} */}
      {loading && <div class="loader"></div>}

      {/* // Renderizado del carrusel para cada tipo */}
      {imageGroups.length > 0 && (
        <div className="carousel">
          <button onClick={prevGroup}>&lt;</button>
          <div className="carousel-content">
            <p className="image-date">{imageGroups[currentGroupIndex].date}</p>
            {imageGroups[currentGroupIndex].s2_image && <img src={imageGroups[currentGroupIndex].s2_image} alt="S2 result" className="carousel-image" />}
            {imageGroups[currentGroupIndex].sr_image && <img src={imageGroups[currentGroupIndex].sr_image} alt="SR result" className="carousel-image" />}
            {imageGroups[currentGroupIndex].build_image && <img src={imageGroups[currentGroupIndex].build_image} alt="Buildings result" className="carousel-image" />}
          </div>
          <button onClick={nextGroup}>&gt;</button>
        </div>
      )}
    </div>
  );
}

const VhrTools = {
  label: 'VHR',
  icon: <ImRoad />,
  content: VhrToolContent,
};

export default VhrTools;
