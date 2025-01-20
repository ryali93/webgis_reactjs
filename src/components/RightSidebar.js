// src/components/RightSidebar.js
import React, { useState, useRef, useEffect } from 'react';
import '../styles/RightSidebar.css';

function RightSidebar({ onWidthChange }) {
  const [width, setWidth] = useState(300); // Ancho inicial del sidebar
  const sidebarRef = useRef(null);
  const isDragging = useRef(false);

  const startDragging = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', onDragging);
    document.addEventListener('mouseup', stopDragging);
  };

  const onDragging = (e) => {
    if (!isDragging.current) return;

    // Calculamos el nuevo ancho del sidebar
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 100 && newWidth <= 400) {
      setWidth(newWidth);
      onWidthChange(newWidth); // Notificamos el cambio de ancho
    }
  };

  const stopDragging = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onDragging);
    document.removeEventListener('mouseup', stopDragging);
  };

  // Post-ts
  const handleTool1Click = async () => {
    try {
      console.log('Sending request to /ee/post-ts');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ee/post-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: "COPERNICUS/S2_HARMONIZED",
          area: "[[-5.369417157985271,41.07879192796631],[-5.379929462314889,41.04508787639554],[-5.3352291213116025,41.037159091699976],[-5.324716816981985,41.07086720519197],[-5.369417157985271,41.07879192796631]]",
          indices: "",
          start_date: '2025-01-07',
          end_date: '2025-01-16',
          scale: "10",
          reducer: "mean",
          cloud_cover: "80"
        }),
      }); 

      console.log('Received response:', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Received data:', data);
      console.log(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    onWidthChange(width); // Notificar el ancho inicial
  }, [width, onWidthChange]);

  return (
    <div
      ref={sidebarRef}
      className="right-sidebar"
      style={{ width: `${width}px` }}
    >
      <div
        className="slicer"
        onMouseDown={startDragging}
        title="Arrastra para redimensionar"
      ></div>
      <div className="sidebar-content">
        <h3>Tools</h3>
        <p>Add your tools here!</p>
        <ul>
          <li>
            <button onClick={handleTool1Click}>Tool 1</button>
          </li>
          <li>
            <button>Tool 2</button>
          </li>
          <li>
            <button>Tool 3</button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default RightSidebar;
