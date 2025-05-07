import React from 'react';
import { formatDisplayValue } from '../utils/formatters';

// Assume formatDisplayValue helper is imported or defined here


export const SchoolCard = ({ school, columns }) => {
  // Find the config for display_name
  const nameColConfig = columns.find(c => c.key === 'display_name');

  return (
    <div className="card mb-3 shadow-sm">
      {/* Card Header (Name Section) */}
      {nameColConfig && (
        <div className="card-body pb-2">
          <h5 className="card-title mb-0">
            {formatDisplayValue(nameColConfig, school)}
          </h5>
        </div>
      )}
      {/* Card List Group */}
      <ul className="list-group list-group-flush">
        {columns
          .filter(col => col.key !== 'display_name') // Exclude name row
          .map(col => (
            <li
              key={col.key}
              className={`list-group-item d-flex justify-content-between align-items-center py-2 ${col.key === 'diversity_chart' ? 'diversity-list-item-new' : ''}`} // Add special class for diversity
            >
              {/* Conditional rendering for diversity layout */}
              {col.key === 'diversity_chart' ? (
                 <div className='w-100'> {/* Wrapper for special layout */}
                     <div className="row g-1 mb-1 align-items-center">
                         <div className="col-7 d-flex align-items-center">
                             <h6 className="diversity-title mb-0">{col.header || 'Student Diversity'}</h6>
                         </div>
                         <div className="col-5 diversity-chart-right d-flex justify-content-center align-items-center">
                             {/* Format function returns canvas+legend div */}
                             {formatDisplayValue(col, school)}
                         </div>
                     </div>
                     {/* Legend gets populated later targeting the #diversityLegend-ID */}
                 </div>
              ) : (
                 <> {/* Standard Layout */}
                     <span>{col.header || col.key}</span>
                     <span className="text-end">{formatDisplayValue(col, school)}</span>
                 </>
              )}
            </li>
         ))}
      </ul>
    </div>
  );
}
