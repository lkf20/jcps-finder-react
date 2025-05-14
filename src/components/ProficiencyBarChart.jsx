// src/components/ProficiencyBarChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const BAR_COLORS = [
  '#1976d2', // All students (School)
  '#ff9800', // Econ disadvantaged (School)
  '#cccccc', // State Average (Example: Green) - CHOOSE A DISTINCT COLOR
];

// State Averages
const STATE_AVERAGE_READING = 46;
const STATE_AVERAGE_MATH = 41;

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

    // If all school-specific data is null, we might still want to show state averages if available
    // For now, let's keep the existing behavior: if all school data is null, clear the chart.
    // You could adjust this to always show state averages if desired.
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
            // Adjust barPercentage and categoryPercentage if 3 bars look too crowded
            // barPercentage: 0.7, // Example: slightly thinner bars
            // categoryPercentage: 0.6,
          },
          {
            label: 'Econ Disadv.', 
            data: [readingEcon, mathEcon],
            backgroundColor: BAR_COLORS[1],
            borderRadius: 4,
            // barPercentage: 0.7,
            // categoryPercentage: 0.6,
          },
          // --- NEW DATASET FOR STATE AVERAGES ---
          {
            label: 'State Avg',
            data: [STATE_AVERAGE_READING, STATE_AVERAGE_MATH],
            backgroundColor: BAR_COLORS[2], // Use the third color
            borderRadius: 4,
            // barPercentage: 0.7,
            // categoryPercentage: 0.6,
          }
          // --- END NEW DATASET ---
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          // No averageLine plugin needed anymore
          legend: {
            display: true,
            position: 'bottom',
            align: 'center',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 10, // May need to reduce padding if more legend items
              font: { size: 10 }, // May need smaller font
              pointStyle: 'rect',
              generateLabels: function(chart) { // This function should now correctly include the 3rd dataset
                const datasets = chart.data.datasets;
                return datasets.map((dataset, i) => ({
                    text: dataset.label,
                    fillStyle: dataset.backgroundColor,
                    strokeStyle: dataset.borderColor || dataset.backgroundColor,
                    lineWidth: dataset.borderWidth || 0,
                    hidden: !chart.isDatasetVisible(i),
                    datasetIndex: i,
                    pointStyle: 'rect',
                }));
              }
            },
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
            // If bars are grouped, Chart.js handles this by default.
            // You might want to adjust spacing between categories if it looks too tight.
          }
        },
        animation: { duration: 0 },
        // To ensure bars within the same category are grouped together:
        // (Chart.js usually does this by default for multiple datasets in a bar chart)
        // If they are stacking instead of grouping, you'd look into x-axis options:
        // scales: { x: { stacked: false }, y: { stacked: false } } // Ensure not stacked
      },
      // No custom plugins array needed here anymore unless you have others
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
  }, [school, resolvedChartId, variant]);

  // Adjust canvas size if needed for 3 bars + legend
  const width = variant === 'table' ? 200 : 240; // Slightly wider?
  const height = variant === 'table' ? 130 : 170; // Slightly taller for legend space?

  return (
    <canvas
      ref={canvasRef}
      id={resolvedChartId}
      width={width}
      height={height}
      style={{ display: 'block', margin: '0 auto', background: 'transparent' }}
    ></canvas>
  );
};

export default ProficiencyBarChart;