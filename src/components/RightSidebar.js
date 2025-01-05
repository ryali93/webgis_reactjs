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
            <button>Tool 1</button>
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
