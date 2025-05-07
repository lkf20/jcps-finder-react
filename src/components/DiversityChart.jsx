// src/components/DiversityChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { DIVERSITY_LABELS, DIVERSITY_COLORS, DIVERSITY_KNOWN_KEYS } from '../utils/diversityConfig'; 

export const DiversityChart = ({ school, chartId }) => { // Added chartId prop
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !school || !chartId) { // Added chartId check
      // console.log("DiversityChart: Canvas, School prop, or chartId missing.");
      return;
    }

    // --- 1. Prepare Data ---
    const processedData = {};
    let dataAvailable = false;
    const knownKeys = ['white_percent', 'african_american_percent', 'hispanic_percent', 'asian_percent', 'two_or_more_races_percent'];

    knownKeys.forEach(key => {
      const pct = school[key];
      const numPct = (pct != null && !isNaN(parseFloat(pct))) ? Number(parseFloat(pct).toFixed(2)) : 0;
      processedData[key] = numPct;
      if (numPct > 0) dataAvailable = true;
    });
    
    const calculatedKnownTotal = knownKeys.reduce((sum, key) => sum + (processedData[key] || 0), 0);
    const otherPercent = Math.max(0, 100 - parseFloat(calculatedKnownTotal.toFixed(2)));
    processedData['other_percent'] = parseFloat(otherPercent.toFixed(2));

    if (processedData['other_percent'] > 0) dataAvailable = true;

    const dataValues = [
      processedData['white_percent'] || 0,
      processedData['african_american_percent'] || 0,
      processedData['hispanic_percent'] || 0,
      processedData['asian_percent'] || 0,
      processedData['two_or_more_races_percent'] || 0,
      processedData['other_percent'] || 0
    ];

    // --- 2. Filter Data for Chart ---
    const filteredChartLabels = [];
    const filteredChartData = [];
    const filteredChartColors = [];

    dataValues.forEach((value, index) => {
      if (value > 0.01) { // Only include >0.01% in chart segments to avoid tiny slivers
        filteredChartLabels.push(DIVERSITY_LABELS[index]);
        filteredChartData.push(value);
        filteredChartColors.push(DIVERSITY_COLORS[index % DIVERSITY_COLORS.length]);
      }
    });

    // --- 3. Handle "No Data" for Chart ---
    if (!dataAvailable || filteredChartData.length === 0) {
      const ctx = canvasElement.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      // Optional: Render "No data" text on canvas if desired
      // if (ctx) {
      //   ctx.font = "12px Arial";
      //   ctx.textAlign = "center";
      //   ctx.fillStyle = "#888";
      //   ctx.fillText("No data", canvasElement.width / 2, canvasElement.height / 2);
      // }
      return;
    }

    // --- 4. Chart Configuration ---
    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: filteredChartLabels,
        datasets: [{
          label: 'Diversity %',
          data: filteredChartData,
          backgroundColor: filteredChartColors,
          hoverOffset: 4,
          borderWidth: 1 // Or 0 if you prefer no borders between segments
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // CRITICAL: Allows chart to fill constrained container
        cutout: '65%', // Adjust for doughnut thickness
        plugins: {
          legend: { display: false }, // We use our custom DiversityLegend component
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) { label += ': '; }
                let value = context.parsed || 0;
                label += parseFloat(value.toFixed(1)) + '%';
                return label;
              }
            }
          }
        },
        animation: { duration: 0 } // Disable animation for faster rendering/updates
      }
    };

    // --- 5. Create/Update Chart Instance ---
    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      console.error("Failed to get canvas context.");
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    chartInstanceRef.current = new Chart(ctx, chartConfig);

    // --- 6. Cleanup ---
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };

  }, [school, chartId]); // Re-run effect if school data or chartId changes

  // Render only the canvas. The ID is now passed as a prop.
  // Style ensures it tries to fill parent.
  return (
    <canvas ref={canvasRef} id={chartId} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
  );
};

export default DiversityChart;