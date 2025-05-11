// src/components/ProficiencyBarChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const BAR_COLORS = [
  '#1976d2', // All students
  '#ff9800', // Econ disadvantaged
];

export const ProficiencyBarChart = ({ school, chartId, variant }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const resolvedChartId = chartId || `proficiency-bar-chart-${school?.school_code_adjusted || Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement || !school || !resolvedChartId) return;

    const readingAll = !isNaN(school.reading_all_proficient_distinguished) ? Number(school.reading_all_proficient_distinguished) : null;
    const readingEcon = !isNaN(school.reading_econ_disadv_proficient_distinguished) ? Number(school.reading_econ_disadv_proficient_distinguished) : null;
    const mathAll = !isNaN(school.math_all_proficient_distinguished) ? Number(school.math_all_proficient_distinguished) : null;
    const mathEcon = !isNaN(school.math_econ_disadv_proficient_distinguished) ? Number(school.math_econ_disadv_proficient_distinguished) : null;

    if ([readingAll, readingEcon, mathAll, mathEcon].every(v => v === null)) {
      const ctx = canvasElement.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const chartConfig = {
      type: 'bar',
      data: {
        labels: ['Reading', 'Math'],
        datasets: [
          {
            label: 'All',
            data: [readingAll, mathAll],
            backgroundColor: BAR_COLORS[0],
            borderRadius: 4,
            barPercentage: 0.8,
            categoryPercentage: 0.6,
          },
          {
            label: 'Econ Disadvan',
            data: [readingEcon, mathEcon],
            backgroundColor: BAR_COLORS[1],
            borderRadius: 4,
            barPercentage: 0.8,
            categoryPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true, // Set to false if you want it to purely fill the canvas width/height props
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            align: 'center', // To help with single line centering
            labels: {
              // These will now be used by our custom generateLabels function
              boxWidth: 10,      // Desired width for our custom square
              boxHeight: 10,     // Desired height for our custom square
              padding: 15,       // Space between legend items
              font: {
                size: 11,        // Font size for legend text
              },
              // Custom function to generate legend items
              generateLabels: function(chart) {
                const datasets = chart.data.datasets;
                return datasets.map((dataset, i) => {
                  return {
                    text: dataset.label,
                    fillStyle: dataset.backgroundColor, // Or strokeStyle for line charts
                    strokeStyle: dataset.borderColor || dataset.backgroundColor, // Fallback for border
                    lineWidth: dataset.borderWidth || 0,
                    hidden: !chart.isDatasetVisible(i),
                    datasetIndex: i,
                    // --- Crucial for custom swatch appearance ---
                    // We are telling it to draw a rectangle of this size
                    // This bypasses the default pointStyle rendering issues for size.
                    // The 'pointStyle' property here makes it render a shape,
                    // and we use 'rect' to make it a rectangle.
                    pointStyle: 'rect',
                    // NOTE: Chart.js might internally use these boxWidth/Height to draw the 'rect'
                    // if pointStyle is 'rect'. So we keep them defined.
                    // If it *still* doesn't respect the size perfectly with pointStyle 'rect',
                    // this generateLabels function is where you could even inject an 'image'
                    // pointStyle with a tiny pre-rendered square if absolutely needed.
                  };
                });
              }
            },
            // To encourage a single line, we can try to influence the layout.
            // However, Chart.js legend layout is somewhat internal.
            // If it still wraps, the canvas width might be the limiting factor.
            // We can't directly force "no wrap" via options.
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                let value = context.parsed.y;
                return `${label}: ${!isNaN(value) ? Math.round(value) + '%' : 'N/A'}`;
              },
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) { return value + '%'; }
            },
            title: { display: false },
            grid: { display: true, color: '#eee' },
          },
          x: {
            title: { display: false },
            grid: { display: false },
          }
        },
        animation: { duration: 0 },
      },
    };

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    chartInstanceRef.current = new Chart(ctx, chartConfig);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [school, resolvedChartId, variant]); // Added variant to dependencies

  // Sizing: adjust width/height based on variant
  // These explicitly set the canvas element size.
  // `maintainAspectRatio: false` would make the chart drawing fill this.
  // `maintainAspectRatio: true` (default) makes the chart drawing respect its internal aspect ratio *within* these bounds.
  const width = variant === 'table' ? 180 : 220;
  const height = variant === 'table' ? 120 : 160;

  return (
    <canvas
      ref={canvasRef}
      id={resolvedChartId}
      width={width}  // Setting canvas width
      height={height} // Setting canvas height
      // Forcing the chart to use these dimensions for its drawing area rather than its internal aspect ratio:
      // style={{ display: 'block', width: `${width}px`, height: `${height}px`, margin: '0 auto', background: 'transparent' }}
      // Simpler, if maintainAspectRatio is true, chart will fit within these dimensions.
      // If maintainAspectRatio is false, chart will stretch to these dimensions.
      style={{ display: 'block', margin: '0 auto', background: 'transparent' }}
    ></canvas>
  );
};

export default ProficiencyBarChart;