import React from 'react';
import { formatDisplayValue } from '../utils/formatters';
import DiversityChart from './DiversityChart';
import DiversityLegend from './DiversityLegend';
import chartStyles from './DiversityChart.module.css';
import legendStyles from './DiversityLegend.module.css';
import tableStyles from './TableView.module.css';
// Import a potential CellValue component if formatting gets very complex
// Or import the formatting helper if defined separately
// For now, formatting logic is assumed to be passed via columns prop or handled here




export const SchoolTableRow = ({ school, columns }) => {
  return (
    <tr>
      {columns.map(col => (
        <td key={col.key} className={
          col.key === 'diversity_chart' ? chartStyles.diversityChartTableCell :
          col.key === 'start_end_time' ? tableStyles.startEndTimeCol :
          col.key === 'reading_math_proficiency' ? tableStyles.readingMathCol :
          tableStyles.tableCellCustom
        }>
          {col.key === 'diversity_chart' ? (
            <div className={chartStyles.diversityChartContainerTable}>
              <DiversityChart school={school} variant="table" />
              <DiversityLegend school={school} legendItemClass={legendStyles.legendItemTable} />
            </div>
          ) : (
            formatDisplayValue(col, school)
          )}
        </td>
      ))}
    </tr>
  );
}

