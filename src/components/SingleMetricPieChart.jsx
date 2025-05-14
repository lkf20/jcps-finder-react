// src/components/SingleMetricPieChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './SingleMetricPieChart.module.css'; // We'll keep this for container styling

// --- Chart.js Plugin to Draw Text in the Center ---
const centerTextPlugin = {
  id: 'centerText',
  afterDraw: (chart) => {
    if (chart.config.type !== 'doughnut' || !chart.config.options.plugins?.centerText?.display) {
      return;
    }
    const ctx = chart.ctx;
    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

    // Get the text and font options from chart config
    const text = chart.config.options.plugins.centerText.text || '';
    const color = chart.config.options.plugins.centerText.color || '#000';
    const fontStyle = chart.config.options.plugins.centerText.fontStyle || 'Arial';
    const baseFontSize = chart.config.options.plugins.centerText.baseFontSize || 20; // Base size
    
    // Dynamically adjust font size based on chart width to prevent overflow
    // You might need to fine-tune the divisor (e.g., 4, 5, 6)
    const chartWidth = chart.chartArea.right - chart.chartArea.left;
    let fontSize = Math.min(baseFontSize, chartWidth / 4.5); // Adjust divisor for best fit

    // Ensure minimum font size if chart is very small
    fontSize = Math.max(fontSize, 8); // e.g., minimum 8px

    ctx.save();
    ctx.font = `bold ${fontSize}px ${fontStyle}`; // Make it bold
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  }
};

// Register the plugin globally for all charts of this type if not already done
// Or pass it to the specific chart instance via config.plugins array
// For simplicity here, we'll assume it's passed via config.
// Chart.register(centerTextPlugin); // Not strictly needed if passed in chart config

export const SingleMetricPieChart = ({
  percentage,
  metricLabel, // Still useful for tooltips or if you want a small label elsewhere
  metricColor,
  baseColor = '#E0E0E0',
  chartIdSuffix,
  variant = 'table', // 'table' or 'card'
  // showLegend = true, // We are removing the external div legend
}) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const validPercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
  const remainingPercentage = 100 - validPercentage;
  const chartId = `single-metric-chart-${chartIdSuffix || Math.random().toString(36).substring(7)}`;

  // Text for the center of the doughnut
  const centerPercentageText = `${Math.round(validPercentage)}%`;

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const data = {
      // labels: [metricLabel, 'Other'], // Labels not strictly needed for display if no legend/tooltip on 'Other'
      datasets: [{
        data: [validPercentage, remainingPercentage],
        backgroundColor: [metricColor, baseColor],
        hoverOffset: 4,
        borderWidth: 1,
        circumference: (ctx) => {
            if (ctx.dataset.data[0] === 0 && ctx.dataset.data[1] === 0) return 0;
            return 360;
        },
      }]
    };

    const chartConfig = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%', // Adjust doughnut thickness, e.g., 60-75%
                       // Larger cutout % means thinner doughnut, more space in middle
        plugins: {
          // Our custom plugin for center text
          centerText: { // Custom namespace for our plugin's options
            display: true,
            text: centerPercentageText,
            color: '#333', // Color of the text
            fontStyle: 'Arial, sans-serif', // Font family
            baseFontSize: 20, // Base font size (will be scaled down if chart is small)
          },
          legend: {
            display: false, // Disable Chart.js default legend
          },
          tooltip: {
            enabled: true, // Keep tooltips on the doughnut segments if desired
            callbacks: {
              label: function(context) {
                // Only show tooltip for the actual metric segment
                if (context.dataIndex === 0) { 
                  return `${metricLabel}: ${Math.round(context.parsed)}%`;
                }
                return null; // No tooltip for the "other" segment
              }
            }
          }
        },
        animation: {
          duration: 0
        }
      },
      plugins: [centerTextPlugin] // <<<< REGISTER THE PLUGIN FOR THIS CHART INSTANCE
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    chartInstanceRef.current = new Chart(canvasElement, chartConfig);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  // Re-run effect if these critical props change
  }, [validPercentage, centerPercentageText, metricLabel, metricColor, baseColor, chartId]); 

  return (
    <div className={`${styles.chartContainer} ${variant === 'card' ? styles.cardVariant : ''}`}>
      <canvas ref={canvasRef} id={chartId} className={styles.chartCanvas}></canvas>
      {/* Legend div is now removed */}
    </div>
  );
};

export default SingleMetricPieChart;