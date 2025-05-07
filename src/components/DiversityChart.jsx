import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Define outside component if it doesn't rely on props/state
const chartLabels = ['White', 'AA', 'Hispanic', 'Asian', 'Two+', 'Other']; // Shortened labels
const chartBackgroundColors = ['#ff9800', '#009688', '#ffeb3b', '#e91e63', '#9c27b0', '#bdbdbd']; // ADJUST COLORS

export const DiversityChart = ({ school }) => { // Receive school data object as prop
  const canvasRef = useRef(null); // Ref to access the canvas element
  const legendRef = useRef(null); // Ref to access the legend div element
  const chartInstanceRef = useRef(null); // Ref to store the chart instance

  useEffect(() => {
    console.log(`DiversityChart useEffect for school: ${school?.school_code_adjusted}`);
    const canvasElement = canvasRef.current;
    const legendElement = legendRef.current;

    // --- 1. Initial Checks ---
    if (!canvasElement || !legendElement || !school) {
      console.log("DiversityChart: Canvas, Legend, or School prop missing.");
      return; // Exit if elements or data aren't ready
    }

    // --- 2. Prepare Data ---
    let chartData = {}; let knownTotalPercent = 0; let dataAvailable = false;
    const knownKeys = ['white_percent', 'african_american_percent', 'hispanic_percent', 'asian_percent', 'two_or_more_races_percent']; // ADJUST KEYS
    knownKeys.forEach(key => { const pct = school[key]; const numPct = (pct != null && !isNaN(parseFloat(pct))) ? Number(parseFloat(pct).toFixed(2)) : 0; chartData[key] = numPct; knownTotalPercent += numPct; if (numPct > 0) dataAvailable = true; });
    let calculatedKnownTotal = Object.keys(chartData).filter(k => k !== 'other_percent').reduce((sum, key) => sum + chartData[key], 0);
    const otherPercent = Math.max(0, 100 - parseFloat(calculatedKnownTotal.toFixed(2))); chartData['other_percent'] = parseFloat(otherPercent.toFixed(2));
    if (chartData['other_percent'] > 0) dataAvailable = true;

    const data = [ chartData['white_percent'] || 0, chartData['african_american_percent'] || 0, chartData['hispanic_percent'] || 0, chartData['asian_percent'] || 0, chartData['two_or_more_races_percent'] || 0, chartData['other_percent'] || 0 ]; // ADJUST KEYS

    // --- 3. Filter Data for Chart & Legend ---
    const filteredChartLabels = []; const filteredChartData = []; const filteredChartColors = [];
    const legendItems = []; // For generating legend JSX
    data.forEach((value, index) => {
        if (value > 0) { // Only include > 0% in chart segments
            filteredChartLabels.push(chartLabels[index]);
            filteredChartData.push(value);
            filteredChartColors.push(chartBackgroundColors[index]);
        }
        // Include in legend array if label isn't Other and value > 0
        if (chartLabels[index] !== 'Other' && value > 0) {
             legendItems.push({
                 label: chartLabels[index],
                 value: Math.round(value),
                 color: chartBackgroundColors[index]
             });
        }
    });

    // --- 4. Handle "No Data" Case ---
    if (!dataAvailable || filteredChartData.length === 0) {
        console.log(`DiversityChart: No data available for ${school?.school_code_adjusted}`);
        legendElement.innerHTML = '<span class="text-muted small">No data</span>';
        // Clear canvas if needed (though Chart destroy should handle it)
        const ctx = canvasElement.getContext('2d');
        if(ctx) ctx.clearRect(0,0, canvasElement.width, canvasElement.height);
        // Destroy previous instance if exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }
        return; // Don't proceed to render chart
    }

    // --- 5. Chart Configuration ---
    const chartConfig = {
        type: 'doughnut',
        data: { labels: filteredChartLabels, datasets: [{ label: 'Diversity %', data: filteredChartData, backgroundColor: filteredChartColors, hoverOffset: 4, borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: true, aspectRatio: 1, cutout: '65%', plugins: { legend: { display: false }, tooltip: { enabled: true, callbacks: { label: function(context) { let label = context.label || ''; if (label) { label += ': '; } let value = context.parsed || 0; label += Math.round(value) + '%'; return label; } } } }, animation: false }
    };

    // --- 6. Create/Update Chart Instance ---
    const ctx = canvasElement.getContext('2d');
    if (!ctx) { console.error("Failed to get canvas context."); return; }

    // Destroy previous chart instance IF IT EXISTS before creating a new one
    if (chartInstanceRef.current) {
        console.log(`DiversityChart: Destroying previous chart for ${canvasElement.id}`);
        chartInstanceRef.current.destroy();
    }

    console.log(`DiversityChart: Creating new chart for ${canvasElement.id}`);
    chartInstanceRef.current = new Chart(ctx, chartConfig); // Store instance in ref

    // --- 7. Generate and Render Legend using React/JSX (Preferred) ---
    // Clear previous legend content first
    legendElement.innerHTML = ''; // Or use ReactDOM if rendering React components here

    const legendList = (
        <ul className="list-unstyled mb-0 diversity-legend-list">
            {legendItems.map(item => (
                <li key={item.label} className="d-flex align-items-center mb-1">
                    <span className="legend-color-box me-2" style={{ backgroundColor: item.color }}></span>
                    <span className="legend-label flex-grow-1">{item.label}</span>
                    <span className="legend-value ms-1">{item.value}%</span>
                </li>
            ))}
        </ul>
    );

    // Render the JSX legend - Requires ReactDOM or portal if not directly in return
    // For simplicity here, let's stick to innerHTML for the legend content for now,
    // but ideally, the legend would be part of the component's returned JSX.
    // **Reverting to innerHTML approach for legend simplicity in this step:**
     let legendHTML = '<ul class="list-unstyled mb-0 diversity-legend-list">';
     legendItems.forEach(item => {
         legendHTML += `<li class="d-flex align-items-center mb-1"><span class="legend-color-box me-2" style="background-color: ${item.color};"></span><span class="legend-label flex-grow-1">${item.label}</span><span class="legend-value ms-1">${item.value}%</span></li>`;
     });
     legendHTML += '</ul>';
     legendElement.innerHTML = legendHTML;


    // --- 8. Cleanup Function ---
    // This function is returned by useEffect and runs when the component
    // unmounts or when the dependencies (school data) change BEFORE the effect runs again.
    return () => {
        console.log(`DiversityChart Cleanup: Destroying chart for ${canvasElement.id}`);
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null; // Clear the ref
        }
         // Clear legend on cleanup too
        if (legendRef.current) {
             legendRef.current.innerHTML = '';
        }
    };

  }, [school]); // Dependency array: re-run effect only if 'school' prop changes

  // --- Render canvas and legend placeholder div ---
  // Use refs to connect these elements to the useEffect logic
  // Generate unique IDs based on school data if possible
  const schoolId = school?.school_code_adjusted || Math.random().toString(36).substring(7);
  const canvasId = `diversityChart-${schoolId}`;
  const legendId = `diversityLegend-${schoolId}`;

  return (
    <div className="diversity-container d-flex align-items-center">
      <canvas ref={canvasRef} id={canvasId} className="diversity-chart-canvas me-2"></canvas>
      <div ref={legendRef} id={legendId} className="diversity-legend"></div>
    </div>
  );
}

