// src/components/ResultsDisplay.jsx
import React, { useState, useMemo, useEffect } from 'react';
import styles from './ResultsDisplay.module.css';
import { TableView } from './TableView';
import { CardView } from './CardView';
import { ColumnSelector } from './ColumnSelector';

const allPossibleColumns = [
    { key: 'display_name', header: '', default: true, sortable: true, sortLabel: 'A-Z', sortDescDefault: false },
    { key: 'distance_mi', header: 'Distance (mi)', default: true, sortable: true, sortLabel: 'Distance', sortDescDefault: false },
    { key: 'membership', header: 'Students', default: true, sortable: true, sortLabel: 'Students', sortDescDefault: true },
    { key: 'start_end_time', header: 'Start - End Time', default: true, sortable: true, sortLabel: 'Start Time', sortDescDefault: false },
    { key: 'great_schools_rating', header: 'GreatSchools Rating', default: false, sortable: true, sortLabel: 'GreatSchools Rating', sortDescDefault: true },
    { key: 'overall_indicator_rating', header: 'KY Rating', default: true, sortable: true, sortLabel: 'KY Rating', sortDescDefault: true },
    { key: 'reading_math_proficiency', header: 'Reading / Math Proficiency', default: true, sortable: false },
    { key: 'gifted_talented_percent', header: 'Gifted & Talented', default: false, sortable: true, sortLabel: 'Gifted & Talented', sortDescDefault: true },
    { key: 'economically_disadvantaged_percent', header: 'Economically Disadvantaged', default: false, sortable: false },
    { key: 'diversity_chart', header: 'Student Diversity', default: false, sortable: false },
    { key: 'teacher_avg_years_experience', header: 'Avg Yrs Teacher Experience', default: false, sortable: true, sortLabel: 'Avg Teacher Experience', sortDescDefault: true },
    { key: 'percent_teachers_3_years_or_less_experience', header: 'Teachers with <\u00A03\u00A0Yrs Experience', default: false, sortable: false },
    { key: 'parent_satisfaction', header: 'Parent Satisfaction', default: true, sortable: true, sortLabel: 'Parent Satisfaction', sortDescDefault: true },
    { key: 'pta_membership_percent', header: 'PTA Membership', default: false, sortable: true, sortLabel: 'PTA Membership', sortDescDefault: true },
];

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

  const [sortConfig, setSortConfig] = useState({ key: 'distance_mi', descending: false });
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const initialCols = ['display_name', ...allPossibleColumns.filter(col => col.default).map(col => col.key)];
    return [...new Set(initialCols.filter(key => key !== 'diversity_chart'))];
  });

  // --- THIS MUST BE DECLARED BEFORE `schoolsToDisplay` ---
  const userResideZoneDisplayName = useMemo(() => {
    if (!searchResults || !searchResults.results_by_zone || searchResults.results_by_zone.length === 0) {
      return null;
    }
    let resideHighSchoolObject = null;
    for (const currentZone of searchResults.results_by_zone) {
      if (currentZone.schools && Array.isArray(currentZone.schools)) {
        const foundSchool = currentZone.schools.find(school =>
          school &&
          school.reside === 'Yes' &&
          typeof school.school_level === 'string' &&
          school.school_level.toLowerCase() === 'high school'
        );
        if (foundSchool) {
          resideHighSchoolObject = foundSchool;
          break;
        }
      }
    }
    if (resideHighSchoolObject) {
      if (resideHighSchoolObject.school_zone && typeof resideHighSchoolObject.school_zone === 'string') {
        return resideHighSchoolObject.school_zone;
      }
    }
    return null;
  }, [searchResults]);

  // --- THIS MUST BE DECLARED AFTER `userResideZoneDisplayName` ---
  const schoolsToDisplay = useMemo(() => {
    console.log("Recalculating schoolsToDisplay...");
    if (!searchResults || !searchResults.results_by_zone) {
        console.log(" -> No searchResults or results_by_zone found.");
        return [];
    }

    const levelToZoneTypeMap = {
        'Elementary': ['Elementary', 'Reside Elementary', 'Trad/Mag Elem', 'Choice Elem', 'Traditional/Magnet Elementary'],
        'Middle': ['Middle', 'Reside Middle', 'Trad/Mag Middle', 'Choice Middle', 'Traditional/Magnet Middle'],
        'High': ['High', 'Reside High', 'Trad/Mag High', 'Choice High', 'Traditional/Magnet High']
    };

    const relevantZoneKeywords = levelToZoneTypeMap[schoolLevel] || [schoolLevel];
    const filteredZones = searchResults.results_by_zone.filter(zone =>
        relevantZoneKeywords.some(keyword => zone.zone_type.includes(keyword))
    );

    // --- START: NEW LOGIC USING `zone_type` ---

    // 1. Flatten all schools, but add the display_type based on the zone it came from.
    const schoolsWithDisplayType = filteredZones.flatMap(zone => {
        // Determine the displayType for all schools in this zone.
        // Resides zones are simple names like "Elementary", "Middle", "High".
        // Choice zones have "Magnet" in their name.
        const isResideZone = !zone.zone_type.includes('Magnet');
        const displayType = isResideZone ? 'Reside School' : 'Magnet/Choice Program';

        // If the zone has no schools, flatMap needs an empty array.
        if (!zone.schools) {
            return [];
        }

        // Tag each school in this zone with the correct displayType.
        return zone.schools.map(school => ({
            ...school,
            display_type: displayType
        }));
    });
    
    // 2. De-duplicate the list, giving priority to the "Reside School" designation.
    const uniqueSchoolsMap = new Map();
    schoolsWithDisplayType.forEach(school => {
        const existing = uniqueSchoolsMap.get(school.school_code_adjusted);
        // If we haven't seen this school yet, or if the new entry is a "Reside School"
        // (overwriting a potential "Magnet/Choice" entry), then add/update it.
        if (!existing || school.display_type === 'Reside School') {
            uniqueSchoolsMap.set(school.school_code_adjusted, school);
        }
    });
    let processedSchools = Array.from(uniqueSchoolsMap.values());
    console.log(` -> Flattened and de-duplicated to ${processedSchools.length} schools.`);

    // 3. Sort the final, unique list of schools.
    const { key: sortKey, descending: sortDesc } = sortConfig;
    processedSchools.sort((a, b) => {
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
    // --- END: NEW LOGIC ---

    console.log(` -> Processed ${processedSchools.length} schools AFTER sorting.`);
    console.log("Final list of schools being sent to the table:", processedSchools);
    return processedSchools;

  }, [searchResults, schoolLevel, sortConfig]);

  const columnsToDisplay = useMemo(() => {
    return allPossibleColumns
      .filter(col => selectedColumns.includes(col.key))
      .sort((a, b) => allPossibleColumns.findIndex(c => c.key === a.key) - allPossibleColumns.findIndex(c => c.key === b.key));
  }, [selectedColumns]);

  const handleSortChange = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const newKey = selectedOption.value;
    const newDesc = selectedOption.dataset.sortDesc === 'true';
    console.log("Sort changed:", { key: newKey, descending: newDesc });
    setSortConfig({ key: newKey, descending: newDesc });
  };

  const handleApplySelectedColumns = (newlySelectedKeys) => {
    console.log("Applying new columns from ColumnSelector:", newlySelectedKeys);
    setSelectedColumns(Array.isArray(newlySelectedKeys) ? newlySelectedKeys : []);
  };

  const sortOptions = useMemo(() => {
    const availableSortKeys = desiredSortKeysInOrder.filter(key =>
      selectedColumns.includes(key) && allPossibleColumns.find(col => col.key === key)?.sortable
    );
    if (availableSortKeys.length === 0) {
      return [<option key="no-sort" value="" disabled>No sort options available</option>];
    }
    return availableSortKeys.map(key => {
      const colConfig = allPossibleColumns.find(col => col.key === key);
      if (!colConfig) return null;
      const displayLabel = colConfig.sortLabel || colConfig.header || colConfig.key;
      return (
        <option key={colConfig.key} value={colConfig.key} data-sort-desc={colConfig.sortDescDefault === true}>
           {displayLabel}
        </option>
      );
    }).filter(Boolean);
  }, [selectedColumns, sortConfig.key]); // sortConfig.key added to dependency array

  useEffect(() => {
    const currentSortKey = sortConfig.key;
    const isCurrentSortKeyVisible = selectedColumns.includes(currentSortKey);
    const currentSortColConfig = allPossibleColumns.find(col => col.key === currentSortKey);
    const isCurrentSortKeySortable = currentSortColConfig?.sortable === true;

    if (!isCurrentSortKeyVisible || !isCurrentSortKeySortable) {
      const newValidSortKey = desiredSortKeysInOrder.find(key => {
        const colConfig = allPossibleColumns.find(col => col.key === key);
        return selectedColumns.includes(key) && colConfig?.sortable;
      });
      if (newValidSortKey) {
        const newColConfig = allPossibleColumns.find(col => col.key === newValidSortKey);
        if (newColConfig) {
            console.log(`Sort key '${currentSortKey}' is no longer valid/visible. Switching to '${newValidSortKey}'.`);
            setSortConfig({
                key: newValidSortKey,
                descending: newColConfig.sortDescDefault
            });
        }
      } else {
        console.warn("No visible sortable columns available to set as default sort.");
      }
    }
  }, [selectedColumns, sortConfig.key]);

  return (
    <>
      {searchResults && (
        <div id="results-info" className={styles.resultsInfoBar}>
            <div>
                {`Showing results for address: ${searchResults.query_address || 'N/A'} (Lat: ${searchResults.query_lat?.toFixed(5) || 'N/A'}, Lon: ${searchResults.query_lon?.toFixed(5) || 'N/A'})`}
            </div>
            <div className={styles.zoneInfoLine}>
              Your zone is: <strong>{String(userResideZoneDisplayName).toUpperCase()}</strong>
            </div>
        </div>
      )}
      <div className={styles.displayControlsContainer} id="display-controls-container">
        <div className="d-flex align-items-center">
          <label htmlFor="displaySortBy" className={`form-label me-2 ${styles.sortByLabel}`}>Sort by:</label>
          <select
            className={`form-select form-select-sm ${styles.sortDropdown}`}
            id="displaySortBy"
            onChange={handleSortChange}
            value={sortConfig.key || ''}
            aria-label="Sort results by"
            disabled={sortOptions.length === 0}
          >
            {sortOptions}
            {sortOptions.length === 0 && <option value="" disabled>No sort options for visible columns</option>}
          </select>
        </div>
        <div>
          <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#customizeColumnsOffcanvas" title="Customize Columns">
            <i className="bi bi-filter"></i> <span className="visually-hidden">Customize Columns</span>
          </button>
        </div>
      </div>

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