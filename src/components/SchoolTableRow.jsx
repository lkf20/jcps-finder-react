import React from 'react';
import { formatDisplayValue } from '../utils/formatters';
import DiversityChart from './DiversityChart';
import DiversityLegend from './DiversityLegend';
import chartStyles from './DiversityChart.module.css';
import tableStyles from './TableView.module.css';
import styles from './TableView.module.css'; 

export const SchoolTableRow = ({ school, columns }) => {
  // Helper to check for actual diversity data
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
        // ... (logic for other cell types remains the same)
        const isDiversityChartCol = col.key === 'diversity_chart';
        
        // <<< START: MODIFIED CODE >>>
        if (isDiversityChartCol) {
          return (
            <td key={col.key} className={tableStyles.diversityCell}>
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
        // <<< END: MODIFIED CODE >>>

        // Existing logic for other cells
        const isSingleMetricPieCol = [
          'gifted_talented_percent',
          'economically_disadvantaged_percent',
          'percent_teachers_3_years_or_less_experience',
          'parent_satisfaction',
          'pta_membership_percent'
        ].includes(col.key);

        let cellClassName = tableStyles.tableCellCustom;

        if (col.key === 'display_name') {
            cellClassName = tableStyles.displayNameCell;
        } else if (isSingleMetricPieCol) {
          cellClassName = tableStyles.pieChartCell;
        } else if (col.key === 'start_end_time') {
          cellClassName = tableStyles.startEndTimeCol;
        } else if (col.key === 'reading_math_proficiency') {
          cellClassName = tableStyles.readingMathCol;
        } else if (col.key === 'overall_indicator_rating') {
          cellClassName = tableStyles.kyRatingCell;
        } else if (col.key === 'teacher_avg_years_experience') {
          cellClassName = tableStyles.numericCellSmall;
        }
        
        return (
          <td key={col.key} className={cellClassName.trim()}>
            {formatDisplayValue(col, school)}
          </td>
        );
      })}
    </tr>
  );
}