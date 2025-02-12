import React, { use, useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import './GraphVis.css';

const GraphVis = ({timeSeriesData, canvasId}) => {
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
        "#43868f","#9eba91","#cfd4b2","#f7f1dc","#ebcca4","#e4a377","#de755b","#d43d51","#488f31"
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
      console.log("labelsArray: ", labelsArray);
      // '2024-12-07' to date format
      const labelsArrayDates = labelsArray.map((d) => new Date(d));


      if (chartRef.current) {
        if (chart) {
          chart.destroy(); // Destroy the existing chart instance
        }

        const newChart = new Chart(chartRef.current, {
          type: 'line',
          data: {
            labels: labelsArrayDates,
            datasets: datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                // type: 'time',
                type: 'timeseries',
                time: {
                  unit: 'day'
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
      <canvas id={canvasId} ref={chartRef}></canvas>
    </div>
  );
};

export default GraphVis;