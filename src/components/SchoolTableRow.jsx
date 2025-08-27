// src/components/SchoolTableRow.jsx
import React from 'react';
import { formatDisplayValue } from '../utils/formatters';
import DiversityChart from './DiversityChart'; // Only if DiversityChart isn't formatted via formatDisplayValue
import DiversityLegend from './DiversityLegend'; // Only if DiversityLegend isn't formatted via formatDisplayValue
import chartStyles from './DiversityChart.module.css'; // For DiversityChart specific container if needed
import legendStyles from './DiversityLegend.module.css'; // For DiversityLegend specific container if needed
import tableStyles from './TableView.module.css'; // Import this to use .pieChartCell etc.

export const SchoolTableRow = ({ school, columns }) => {
  return (
    <tr>
      {columns.map(col => {
        const isDiversityChartCol = col.key === 'diversity_chart';
        const isSingleMetricPieCol = [
          'gifted_talented_percent',
          'economically_disadvantaged_percent',
          'percent_teachers_3_years_or_less_experience',
          'parent_satisfaction',
          'pta_membership_percent'
        ].includes(col.key);

        let cellClassName = tableStyles.tableCellCustom; // Default

        if (col.key === 'display_name') {
            cellClassName = tableStyles.displayNameCell;
        } else if (col.key === 'map_icon') {
          cellClassName = tableStyles.mapIconCell; 
        } else if (isDiversityChartCol) {
          // Diversity chart might have its own specific cell styling from DiversityChart.module.css
          // or you can use the common pieChartCell plus its specific one.
          // For now, let's assume DiversityChart.module.css handles its cell or use .pieChartCell
          cellClassName = `${tableStyles.pieChartCell} ${chartStyles.diversityChartTableCell || ''}`; 
          // Note: chartStyles.diversityChartTableCell had a large min-width (320px), 
          // you might want to adjust that if you use a common .pieChartCell.
          // Or just use tableStyles.pieChartCell if DiversityChart itself doesn't need huge cell width.
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
        // Add other specific column styles here if needed

        return (
          <td key={col.key} className={cellClassName.trim()}>
            {col.key === 'diversity_chart' ? (
              // Keep existing DiversityChart rendering if it's special
              <div className={chartStyles.diversityChartContainerTable}>
                <DiversityChart school={school} variant="table" />
                <DiversityLegend school={school} legendItemClass={legendStyles.legendItemTable} />
              </div>
            ) : (
              // All other columns, including SingleMetricPieChart ones, go through formatDisplayValue
              formatDisplayValue(col, school)
            )}
          </td>
        );
      })}
    </tr>
  );
}