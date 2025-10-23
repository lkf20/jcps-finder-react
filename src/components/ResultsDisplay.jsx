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
    { key: 'gifted_talented_percent', header: 'Gifted & Talented', default: true, sortable: true, sortLabel: 'Gifted & Talented', sortDescDefault: true },
    { key: 'economically_disadvantaged_percent', header: 'Economically Disadvantaged', default: true, sortable: false },
    { key: 'diversity_chart', header: 'Student Diversity', default: true, sortable: false },
    { key: 'teacher_avg_years_experience', header: 'Avg Yrs Teacher Experience', default: true, sortable: true, sortLabel: 'Avg Teacher Experience', sortDescDefault: true },
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
  const [sortConfig, setSortConfig] = useState({ key: 'distance_mi', descending: false });
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const initialCols = ['display_name', ...allPossibleColumns.filter(col => col.default).map(col => col.key)];
    return [...new Set(initialCols)];
  });

  const userResideZoneDisplayName = useMemo(() => {
    if (!searchResults?.results_by_zone?.length) return null;
    for (const currentZone of searchResults.results_by_zone) {
      const foundSchool = currentZone.schools?.find(school =>
        school?.reside === 'Yes' && school?.school_level?.toLowerCase() === 'high school'
      );
      if (foundSchool) return foundSchool.school_zone || null;
    }
    return null;
  }, [searchResults]);

  // <<< START: NEW CODE >>>
  const zoneDisplayText = useMemo(() => {
    const resideZoneText = userResideZoneDisplayName 
      ? String(userResideZoneDisplayName).toUpperCase() 
      : null;

    if (searchResults?.is_in_choice_zone && resideZoneText) {
      return `${resideZoneText} and CHOICE ZONE`;
    }
    if (resideZoneText) {
      return resideZoneText;
    }
    if (searchResults?.is_in_choice_zone) {
      return 'CHOICE ZONE';
    }
    return 'N/A';
  }, [userResideZoneDisplayName, searchResults?.is_in_choice_zone]);
  // <<< END: NEW CODE >>>

  const schoolsToDisplay = useMemo(() => {
    if (!searchResults || !searchResults.results_by_zone) {
        return [];
    }
    const levelToZoneTypeMap = {
        'Elementary': ['Elementary', 'Traditional/Magnet Elementary'],
        'Middle': ['Middle', 'Traditional/Magnet Middle'],
        'High': ['High', 'Traditional/Magnet High']
    };
    const relevantZoneKeywords = levelToZoneTypeMap[schoolLevel] || [];
    const filteredZones = searchResults.results_by_zone.filter(zone =>
        relevantZoneKeywords.some(keyword => zone.zone_type.includes(keyword))
    );

    const schoolsWithDisplayType = filteredZones.flatMap(zone => {
        if (!zone.schools) return [];
        return zone.schools.map(school => ({ ...school }));
    });
    
    const uniqueSchoolsMap = new Map();
    schoolsWithDisplayType.forEach(school => {
        const existing = uniqueSchoolsMap.get(school.school_code_adjusted);
        if (!existing || school.display_status === 'Reside') {
            uniqueSchoolsMap.set(school.school_code_adjusted, school);
        }
    });
    let processedSchools = Array.from(uniqueSchoolsMap.values());

    const { key: sortKey, descending: sortDesc } = sortConfig;
    processedSchools.sort((a, b) => {
        let vA = a[sortKey]; let vB = b[sortKey];
        const nA = vA == null || vA === 'N/A' || vA === ''; 
        const nB = vB == null || vB === 'N/A' || vB === '';
        
        // Always put N/A/null/empty values at the bottom regardless of sort direction
        if (nA && nB) return 0; 
        if (nA) return 1;  // N/A values go to bottom
        if (nB) return -1; // N/A values go to bottom
        
        if (sortKey === 'start_end_time') { vA = a['start_time']; vB = b['start_time']; }
        const numA = parseFloat(vA); const numB = parseFloat(vB); let comp = 0;
        if (!isNaN(numA) && !isNaN(numB)) {
            if (numA > numB) comp = 1; else if (numA < numB) comp = -1;
        } else {
            const sA = String(vA).toLowerCase(); const sB = String(vB).toLowerCase();
            if (sA > sB) comp = 1; else if (sA < sB) comp = -1;
        }
        return sortDesc ? (comp * -1) : comp;
    });
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
    setSortConfig({ key: newKey, descending: newDesc });
  };

  const handleApplySelectedColumns = (newlySelectedKeys) => {
    setSelectedColumns(Array.isArray(newlySelectedKeys) ? newlySelectedKeys : []);
  };

  const sortOptions = useMemo(() => {
    const availableSortKeys = desiredSortKeysInOrder.filter(key =>
      selectedColumns.includes(key) && allPossibleColumns.find(col => col.key === key)?.sortable
    );
    if (!availableSortKeys.length) {
      return [<option key="no-sort" value="" disabled>No sort options available</option>];
    }
    return availableSortKeys.map(key => {
      const colConfig = allPossibleColumns.find(col => col.key === key);
      return colConfig ? (
        <option key={colConfig.key} value={colConfig.key} data-sort-desc={colConfig.sortDescDefault === true}>
           {colConfig.sortLabel || colConfig.header || colConfig.key}
        </option>
      ) : null;
    }).filter(Boolean);
  }, [selectedColumns]);

  useEffect(() => {
    const currentSortKey = sortConfig.key;
    const isCurrentSortKeyVisible = selectedColumns.includes(currentSortKey);
    const isCurrentSortKeySortable = allPossibleColumns.find(col => col.key === currentSortKey)?.sortable;
    if (!isCurrentSortKeyVisible || !isCurrentSortKeySortable) {
      const newValidSortKey = desiredSortKeysInOrder.find(key => 
        selectedColumns.includes(key) && allPossibleColumns.find(col => col.key === key)?.sortable
      );
      if (newValidSortKey) {
        const newColConfig = allPossibleColumns.find(col => col.key === newValidSortKey);
        if (newColConfig) {
            setSortConfig({ key: newValidSortKey, descending: newColConfig.sortDescDefault });
        }
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
            {/* <<< START: MODIFIED CODE >>> */}
            <div className={styles.zoneInfoLine}>
              Your zone is: <strong>{zoneDisplayText}</strong>
            </div>
            {/* <<< END: MODIFIED CODE >>> */}
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