// src/components/ColumnSelector.jsx
import React, { useState, useEffect } from 'react';
import styles from './ColumnSelector.module.css';

export const ColumnSelector = ({
  id = "customizeColumnsOffcanvas", // Default ID
  title = "Select Columns",         // Default Title
  allPossibleColumns,
  initialSelectedColumns,
  onApplyColumns,
  alwaysIncludedKey = 'display_name' // Key that should always be selected and not shown as a checkbox
}) => {
  const [currentSelection, setCurrentSelection] = useState(new Set(initialSelectedColumns));

  // Effect to sync local state if initialSelectedColumns prop changes from parent
  // This ensures if the parent state changes for other reasons, the offcanvas reflects it when re-opened.
  useEffect(() => {
    setCurrentSelection(new Set(initialSelectedColumns));
  }, [initialSelectedColumns]);

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setCurrentSelection(prevSelection => {
      const newSelection = new Set(prevSelection);
      if (checked) {
        newSelection.add(value);
      } else {
        newSelection.delete(value);
      }
      return newSelection;
    });
  };

  const handleApply = () => {
    // Ensure the alwaysIncludedKey is part of the final selection
    const finalSelectionWithAlwaysIncluded = new Set(currentSelection);
    if (alwaysIncludedKey) {
      finalSelectionWithAlwaysIncluded.add(alwaysIncludedKey);
    }
    onApplyColumns(Array.from(finalSelectionWithAlwaysIncluded));
    // The data-bs-dismiss="offcanvas" on the button will handle closing
  };

  // Filter out the column that should always be included (e.g., 'display_name')
  // and any other columns you might want to exclude from user selection.
  const columnsToShowInSelector = allPossibleColumns.filter(
    col => col.key !== alwaysIncludedKey && !col.fixed
  );

  // Group columns by category
  const groupings = [
    {
      label: 'General',
      keys: ['distance_mi', 'membership', 'start_end_time'],
    },
    {
      label: 'Performance',
      keys: ['overall_indicator_rating', 'great_schools_rating', 'reading_math_proficiency', 'gifted_talented_percent'],
    },
    {
      label: 'Demographics',
      keys: ['diversity_chart', 'economically_disadvantaged_percent'],
    },
    {
      label: 'Teachers',
      keys: ['teacher_avg_years_experience', 'percent_teachers_3_years_or_less_experience'],
    },
    {
      label: 'Parent/Community',
      keys: ['parent_satisfaction', 'pta_membership_percent'],
    },
  ];

  return (
    <div className={`offcanvas offcanvas-end ${styles.offcanvasCustom}`} tabIndex="-1" id={id} aria-labelledby={`${id}Label`}>
      <div className={`offcanvas-header ${styles.headerCustom} border-bottom`}>
        <h5 className={`offcanvas-title ${styles.titleCustom}`} id={`${id}Label`}>Select Display Data</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className={`offcanvas-body ${styles.bodyCustom}`}>
        {groupings.map((group, idx) => {
          const groupColumns = columnsToShowInSelector.filter(col => group.keys.includes(col.key));
          if (groupColumns.length === 0) return null;
          return (
            <React.Fragment key={group.label}>
              {idx > 0 && <hr className={styles.dividerLine} />}
              <div style={{ marginBottom: '1.2rem' }}>
                <h6 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{group.label}</h6>
                {groupColumns.map(col => (
                  <div className={`form-check ${styles.formCheckCustom}`} key={col.key}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={col.key}
                      id={`col-select-${col.key}-${id}`}
                      checked={currentSelection.has(col.key)}
                      onChange={handleCheckboxChange}
                    />
                    <label className={`form-check-label ${styles.formCheckLabelCustom}`} htmlFor={`col-select-${col.key}-${id}`}>
                      {col.header || col.key}
                    </label>
                  </div>
                ))}
              </div>
            </React.Fragment>
          );
        })}
        {columnsToShowInSelector.length === 0 && <p>No columns available for selection.</p>}
      </div>
      <div className={`offcanvas-footer ${styles.footerCustom} p-3 border-top bg-light`}>
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleApply}
          data-bs-dismiss="offcanvas"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default ColumnSelector;