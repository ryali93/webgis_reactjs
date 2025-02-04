import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import './InSAR.css';

const InSAR = ({ timeSeriesInSAR, canvasId }) => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    console.log("[InSAR] Entro en useEffect");
    if (chartRef.current && timeSeriesInSAR) {
      plotData(timeSeriesInSAR);
    }
  }, [timeSeriesInSAR]);

  function plotData(timeSeriesInSAR) {
    try {
      console.log('[InSAR] Starting to plot data...');

    if (!timeSeriesInSAR || !timeSeriesInSAR.data_insar_ts || !timeSeriesInSAR.metadata_insar) {
      console.error('[InSAR] Invalid timeSeriesInSAR data:', timeSeriesInSAR);
      return;
    }

    const data = timeSeriesInSAR.data_insar_ts;
    const metadata = timeSeriesInSAR.metadata_insar;

    // Get the date and displacement values
    const date = data.map((d) => new Date(d.date));
    console.log('[InSAR] date:', date);

    const displacement = data.map((d) => d.date_value);
    console.log('[InSAR] displacement:', displacement);

    console.log('[InSAR] Length of date:', date.length);

    setMetadata(metadata); // Set metadata state

    if (chartRef.current) {
      if (chart) {
        chart.destroy(); // Destroy the existing chart instance
      }

      const newChart = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: date,
          datasets: [
            {
              label: 'Displacement',
              data: displacement,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Displacement'
              }
            }
          }
        }
      });
      setChart(newChart);

      console.log('[InSAR] Finished plotting data.');
    }
   } catch (error) {
    console.error('[InSAR] Error plotting data:', error);
  }
};

  return (
    <div className="insar-container">
      {metadata && (
        <div className="insar-metadata">
          <p>
            ID: {metadata[0].id}, Acceleration: {metadata[0].acceleration}, Height: {metadata[0].height}, 
            Mean Velocity: {metadata[0].mean_velocity}, RMSE: {metadata[0].rmse}
          </p>
        </div>
      )}
      <div className="insar-chart">
        <canvas id={canvasId} ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default InSAR;