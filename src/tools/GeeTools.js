import React, { useState } from 'react';
import { FaTools } from 'react-icons/fa';

// Componente principal para GEE Tools
function GeeToolContent() {
  const [value, setValue] = useState('');

  const handleRun = () => {
    console.log(`Running GEE tool with value: ${value}`);
  };

  return (
    <div>
      <h4>Google Earth Engine Tool</h4>
      <input
        type="text"
        value={value}
        placeholder="Enter value"
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleRun}>Run</button>
    </div>
  );
}

// Objeto que contiene la metadata
const GeeTools = {
  label: 'GEE',
  icon: <FaTools />,
  content: GeeToolContent, // Referencia al componente como función
};

export default GeeTools;
