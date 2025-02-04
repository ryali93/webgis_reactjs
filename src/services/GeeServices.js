// src/services/GeeServices.js
import { GeometryValidation } from '../tools/utils';

const post_mapid = async (request) => {
  try {
    console.log('[GeeServices] Received request:', request);
    let coordinates;
    var { idName, geometry, bands, gee_type, scale, start_date, end_date, vis, cloud_cover } = request;
    coordinates = GeometryValidation(geometry);

    // Crear la URL con todos los parámetros necesarios
    const url = `${process.env.REACT_APP_GEE_API_URL}/ee/post-mapid`;

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
  } catch (error) {
    console.error('Error:', error);
  }
};

const get_dates = async (request) => {
  try {
    console.log('[GeeServices] Received request:', request);
    let coordinates;
    var { idName, geometry, cloud_cover } = request;
    coordinates = GeometryValidation(geometry);

    const url = new URL(`${process.env.REACT_APP_GEE_API_URL}/ee/get-available-dates`);
    url.search = new URLSearchParams({
      id: idName,
      area: JSON.stringify(coordinates),
      cloud_cover: cloud_cover
    });
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

const post_time_series = async (request) => {
  try {
    console.log('[GeeServices] Received request:', request);
    let coordinates;
    var { idName, geometry, indices, reducer, start_date, end_date, cloud_cover } = request;
    coordinates = GeometryValidation(geometry);

    // Crear la URL con todos los parámetros necesarios
    const url = `${process.env.REACT_APP_GEE_API_URL}/ee/post-ts`;
    const body = {
      id: idName,
      area: JSON.stringify(coordinates),
      indices: indices,
      reducer: reducer,
      start_date: start_date,
      end_date: end_date,
      cloud_cover: cloud_cover
    };
    console.log('body:', body);
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
  } catch (error) {
    console.error('Error:', error);
  }
};

const display_img = async (request) => {
  try {
    console.log('[GeeServices] Received request:', request);
    let coordinates;
    var { id, geometry, indices, scale, start_date, end_date, cloud_cover } = request;
    coordinates = GeometryValidation(geometry);
    console.log('Coordinates:', coordinates);

    // Crear la URL con todos los parámetros necesarios
    const url = new URL(`${process.env.REACT_APP_GEE_API_URL}/ee/display-img`);
    url.search = new URLSearchParams({
      id: id,
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
  } catch (error) {
    console.error('Error:', error);
  }
};

const get_flood = async (request) => {
  try {
    console.log('[GeeServices:getFlood] Received request:', request);
    let coordinates;
    var { geometry, start_date, end_date } = request;
    coordinates = GeometryValidation(geometry);

    const url = new URL(`${process.env.REACT_APP_GEE_API_URL}/ee/get-flood`);
    url.search = new URLSearchParams({
      area: JSON.stringify(coordinates),
      start_date: start_date,
      end_date: end_date,
    });
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Export the function
export {
  post_mapid,
  get_dates,
  post_time_series,
  display_img,
  get_flood
};