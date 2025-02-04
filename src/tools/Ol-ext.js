import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import '../styles/Tools.css';


function findLayerByTitle(layers, title) {
    for (const layer of layers) {
      if (layer.get('title') === title) {
        return layer;
      }
      if (layer.getLayers) {
        // Si es un Group, busca recursivamente
        const found = findLayerByTitle(layer.getLayers().getArray(), title);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

class CustomLayerSwitcher extends LayerSwitcher {
    constructor(options) {
      super(options);
      this.planetLayerTitle = 'Planet'; // Título de la capa específica
    }
  
    drawPanel() {
        super.drawPanel();
      
        setTimeout(() => {
          const panel = document.querySelector('.ol-layerswitcher .panel');
          if (!panel) {
            console.error('No se encontró el panel del LayerSwitcher');
            return;
          }
      
          const planetLayerElement = Array.from(panel.querySelectorAll('li')).find((li) => {
            const label = li.querySelector('label span');
            return label && label.textContent === this.planetLayerTitle;
          });
      
          if (planetLayerElement) {
            console.log('Capa Planet detectada, agregando controles específicos.');
      
            // Evita duplicar controles personalizados
            const existingCustomControls = planetLayerElement.querySelector('.planet-custom-controls');
            if (existingCustomControls) {
              console.log('Controles personalizados ya existen para Planet. Evitando duplicados.');
              return;
            }
      
            // Crear el contenedor con estilos
            const customControlsDiv = document.createElement('div');
            customControlsDiv.className = 'planet-custom-controls';
      
            const yearSelect = document.createElement('select');
            yearSelect.id = 'yearPlanet';
            yearSelect.innerHTML = `
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
            `;
      
            const monthSelect = document.createElement('select');
            monthSelect.id = 'monthPlanet';
            monthSelect.innerHTML = `
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            `;
      
            // Añadir los selects al contenedor
            customControlsDiv.appendChild(yearSelect);
            customControlsDiv.appendChild(monthSelect);
      
            // Localiza el contenedor del control de opacidad
            const opacityLabel = planetLayerElement.querySelector('.layerswitcher-opacity');
            if (opacityLabel) {
              // Inserta los controles justo después del control de opacidad
              opacityLabel.parentNode.insertBefore(customControlsDiv, opacityLabel.nextSibling);
            } else {
              // Si no encuentra el control de opacidad, añádelo al final del elemento de la capa
              planetLayerElement.appendChild(customControlsDiv);
            }
      
            // Agregar eventos para manejar cambios
            yearSelect.addEventListener('change', () => {
              this.onPlanetChange(yearSelect.value, monthSelect.value);
            });
            monthSelect.addEventListener('change', () => {
              this.onPlanetChange(yearSelect.value, monthSelect.value);
            });
          }


          // Obtener todas las capas listadas en el LayerSwitcher
          const layerElements = panel.querySelectorAll('li');

          layerElements.forEach((layerElement) => {
            const label = layerElement.querySelector('label span');
            if (!label) return;

            const layerTitle = label.textContent;

            // Evitar duplicación de botones
            const existingDeleteButton = layerElement.querySelector('.delete-layer-btn');
            if (existingDeleteButton) return;

            // Crear botón de eliminación para todas las capas
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'delete-layer-btn';
            deleteButton.style.marginLeft = '10px';
            deleteButton.style.backgroundColor = '#ff4d4f';
            deleteButton.style.color = 'white';
            deleteButton.style.border = 'none';
            deleteButton.style.padding = '3px 6px';
            deleteButton.style.cursor = 'pointer';
            deleteButton.style.fontSize = '12px';

            // Insertar el botón junto al nombre de la capa
            label.parentNode.appendChild(deleteButton);

            // Evento para eliminar la capa cuando se presiona el botón
            deleteButton.addEventListener('click', () => {
              this.removeLayerByTitle(layerTitle);
            });
          });
          
        }, 100);
    }
  

  onPlanetChange(year, month) {
    console.log(`Cambiando configuración de Planet: Año ${year}, Mes ${month}`);
    const map = this.getMap();
    const layers = map.getLayers().getArray();
    
    // Busca la capa Planet
    const planetLayer = findLayerByTitle(layers, this.planetLayerTitle);
  
    if (planetLayer) {
      const source = planetLayer.getSource();
  
      // Construye la nueva URL
      const newUrl = `https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${year}_${month}_mosaic/gmap/{z}/{x}/{y}.png?api_key=PLAKe989a4955bb2438989b94eda796179f3`;
      source.setUrl(newUrl); // Actualiza la URL del source
      console.log(`URL de Planet actualizada: ${newUrl}`);
  
      // Fuerza el redibujado de la capa
      planetLayer.getSource().refresh();
    } else {
      console.error('No se encontró la capa Planet en el mapa.');
    }
  }

  // Método para eliminar cualquier capa por su título
  removeLayerByTitle(title) {
    const map = this.getMap();
    const layers = map.getLayers().getArray();

    // Evitar eliminar la capa base si es necesario
    const nonRemovableLayers = ['Base Layer', 'Base Map'];  // Ajusta los nombres según tu configuración
    if (nonRemovableLayers.includes(title)) {
      console.warn(`La capa "${title}" no puede ser eliminada.`);
      return;
    }

    const layerToRemove = findLayerByTitle(layers, title);

    if (layerToRemove) {
      map.removeLayer(layerToRemove);
      console.log(`Capa "${title}" eliminada.`);
      this.drawPanel(); // Refresca el panel para actualizar la lista de capas
    } else {
      console.error(`No se encontró la capa "${title}" para eliminar.`);
    }
  }

  
}

export default CustomLayerSwitcher;
