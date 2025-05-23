// src/components/ProficiencyBarChart.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';

// Custom Plugin to display datalabels
const horizontalBarDataLabelsPlugin = {
  id: 'horizontalBarDataLabels',
  afterDatasetsDraw: (chart, args, pluginOptions) => {
    const { ctx, data, chartArea: { left, right, top, bottom }, scales: { x, y } } = chart;
    const { 
        fontColor = '#333', 
        fontSize = 10, 
        fontStyle = 'Arial, sans-serif', 
        offsetX = 6, // Horizontal offset from bar end
        offsetY = 0, // Vertical offset from bar center
        show = true,
        minBarWidth = 30 // Minimum bar width to place label inside
    } = pluginOptions;

    if (!show || !data.datasets.length) return;

    ctx.save();
    ctx.font = `bold ${fontSize}px ${fontStyle}`;
    ctx.fillStyle = fontColor;
    ctx.textBaseline = 'middle';

    data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.hidden) {
        meta.data.forEach((element, index) => {
          const rawValue = dataset.data[index];
          if (rawValue === null || rawValue === undefined || isNaN(parseFloat(rawValue))) return;

          const displayValue = `${Math.round(parseFloat(rawValue))}%`;
          const textMetrics = ctx.measureText(displayValue);
          const textWidth = textMetrics.width;
          
          const barStartX = element.base || left;
          const barEndX = element.x;
          const barWidth = barEndX - barStartX;
          const barCenterY = element.y + offsetY;

          let textXPosition;
          
          // Calculate available space to the right of the bar
          const availableRightSpace = right - barEndX - offsetX;
          
          // Always place outside to the right if there's enough space
          if (availableRightSpace >= textWidth + 5) {
            textXPosition = barEndX + offsetX;
            ctx.textAlign = 'left';
          } else if (barWidth >= minBarWidth && barWidth >= textWidth + (offsetX * 2)) {
            // Place inside the bar only if bar is wide enough
            textXPosition = barEndX - offsetX;
            ctx.textAlign = 'right';
          } else {
            // Force outside placement even if it might be tight
            textXPosition = barEndX + offsetX;
            ctx.textAlign = 'left';
            
            // If it would overflow, place it at the maximum possible position
            if (textXPosition + textWidth > right) {
              textXPosition = right - textWidth - 2;
              ctx.textAlign = 'left';
            }
          }

          ctx.fillText(displayValue, textXPosition, barCenterY);
        });
      }
    });
    ctx.restore();
  }
};

const BAR_COLORS = ['#1976d2', '#ff9800', '#cccccc'];
const STATE_AVERAGE_READING = 46;
const STATE_AVERAGE_MATH = 41;

export const ProficiencyBarChart = ({ school, chartId, variant }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const resolvedChartId = chartId || `proficiency-bar-chart-${school?.school_code_adjusted || Math.random().toString(36).substring(7)}`;

  const { barThickness, legendConfig, ticksConfig, layoutConfig, valueLabelConfig, categoryGap } = useMemo(() => {
    if (variant === 'card') {
      return {
        barThickness: 8, // Uniform thickness
        categoryGap: 0.6, // Space between Reading and Math groups
        legendConfig: { padding: 8, fontSize: 9, boxSize: 8 },
        ticksConfig: { ySize: 10, xSize: 8 },
        layoutConfig: { top: 10, right: 45, bottom: 35, left: 80 }, // Move chart right with more left padding
        valueLabelConfig: { fontSize: 9, offsetY: 0, offsetX: 4, minBarWidth: 25 }
      };
    } else { // table
      return {
        barThickness: 8, // Same uniform thickness
        categoryGap: 0.6, // Space between Reading and Math groups
        legendConfig: { padding: 10, fontSize: 10, boxSize: 10 },
        ticksConfig: { ySize: 11, xSize: 10 },
        layoutConfig: { top: 10, right: 50, bottom: 40, left: 25 },
        valueLabelConfig: { fontSize: 10, offsetY: 0, offsetX: 4, minBarWidth: 30 }
      };
    }
  }, [variant]);

  const createChart = useMemo(() => {
    return () => {
      const canvasElement = canvasRef.current;
      if (!canvasElement || !school) {
        return;
      }

      // Destroy existing chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      const readingAll = school.reading_all_proficient_distinguished != null ? Number(school.reading_all_proficient_distinguished) : null;
      const mathAll = school.math_all_proficient_distinguished != null ? Number(school.math_all_proficient_distinguished) : null;
      const readingEcon = school.reading_econ_disadv_proficient_distinguished != null ? Number(school.reading_econ_disadv_proficient_distinguished) : null;
      const mathEcon = school.math_econ_disadv_proficient_distinguished != null ? Number(school.math_econ_disadv_proficient_distinguished) : null;

      if ([readingAll, readingEcon, mathAll, mathEcon].every(v => v === null) &&
          (STATE_AVERAGE_READING === null && STATE_AVERAGE_MATH === null)) {
        return;
      }

      const yAxisLabels = ['Reading', 'Math'];
      const yAxisDataOrder = (valRead, valMath) => yAxisLabels.map(l => l === 'Reading' ? valRead : valMath);
      const yAxisTicksCallback = (v, i) => yAxisLabels[i] === 'Reading' ? 'R' : 'M';

      const chartConfig = {
        type: 'bar',
        data: {
          labels: yAxisLabels,
          datasets: [
            { 
              label: 'All', 
              data: yAxisDataOrder(readingAll, mathAll), 
              backgroundColor: BAR_COLORS[0], 
              borderRadius: 2, 
              barThickness: barThickness,
              maxBarThickness: barThickness // Ensure uniform thickness
            },
            { 
              label: 'Econ Dis.', 
              data: yAxisDataOrder(readingEcon, mathEcon), 
              backgroundColor: BAR_COLORS[1], 
              borderRadius: 2, 
              barThickness: barThickness,
              maxBarThickness: barThickness // Ensure uniform thickness
            },
            { 
              label: 'State Avg', 
              data: yAxisDataOrder(STATE_AVERAGE_READING, STATE_AVERAGE_MATH), 
              backgroundColor: BAR_COLORS[2], 
              borderRadius: 2, 
              barThickness: barThickness,
              maxBarThickness: barThickness // Ensure uniform thickness
            }
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            horizontalBarDataLabels: { 
              show: true, 
              fontColor: '#333', 
              fontSize: valueLabelConfig.fontSize, 
              offsetX: valueLabelConfig.offsetX, 
              offsetY: valueLabelConfig.offsetY,
              minBarWidth: valueLabelConfig.minBarWidth
            },
            legend: { 
              display: true, 
              position: 'bottom', 
              align: 'center',
              maxWidth: 400, // Prevent legend from getting too wide
              labels: { 
                usePointStyle: true, 
                pointStyle: 'rect', 
                boxWidth: legendConfig.boxSize, 
                boxHeight: legendConfig.boxSize, 
                padding: legendConfig.padding, 
                font: { size: legendConfig.fontSize },
                borderWidth: 0, // Remove border around legend rectangles
                generateLabels: function(chart) {
                  // Custom legend generation to ensure single line
                  const datasets = chart.data.datasets;
                  return datasets.map((dataset, i) => ({
                    text: dataset.label,
                    fillStyle: dataset.backgroundColor,
                    strokeStyle: dataset.backgroundColor, // Same as fill to remove border
                    lineWidth: 0, // No border
                    pointStyle: 'rect',
                    datasetIndex: i
                  }));
                }
              }
            },
            tooltip: { 
              enabled: true, 
              callbacks: { 
                label: (ctx) => `${ctx.dataset.label || ''}: ${!isNaN(ctx.parsed.x) ? Math.round(ctx.parsed.x) + '%' : 'N/A'}`
              }
            }
          },
          scales: {
            x: { 
              beginAtZero: true, 
              max: 100, 
              ticks: { display: false }, 
              grid: { display: false, drawBorder: false }, 
              border: { display: false }
            },
            y: { 
              grid: { display: false }, 
              ticks: { 
                font: { size: ticksConfig.ySize }, 
                callback: yAxisTicksCallback, 
                autoSkip: false 
              }, 
              border: { display: false }
            }
          },
          animation: { duration: 0 },
          layout: { padding: layoutConfig },
        },
        plugins: [horizontalBarDataLabelsPlugin]
      };

      const ctx = canvasElement.getContext('2d');
      if (!ctx) return;
      
      chartInstanceRef.current = new Chart(ctx, chartConfig);
    };
  }, [school, barThickness, legendConfig, ticksConfig, layoutConfig, valueLabelConfig, categoryGap]);

  // Handle resize and chart recreation
  useEffect(() => {
    // Set up ResizeObserver to handle container size changes
    if (containerRef.current && !resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        // Debounce the chart recreation
        setTimeout(() => {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.resize();
          }
        }, 100);
      });
      resizeObserverRef.current.observe(containerRef.current);
    }

    // Create chart with a slight delay to ensure DOM is ready
    const timeoutId = setTimeout(createChart, 50);

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [createChart]);

  // Handle variant changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      // Force recreation when variant changes
      setTimeout(createChart, 10);
    }
  }, [variant, createChart]);

  const containerStyle = variant === 'card' ? {
    height: '160px', // Taller for better chart visibility
    width: '250px', // Narrower to prevent overflow
    display: 'flex',
    justifyContent: 'flex-end', // Right align container
    alignItems: 'center'
  } : {
    height: '180px', // Taller
    width: '280px', // Slightly narrower
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const canvasStyle = {
    height: '100%',
    width: '100%',
    display: 'block',
    background: 'transparent'
  };

  return (
    <div 
      ref={containerRef}
      style={containerStyle}
    >
      <canvas
        key={`${resolvedChartId}-${variant}`}
        ref={canvasRef}
        id={resolvedChartId}
        style={{ 
          display: 'block',
          background: 'transparent',
          ...canvasStyle
        }}
      />
    </div>
  );
};

export default ProficiencyBarChart;