// src/components/ResultsDisplay.jsx
import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect
import styles from './ResultsDisplay.module.css';
import { TableView } from './TableView';
import { CardView } from './CardView';
import { ColumnSelector } from './ColumnSelector';

// --- Define allPossibleColumns with updated sort properties ---
// (Keep this definition exactly as provided in the previous step)
const allPossibleColumns = [
    { key: 'display_name', header: '', default: true, sortable: true, sortLabel: 'A-Z', sortDescDefault: false },
    // General
    { key: 'distance_mi', header: 'Distance (mi)', default: true, sortable: true, sortLabel: 'Distance', sortDescDefault: false },
    { key: 'membership', header: 'Students', default: true, sortable: true, sortLabel: 'Students', sortDescDefault: true },
    { key: 'start_end_time', header: 'Start - End Time', default: true, sortable: true, sortLabel: 'Start Time', sortDescDefault: false },
    // Performance
    { key: 'great_schools_rating', header: 'GreatSchools Rating', default: false, sortable: true, sortLabel: 'GreatSchools Rating', sortDescDefault: true },
    { key: 'overall_indicator_rating', header: 'KY Rating', default: true, sortable: true, sortLabel: 'KY Rating', sortDescDefault: true },
    { key: 'reading_math_proficiency', header: 'Reading / Math Proficiency', default: true, sortable: false },
    { key: 'gifted_talented_percent', header: 'Gifted & Talented', default: false, sortable: true, sortLabel: 'Gifted & Talented', sortDescDefault: true },
    // Demographics
    { key: 'economically_disadvantaged_percent', header: 'Economically Disadvantaged', default: false, sortable: false },
    { key: 'diversity_chart', header: 'Student Diversity', default: false, sortable: false },
    // Teachers
    { key: 'teacher_avg_years_experience', header: 'Avg Yrs Teacher Experience', default: false, sortable: true, sortLabel: 'Avg Teacher Experience', sortDescDefault: true },
    { key: 'percent_teachers_3_years_or_less_experience', header: ' Teachers with < 3 Yrs Experience', default: false, sortable: false },
    // Parent/Community
    { key: 'parent_satisfaction', header: 'Parent Satisfaction', default: true, sortable: true, sortLabel: 'Parent Satisfaction', sortDescDefault: true },
    { key: 'pta_membership_percent', header: 'PTA Membership', default: false, sortable: true, sortLabel: 'PTA Membership', sortDescDefault: true },

];

// --- Define the desired order and keys for the sort dropdown ---
// (Keep this definition exactly as provided in the previous step)
const desiredSortKeysInOrder = [
    'distance_mi',
    'display_name',
    'membership',
    'great_schools_rating',
    'start_end_time',
    'overall_indicator_rating',
    'gifted_talented_percent',
    'teacher_avg_years_experience',
    'parent_satisfaction',
    'pta_membership_percent',
];


export const ResultsDisplay = ({ searchResults, schoolLevel }) => {
  console.log("ResultsDisplay received props:", { searchResults, schoolLevel });

  const [sortConfig, setSortConfig] = useState({ key: 'distance_mi', descending: false }); // Default to Distance
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const initialCols = ['display_name', ...allPossibleColumns.filter(col => col.default).map(col => col.key)];
    return [...new Set(initialCols.filter(key => key !== 'diversity_chart'))];
  });

  // --- Memoized Calculation: Filter and Sort Schools ---
  // (Keep this useMemo hook exactly as provided in the previous step)
  const schoolsToDisplay = useMemo(() => {
    console.log("Recalculating schoolsToDisplay...");
    if (!searchResults || !searchResults.results_by_zone) {
      console.log(" -> No searchResults or results_by_zone found.");
      return [];
    }
    console.log(` -> Filtering for level: ${schoolLevel}`);
    const levelToZoneTypeMap = {
        'Elementary': ['Elementary', 'Reside Elementary', 'Trad/Mag Elem', 'Choice Elem'],
        'Middle': ['Middle', 'Reside Middle', 'Trad/Mag Middle', 'Choice Middle'],
        'High': ['High', 'Reside High', 'Trad/Mag High', 'Choice High']
    };
    const relevantZoneKeywords = levelToZoneTypeMap[schoolLevel] || [schoolLevel];
    console.log(` -> Using keywords: ${relevantZoneKeywords.join(', ')}`);
    const filteredZones = searchResults.results_by_zone.filter(zone =>
        relevantZoneKeywords.some(keyword => zone.zone_type.includes(keyword))
    );
    console.log(` -> Found ${filteredZones.length} matching zones:`, filteredZones);
    let schools = filteredZones.flatMap(zone => zone.schools || []);
    console.log(` -> Flattened ${schools.length} schools BEFORE sort:`, schools.slice(0, 5));

    const { key: sortKey, descending: sortDesc } = sortConfig;
    schools = [...schools].sort((a, b) => {
      let vA = a[sortKey]; let vB = b[sortKey];
      const nA = vA == null; const nB = vB == null;
      if (nA && nB) return 0; if (nA) return sortDesc ? -1 : 1; if (nB) return sortDesc ? 1 : -1;

      if (sortKey === 'start_end_time') {
          vA = a['start_time'];
          vB = b['start_time'];
      }

      const numA = parseFloat(vA); const numB = parseFloat(vB); let comp = 0;
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA > numB) comp = 1; else if (numA < numB) comp = -1;
      } else {
        const sA = String(vA).toLowerCase(); const sB = String(vB).toLowerCase();
        if (sA > sB) comp = 1; else if (sA < sB) comp = -1;
      }
      return sortDesc ? (comp * -1) : comp;
    });
    console.log(` -> Found ${schools.length} schools AFTER sort.`);
    return schools;
  }, [searchResults, schoolLevel, sortConfig]);

  // --- Memoized Calculation: Determine Columns to Display ---
  // (Keep this useMemo hook as is)
  const columnsToDisplay = useMemo(() => {
    return allPossibleColumns
      .filter(col => selectedColumns.includes(col.key))
      .sort((a, b) => allPossibleColumns.findIndex(c => c.key === a.key) - allPossibleColumns.findIndex(c => c.key === b.key));
  }, [selectedColumns]);

  // --- Event Handlers (for Sort and Columns) ---
  // (Keep these handlers as is)
  const handleSortChange = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const newKey = selectedOption.value;
    const newDesc = selectedOption.dataset.sortDesc === 'true';
    console.log("Sort changed:", { key: newKey, descending: newDesc });
    setSortConfig({ key: newKey, descending: newDesc });
  };

  const handleApplySelectedColumns = (newlySelectedKeys) => {
    console.log("Applying new columns from ColumnSelector:", newlySelectedKeys);
    // Ensure newlySelectedKeys is an array before setting state
    setSelectedColumns(Array.isArray(newlySelectedKeys) ? newlySelectedKeys : []);
  };

  // --- Generate Sort Options Dynamically based on VISIBLE columns ---
  const sortOptions = useMemo(() => {
    // Filter the desired order to only include keys that are currently selected/visible
    const availableSortKeys = desiredSortKeysInOrder.filter(key =>
        selectedColumns.includes(key)
    );

    return availableSortKeys.map(key => {
      const colConfig = allPossibleColumns.find(col => col.key === key);
      // We can assume colConfig exists and is sortable because desiredSortKeysInOrder only contains sortable keys
      if (!colConfig) return null; // Safety check

      return (
        <option
          key={colConfig.key}
          value={colConfig.key}
          data-sort-desc={colConfig.sortDescDefault === true}
        >
          {colConfig.sortLabel || colConfig.header || colConfig.key}
        </option>
      );
    }).filter(Boolean); // Remove any nulls from safety check
  }, [selectedColumns]); // <<<<< DEPENDENCY UPDATED: Re-run when selectedColumns changes

  // --- Effect to Reset Sort Config if Current Sort Column is Hidden ---
  useEffect(() => {
    const currentSortKey = sortConfig.key;
    const isCurrentSortKeyVisible = selectedColumns.includes(currentSortKey);

    // Find the config for the current sort key to check if it's supposed to be sortable
    // (This guards against scenarios where 'sortable' might change dynamically, though unlikely here)
    const currentSortColConfig = allPossibleColumns.find(col => col.key === currentSortKey);
    const isCurrentSortKeySortable = currentSortColConfig?.sortable === true;

    // If the current sort key is no longer visible OR no longer designated as sortable
    if (!isCurrentSortKeyVisible || !isCurrentSortKeySortable) {
      // Find the first key from our desired list that IS visible and IS sortable
      const newValidSortKey = desiredSortKeysInOrder.find(key => {
        const colConfig = allPossibleColumns.find(col => col.key === key);
        // Check both visibility (in selectedColumns) and inherent sortability (in allPossibleColumns)
        return selectedColumns.includes(key) && colConfig?.sortable;
      });

      if (newValidSortKey) {
        // If we found a valid replacement key
        const newColConfig = allPossibleColumns.find(col => col.key === newValidSortKey);
        if (newColConfig) { // Ensure config exists
            console.log(`Sort key '${currentSortKey}' is no longer valid/visible. Switching to '${newValidSortKey}'.`);
            // Update the sortConfig state to the new valid key and its default direction
            setSortConfig({
                key: newValidSortKey,
                descending: newColConfig.sortDescDefault
            });
        }
      } else {
        // Edge case: No sortable columns are currently visible.
        // The sort dropdown will be empty. We could optionally reset sortConfig
        // to a default non-sorting state, but leaving it might be acceptable.
        console.warn("No visible sortable columns available to set as default sort.");
        // Example reset (optional): setSortConfig({ key: null, descending: false });
      }
    }
    // This effect should run when the selected columns change, or if the sort key itself changes
    // (though changing the key via dropdown triggers handleSortChange which sets it anyway).
  }, [selectedColumns, sortConfig.key]); // <<<<< DEPENDENCIES DEFINED

    // --- Determine the User's Reside Zone Name based on a Reside High School ---
    const userResideZoneDisplayName = useMemo(() => {
        if (!searchResults || !searchResults.results_by_zone || searchResults.results_by_zone.length === 0) {
          return null;
        }
    
        let resideHighSchoolObject = null;
    
        // Iterate through each zone object in the results_by_zone array
        for (const currentZone of searchResults.results_by_zone) {
          if (currentZone.schools && Array.isArray(currentZone.schools)) {
            // Find the "Reside High School" within this zone's schools array
            const foundSchool = currentZone.schools.find(school => 
              school && 
              typeof school.type === 'string' && 
              school.type.toLowerCase() === 'reside' && // As per your data: type: "Reside"
              typeof school.school_level === 'string' &&
              school.school_level.toLowerCase() === 'high school' // As per your data: school_level: "High School"
            );
    
            if (foundSchool) {
              resideHighSchoolObject = foundSchool; // We found the specific school object
              break; 
            }
          }
        }
    
        if (resideHighSchoolObject) {
          // Now, directly use the 'zone' property from the resideHighSchoolObject
          // As per your data: zone: "Ballard Zone"
          if (resideHighSchoolObject.zone && typeof resideHighSchoolObject.zone === 'string') {
            return resideHighSchoolObject.zone; // This should be "Ballard Zone"
          }
        }
        
        return null; // Or 'Reside zone information not available'
      }, [searchResults]);

  // --- JSX Rendering ---
  return (
    <>
      {searchResults && (
        <div id="results-info" className={styles.resultsInfoBar}>
            <div>
                {`Showing results for address: ${searchResults.query_address || 'N/A'} (Lat: ${searchResults.query_lat?.toFixed(5) || 'N/A'}, Lon: ${searchResults.query_lon?.toFixed(5) || 'N/A'})`}
            </div>
            <div className={styles.zoneInfoLine}> 
              Your zone is: <strong>{String(userResideZoneDisplayName).toUpperCase()}</strong>
              {/* Using String() for safety in case 'zone' is not a string, then toUpperCase() */}
            </div>
        </div>
      )}
      <div className={styles.displayControlsContainer} id="display-controls-container">
        <div>
          <label htmlFor="displaySortBy" className="form-label visually-hidden">Sort results by:</label>
          <select
            className="form-select form-select-sm"
            id="displaySortBy"
            onChange={handleSortChange}
            value={sortConfig.key || ''} // Handle potential null key if no options available
            aria-label="Sort results"
            disabled={sortOptions.length === 0} // Disable dropdown if no options
          >
            {/* Render the dynamically generated sort options */}
            {sortOptions}
            {/* Optional: Add a message if no options are available */}
            {sortOptions.length === 0 && <option value="" disabled>No sort options for visible columns</option>}
          </select>
        </div>
        <div>
          <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#customizeColumnsOffcanvas" title="Customize Columns">
            <i className="bi bi-filter"></i> <span className="visually-hidden">Customize Columns</span>
          </button>
        </div>
      </div>

      {/* Results Table/Cards */}
      {/* (Keep the table/card rendering logic as is) */}
      <div id="results-output" className={`d-none d-md-block ${styles.tableWrapper}`}>
        {schoolsToDisplay.length > 0 ? (
          <TableView schools={schoolsToDisplay} columns={columnsToDisplay} />
        ) : (
          <p className={`${styles.noResultsText} text-muted`}>No schools found matching your criteria.</p>
        )}
      </div>

      <div id="results-output-cards" className={`d-md-none ${styles.cardWrapper}`}>
        {schoolsToDisplay.length > 0 ? (
          <CardView schools={schoolsToDisplay} columns={columnsToDisplay} />
        ) : (
          <p className={`${styles.noResultsText} text-muted`}>No schools found matching your criteria.</p>
        )}
      </div>

      {/* Column Selector Offcanvas */}
      {/* (Keep the ColumnSelector component usage as is) */}
      <ColumnSelector
        id="customizeColumnsOffcanvas"
        title="Customize Displayed Columns"
        allPossibleColumns={allPossibleColumns}
        initialSelectedColumns={selectedColumns}
        onApplyColumns={handleApplySelectedColumns}
        alwaysIncludedKey="display_name"
      />
    </>
  );
}