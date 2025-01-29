import React, { useState, useEffect } from 'react';
import './TsVis.css';


const TsVis = (multiTemporalImages) => {
  console.log('[TsVis] multiTemporalImages:', multiTemporalImages);
  
  const multiTemporalImagesArray = Object.values(multiTemporalImages);

// Obtener los diferentes índices
const indices = [...new Set(multiTemporalImagesArray.map((data) => data.indice))];
const [selectedIndex, setSelectedIndex] = useState(indices[0] || '');

// Filtrar las imágenes por el índice seleccionado
const filteredImages = multiTemporalImagesArray.filter((data) => data.indice === selectedIndex);

// Crear un array de enlaces de leyendas
const legendLinks = indices.map((indice) => `/legends/${indice.toLowerCase()}.png`);

// Obtener el enlace de la leyenda correspondiente al índice seleccionado
const legendSrc = legendLinks[indices.indexOf(selectedIndex)];

useEffect(() => {
  if (indices.length > 0 && !selectedIndex) {
    setSelectedIndex(indices[0]);
  }
}, [indices, selectedIndex]);

return (
  <div className="tsvis-container">
    <h1>Time Series Visualization</h1>
    <div className="tsvis-buttons">
      {indices.map((indice) => (
        <button key={indice} onClick={() => setSelectedIndex(indice)}>
          {indice}
        </button>
      ))}
    </div>
    <h2>{selectedIndex}</h2>
    <div className="tsvis-images">
      {filteredImages.map((data, index) => (
        <div key={index} className="tsvis-image-container">
          <img src={data.url} alt={`Multitemporal Image ${index}`} />
          <p>{data.date}</p>
        </div>
      ))}
    </div>
    {selectedIndex && (
      <div className="tsvis-legend">
        <img src={legendSrc} alt={`Legend for ${selectedIndex}`} />
      </div>
    )}
  </div>
);
};

export default TsVis;