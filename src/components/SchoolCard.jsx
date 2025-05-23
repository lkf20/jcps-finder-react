// src/components/SchoolCard.jsx
import React from 'react';
import styles from './SchoolCard.module.css';
import { formatDisplayValue } from '../utils/formatters';
import DiversityChart from './DiversityChart';   // Adjust path if necessary
import DiversityLegend from './DiversityLegend'; // Adjust path if necessary

export const SchoolCard = ({ school, columns }) => {
  const nameColConfig = columns.find(c => c.key === 'display_name');
  const diversityColConfig = columns.find(c => c.key === 'diversity_chart');


  // Helper to check if there's any actual diversity data to display
  const hasActualDiversityData = () => {
    if (!school) return false;
    const keysToCheck = ['white_percent', 'african_american_percent', 'hispanic_percent', 'asian_percent', 'two_or_more_races_percent'];
    let hasData = keysToCheck.some(key => school[key] != null && parseFloat(school[key]) > 0);

    if (!hasData) { // Check 'other_percent' calculation if primary keys are all zero
        const processedData = {}; // Use a local object for calculation
        keysToCheck.forEach(key => {
            const pct = school[key];
            const numPct = (pct != null && !isNaN(parseFloat(pct))) ? Number(parseFloat(pct).toFixed(2)) : 0;
            processedData[key] = numPct; // Store in local object
        });
        const calculatedKnownTotal = keysToCheck.reduce((sum, key) => sum + (processedData[key] || 0), 0);
        const otherPercent = Math.max(0, 100 - parseFloat(calculatedKnownTotal.toFixed(2)));
        if (otherPercent > 0.01) hasData = true; // Check if 'other' contributes
    }
    return hasData;
  };

  const shouldShowDiversitySection = diversityColConfig && hasActualDiversityData();

  return (
    <div className={`${styles.schoolCard} card mb-2 shadow-sm`}>
      {/* Card Header (Name Section) */}
      {nameColConfig && (
        <div className={`${styles.cardNameBody} card-body pb-3`}>
          <h5 className={`${styles.schoolNameTitle} card-title mb-0`}>
            {/* Assuming formatDisplayValue handles display_name correctly */}
            {formatDisplayValue(nameColConfig, school)}
          </h5>
        </div>
      )}

      {/* Card List Group for other data points */}
      <ul className="list-group list-group-flush">
        {columns
          .filter(col => col.key !== 'display_name' && col.key !== 'diversity_chart') // Exclude name and diversity_chart (handled separately)
          .map(col => (
            <li
              key={col.key}
              className={`${styles.standardListItem} list-group-item d-flex justify-content-between align-items-center py-3`}
            >
              <span className={`${styles.standardListItemLabel} me-2 fw-bold small`}>{col.header || col.key}:</span>
              <span className={`${styles.standardListItemValue} text-end small`}>
                {formatDisplayValue(col, school, 'card')}
            </span>
            </li>
          ))}

        {/* --- New Dedicated Diversity Section --- */}
        {diversityColConfig && ( // Render this list item if diversity_chart is a selected column
          <li className={`${styles.diversityListItem} list-group-item py-4`}>
            {shouldShowDiversitySection ? (
              <div className="container-fluid px-0"> {/* Ensures Bootstrap grid behaves */}
                {/* Top Row: Title and Chart */}
                <div className="row g-1 align-items-center mb-1"> {/* Smaller gutter and margin */}
                  <div className="col">
                    <span className={`${styles.diversityTitle} mb-0 fw-bold small`}>{(diversityColConfig.header || 'Student Diversity') + ':'}</span>
                  </div>
                  <div className={`${styles.diversityChartContainer} col-auto`}> 
                    <DiversityChart school={school} />
                  </div>
                </div>

                {/* Bottom Row: Legend */}
                <div className="row mt-3">
                  <div className="col-12">
                    <DiversityLegend school={school} />
                  </div>
                </div>
              </div>
            ) : (
              // Display if diversity_chart is selected but no data
              <div>
                <h6 className="mb-1 fw-bold small">{(diversityColConfig.header || 'Student Diversity') + ':'} </h6>
                <p className="text-muted small mb-0">No diversity data available.</p>
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};