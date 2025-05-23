// src/components/ProficiencyBarChart.jsx
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Custom Plugin to display datalabels at the end of horizontal bars
const horizontalBarDataLabelsPlugin = {
  id: 'horizontalBarDataLabels',
  afterDatasetsDraw: (chart, args, pluginOptions) => {
    const { ctx, data, scales: { x, y } } = chart;
    const { fontColor = 'black', fontSize = 10, fontStyle = 'Arial', offsetX = 5, offsetY = 1, } = pluginOptions;

    ctx.save();
    ctx.font = `bold ${fontSize}px ${fontStyle}`;
    ctx.fillStyle = fontColor;
    ctx.textBaseline = 'middle';

    data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta.hidden) { // Only draw for visible datasets
        meta.data.forEach((element, index) => {
          const rawValue = dataset.data[index];
          if (rawValue === null || rawValue === undefined || isNaN(rawValue)) return; // Skip null/undefined/NaN

          const displayValue = `${Math.round(rawValue)}%`;
          const model = element.getProps(['x', 'y', 'base', 'width', 'height'], true);
          const xPositionOriginal = element.x; // End of the bar
          let xPositionLabel = xPositionOriginal + offsetX; 
          let xPosition = model.x + offsetX; // Position to the right of the bar end
          let yPosition = model.y;
          let yPositionLabel = element.y + offsetY;
          
          ctx.textAlign = 'left'; // Align text to the left of xPosition

          // Prevent label from going off canvas (simple check)
          if (xPositionLabel + ctx.measureText(displayValue).width > chart.chartArea.right) {
            ctx.textAlign = 'right';
            ctx.fillText(displayValue, xPositionOriginal - offsetX, yPositionLabel); 
          } else {
            ctx.fillText(displayValue, xPositionLabel, yPositionLabel);
          }

        });
      }
    });
    ctx.restore();
  }
};

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

    let legendPadding = 10;
    let legendFontSize = 10;
    let barThickness = variant === 'card' ? 14 : 12;
    let valueLabelFontSize = variant === 'card' ? 9 : 10;
    let valueLabelOffsetY = variant === 'card' ? 1 : 2;
    let yTicksFontSize = variant === 'card' ? 10 : 11; // "Reading", "Math" labels



    if (variant === 'card') {
        legendPadding = 5;
        legendFontSize = 8; // Smaller font for card legend

    }

    // Y-axis labels (categories)
    const yAxisLabels = ['Reading', 'Math']; 
    const yAxisTicksCallback = (value, index) => { // For R and M labels
        const label = yAxisLabels[index];
        return label === 'Reading' ? 'R' : label === 'Math' ? 'M' : label;
    };

    const chartConfig = {
      type: 'bar',
      data: {
        labels: yAxisLabels,
        datasets: [
          {
            label: 'All', 
            data: yAxisLabels.map(label => label === 'Reading' ? readingAll : mathAll),
            backgroundColor: BAR_COLORS[0],
            borderRadius: 4,
            barThickness: barThickness, 
          },
          {
            label: 'Econ Dis.', 
            data: [readingEcon, mathEcon],
            backgroundColor: BAR_COLORS[1],
            borderRadius: 4,
            barThickness: barThickness, 
          },
          {
            label: 'State Avg',
            data: [STATE_AVERAGE_READING, STATE_AVERAGE_MATH],
            backgroundColor: BAR_COLORS[2], // Use the third color
            borderRadius: 4,
            barThickness: barThickness, 
          }
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          horizontalBarDataLabels: { // Options for our custom plugin
            fontColor: '#333',
            fontSize: valueLabelFontSize,
            fontStyle: 'Arial, sans-serif',
            offsetX: 5, // Pixels offset from the end of the bar
            offsetY: valueLabelOffsetY, // Pixels offset from the end of the bar
          },
          legend: {
            display: true,
            position: 'bottom',
            align: 'center',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: legendPadding, 
              font: { size: legendFontSize }, // May need smaller font
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
                let value = context.parsed.x;
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
              font: { size: yTicksFontSize },
              callback: yAxisTicksCallback, // Use callback for R and M
          },
            title: { display: false },
            grid: { display: false, color: '#eee' },
            border: { // Controls the main Y-axis line
              display: false // <<<< HIDES THE Y-AXIS LINE
          }
          },
          x: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              display: false, // <<<< THIS HIDES ALL X-AXIS TICK LABELS
              // callback, stepSize, font size are no longer needed if display is false
            },
            title: { display: false },
            grid: { display: false},
            drawBorder: false,
            drawOnChartArea: false,
            border: { // Controls the main X-axis line
              display: false // <<<< HIDES THE X-AXIS LINE
          }
          },
          },
        animation: { duration: 0 },
      },
        // To ensure bars within the same category are grouped together:
        // (Chart.js usually does this by default for multiple datasets in a bar chart)
        // If they are stacking instead of grouping, you'd look into x-axis options:
        // scales: { x: { stacked: false }, y: { stacked: false } } // Ensure not stacked
      plugins: [horizontalBarDataLabelsPlugin]
      
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
  const width = variant === 'table' ? 200 : 180; // 
  const height = variant === 'table' ? 130 : 160; // 

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