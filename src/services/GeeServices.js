// src/services/GeeServices.js
// Post-ts

import { GeometryValidation } from '../tools/utils';

const GeeFunction = async (request) => {
    try {

      let coordinates;
      var { geometry, dateRange } = request;

      console.log('[GeeServices] Received request:', request);
      coordinates = GeometryValidation(geometry);
      console.log('[GeeServices] Geometry:', geometry);
      
      const requestData = {
        id: "COPERNICUS/S2_SR_HARMONIZED",
        area: JSON.stringify(coordinates),
        indices: "",
        start_date: dateRange[0],
        end_date: dateRange[1],
        scale: "10",
        reducer: "mean",
        cloud_cover: "80",
      };

      console.log('Sending request to /ee/post-ts');
      const response = await fetch(`${process.env.REACT_APP_GEE_API_URL}/ee/post-ts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
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

// Export the function
export {
  GeeFunction
};