const post_time_series = async (idName, coordinates, indices, reducer, start_date, end_date, cloud_cover) => {
        //let coordinates;
        // coordinates = valid_geometry(geometry);
      
        // Crear la URL con todos los parámetros necesarios
        const url = `${process.env.REACT_APP_GEE_API_URL}/ee/post-ts`;
        const body = {
          id: idName,
          area: coordinates,
          indices: indices,
          reducer: reducer,
          start_date: start_date,
          end_date: end_date,
          cloud_cover: cloud_cover          
        };
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });
      
        const data = await response.json();
        console.log(data);
        
        // Convert the dates to a human-readable format
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
        const result = { "data": newData, "labels": newLabels };
        console.log(result); // Log the result to the console
        return result;

      } catch (error) {
        console.error("Error al obtener los datos:", error);
        throw error;
      }
    };

export { post_time_series };

