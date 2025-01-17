import { post_mapid, get_dates, post_time_series, get_hillshade, get_hotspot, get_burned, get_flood, post_fire_risk, post_statistics, getPlanetXYZUrl, display_img } from './services.js';
//////////////////////////////////////////////////////////////////////
// Initialize the map
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-4.7240425, 39.7825346]),
    zoom: 7
  })
});

// Function to update the list of layers
function updateLayerList() {
  const layerUl = document.getElementById('layerUl');
  layerUl.innerHTML = ""; // Clear the current list

  map.getLayers().forEach((layer, index) => {
    const layerLi = document.createElement('li');

    // Create an input field for the layer name
    const layerNameInput = document.createElement('input');
    layerNameInput.type = 'text';
    layerNameInput.value = layer.get('name') || `Capa ${index}`;
    layerNameInput.addEventListener('change', function() {
      layer.set('name', this.value);
      updateLayerList(); // Update the list to reflect the new name
    });

    // Create an input field for opacity
    const opacityInput = document.createElement('input');
    opacityInput.type = 'range';
    opacityInput.min = 0;
    opacityInput.max = 1;
    opacityInput.step = 0.1;
    opacityInput.value = layer.getOpacity();
    opacityInput.addEventListener('change', function() {
      // layer.setOpacity(this.value);
      layer.set('opacity', this.value);
      updateLayerList(); // Update the list to reflect the new name
    });

    // Create a delete button for the layer
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'X';
    deleteButton.addEventListener('click', function() {
      map.removeLayer(layer);
      updateLayerList(); // Update the list after removal
    });

    // Create a button to toggle visibility
    const visibilityButton = document.createElement('button');
    visibilityButton.innerHTML = layer.getVisible() ? 'Hide' : 'Show';
    visibilityButton.addEventListener('click', function() {
      layer.setVisible(!layer.getVisible());
      visibilityButton.innerHTML = layer.getVisible() ? 'Hide' : 'Show';
    });

    // Append elements to the list item
    layerLi.appendChild(layerNameInput);
    layerLi.appendChild(opacityInput);
    layerLi.appendChild(visibilityButton);
    layerLi.appendChild(deleteButton);

    // Append the list item to the list
    layerUl.appendChild(layerLi);
  });
}

// Listen for changes to the layer collection and update the layer list
map.getLayers().on(['add', 'remove'], updateLayerList);

// Call the function once to initialize the layer list
updateLayerList();


//////////////////////////////////////////////////////////////////////
// Toggle advanced options
document.getElementById('toggleAdvanced').addEventListener('click', function() {
  // this.classList.toggle('active');
  const advancedOptions = document.getElementById('advancedOptions');
  if (advancedOptions.style.display === 'none' || advancedOptions.style.display === '') {
    advancedOptions.style.display = 'block';
  } else {
    advancedOptions.style.display = 'none';
  }
});

//////////////////////////////////////////////////////////////////////
let globalData;
let availableDates = [];

// Load data from JSON file
fetch('./gee_catalog.json')
  .then(response => response.json())
  .then(data => {
    globalData = data;
    initializeMissionComboBox(data);
  })
  .catch(error => console.error('Error al cargar el archivo JSON:', error));

function initializeMissionComboBox(data) {
  const missionSelect = document.getElementById('missionSelect');
  const uniqueMissions = [...new Set(data.map(item => item.MISSION))];  // Get unique missions

  uniqueMissions.forEach(mission => {
    const option = document.createElement('option');
    option.value = mission;
    option.textContent = mission;
    missionSelect.appendChild(option);
  });

  missionSelect.addEventListener('change', function() {
    const selectedMission = this.value;
    initializeProductComboBox(selectedMission);
  });
}

function initializeProductComboBox(selectedMission) {
  const productSelect = document.getElementById('productSelect');
  productSelect.innerHTML = '<option value="">Select product</option>';
  productSelect.disabled = false;

  const relevantProducts = globalData.filter(item => item.MISSION === selectedMission);

  relevantProducts.forEach(product => {
    const option = document.createElement('option');
    option.value = product.PRODUCT;
    option.textContent = product.PRODUCT;
    option.title = product.title;
    productSelect.appendChild(option);
  });

  productSelect.addEventListener('change', async function() {
    const selectedProduct = this.value;
    initializeBandComboBox(selectedMission, selectedProduct);
    initializeIndicesComboBox();

  // Get available dates
  const features = source.getFeatures();
  let geometry;
  if (features.length > 0) {
    geometry = features[0].getGeometry();
  }
  const collectionName = document.getElementById('missionSelect').value;
  const productName = document.getElementById('productSelect').value;
  const cloudCover = document.getElementById('cloudCoverSlider').value;
  const statisticsCheck = document.getElementById('showStatisticsCheckbox').value;
  const idName = collectionName + "/" + productName;
  // If idName includes "S2", "Landsat" or "MODIS" then get available dates
  if (idName.includes("S2") || idName.includes("Landsat") || idName.includes("MODIS")) {
    availableDates = await get_dates(idName, geometry, cloudCover); //geometry, startDate, endDate, cloudCover
    console.log(availableDates);
  }

  });

}

function initializeBandComboBox(selectedMission, selectedProduct) {
  const bandSelect = document.getElementById('bandSelect');
  bandSelect.innerHTML = '<option value="">Select bands</option>';
  bandSelect.disabled = false;

  const relevantProduct = globalData.find(item => item.MISSION === selectedMission && item.PRODUCT === selectedProduct);

  if (relevantProduct && Array.isArray(relevantProduct.band_values)) {
    relevantProduct.band_values.forEach((band, index) => {
      const option = document.createElement('option');
      option.value = relevantProduct.band_values[index] || band;
      option.textContent = relevantProduct.band_values[index] + " - " + relevantProduct.band_description[index] || band;
      option.title = relevantProduct.band_description[index] || band;

      bandSelect.appendChild(option);
    });
  }
}

function initializeIndicesComboBox() {
  const indicesSelect = document.getElementById('indicesSelect');
  indicesSelect.innerHTML = '<option value="">Select indices</option>';
  indicesSelect.disabled = false;

  const productName = document.getElementById('productSelect').value;

  if (productName && productName.includes("S2")) {
    const indices = ["NBR","NDVI","NDMI","GNDVI","NDWI","SAVI","EVI"];
    indices.forEach((indice) => {
      const option = document.createElement('option');
      option.value = indice;
      option.textContent = indice;
      option.title = indice;

      indicesSelect.appendChild(option);
    });
  }
}

//////////////////////////////////////////////////////////////////////
// First, define the source and vector layer
let source = new ol.source.Vector();
let vector = new ol.layer.Vector({
  source: source
});

// Add the layer to the map
map.addLayer(vector);

// Define a function that adds the draw interaction to the map
let draw;
function addDrawInteraction(type) {
  if (draw) {
    map.removeInteraction(draw);
  }
  draw = new ol.interaction.Draw({
    source: source,
    type: type === 'Rectangle' ? 'Circle' : type,
    geometryFunction: type === 'Rectangle' ? ol.interaction.Draw.createRegularPolygon(4) : undefined
  });
  map.addInteraction(draw);
  
  draw.on('drawend', function(evt) {
    let geometry = evt.feature.getGeometry();
    console.log(geometry.getCoordinates());
  });
}

// Add event listeners for the buttons
document.getElementById('drawPoint').addEventListener('click', function() {
  vector = addDrawInteraction('Point');
});
document.getElementById('drawRectangle').addEventListener('click', function() {
  vector = addDrawInteraction('Rectangle');
});
document.getElementById('drawPolygon').addEventListener('click', function() {
  vector = addDrawInteraction('Polygon');
});
document.getElementById('drawClear').addEventListener('click', function() {
  source.clear();
  // Cancel the draw interaction
  map.removeInteraction(draw);
});

// Initialize the slider and the event handler.
const cloudCoverSlider = document.getElementById("cloudCoverSlider");
const cloudCoverValue = document.getElementById("cloudCoverValue");

cloudCoverSlider.addEventListener("input", function() {
    cloudCoverValue.innerText = cloudCoverSlider.value;
});

//////////////////////////////////////////////////////////////////////
// Get elements from the DOM in a function
document.getElementById('getDataButton').addEventListener('click', async function() {
    // Get the value of the mission select
    const collectionName = document.getElementById('missionSelect').value;
    const productName = document.getElementById('productSelect').value;
    const idName = collectionName + "/" + productName;
    const cloud_cover = document.getElementById('cloudCoverSlider').value;
  
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }
  
    // Get the dates from the Flatpickr calendar
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    const endDate = dateRange.length > 1 ? dateRange[1].toLocaleDateString('en-CA') : null;
  
    // Get the selected bands (if any)
    const bandSelect = document.getElementById('bandSelect');
    const selectedOptions = Array.from(bandSelect.selectedOptions);
    const selectedBands = selectedOptions.map(option => option.value);
    var bands = selectedOptions.map(option => option.value).join(",");

    const item_data = globalData.find(item => item.MISSION === collectionName && item.PRODUCT === productName);
    
    // Get the selected scales
    const selectedScales = selectedBands.map(selectedBand => {
      const bandIndex = item_data.band_values.indexOf(selectedBand);
      if (bandIndex === -1) {
        console.error(`La banda ${selectedBand} no se encontró en la información de datos`);
        return null;
      }
      return item_data.band_scale[bandIndex];
    });

    // Get the selected indices
    const selectedIndices = Array.from(document.getElementById('indicesSelect').selectedOptions).map(option => option.value);
    console.log(selectedIndices)

    // Get the mean scale
    // If selectedScales is empty, return scale = 1
    console.log(selectedScales)
    const scale = selectedScales.length > 0 ? selectedScales.reduce((a, b) => a + b, 0) / selectedScales.length : 1;
    console.log(scale)

    // Get the selected type
    const relevantProduct = globalData.find(item => item.MISSION === collectionName && item.PRODUCT === productName);
    const gee_type = relevantProduct.gee_type;
    const vis = relevantProduct.gee_vis;
    
    // Add indices to bands variable
    const indices = selectedIndices.join(",")
    if (bands === "") {
      bands = indices;
    } else {
      bands = bands + "," + indices;
    }

    // Get the mapid
    if (geometry.getType() != 'Point') {
      const mapid = await post_mapid(idName, geometry, bands, gee_type, scale, startDate, endDate, vis, cloud_cover);
      // const mapid = await get_mapid(idName, geometry, bands, gee_type, scale, startDate, endDate, vis, cloud_cover);
      console.log(mapid);

      // Add the XYZ image to the map
      const xyzSource = new ol.source.XYZ({
          url: mapid,
          attributions: "XYZ",
          maxZoom: 18
      });
      const xyzLayer = new ol.layer.Tile({ source: xyzSource });
      map.addLayer(xyzLayer);

      // Add statistics to the canvas
      // const data = await post_statistics(idName, geometry, bands, gee_type, startDate, endDate);
      // console.log(data)
      // updateStatisticsData(data);
    }

    if (geometry.getType() == 'Point') {
      const urls = await display_img(idName, geometry, bands, scale, startDate, endDate, cloud_cover);
      const urlsArray = JSON.parse(urls);
      console.log(urlsArray);
      const container = document.getElementById('image-slider');
      container.innerHTML = ''; // Limpiar imágenes anteriores
    
      urlsArray.forEach(item => {
          if(item.url) {
            // const container = document.getElementById('images-slider');
            const imgElement = document.createElement('img');
            const labelElement = document.createElement('p');
            const indiceElement = document.createElement('p');
    
            indiceElement.textContent = item.indice;
            labelElement.textContent = item.date;
            imgElement.src = item.url;
    
            container.appendChild(labelElement);
            container.appendChild(indiceElement);
            container.appendChild(imgElement);
          }  
    });

    }
    if (idName.includes("S2") || idName.includes("Landsat") || idName.includes("MODIS") || idName.includes("ERA5")) {
      // Get the time series
      const data = await post_time_series(idName, geometry, bands, "mean", startDate, endDate, cloudCoverSlider.value);
      updateChartData(chart, data["data"], data["labels"]);
    }
});

document.getElementById('planetBasemapSelect').addEventListener('change', function(event) {
  let selectedDate = event.target.value;

  if (selectedDate) {
      let planetUrl = getPlanetXYZUrl(selectedDate);

      // Crear y agregar la capa XYZ de Planet a OpenLayers
      let planetLayer = new ol.layer.Tile({
          source: new ol.source.XYZ({
              url: planetUrl
          })
      });
      map.addLayer(planetLayer);
  }
});

function populateDateOptions() {
  const selectElement = document.getElementById('planetBasemapSelect');
  const startDate = new Date('2020-01-01');
  const currentDate = new Date();
  
  for(let date = startDate; date <= currentDate; date.setMonth(date.getMonth() + 1)) {
      // Convertir fecha a formato "YYYY-MM" y "Month YYYY"
      let year = date.getFullYear();
      let month = date.getMonth() + 1; // Los meses son 0-indexed, así que sumamos 1
      let formattedDate = `${year}-${month.toString().padStart(2, '0')}`;
      let monthName = date.toLocaleString('en-US', { month: 'long' });

      // Crear y añadir la nueva opción al combobox
      let option = new Option(`${monthName} ${year}`, formattedDate);
      selectElement.appendChild(option);
  }
}

// Llamar a la función al cargar la página
populateDateOptions();

// Create a graph
let ctx = document.getElementById('myChart').getContext('2d');
let chart = createChart(ctx);

//////////////////////////////////////////////////////////////////////
function formatDate(str) {
  const date = new Date(str);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() retorna valores de 0 (enero) a 11 (diciembre)
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

flatpickr('#calendar-range', {
  "mode": "range",
  "onOpen": function (selectedDates, dateStr, instance) {
    const events = document.getElementsByClassName('event');
    for (let i = 0; i < events.length; i++) {
      events[i].classList.remove('event');
    }
  },
  "onDayCreate": function (dObj, dStr, fp, dayElem) {
    for (let i = 0; i < availableDates.length; i++) {
      if (formatDate(dayElem.ariaLabel) === availableDates[i]) {
        dayElem.innerHTML += "<span class='event'></span>";
      }
    }
  }
});

////////////////////////////////////////////////////////////

const layers = map.getLayers().getArray();
layers.forEach((layer, index) => {
  console.log(`Layer ${index + 1}:`);
  console.log('Visible: ', layer.getVisible());
});

document.getElementById('toggleChartBtn').addEventListener('click', function() {
  const chartOverlay = document.getElementById('chartOverlay');
  
  if (chartOverlay.classList.contains('minimized')) {
      chartOverlay.classList.remove('minimized');
      this.innerHTML = "-";
  } else {
      chartOverlay.classList.add('minimized');
      this.innerHTML = "+";
  }
});

// Create a function to call the get_soil_moisture function when selecting the option soil_moisture from indexSelect
document.getElementById('indexSelect').addEventListener('change', async function() {
  console.log("Analysis selection")

  if (this.value === 'hillshade') {
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }

    // Get the hillshade data
    const mapid_hillshade = await get_hillshade(geometry);
    // Add the XYZ image to the map
    console.log(mapid_hillshade)
    const xyzSource = new ol.source.XYZ({
      url: mapid_hillshade,
      attributions: "XYZ",
      maxZoom: 18
    });
    const xyzLayer = new ol.layer.Tile({ source: xyzSource });
    map.addLayer(xyzLayer);
  }
  if (this.value === 'hotspot') {
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }

    // Get the dates from the Flatpickr calendar
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    const endDate = dateRange.length > 1 ? dateRange[1].toLocaleDateString('en-CA') : null;

    // Get the hotspot data
    const hostpot = await get_hotspot(geometry, startDate, endDate);
    const hotspot_url = hostpot["url_data"];
    const hotspot_mapid = hostpot["url_xyz"].urlFormat;

    console.log(hotspot_url)
    // Add the XYZ image to the map
    const xyzSource = new ol.source.XYZ({
      url: hotspot_mapid,
      attributions: "XYZ"
    });
    const xyzLayer = new ol.layer.Tile({ source: xyzSource });
    map.addLayer(xyzLayer);
  }

  if (this.value === 'burned') {
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }

    // Get the dates from the Flatpickr calendar
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    const endDate = dateRange.length > 1 ? dateRange[1].toLocaleDateString('en-CA') : null;

    // Get the burned data
    const burned = await get_burned(geometry, startDate, endDate);
    const burned_mapid = burned["url_xyz"].urlFormat;
    const severity_mapid = burned["url_severity"].urlFormat;

    // Add the XYZ image to the map
    const xyzSource = new ol.source.XYZ({
      url: burned_mapid,
      attributions: "XYZ"
    });
    const xyzLayer = new ol.layer.Tile({ source: xyzSource });

    // Add the Severity image to the map
    const xyzSourceSeverity = new ol.source.XYZ({
      url: severity_mapid,
      attributions: "XYZ"
    });
    const xyzLayerSeverity = new ol.layer.Tile({ source: xyzSourceSeverity });

    map.addLayer(xyzLayer);
    map.addLayer(xyzLayerSeverity);
  }
  if (this.value === 'flood') {
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }

    // Get the dates from the Flatpickr calendar
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    const endDate = dateRange.length > 1 ? dateRange[1].toLocaleDateString('en-CA') : null;

    // Get the flood data
    const flood = await get_flood(geometry, startDate, endDate);
    const flood_mapid = flood["url_xyz"].urlFormat;

    // Add the XYZ image to the map
    const xyzSource = new ol.source.XYZ({
      url: flood_mapid,
      attributions: "XYZ"
    });
    const xyzLayer = new ol.layer.Tile({ source: xyzSource });
    map.addLayer(xyzLayer);
  }

  if (this.value === 'fire_risk') {
    // Get the geometry drawn (if exists)
    const features = source.getFeatures();
    let geometry;
    if (features.length > 0) {
      geometry = features[0].getGeometry();
    }

    // Get the dates from the Flatpickr calendar
    const dateRange = document.getElementById('calendar-range')._flatpickr.selectedDates;
    const startDate = dateRange.length > 0 ? dateRange[0].toLocaleDateString('en-CA') : null;
    console.log("Start date: ", startDate)

    // Get the fire risk data
    const fire_risk = await post_fire_risk(geometry, startDate);
    const fire_risk_mapid = fire_risk["url_xyz"]; //.urlFormat
    const fire_risk_class_mapid = fire_risk["url_class_xyz"]; //.urlFormat

    // Add the XYZ image to the map
    const xyzSource = new ol.source.XYZ({
      url: fire_risk_mapid,
      attributions: "XYZ"
    });

    const xyzLayer = new ol.layer.Tile({ source: xyzSource });
    map.addLayer(xyzLayer);

    const xyzSourceClass = new ol.source.XYZ({
      url: fire_risk_class_mapid,
      attributions: "XYZ"
    });

    const xyzLayerClass = new ol.layer.Tile({ source: xyzSourceClass });
    map.addLayer(xyzLayerClass);
  }


});

/////////////////////////////////////////////////////////////////////
function createChart(ctx) {
  return new Chart(ctx, {
      type: 'line',
      data: {
          labels: [],
          datasets: [] // Conjunto vacío inicialmente
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
              },
              x: {
                  type: 'time',
                  time: {
                      unit: 'day',
                      parser: 'YYYY-MM-DDTHH:mm:ss.SSSZ' 
                  }
              }
          }
      },
  });
}

function updateChartData(chart, newData, newLabels) {
    // Eliminar datasets previos
    chart.data.datasets = [];
    
    // Colores base (puedes expandir esto si esperas más series)
    // const backgroundColors = ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'];
    // const borderColors = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'];
    const backgroundColors = ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'];
    const borderColors = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'];
    
    newData.forEach((dataSet, index) => {
        chart.data.datasets.push({
            label: newLabels[index],
            data: dataSet,
            backgroundColor: backgroundColors[index % backgroundColors.length], // Usamos modulo para no salirnos del rango
            borderColor: borderColors[index % borderColors.length]
        });
    });

    chart.update();
}

/////////////////////////////////////////////////////////////////////

document.getElementById('showStatisticsCheckbox').addEventListener('change', function() {
  var div = document.getElementById('statisticsDiv');
  if (this.checked) {
    div.style.display = 'block';
    // Lógica para actualizar el canvas con las estadísticas
  } else {
    div.style.display = 'none';
  }
});

function updateStatisticsData(data) {
  const statisticsDiv = document.getElementById('statisticsDiv');
  // Limpia
  statisticsDiv.innerHTML = '';
  
  // Encabezado
  const h3 = document.createElement('h3');
  h3.textContent = 'Statistics';
  statisticsDiv.appendChild(h3);
  
  // Lista para los datos
  const ul = document.createElement('ul');

  // Itera sobre las claves del objeto de datos
  Object.keys(data).forEach(key => {
    // Crea un elemento de lista para cada clave
    const li = document.createElement('li');
    li.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitaliza la primera letra

    // Crea una sublista para las estadísticas de cada clave
    const subUl = document.createElement('ul');
    Object.keys(data[key]).forEach(subKey => {
      const subLi = document.createElement('li');
      subLi.textContent = `${subKey.charAt(0).toUpperCase() + subKey.slice(1)}: ${data[key][subKey]}`;
      subUl.appendChild(subLi);
    });

    li.appendChild(subUl);
    ul.appendChild(li);
  });

  // Añade la lista al div de estadísticas
  statisticsDiv.appendChild(ul);
}
