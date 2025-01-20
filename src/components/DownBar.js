import React, { useState, useRef, useEffect } from 'react';
import '../styles/DownBar.css';

function DownBar({ onHeightChange, leftSidebarWidth, rightSidebarWidth }) {
    const downbarRef = useRef(null);
    const isDragging = useRef(false);
    const [height, setHeight] = useState(300);

    const startDragging = (e) => {
        e.preventDefault();
        isDragging.current = true;
        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', stopDragging);
    };

    const onDragging = (e) => {
        if (!isDragging.current) return;

        // Calculamos la nueva altura del sidebar
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 100 && newHeight <= 500) {
            setHeight(newHeight);
            onHeightChange(newHeight); // Notificamos el cambio de altura
        }
    };

    const stopDragging = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', onDragging);
        document.removeEventListener('mouseup', stopDragging);
    };

    useEffect(() => {
        onHeightChange(height);
    }, [height, onHeightChange])
    return (
        <div
          ref={downbarRef}
          className="downbar"
          style={{ height: `${height}px`, left: `${leftSidebarWidth}px`, right: `${rightSidebarWidth}px` }}
        >
          <div
            className="downslicer"
            onMouseDown={startDragging}
            title="Arrastra para redimensionar"
          ></div>
          <div className="downbar-content">
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
    
    export default DownBar;