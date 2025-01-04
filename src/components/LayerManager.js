import React from 'react';
import '../styles/LayerManager.css';

function LayerManager({ baseLayers, overlayLayers, toggleVisibility, changeOpacity }) {
  return (
    <div className="layer-manager">
      <h3>Layer Manager</h3>

      <div className="layer-group">
        <div className="group-header">Base Layers -</div>
        {baseLayers.map(({ layer, visible, opacity }, index) => (
          <div key={index} className="layer-item">
            <label>
              <input
                type="checkbox"
                checked={visible}
                onChange={() => toggleVisibility(layer)}
              />
              {layer.get('title')}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => changeOpacity(layer, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>

      <div className="layer-group">
        <div className="group-header">Overlays -</div>
        {overlayLayers.map(({ layer, visible, opacity }, index) => (
          <div key={index} className="layer-item">
            <label>
              <input
                type="checkbox"
                checked={visible}
                onChange={() => toggleVisibility(layer)}
              />
              {layer.get('title')}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => changeOpacity(layer, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayerManager;
