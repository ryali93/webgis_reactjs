const get_data_by_id = async (request) => {
    try {
      console.log('[InsarServices] Received GET DATA request:', request);
      var { id_insar, table } = request;
      const url = new URL(`${process.env.REACT_APP_INSAR_API_URL}/insar/data`);
    //   const url = new URL(`http://212.128.193.128:4001/insar/data`);
      url.search = new URLSearchParams({
        id: id_insar,
        table: table
      });
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const get_metadata_by_id = async (request) => {
    try {
      console.log('[InsarServices] Received GET METADATA request:', request);
      var { id_insar, table } = request;
      const url = new URL(`${process.env.REACT_APP_INSAR_API_URL}/insar/metadata`);
    //   const url = new URL(`http://212.128.193.128:4001/insar/metadata`);
      url.search = new URLSearchParams({
        id: id_insar,
        table: table
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
    get_data_by_id,
    get_metadata_by_id
  };