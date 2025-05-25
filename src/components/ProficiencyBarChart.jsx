// src/components/ProficiencyBarChart.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation'; 

Chart.register(annotationPlugin);

// Custom Plugin to display datalabels
const horizontalBarDataLabelsPlugin = {
  id: 'horizontalBarDataLabels',
  afterDatasetsDraw: (chart, args, pluginOptions) => {
    const { ctx, data, chartArea: { left, right }, scales: { x, y } } = chart; // Get chartArea.right
    const { 
        fontColor = '#333', 
        fontSize = 10, 
        fontStyle = 'Arial, sans-serif', 
        offsetX = 4, 
        offsetY = 0,
        show = true,
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
          
          const barEndX = element.x;
          const barCenterY = element.y + offsetY;

          let textXPosition = barEndX + offsetX;
          ctx.textAlign = 'left';
          
          // Prefer to draw outside, to the right, if enough space considering chart's own padding
          if (textXPosition + textWidth > right) { 
            textXPosition = right - textWidth - 2; 
          }
          if (textXPosition < barEndX + offsetX) {
            textXPosition = barEndX + offsetX; // 
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
  const resolvedChartId = chartId || `proficiency-bar-chart-${school?.school_code_adjusted || Math.random().toString(36).substring(7)}`;

  // --- Centralized Configuration based on Variant ---
  const { 
    barThickness, 
    legendConfig, 
    ticksConfig, 
    layoutConfig, 
    valueLabelConfig, 
    containerStyle 
  } = useMemo(() => {
    const commonBarThickness = 10;
    const commonValueLabelOffsetX = 6;
    if (variant === 'card') {
      return {
        barThickness: commonBarThickness, 
        legendConfig: { padding: 4, fontSize: 8, boxSize: 6 }, // << Compact legend
        ticksConfig: { ySize: 9 }, // xSize not really used as ticks are hidden
        layoutConfig: { top: 5, right: 0, bottom: 5, left: 0 }, // << 2. INCREASED RIGHT PADDING for labels
                                                                    // << Increased left to push chart right
        valueLabelConfig: { fontSize: 8, offsetY: 1, offsetX: commonValueLabelOffsetX }, // << 3. INCREASED offsetX
        containerStyle: { height: '130px', width: '167px' } // << 4. TALLER for R/M spacing. Width 100%
      };
    } else { // table
      return {
        barThickness: commonBarThickness + 2, // << 1. THICKER BARS for table
        legendConfig: { padding: 8, fontSize: 9, boxSize: 8 },
        ticksConfig: { ySize: 10 },
        layoutConfig: { top: 10, right: 50, bottom: 10, left: 20 },
        valueLabelConfig: { fontSize: 9, offsetY: 1, offsetX: commonValueLabelOffsetX + 1 },// << 3. INCREASED offsetX
        containerStyle: { height: '170px', width: '100%', maxWidth: '320px' } // << 4. TALLER & WIDER for legend
      };
    }
  }, [variant]);

  // Memoized createChart function (from your stable version)
  const createChart = useMemo(() => {
    return () => {
      const canvasElement = canvasRef.current;
      if (!canvasElement || !school || canvasElement.offsetParent === null ) { // Check offsetParent for visibility
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
        return;
      }

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
      const yAxisTicksCallback = (v, i) => yAxisLabels[i].substring(0,1); // R, M

      const chartConfig = {
        type: 'bar',
        data: {
          labels: yAxisLabels,
          datasets: [
            { label: 'All', data: yAxisDataOrder(readingAll, mathAll), backgroundColor: BAR_COLORS[0], borderRadius: 2, barThickness: barThickness, maxBarThickness: barThickness },
            { label: 'Econ Dis.', data: yAxisDataOrder(readingEcon, mathEcon), backgroundColor: BAR_COLORS[1], borderRadius: 2, barThickness: barThickness, maxBarThickness: barThickness },
            { label: 'State Avg', data: yAxisDataOrder(STATE_AVERAGE_READING, STATE_AVERAGE_MATH), backgroundColor: BAR_COLORS[2], borderRadius: 2, barThickness: barThickness, maxBarThickness: barThickness }
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            // Add annotation plugin configuration
            annotation: {
              annotations: {
                line100: {
                  type: 'line',
                  xMin: 100,
                  xMax: 100,
                  borderColor: '#BEBEBE',
                  borderWidth: 1,
                  borderDash: [5, 5], // This will work with annotation plugin
                }
              }
            },
            horizontalBarDataLabels: {
              show: true, fontColor: '#333',
              fontSize: valueLabelConfig.fontSize,
              offsetX: valueLabelConfig.offsetX,
              offsetY: valueLabelConfig.offsetY,
              minBarWidthForInsideLabel: valueLabelConfig.minBarWidth,
              chartLayoutPaddingRight: layoutConfig.right
            },
            legend: {
              display: true, position: 'bottom', align: 'center',
              labels: {
                usePointStyle: true, pointStyle: 'rect',
                boxWidth: legendConfig.boxSize, boxHeight: legendConfig.boxSize,
                padding: legendConfig.padding, font: { size: legendConfig.fontSize }
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
              grid: { 
                display: false, // Turn off regular grid lines since we're using annotation
                drawBorder: false 
              },
              border: { display: false },
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: ticksConfig.ySize }, callback: yAxisTicksCallback, autoSkip: false },
              border: { display: false }
            }
          },
          animation: { duration: 0 },
          layout: { padding: layoutConfig },
        },
        plugins: [horizontalBarDataLabelsPlugin]
      };
      
      // Make sure to register the annotation plugin
      // Chart.register(ChartAnnotation); // If using Chart.js v3+

      const ctx = canvasElement.getContext('2d');
      if (!ctx) return;
      chartInstanceRef.current = new Chart(ctx, chartConfig);
    };
  // Dependencies for createChart memoization
  }, [school, resolvedChartId, barThickness, legendConfig, ticksConfig, layoutConfig, valueLabelConfig]); 

  // useEffect for chart creation and resize handling (kept from your stable version)
  useEffect(() => {
    const currentContainerRef = containerRef.current; 
    let localResizeObserverRef = null; // Use local variable for observer instance

    if (currentContainerRef) { // Check if containerRef.current exists
      localResizeObserverRef = new ResizeObserver(() => {
        const resizeTimeoutId = setTimeout(() => {
          if (chartInstanceRef.current) {
            // Re-creating the chart on resize is often more stable than chart.resize()
            // if options or data structure related to size might change.
            createChart(); 
          } else {
            createChart();
          }
        }, 100); 
        return () => clearTimeout(resizeTimeoutId);
      });
      localResizeObserverRef.observe(currentContainerRef);
    }
    
    const timeoutId = setTimeout(createChart, 50); // Initial create

    return () => {
      clearTimeout(timeoutId);
      if (localResizeObserverRef && currentContainerRef) { // Use captured currentContainerRef
        localResizeObserverRef.unobserve(currentContainerRef);
      }
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [createChart]); // Depends only on createChart

  // Effect to specifically handle variant changes by recreating the chart
  useEffect(() => {
    // The main useEffect already depends on configs that change with variant.
    // This explicit call ensures recreation if createChart itself doesn't change but variant does.
    // It could also be handled by adding `variant` to the main useEffect's dependency array
    // if createChart itself doesn't depend on variant (which it does via configs).
    // For now, keeping this explicit recreate on variant change as a safeguard.
    const recreateTimeoutId = setTimeout(createChart, 10); 
    return () => clearTimeout(recreateTimeoutId);
  }, [variant, createChart]);

  return (
    <div 
      ref={containerRef}
      style={{
        ...containerStyle, // Applies height and width from useMemo
        display: 'flex', 
        // For card view, this pushes the 100% width canvas to the right,
        // then layout.padding.left on the chart pushes the drawing area right.
        justifyContent: variant === 'card' ? 'flex-end' : 'center', 
        alignItems: 'center',
      }}
    >
      <canvas
        key={`${resolvedChartId}-${variant}`} 
        ref={canvasRef}
        id={resolvedChartId}
        style={{ 
          display: 'block',
          background: 'transparent',
          width: '100%',  // Canvas fills the div container's width
          height: '100%', // Canvas fills the div container's height
        }}
      />
    </div>
  );
};

export default ProficiencyBarChart;