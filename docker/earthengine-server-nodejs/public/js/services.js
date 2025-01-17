import { valid_geometry } from './utils.js';

const host = "http://localhost:3000"; // 212.128.193.74

////////////////////////////////////////////////////////////
// Async functions to call the API
////////////////////////////////////////////////////////////
const get_mapid = async (idName, geometry, bands, gee_type, scale, start_date, end_date, vis, cloud_cover) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = new URL(`${host}/ee/get-mapid`);
  url.search = new URLSearchParams({
    id: idName,
    area: JSON.stringify(coordinates),
    indices: bands,
    gee_type: gee_type,
    scale: scale,
    start_date: start_date,
    end_date: end_date,
    vis: JSON.stringify(vis),
    cloud_cover: cloud_cover
  });
  const response = await fetch(url);
  const data = await response.text();
  return data; 
};

const post_mapid = async (idName, geometry, bands, gee_type, scale, start_date, end_date, vis, cloud_cover) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = `${host}/ee/post-mapid`;
  const body = {
    id: idName,
    area: JSON.stringify(coordinates),
    indices: bands,
    gee_type: gee_type,
    scale: scale,
    start_date: start_date,
    end_date: end_date,
    vis: JSON.stringify(vis),
    cloud_cover: cloud_cover
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await response.text();
  return data; 
};
  
const get_dates = async (idName, geometry, cloud_cover) => { //start_date, end_date, 
  let coordinates;
  coordinates = valid_geometry(geometry);

  const url = new URL(`${host}/ee/get-available-dates`);
  url.search = new URLSearchParams({
    id: idName,
    area: JSON.stringify(coordinates),
    cloud_cover: cloud_cover
  });
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const get_time_series = async (idName, geometry, indices, reducer, start_date, end_date, cloud_cover) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = new URL(`${host}/ee/get-ts`);
  url.search = new URLSearchParams({
    id: idName,
    area: JSON.stringify(coordinates),
    indices: indices,
    reducer: reducer,
    start_date: start_date,
    end_date: end_date,
    cloud_cover: cloud_cover
  });
  const response = await fetch(url);
  const data = await response.json();

  const date = data['features'].map(x => x["properties"]['system:time_start']);

  // Crear un objeto para almacenar los datos de cada índice
  let indicesData = {};
  indices.split(",").forEach(index => {
    indicesData[index] = data['features'].map(x => x["properties"][index]);
  });
  const dates = date.map(timestamp => new Date(timestamp));

  // Asociar cada fecha con su correspondiente valor de índice
  Object.keys(indicesData).forEach(index => {
    indicesData[index] = dates.map((date, i) => { return { x: date, y: indicesData[index][i] }});
  });

  return indicesData;
}

const post_time_series = async (idName, geometry, indices, reducer, start_date, end_date, cloud_cover) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = `${host}/ee/post-ts`;
  const body = {
    id: idName,
    area: JSON.stringify(coordinates),
    indices: indices,
    reducer: reducer,
    start_date: start_date,
    end_date: end_date,
    cloud_cover: cloud_cover
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  
  function formatDate(timestamp) {
      return new Date(timestamp).toISOString();
  }
  const dates = data.dates.map(formatDate);
  
  let newData = [];
  let newLabels = [];

  Object.keys(data).forEach(key => {
      if (key !== "dates") {
          const [indexName, stat] = key.split("_"); // Obtenemos el nombre del índice y el estadístico
          newData.push(data[key].map((value, i) => ({
              x: dates[i],
              y: value
          })));
          newLabels.push(`${indexName} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
      }
  });
  return {"data": newData, "labels": newLabels};
};

const get_hillshade = async (geometry) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = new URL(`${host}/ee/get-hillshade`);
  url.search = new URLSearchParams({
    area: JSON.stringify(coordinates)
  });
  const response = await fetch(url);
  const data = await response.text();
  return data;
}

const get_hotspot = async (geometry, start_date, end_date) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = new URL(`${host}/ee/get-hotspot`);
  url.search = new URLSearchParams({
    area: JSON.stringify(coordinates),
    start_date: start_date,
    end_date: end_date
  });
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const get_burned = async (geometry, start_date, end_date) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = new URL(`${host}/ee/get-burned`);
  url.search = new URLSearchParams({
    area: JSON.stringify(coordinates),
    start_date: start_date,
    end_date: end_date
  });
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const get_flood = async (geometry, start_date, end_date) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = new URL(`${host}/ee/get-flood`);
  url.search = new URLSearchParams({
    area: JSON.stringify(coordinates),
    start_date: start_date,
    end_date: end_date
  });
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const post_fire_risk = async (geometry, date_eval) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  console.log("peticion realizada")

  // Crear la URL con todos los parámetros necesarios
  const url = `${host}/ee/post-fire-risk`;
  const body = {
    geometry: JSON.stringify(coordinates),
    date_eval: date_eval
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  console.log("peticion obtenida")
  const data = await response.json();
  console.log("datos obtenidos")
  return data;
}

const display_img = async ( idName, geometry, indices, scale, start_date, end_date, cloud_cover ) => {
  let coordinates;
  coordinates = valid_geometry(geometry);
  
  // Crear la URL con todos los parámetros necesarios
  const url = new URL(`${host}/ee/display-img`);
  url.search = new URLSearchParams({
    id: idName,
    geometry: JSON.stringify(coordinates),
    indices: indices,
    scale: scale,
    start_date: start_date,
    end_date: end_date,
    cloud_cover: cloud_cover
  });
  console.log(url)
  const response = await fetch(url);
  const data = await response.text();
  return data;
}

// const { id, geometry, indices, gee_type, start_date, end_date } = request.body;
const post_statistics = async ( idName, geometry, indices, gee_type, start_date, end_date ) => {
  let coordinates;
  coordinates = valid_geometry(geometry);

  // Crear la URL con todos los parámetros necesarios
  const url = `${host}/ee/post-statistics`;
  const body = {
    id: idName,
    geometry: JSON.stringify(coordinates),
    indices: indices,
    gee_type: gee_type,
    start_date: start_date,
    end_date: end_date
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  console.log(data)
  return data;
}


// Planet basemap
const getPlanetXYZUrl = (dateString) => {
  let formattedDate = dateString.replace("-", "_");
  let apiKey = "PLAKabb0ed6e8a964c6591391d8e8bfa0980";
  return `https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${formattedDate}_mosaic/gmap/{z}/{x}/{y}.png?api_key=${apiKey}`;
}


export { get_mapid,
  post_mapid,
  get_dates,
  get_time_series,
  post_time_series,
  get_hillshade,
  get_hotspot,
  get_burned,
  get_flood,
  post_fire_risk,
  display_img,
  getPlanetXYZUrl,
  post_statistics
};
