import React, { use, useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { post_time_series } from '../services/GeeMethods';
import { format } from 'date-fns';

const GraphVis = () => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  const fetchData = async () => {
      console.log("Fetching data...");
      try {
        const array = await post_time_series(
          "COPERNICUS/S2_HARMONIZED",
          "[[-3.7134078228680614,40.49723279294008],[-3.714015643798402,40.50586015304347],[-3.7253616344980083,40.50539800116664],[-3.7247538135676677,40.49677058162192],[-3.7134078228680614,40.49723279294008]]",
          "NDVI",
          "mean",
          "2021-12-04",
          "2021-12-18",
          "80"
        );

        const indicesArray = array.data.map((data) => ({
          date: data.map(d => {
            const date = new Date(d.x);
            return isNaN(date) ? null : format(date, 'yyyy-MM-dd'); // Format dates to 'yyyy-MM-dd'
          }),
          value: data.map(d => d.y)
        }));

        const labels = indicesArray[0].date.filter(date => date !== null); // Use the formatted dates as labels
        const datasets = indicesArray.map((data, index) => ({
          label: array.labels[index],
          data: data.value,
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'][index % 3],
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'][index % 3],
          fill: false,
          hitRadius: 10, // Ensure hitRadius is defined
          pointRadius: 5, // Ensure pointRadius is defined
          pointHoverRadius: 7 // Ensure pointHoverRadius is defined
        
        }));

        if (chartRef.current) {
          if (chart) {
            chart.destroy(); // Destroy the existing chart instance
          }
          const newChart = new Chart(chartRef.current, {
            type: 'line',
            data: {
              labels: labels,
              datasets: datasets
            },            
          });
          setChart(newChart);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="chartOverlay">
      <button onClick={fetchData}>Actualizar Gráfica</button>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GraphVis;