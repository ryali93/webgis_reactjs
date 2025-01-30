import React, { use, useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import './GraphVis.css';

const GraphVis = ({timeSeriesData}) => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);

  useEffect(() => {
    if (chartRef.current && timeSeriesData) {
      plotData(timeSeriesData);
    }
  }, [timeSeriesData]);


  function plotData(timeSeriesData) {
    try {
      if (!timeSeriesData || !timeSeriesData.data || !timeSeriesData.labels) {
        console.error("Datos de la serie temporal no válidos:", timeSeriesData);
        return;
      }

      const indicesArray = timeSeriesData.data.map((data) => ({
        date: data.map(d => {
          const date = new Date(d.x);
          return isNaN(date) ? null : format(date, 'yyyy-MM-dd'); // Format dates to 'yyyy-MM-dd'
        }),
        value: data.map(d => d.y)
      }));

      const labels = timeSeriesData.labels.map((data) => data);

      // Obtener los índices con los labels que terminan en 'Mean'
      const indexMean = labels.map((label, index) => {
        if (label.endsWith('Mean')) {
          return index;
        }
      }).filter(index => index !== undefined);

      console.log("indexMean: ", indexMean);

      // Obtener datasets con los indexes obtenidos para el chart
      // Siete colores diferentes
      const colorPalette = [
        "red", "green", "blue", "orange", "purple", "brown", "pink"
      ]


      const datasets = indexMean.map((index) => ({
        label: labels[index],
        data: indicesArray[index].value,
        borderColor: colorPalette[index % colorPalette.length],
        backgroundColor: colorPalette[index % colorPalette.length],
        fill: false,
        hitRadius: 10, // Ensure hitRadius is defined
        pointRadius: 5, // Ensure pointRadius is defined
        pointHoverRadius: 7 // Ensure pointHoverRadius is defined
      }));

      const labelsArray = indicesArray[0].date;

      if (chartRef.current) {
        if (chart) {
          chart.destroy(); // Destroy the existing chart instance
        }
        const newChart = new Chart(chartRef.current, {
          type: 'line',
          data: {
            labels: labelsArray,
            datasets: datasets
          },
          options: {
            scales: {
              x: {
                ticks: {
                  maxRotation: 90,
                  minRotation: 45
                }
              }
            }
          }
        });
        setChart(newChart);
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }

  const handleDestroyChart = () => {
    if (chart) {
      chart.destroy();
      setChart(null);
    }
  };

  useEffect(() => {
    if (chart) {
      console.log("Chart datasets:", chart.data.datasets);
      console.log("Chart labels:", chart.data.labels);
    }
  }, [chart]);

  return (
    <div className="chartOverlay">
      {/* <button className="chart-button" onClick={handleDestroyChart}>Deshacer Gráfica</button>
      <button className="chart-button" onClick={() => plotData(timeSeriesData)}>Crear Gráfica</button>  */}
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GraphVis;