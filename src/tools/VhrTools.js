// src/tools/VhrTools.js
import React, { useEffect, useState } from 'react';
import { ImRoad } from "react-icons/im";
import flatpickr from 'flatpickr';
import '../styles/Tools.css';
import 'flatpickr/dist/flatpickr.css';
import { get_s2, get_sr, get_builds, get_vis } from '../services/VHRServices';

export function VhrToolContent( {addDrawInteraction, clearGeometries, geometry} ) {
  const [datesEval, setDates] = useState([]);
  const [selectedExample, setSelectedExample] = useState(null);
  const [flatpickrInstance, setFlatpickrInstance] = useState(null);
  const [imageUrls, setImageUrls] = useState({ s2: [], sr: [], builds: [] });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const examples = [
    { 
        id: 1, 
        name: "1: Madrid - Barajas (2020-06-22 a 2020-07-07)", 
        date: "2020-06-22 || 2020-07-07", 
        geometry: { type: "Polygon", coordinates: [[[ -99.1332, 19.4326 ], [ -99.1342, 19.4336 ], [ -99.1352, 19.4326 ], [ -99.1332, 19.4326 ]]] } 
    },
    { 
        id: 2, 
        name: "2: Valladolid (2022-08-08; 2022-08-23 )", 
        date: "2022-08-08 || 2022-08-23 ", 
        geometry: { type: "Rectangle", coordinates: [[[ -80.1918, 25.7617 ], [ -80.1928, 25.7627 ]]] } 
    },
    { 
        id: 3, 
        name: "3: Avila - Nissan (2022-05-20; 2022-07-27)", 
        date: "2022-05-20 || 2022-06-12",  // || 2022-07-06 || 2022-07-27
        geometry: { type: "Point", coordinates: [[[ -91.132, 29.234 ], [ -91.135, 29.238 ], [ -91.138, 29.230 ], [ -91.132, 29.234 ]]] }
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

    if (!geometry) {
      console.error('Please select a valid geometry.');
      return;
    }
    // 1. GET VHR - S2 Images
    const requestVHRs2 = {
      geometry: geometry,
      fechas: datesEval
    };
    console.log('[VHR: get_s2] requestVHR:', requestVHRs2);
    try {
      var folder_s2 = await get_s2(requestVHRs2);
      console.log(folder_s2);
    } catch (error) {
      console.error("Error fetching VHR data:", error);
    }
    // 2. GET VHR - S2 Super Resolution
    console.log('[VHR: get_sr] requestVHRsr:', {"folder": folder_s2});
    try {
      var folder_sr = await get_sr({folder: folder_s2});
      console.log(folder_sr);
    } catch (error) {
      console.error("Error fetching VHR SR data:", error);
    }
    // 3. GET VHR - S2 Builds
    console.log('[VHR: get_builds] requestVHRbuilds:', {"folder": folder_s2});
    try {
      var path_builds = await get_builds({folder: folder_s2});
      console.log(path_builds);
    } catch (error) {
      console.error("Error fetching VHR builds data:", error);
    }
    // 4. GET VHR - Visualization
    console.log('[VHR: get_vis] requestVHRvis:', {"folder": folder_s2});
    try {
      var listImages = await get_vis({folder: folder_s2});
      console.log(listImages);
    } catch (error) {
      console.error("Error fetching VHR VIS data:", error);
    }

    // 5. Buscar imágenes en la carpeta y mostrarlas en el carrusel
    fetchImages(listImages);

  };

  // Función para procesar y organizar imágenes
  const fetchImages = async (listImages) => {
    try {
      // Reemplazar "/tmp/" por "/outputs/" en las rutas
      const processedImages = listImages.map(image => image.replace("/tmp/", "outputs/"));

      // Diccionario para clasificar imágenes
      const imagesByType = {
        s2: [],
        sr: [],
        builds: []
      };

      // Clasificar imágenes en categorías
      processedImages.forEach(image => {
        if (image.includes("/s2")) {
          imagesByType.s2.push(image);
        } else if (image.includes("/sr")) {
          imagesByType.sr.push(image);
        } else if (image.includes("/build")) {
          imagesByType.builds.push(image);
        }
      });

      console.log(imagesByType);

      // Función para extraer la fecha del nombre de archivo
      const extractDate = (imagePath) => {
        const match = imagePath.match(/(\d{4}-\d{2}-\d{2})/);
        return match ? match[0] : "0000-00-00"; // Si no encuentra fecha, asigna un valor mínimo
      };

      // Ordenar cada categoría por fecha
      Object.keys(imagesByType).forEach(type => {
        imagesByType[type].sort((a, b) => new Date(extractDate(a)) - new Date(extractDate(b)));
      });

      console.log("Imágenes clasificadas:", imagesByType);

      // Almacenar imágenes ordenadas en el estado
      setImageUrls(imagesByType);

    } catch (error) {
      console.error("Error obteniendo imágenes:", error);
    }
  };

  // Función para cambiar la imagen en el carrusel
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };
  


  return (
    <div>
      <h4>Very High Resolution Tool</h4>

      <div className="drawContainer">
          <div className="drawButtons">
              <button onClick={() => handleGeometrySelection('Point')} className="drawButton" id="drawPoint" title="Point" />
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

      {/* Después de ejecutar el Run, agregar un div y las imágenes .png que están dentro de la carpeta "folder" */}
      {imageUrls.s2.length > 0 && (
        <div className="carousel">
          <button onClick={prevImage}>&lt;</button>
          <img 
            src={imageUrls.s2[currentImageIndex]} 
            alt="S2 result" 
            className="carousel-image" 
            onError={(e) => console.log("Error loading image:", e.target.src)} 
          />
          <button onClick={nextImage}>&gt;</button>
        </div>
      )}

      {imageUrls.sr.length > 0 && (
        <div className="carousel">
          <button onClick={prevImage}>&lt;</button>
          <img src={imageUrls.sr[currentImageIndex]} alt="SR result" className="carousel-image" />
          <button onClick={nextImage}>&gt;</button>
        </div>
      )}

      {imageUrls.builds.length > 0 && (
        <div className="carousel">
          <button onClick={prevImage}>&lt;</button>
          <img src={imageUrls.builds[currentImageIndex]} alt="Buildings result" className="carousel-image" />
          <button onClick={nextImage}>&gt;</button>
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
