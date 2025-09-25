// src/components/SchoolCard.jsx
import React, { useState } from 'react';
import styles from './SchoolCard.module.css';
import { formatDisplayValue } from '../utils/formatters';
import DiversityChart from './DiversityChart';
import DiversityLegend from './DiversityLegend';
import { TourButton } from './TourButton';
import { TourModal } from './TourModal';

export const SchoolCard = ({ school, columns }) => {
  // <<< START: MODIFIED CODE >>>
  // State for the modal is now managed directly by the card
  const [isModalOpen, setIsModalOpen] = useState(false);
  // <<< END: MODIFIED CODE >>>

  const nameColConfig = columns.find(c => c.key === 'display_name');
  const diversityColConfig = columns.find(c => c.key === 'diversity_chart');

  const hasActualDiversityData = () => {
    if (!school) return false;
    const keysToCheck = ['white_percent', 'african_american_percent', 'hispanic_percent', 'asian_percent', 'two_or_more_races_percent'];
    let hasData = keysToCheck.some(key => school[key] != null && parseFloat(school[key]) > 0);

    if (!hasData) {
        const processedData = {};
        keysToCheck.forEach(key => {
            const pct = school[key];
            const numPct = (pct != null && !isNaN(parseFloat(pct))) ? Number(parseFloat(pct).toFixed(2)) : 0;
            processedData[key] = numPct;
        });
        const calculatedKnownTotal = keysToCheck.reduce((sum, key) => sum + (processedData[key] || 0), 0);
        const otherPercent = Math.max(0, 100 - parseFloat(calculatedKnownTotal.toFixed(2)));
        if (otherPercent > 0.01) hasData = true;
    }
    return hasData;
  };

  const shouldShowDiversitySection = diversityColConfig && hasActualDiversityData();

  return (
    // <<< START: MODIFIED CODE >>>
    // Wrap the card and modal in a React Fragment
    <>
      <div className={`${styles.schoolCard} card mb-2 shadow-sm`}>
        {nameColConfig && (
          <div className={`${styles.cardNameBody} card-body pb-3`}>
            <h5 className={`${styles.schoolNameTitle} card-title mb-0`}>
              {formatDisplayValue(nameColConfig, school)}
            </h5>
          </div>
        )}

        <ul className="list-group list-group-flush">
          {columns
            // Filter out the specially handled sections
            .filter(col => col.key !== 'display_name' && col.key !== 'diversity_chart')
            .map(col => {
              // This part for rendering standard list items is unchanged
              return (
              <li
                key={col.key}
                className={`${styles.standardListItem} list-group-item d-flex justify-content-between align-items-center py-3`}
              >
                <span className={`${styles.standardListItemLabel} me-2 fw-bold small`}>{col.header || col.key}:</span>
                <span className={`${styles.standardListItemValue} text-end small`}>
                  {formatDisplayValue(col, school, 'card')}
              </span>
              </li>
              );
            })}

          {/* Dedicated Diversity Section (Unchanged) */}
          {diversityColConfig && (
            <li className={`${styles.diversityListItem} list-group-item py-4`}>
              {shouldShowDiversitySection ? (
                <div className="container-fluid px-0">
                  <div className="row g-1 align-items-center mb-1">
                    <div className="col">
                      <span className={`${styles.diversityTitle} mb-0 fw-bold small`}>{(diversityColConfig.header || 'Student Diversity') + ':'}</span>
                    </div>
                    <div className={`${styles.diversityChartContainer} col-auto`}> 
                      <DiversityChart school={school} />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-12">
                      <DiversityLegend school={school} />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h6 className="mb-1 fw-bold small">{(diversityColConfig.header || 'Student Diversity') + ':'} </h6>
                  <p className="text-muted small mb-0">No diversity data available.</p>
                </div>
              )}
            </li>
          )}
          
          {/* Dedicated Tour Button Section */}
          <li className={`${styles.tourButtonCardItem} list-group-item d-flex justify-content-center py-3`}>
            <TourButton school={school} onClick={() => setIsModalOpen(true)} />
          </li>
        </ul>
      </div>
      
      {/* The Modal is now rendered here, controlled by this component's state */}
      <TourModal
        school={school}
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
    // <<< END: MODIFIED CODE >>>
  );
};