// src/components/SchoolTableRow.jsx
import React from 'react';
import { formatDisplayValue } from '../utils/formatters';
import DiversityChart from './DiversityChart';
import DiversityLegend from './DiversityLegend';
import styles from './TableView.module.css';
import { TourButton } from './TourButton';

export const SchoolTableRow = ({ school, columns, onOpenModal }) => {
  const hasActualDiversityData = () => {
    if (!school) return false;
    const keysToCheck = ['white_percent', 'african_american_percent', 'hispanic_percent', 'asian_percent', 'two_or_more_races_percent'];
    let hasData = keysToCheck.some(key => school[key] != null && parseFloat(school[key]) > 0.01);
    if (hasData) return true;
    const knownTotal = keysToCheck.reduce((sum, key) => sum + (parseFloat(school[key]) || 0), 0);
    const otherPercent = 100 - knownTotal;
    return otherPercent > 0.01;
  };

  return (
    <tr>
      {columns.map(col => {
        // Special handling for the display_name column to include the button
        if (col.key === 'display_name') {
          return (
            <td key={col.key} className={styles.displayNameCell}>
              {formatDisplayValue(col, school)}
              <div className={styles.tourButtonContainer}>
                <TourButton school={school} onClick={() => onOpenModal(school)} />
              </div>
            </td>
          );
        }

        // Special handling for the diversity chart
        const isDiversityChartCol = col.key === 'diversity_chart';
        if (isDiversityChartCol) {
          return (
            <td key={col.key} className={styles.diversityCell}>
              {hasActualDiversityData() ? (
                <div className={styles.diversityContainerTable}>
                  <DiversityChart school={school} variant="table" />
                  <DiversityLegend school={school} variant="table" />
                </div>
              ) : (
                "N/A"
              )}
            </td>
          );
        }

        // Default rendering for all other columns
        const isSingleMetricPieCol = [
          'gifted_talented_percent',
          'economically_disadvantaged_percent',
          'percent_teachers_3_years_or_less_experience',
          'parent_satisfaction',
          'pta_membership_percent'
        ].includes(col.key);

        let cellClassName = styles.tableCellCustom;

        if (isSingleMetricPieCol) {
          cellClassName = styles.pieChartCell;
        } else if (col.key === 'start_end_time') {
          cellClassName = styles.startEndTimeCol;
        } else if (col.key === 'reading_math_proficiency') {
          cellClassName = styles.readingMathCol;
        } else if (col.key === 'overall_indicator_rating') {
          cellClassName = styles.kyRatingCell;
        } else if (col.key === 'teacher_avg_years_experience') {
          cellClassName = styles.numericCellSmall;
        }
        
        return (
          <td key={col.key} className={cellClassName.trim()}>
            {formatDisplayValue(col, school)}
          </td>
        );
      })}
    </tr>
  );
};