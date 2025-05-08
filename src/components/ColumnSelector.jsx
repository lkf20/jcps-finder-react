// src/components/ColumnSelector.jsx
import React, { useState, useEffect } from 'react';

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
    col => col.key !== alwaysIncludedKey && !col.fixed // Add a 'fixed' property to column config if some are non-selectable
  );

  return (
    <div className="offcanvas offcanvas-end" tabIndex="-1" id={id} aria-labelledby={`${id}Label`}>
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title" id={`${id}Label`}>{title}</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        {columnsToShowInSelector.length > 0 ? (
          columnsToShowInSelector.map(col => (
            <div className="form-check mb-2" key={col.key}>
              <input
                className="form-check-input"
                type="checkbox"
                value={col.key}
                id={`col-select-${col.key}-${id}`} // Ensure unique ID if multiple selectors were ever used
                checked={currentSelection.has(col.key)}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor={`col-select-${col.key}-${id}`}>
                {col.header || col.key}
              </label>
            </div>
          ))
        ) : (
          <p>No columns available for selection.</p>
        )}
      </div>
      <div className="offcanvas-footer p-3 border-top bg-light">
        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleApply}
          data-bs-dismiss="offcanvas" // Bootstrap will close the offcanvas
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default ColumnSelector;