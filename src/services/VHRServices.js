// src/services/GeeServices.js
import { GeometryValidation } from '../tools/utils';

const get_s2 = async (request) => {
    try {
        console.log('[VHR_s2] Received request:', request);
        let coordinates;
        var { geometry, fechas } = request;

        coordinates = GeometryValidation(geometry);

        // Crear la URL con todos los parámetros necesarios
        const url = `${process.env.REACT_APP_VHR_API_URL}/s2/download_s2`;
        console.log(url)

        const body = {
            lat: coordinates[0],
            lon: coordinates[1],
            bands: ["B04", "B03", "B02", "B08"],
            fechas: fechas,
            edge_size: 64,
            path: ""
        };
        console.log(body)
        console.log(JSON.stringify(body))
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error);
    }
}

const get_sr = async (request) => {
    try {
        console.log('[VHR_sr] Received request:', request);
        var { folder } = request;

        // Crear la URL con todos los parámetros necesarios
        const url = `${process.env.REACT_APP_VHR_API_URL}/s2/sr_s2`;
        console.log(url)

        const body = {
            folder: folder
        };
        console.log(body)
        console.log(JSON.stringify(body))
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error);
    }
};

const get_builds = async (request) => {
    try {
        console.log('[VHR_builds] Received request:', request);
        var { folder } = request;

        // Crear la URL con todos los parámetros necesarios
        const url = `${process.env.REACT_APP_VHR_API_URL}/s2/get_builds`;
        console.log(url)

        const body = {
            folder: folder
        };
        console.log(body)
        console.log(JSON.stringify(body))
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error);
    }
};

const get_vis = async (request) => {
    try {
        console.log('[VHR_vis] Received request:', request);
        var { folder } = request;

        // Crear la URL con todos los parámetros necesarios
        const url = `${process.env.REACT_APP_VHR_API_URL}/s2/get_vis`;
        console.log(url)

        const body = {
            folder: folder
        };
        console.log(body)
        console.log(JSON.stringify(body))
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error);
    }
};


const get_list_images = async (request) => {
    try {
        console.log('[VHRimages] Received Images request:', request);
        var { folderPath } = request;
        const url = new URL(`${process.env.REACT_APP_INSAR_API_URL}/list-images/${folderPath}`);
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
      console.error('Error:', error);
    }
};
  

// Export the function
export {
    get_s2,
    get_sr,
    get_builds,
    get_vis,
    get_list_images
  };