import React, { useState, useMemo } from 'react'; // Added useMemo

// Import child components we will create next
import { TableView } from './TableView';
import { CardView } from './CardView';
import { ColumnSelector } from './ColumnSelector';

// Assuming allPossibleColumns is defined elsewhere (e.g., imported or passed as prop)
// For now, let's define it here for simplicity, but ideally move it to a config file
// Make sure this includes ALL columns needed for display and sorting
const allPossibleColumns = [
    { key: 'display_name', header: '', default: true, sortable: true, sortLabel: 'A-Z', sortDescDefault: false },
    { key: 'distance_mi', header: 'Distance (mi)', default: true, sortable: true, sortLabel: 'Distance', sortDescDefault: false },
    { key: 'great_schools_rating', header: 'GreatSchools Rating', default: true, sortable: true, sortLabel: 'Rating', sortDescDefault: true },
    { key: 'membership', header: 'Enrollment', default: true, sortable: true, sortLabel: 'Enrollment', sortDescDefault: true },
    { key: 'parent_satisfaction', header: 'Parent Satisfaction', default: false, sortable: true, sortLabel: 'Parent Satisfaction', sortDescDefault: true },
    { key: 'student_teacher_ratio_value', header: 'Student/Teacher Ratio', default: false, sortable: true, sortLabel: 'Stu/Tch Ratio', sortDescDefault: false },
    { key: 'start_time', header: 'Start Time', default: false, sortable: true, sortLabel: 'Start Time', sortDescDefault: false },
    { key: 'end_time', header: 'End Time', default: false, sortable: true, sortLabel: 'End Time', sortDescDefault: false },
    { key: 'ky_reportcard_URL', header: 'KY Report Card', default: false, sortable: false },
    { key: 'diversity_chart', header: 'Student Diversity', default: true, sortable: false },
    { key: 'type', header: 'Type', default: false, sortable: false },
    { key: 'school_level', header: 'Level', default: false, sortable: false },
    { key: 'school_website_link', header: 'Website', default: false, sortable: false },
    { key: 'address', header: 'Addr Str', default: false, sortable: false }, { key: 'city', header: 'City', default: false, sortable: false }, { key: 'state', header: 'State', default: false, sortable: false }, { key: 'zipcode', header: 'Zip', default: false, sortable: false },
    { key: 'white_percent', header: 'White %', default: false, sortable: false }, { key: 'african_american_percent', header: 'AA %', default: false, sortable: false }, { key: 'hispanic_percent', header: 'Hispanic %', default: false, sortable: false }, { key: 'asian_percent', header: 'Asian %', default: false, sortable: false }, { key: 'two_or_more_races_percent', header: 'Two+ %', default: false, sortable: false },
];


export const ResultsDisplay = ({ searchResults, schoolLevel }) => { // Receive props from App

    console.log("ResultsDisplay received props:", { searchResults, schoolLevel });

  // --- State for UI Controls (Sort, Columns) ---
  // Default sort matching App's initial state or desired default
  const [sortConfig, setSortConfig] = useState({ key: 'distance_mi', descending: false });
  const [selectedColumns, setSelectedColumns] = useState(() => {
        const initialCols = [ 'display_name', ...allPossibleColumns.filter(col => col.default).map(col => col.key) ];
        return [...new Set(initialCols)];
  });

  // --- Memoized Calculation: Filter and Sort Schools ---
  // useMemo prevents recalculating this on every render unless dependencies change
  const schoolsToDisplay = useMemo(() => {
    console.log("Recalculating schoolsToDisplay..."); // Check how often this runs
    if (!searchResults || !searchResults.results_by_zone) {
        console.log(" -> No searchResults or results_by_zone found.");
      return [];
    }
    console.log(` -> Filtering for level: ${schoolLevel}`); // Log level used
    // 1. Filter by School Level
    const levelToZoneTypeMap = { 'Elementary': ['Elementary', 'Reside Elementary', 'Trad/Mag Elem', 'Choice Elem'],'Middle': ['Middle', 'Reside Middle', 'Trad/Mag Middle', 'Choice Middle'],'High': ['High', 'Reside High', 'Trad/Mag High', 'Choice High'] }; // ADJUST
    const relevantZoneKeywords = levelToZoneTypeMap[schoolLevel] || [schoolLevel];
    console.log(` -> Using keywords: ${relevantZoneKeywords.join(', ')}`); // Log keywords
    const filteredZones = searchResults.results_by_zone.filter(zone => relevantZoneKeywords.some(keyword => zone.zone_type.includes(keyword)));
    console.log(` -> Found ${filteredZones.length} matching zones:`, filteredZones); 
    let schools = filteredZones.flatMap(zone => zone.schools || []);
    console.log(` -> Flattened ${schools.length} schools BEFORE sort:`, schools.slice(0, 5)); // Log schools found

    // Log filtered zones

    // 2. Sort
    const { key: sortKey, descending: sortDesc } = sortConfig;
    // Create a copy before sorting to avoid mutating original data if passed directly
    schools = [...schools].sort((a, b) => {
        let vA = a[sortKey]; let vB = b[sortKey];
        const nA = vA == null; const nB = vB == null;
        if (nA && nB) return 0; if (nA) return sortDesc ? -1 : 1; if (nB) return sortDesc ? 1 : -1;
        const numA = parseFloat(vA); const numB = parseFloat(vB); let comp = 0;
        if (!isNaN(numA) && !isNaN(numB)) { if (numA > numB) comp = 1; else if (numA < numB) comp = -1; }
        else { const sA = String(vA).toLowerCase(); const sB = String(vB).toLowerCase(); if (sA > sB) comp = 1; else if (sA < sB) comp = -1; }
        return sortDesc ? (comp * -1) : comp;
    });
    console.log(` -> Found ${schools.length} schools AFTER sort.`);
    return schools;
  }, [searchResults, schoolLevel, sortConfig]); // Dependencies for recalculation

  // --- Memoized Calculation: Determine Columns to Display ---
  const columnsToDisplay = useMemo(() => {
    return allPossibleColumns
      .filter(col => selectedColumns.includes(col.key))
      .sort((a,b) => { if (a.key === 'display_name') return -1; if (b.key === 'display_name') return 1; return 0; });
  }, [selectedColumns]); // Dependency for recalculation


  // --- Event Handlers (for Sort and Columns) ---
  const handleSortChange = (event) => {
     const selectedOption = event.target.options[event.target.selectedIndex];
     const newKey = selectedOption.value;
     const newDesc = selectedOption.dataset.sortDesc === 'true';
     console.log("Sort changed:", { key: newKey, descending: newDesc });
     setSortConfig({ key: newKey, descending: newDesc });
     // Note: displayResults is not called directly, React re-renders due to state change
  };

  // This function will be passed to ColumnSelector
  const handleApplySelectedColumns = (newlySelectedKeys) => {
    console.log("Applying new columns from ColumnSelector:", newlySelectedKeys);
    setSelectedColumns(newlySelectedKeys); // Update the state
  };

  // --- Generate Sort Options Dynamically ---
  const sortOptions = useMemo(() => {
      const availableSortColumns = allPossibleColumns.filter(col => selectedColumns.includes(col.key) && col.sortable);
      const sortOrderPreference = ['distance_mi', 'display_name', /* ... other keys ... */ ];
      availableSortColumns.sort((a, b) => { /* ... same sorting logic as before ... */ });

      let options = [];
      availableSortColumns.forEach(col => {
          const defaultOptionValue = `${col.key}-${col.sortDescDefault}`; // Combine key and direction
          options.push(
              <option key={defaultOptionValue} value={col.key} data-sort-desc={col.sortDescDefault === true}>
                  {col.sortLabel || col.header || col.key}
              </option>
          );
          // Add reverse option if needed (same logic as vanilla JS populateSortOptions)
          if (col.key !== 'distance_mi') { // Example condition
             const reverseOptionValue = `${col.key}-${!col.sortDescDefault}`;
             let reverseLabel = `${col.sortLabel || col.header || col.key}`;
             if (col.key === 'display_name') { reverseLabel = "Z-A"; }
             else if (col.sortDescDefault === true) { reverseLabel += " (Lowest)"; }
             else { reverseLabel += " (Highest)"; }
             options.push(
                 <option key={reverseOptionValue} value={col.key} data-sort-desc={!(col.sortDescDefault === true)}>
                     {reverseLabel}
                 </option>
             );
          }
      });
      return options;
  }, [selectedColumns]); // Recalculate when selected columns change


  return (
    <>
      {/* --- Display Controls --- */}
      <div className="d-flex justify-content-end align-items-center mb-2 gap-2" id="display-controls-container">
        <div>
          <label htmlFor="displaySortBy" className="form-label visually-hidden">Sort results by:</label>
          {/* Controlled select dropdown for sorting */}
          <select
             className="form-select form-select-sm"
             id="displaySortBy"
             onChange={handleSortChange}
             // Value needs to reflect combined key+direction to match options, or handle separately
             value={sortConfig.key} // Simplified: just set based on key, direction is via dataset
             aria-label="Sort results"
          >
            {sortOptions}
          </select>
        </div>
        <div>
          <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#customizeColumnsOffcanvas" title="Customize Columns">
            <i className="bi bi-filter"></i> <span className="visually-hidden">Customize Columns</span>
          </button>
        </div>
      </div>

      {/* --- Render Table or No Results --- */}
      <div id="results-output" className="table-responsive d-none d-md-block">
        {schoolsToDisplay.length > 0 ? (
          <TableView schools={schoolsToDisplay} columns={columnsToDisplay} />
        ) : (
          <p className="text-center mt-3 text-muted">No schools found matching your criteria.</p>
        )}
      </div>

      {/* --- Render Cards or No Results --- */}
      <div id="results-output-cards" className="d-md-none">
        {schoolsToDisplay.length > 0 ? (
          <CardView schools={schoolsToDisplay} columns={columnsToDisplay} />
        ) : (
          <p className="text-center mt-3 text-muted">No schools found matching your criteria.</p>
        )}
      </div>
      {/* --- Use the ColumnSelector Component --- */}
      <ColumnSelector
        id="customizeColumnsOffcanvas" // Matches the data-bs-target on the button
        title="Customize Displayed Columns"
        allPossibleColumns={allPossibleColumns}
        initialSelectedColumns={selectedColumns}
        onApplyColumns={handleApplySelectedColumns}
        alwaysIncludedKey="display_name" // 'display_name' won't be a checkbox, but always included
      />
    </>
  );
}
