import React, { useEffect, useRef, useState } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

var CanvasJS = CanvasJSReact.CanvasJS;

const Chart = () => {
  const [chartData, setChartData] = useState([]);
  const chartInstance = useRef(null);

  useEffect(() => {
    setChartData({
      work: [
        { label: '03/03/2025', y: 7.07 },
        { label: '04/03/2025', y: 6.98 },
        { label: '05/03/2025', y: 6.98 },
        { label: '06/03/2025', y: 5.46 },
        { label: '07/03/2025', y: 7.05 },
        { label: '10/03/2025', y: 7.03 },
        { label: '11/03/2025', y: 6.91 },
        { label: '12/03/2025', y: 6.95 },
        { label: '13/03/2025', y: 7.16 },
        { label: '14/03/2025', y: 7.06 },
        { label: '17/03/2025', y: 7.04 },
        { label: '18/03/2025', y: 6.64 },
        { label: '19/03/2025', y: 7 },
        { label: '20/03/2025', y: 7.08 },
        { label: '21/03/2025', y: 6.99 },
        { label: '24/03/2025', y: 7.04 },
        { label: '25/03/2025', y: 2.52 },
        { label: '26/03/2025', y: 6.83 },
        { label: '27/03/2025', y: 6.96 },
        { label: '28/03/2025', y: 7.02 },
        { label: '31/03/2025', y: 7.95 }
      ],
      break: [
        { label: '03/03/2025', y: 1 },
        { label: '04/03/2025', y: 1.01 },
        { label: '05/03/2025', y: 1.07 },
        { label: '06/03/2025', y: 0.85 },
        { label: '07/03/2025', y: 1.02 },
        { label: '10/03/2025', y: 1.02 },
        { label: '11/03/2025', y: 1.15 },
        { label: '12/03/2025', y: 1.11 },
        { label: '13/03/2025', y: 0.98 },
        { label: '14/03/2025', y: 0.97 },
        { label: '17/03/2025', y: 1.05 },
        { label: '18/03/2025', y: 1.36 },
        { label: '19/03/2025', y: 1.04 },
        { label: '20/03/2025', y: 0.96 },
        { label: '21/03/2025', y: 1.07 },
        { label: '24/03/2025', y: 1.02 },
        { label: '25/03/2025', y: 1.15 },
        { label: '26/03/2025', y: 1.21 },
        { label: '27/03/2025', y: 1.08 },
        { label: '28/03/2025', y: 1.01 },
        { label: '31/03/2025', y: 1.1 }
      ],
      lunch: [
        { label: '03/03/2025', y: 0.51 },
        { label: '04/03/2025', y: 0.5 },
        { label: '05/03/2025', y: 0.52 },
        { label: '06/03/2025', y: 0.51 },
        { label: '07/03/2025', y: 0.5 },
        { label: '10/03/2025', y: 0.51 },
        { label: '11/03/2025', y: 0.51 },
        { label: '12/03/2025', y: 0.51 },
        { label: '13/03/2025', y: 0.52 },
        { label: '14/03/2025', y: 0.52 },
        { label: '17/03/2025', y: 0.51 },
        { label: '18/03/2025', y: 0.5 },
        { label: '19/03/2025', y: 0.51 },
        { label: '20/03/2025', y: 0.49 },
        { label: '21/03/2025', y: 0.51 },
        { label: '24/03/2025', y: 0.51 },
        { label: '25/03/2025', y: 0.52 },
        { label: '26/03/2025', y: 0.51 },
        { label: '27/03/2025', y: 0.51 },
        { label: '28/03/2025', y: 0.51 },
        { label: '31/03/2025', y: 0.52 }
      ],
      personal: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0.04 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0.15 },
        { label: '19/03/2025', y: 0 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ],
      breakRefreshment: [
        { label: '03/03/2025', y: 0.49 },
        { label: '04/03/2025', y: 0.51 },
        { label: '05/03/2025', y: 0.44 },
        { label: '06/03/2025', y: 0.34 },
        { label: '07/03/2025', y: 0.52 },
        { label: '10/03/2025', y: 0.51 },
        { label: '11/03/2025', y: 0.63 },
        { label: '12/03/2025', y: 0.61 },
        { label: '13/03/2025', y: 0.46 },
        { label: '14/03/2025', y: 0.45 },
        { label: '17/03/2025', y: 0.54 },
        { label: '18/03/2025', y: 0.71 },
        { label: '19/03/2025', y: 0.51 },
        { label: '20/03/2025', y: 0.47 },
        { label: '21/03/2025', y: 0.56 },
        { label: '24/03/2025', y: 0.5 },
        { label: '25/03/2025', y: 0.63 },
        { label: '26/03/2025', y: 0.7 },
        { label: '27/03/2025', y: 0.57 },
        { label: '28/03/2025', y: 0.5 },
        { label: '31/03/2025', y: 0.59 }
      ],
      meeting: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0 },
        { label: '19/03/2025', y: 0 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ],
      oneToOne: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0 },
        { label: '19/03/2025', y: 0 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ],
      projectWork: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0 },
        { label: '19/03/2025', y: 0 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ],
      recuperation: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0 },
        { label: '19/03/2025', y: 0 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ],
      training: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0 },
        { label: '19/03/2025', y: 0 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ],
      medical: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0 },
        { label: '19/03/2025', y: 0 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ],
      inactivity: [
        { label: '03/03/2025', y: 0 },
        { label: '04/03/2025', y: 0 },
        { label: '05/03/2025', y: 0.07 },
        { label: '06/03/2025', y: 0 },
        { label: '07/03/2025', y: 0 },
        { label: '10/03/2025', y: 0 },
        { label: '11/03/2025', y: 0 },
        { label: '12/03/2025', y: 0 },
        { label: '13/03/2025', y: 0 },
        { label: '14/03/2025', y: 0 },
        { label: '17/03/2025', y: 0 },
        { label: '18/03/2025', y: 0 },
        { label: '19/03/2025', y: 0.02 },
        { label: '20/03/2025', y: 0 },
        { label: '21/03/2025', y: 0 },
        { label: '24/03/2025', y: 0 },
        { label: '25/03/2025', y: 0.93 },
        { label: '26/03/2025', y: 0 },
        { label: '27/03/2025', y: 0 },
        { label: '28/03/2025', y: 0 },
        { label: '31/03/2025', y: 0 }
      ]
    });
  }, []);

  useEffect(() => {
    if (!chartData) return;
    const options = {
      axisX: {
        title: 'Dates'
      },
      axisY: {
        title: 'Hours'
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: 'pointer',
        itemclick: function (e) {
          // Toggle visibility
          if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        }
      },
      data: [
        {
          type: 'spline',
          name: 'Work',
          showInLegend: true,
          dataPoints: chartData.work
        },
        {
          type: 'spline',
          name: 'Break',
          showInLegend: true,
          dataPoints: chartData.break
        },
        {
          type: 'spline',
          name: 'Lunch',
          showInLegend: true,
          dataPoints: chartData.lunch
        },
        {
          type: 'spline',
          name: 'Personal',
          showInLegend: true,
          dataPoints: chartData.personal
        },
        {
          type: 'spline',
          name: 'Break/Refreshment',
          showInLegend: true,
          dataPoints: chartData.breakRefreshment
        },
        {
          type: 'spline',
          name: 'Meeting',
          showInLegend: true,
          dataPoints: chartData.meeting
        },
        {
          type: 'spline',
          name: 'One to One',
          showInLegend: true,
          dataPoints: chartData.oneToOne
        },
        {
          type: 'spline',
          name: 'Project Work',
          showInLegend: true,
          dataPoints: chartData.projectWork
        },
        {
          type: 'spline',
          name: 'Recuperation',
          showInLegend: true,
          color: '#000000',
          dataPoints: chartData.recuperation
        },
        {
          type: 'spline',
          name: 'Training',
          showInLegend: true,
          dataPoints: chartData.training
        },
        {
          type: 'spline',
          name: 'Medical',
          showInLegend: true,
          dataPoints: chartData.medical
        },
        {
          type: 'spline',
          name: 'Inactivity',
          showInLegend: true,
          color: '#ff0000',
          dataPoints: chartData.inactivity
        }
      ],
      animationEnabled: true,
      animationDuration: 2000,
      exportEnabled: true,
      zoomEnabled: true
    };

    // Initialize chart
    chartInstance.current = new CanvasJS.Chart('chartContainer', options);
    chartInstance.current.render();

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.render();
      }
    };

    // Use both ResizeObserver and window resize for maximum compatibility
    const resizeObserver = new ResizeObserver(handleResize);
    const container = document.getElementById('chartContainer');
    // Delay observing until after initial animation
    const animationDuration = options.animationDuration || 2000;
    setTimeout(() => {
      if (container) {
        resizeObserver.observe(container);
      }
    }, animationDuration);

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div
      style={{
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        padding: '0px 15px 15px 15px',
        background: '#fff',
        borderRadius: '5px',
        border: '1px solid #ddd'
      }}
    >
      <h2>User Working Hours Statistics</h2>
      <div
        id="chartContainer"
        style={{
          height: '350px',
          width: '100%'
        }}
      />
    </div>
  );
};

export default Chart;
