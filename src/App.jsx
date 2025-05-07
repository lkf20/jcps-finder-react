import { useState } from 'react';
import './App.css';

// --- Configuration --- Keep API endpoint accessible ---
const API_ENDPOINT = 'https://1248-2603-6010-6202-ce13-78bb-dfe0-99f2-7526.ngrok-free.app/school-details-by-address'; // <<< UPDATE THIS

function App() {
  // --- State Variables ---
  const [address, setAddress] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'distance_mi', descending: false }); // Default sort state
  // Add selectedColumns

  // --- Column Configuration (Adapted for React) ---
  // We might move formatting logic into the rendering later
  const allPossibleColumns = [
    // Key: API data key, Header: Display text, Default: Show initially?, Sortable etc.
    { key: 'display_name', header: '', default: true, sortable: true, sortLabel: 'A-Z', sortDescDefault: false},
    { key: 'distance_mi', header: 'Distance (mi)', default: true, sortable: true, sortLabel: 'Distance', sortDescDefault: false},
    { key: 'great_schools_rating', header: 'GreatSchools Rating', default: true, sortable: true, sortLabel: 'Rating', sortDescDefault: true},
    { key: 'membership', header: 'Enrollment', default: true, sortable: true, sortLabel: 'Enrollment', sortDescDefault: true},
    { key: 'parent_satisfaction', header: 'Parent Satisfaction', default: false, sortable: true, sortLabel: 'Parent Satisfaction', sortDescDefault: true},
    { key: 'student_teacher_ratio_value', header: 'Student/Teacher Ratio', default: false, sortable: true, sortLabel: 'Stu/Tch Ratio', sortDescDefault: false},
    { key: 'start_time', header: 'Start Time', default: false, sortable: true, sortLabel: 'Start Time', sortDescDefault: false },
    { key: 'end_time', header: 'End Time', default: false, sortable: true, sortLabel: 'End Time', sortDescDefault: false },
    { key: 'ky_reportcard_URL', header: 'KY Report Card', default: false, sortable: false },
    { key: 'diversity_chart', header: 'Student Diversity', default: true, sortable: false }, // Defaulting to true for testing
    // Add other columns: type, school_level, website_link etc. if needed for rendering
    { key: 'type', header: 'Type', default: false, sortable: false },
    { key: 'school_level', header: 'Level', default: false, sortable: false },
    { key: 'school_website_link', header: 'Website', default: false, sortable: false },
     // Address keys needed for map link in display_name format
    { key: 'address', header: 'Addr Str', default: false, sortable: false },
    { key: 'city', header: 'City', default: false, sortable: false },
    { key: 'state', header: 'State', default: false, sortable: false },
    { key: 'zipcode', header: 'Zip', default: false, sortable: false },
];

// --- Initialize selectedColumns state ---
// Do this *after* allPossibleColumns is defined
 const [selectedColumns, setSelectedColumns] = useState(() => {
    const initialCols = [
      'display_name',
      ...allPossibleColumns.filter(col => col.default).map(col => col.key)
    ];
    return [...new Set(initialCols)];
 });


  // --- Event Handlers ---
  function handleAddressChange(event) {
    setAddress(event.target.value);
  }

  function handleLevelChange(event) {
    setSchoolLevel(event.target.value);
  }

  async function handleSearchSubmit(event) {
    event.preventDefault(); // Prevent page reload
    if (!address || !schoolLevel) {
      setError("Please enter an address and select a school level.");
      return;
    }

    console.log("Form submitted!", { address, schoolLevel });
    setIsLoading(true);
    setError(null);
    setSearchResults(null); // Clear previous results

    try {
      console.log("Fetching from:", API_ENDPOINT);
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address
          // Add sort keys later if needed for initial API sort
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      console.log("API Response:", data); // <<< Log results for now
      setSearchResults(data); // Store results in state

    } catch (fetchError) {
      console.error("API Fetch Error:", fetchError);
      setError(`Failed to retrieve school data: ${fetchError.message}`);
      setSearchResults(null);
    } finally {
      setIsLoading(false); // Ensure loader stops
    }
  }

  // --- Helper function to get schools to display (Filtering & Sorting) ---
  function getSchoolsToDisplay() {
    if (!searchResults || !searchResults.results_by_zone) {
      return [];
    }

    // 1. Filter by School Level
    const levelToZoneTypeMap = { /* ... Your existing map ... */ };
    const relevantZoneKeywords = levelToZoneTypeMap[schoolLevel] || [schoolLevel];
    const filteredZones = searchResults.results_by_zone.filter(zone =>
      relevantZoneKeywords.some(keyword => zone.zone_type.includes(keyword))
    );
    let schools = filteredZones.flatMap(zone => zone.schools || []);

    // 2. Sort (using sortConfig state - which we haven't implemented fully yet)
    // For now, just use default sort or sort by distance if available
    const { key: sortKey, descending: sortDesc } = sortConfig;
    schools.sort((a, b) => {
        let valA = a[sortKey]; let valB = b[sortKey];
        const aIsNull = valA == null; const bIsNull = valB == null; // Simpler null check
        if (aIsNull && bIsNull) return 0; if (aIsNull) return sortDesc ? -1 : 1; if (bIsNull) return sortDesc ? 1 : -1;
        const numA = parseFloat(valA); const numB = parseFloat(valB); let comparison = 0;
        if (!isNaN(numA) && !isNaN(numB)) { if (numA > numB) comparison = 1; else if (numA < numB) comparison = -1; }
        else { const stringA = String(valA).toLowerCase(); const stringB = String(valB).toLowerCase(); if (stringA > stringB) comparison = 1; else if (stringA < stringB) comparison = -1; }
        return sortDesc ? (comparison * -1) : comparison;
    });

    return schools;
  }

  // --- Helper function to format value for display (can include simple formatting) ---
   function formatDisplayValue(colConfig, school) {
      const value = school[colConfig.key];

      // Basic Formatting Examples (Add more complex ones as needed)
      if (value === null || value === undefined) return 'N/A';

      switch (colConfig.key) {
         case 'distance_mi':
            return !isNaN(value) ? Number(value).toFixed(1) : 'N/A';
         case 'parent_satisfaction':
             return !isNaN(value) ? `${Number(value).toFixed(1)}%` : 'N/A';
         case 'student_teacher_ratio_value':
             return !isNaN(value) ? `${Math.round(value)}:1` : 'N/A';
         case 'school_website_link':
         case 'ky_reportcard_URL':
             return value ? <a href={value} target="_blank" rel="noopener noreferrer" className={colConfig.key === 'ky_reportcard_URL' ? 'btn btn-outline-primary btn-sm py-0' : ''}>{colConfig.key === 'ky_reportcard_URL' ? <>View <i className="bi bi-box-arrow-up-right ms-1"></i></> : 'Link'}</a> : 'N/A'; // Basic link or Button Link
         case 'great_schools_rating':
             return !isNaN(value) ? <span className="rating-circle">{value}</span> : 'N/A'; // Use CSS class
         case 'display_name':
             { // Use block scope for temp variables
                 let nameLinkHTML = <a href={school.school_website_link || '#'} target="_blank" rel="noopener noreferrer">{value || 'N/A'}</a>;
                 let detailsText = '';
                 if (school.type || school.school_level) { detailsText = `${school.type || ''}${school.type && school.school_level ? ' - ' : ''}${school.school_level || ''}`; }
                 let mapLinkHTML = null;
                 if (school.address && school.city && school.state && school.zipcode) {
                     const fullAddress = `${school.address}, ${school.city}, ${school.state} ${school.zipcode}`; const encodedAddress = encodeURIComponent(fullAddress); const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                     mapLinkHTML = <a href={mapsUrl} target="_blank" className="ms-1 text-secondary" title="View address"><i className="bi bi-geo-alt-fill"></i></a>;
                 }
                 return <> {nameLinkHTML} {(detailsText || mapLinkHTML) && <div className="d-flex align-items-center mt-1"><small className="text-muted">{detailsText}</small>{mapLinkHTML}</div>} </>; // Render conditionally
             }
         case 'diversity_chart':
             // We render the canvas structure here, Chart rendering happens in useEffect/component later
             const schoolId = school.school_code_adjusted || Math.random().toString(36).substring(7);
             const canvasId = `diversityChart-${schoolId}`;
             const legendId = `diversityLegend-${schoolId}`; // Still need ID for potential CSS/JS targeting
             // Check data availability (simplified check - assumes necessary keys are in school obj)
             const hasData = ['white_percent', 'african_american_percent', 'hispanic_percent', 'asian_percent', 'two_or_more_races_percent'].some(key => school[key] > 0); // Basic check
             if (!hasData && !(school.other_percent > 0)) return <span className="text-muted small">No data</span>; // Check other too

             const chartData = { /* Extract necessary data for attribute */ };
              knownKeys.forEach(key => { chartData[key] = school[key] || 0; }); // Simplified extraction
              // Calculate other if needed here or assume it exists
              chartData['other_percent'] = school.other_percent || Math.max(0, 100 - Object.values(chartData).reduce((s,v)=>s+v, 0)); // Example calculation

             const encodedData = JSON.stringify(chartData);
             // IMPORTANT: Chart.js initialization needs to happen elsewhere (useEffect)
             return (
                 <div className="diversity-container d-flex align-items-center">
                   <canvas id={canvasId} className="diversity-chart-canvas me-2" data-chart-data={encodedData} data-ready="false" width="80" height="80" aria-label={`...`}></canvas>
                   <div id={legendId} className="diversity-legend"></div> {/* Placeholder */}
                 </div>
               );

         default:
            return String(value); // Default: convert to string
       }
   }

   // --- Prepare data for rendering ---
  const schoolsToDisplay = getSchoolsToDisplay();
  const columnsToDisplay = allPossibleColumns.filter(col => selectedColumns.includes(col.key)).sort((a, b) => { 
    if (a.key === 'display_name') return -1; 
    if (b.key === 'display_name') return 1; 
    return 0; 
  });


  // --- Render Logic ---
  return (
    <>
      <div className="container mt-4">
        <header className="text-center mb-4">
          <h1>JCPS School Finder</h1>
          <p className="lead">Find schools in your zone.</p>
        </header>

        {/* --- Search Form --- */}
        <section id="search-section" className="card p-4 mb-4 shadow-sm">
          <form id="school-search-form" onSubmit={handleSearchSubmit}> {/* Add onSubmit */}
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Enter Your Full Address:</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                placeholder="e.g., 123 Main St, Louisville, KY 40202"
                required
                value={address} // Controlled input
                onChange={handleAddressChange} // State updater
              />
            </div>
            <div className="row g-3 align-items-end">
              <div className="col-md-9">
                <label htmlFor="schoolLevel" className="form-label">Select School Level:</label>
                <select
                  className="form-select"
                  id="schoolLevel"
                  name="schoolLevel"
                  required
                  value={schoolLevel} // Controlled input
                  onChange={handleLevelChange} // State updater
                >
                  <option value="" disabled>-- Please Select --</option>
                  <option value="Elementary">Elementary School</option>
                  <option value="Middle">Middle School</option>
                  <option value="High">High School</option>
                </select>
              </div>
              <div className="col-md-3">
                 <button type="submit" className="btn btn-primary w-100" disabled={isLoading}> {/* Disable button when loading */}
                   {isLoading ? 'Searching...' : 'Find Schools'} {/* Change button text */}
                 </button>
              </div>
            </div>
          </form>
        </section>

{/* --- Results Section --- */}
<section id="results-section" className="mt-4">
           {isLoading && <div id="loader" className="loader" style={{display:'block'}}></div>} {/* Show loader */}
           {error && <div id="error-message" className="alert alert-danger" role="alert">{error}</div>}
           {searchResults && !error && ( // Only show info/results if search completed without error
             <>
               <div id="results-info" className="alert alert-secondary">{`Showing results for address: ${searchResults.query_address} (Lat: ${searchResults.query_lat?.toFixed(5)}, Lon: ${searchResults.query_lon?.toFixed(5)})`}</div>

               {/* --- Display Controls --- */}
               {/* Add state/handlers for these later */}
               <div className="d-flex justify-content-end align-items-center mb-2 gap-2" id="display-controls-container">
                 <div>
                   <label htmlFor="displaySortBy" className="form-label visually-hidden">Sort results by:</label>
                   <select className="form-select form-select-sm" id="displaySortBy">
                       {/* Populate options based on state/config later */}
                       <option value="distance_mi">Distance</option>
                       <option value="display_name">A-Z</option>
                       {/* ... more options ... */}
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
                   <table className="table table-hover mt-3">
                     <thead className="table-light">
                       <tr>{columnsToDisplay.map(col => <th key={col.key}>{col.header}</th>)}</tr>
                     </thead>
                     <tbody>
                       {schoolsToDisplay.map(school => (
                         <tr key={school.school_code_adjusted}>
                           {columnsToDisplay.map(col => (
                             <td key={col.key}>
                               {/* Use helper function for potentially complex rendering */}
                               {formatDisplayValue(col, school)}
                             </td>
                           ))}
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 ) : (
                   <p className="text-center mt-3 text-muted">No schools found matching your criteria.</p>
                 )}
               </div>

               {/* --- Render Cards or No Results --- */}
               <div id="results-output-cards" className="d-md-none">
                 {schoolsToDisplay.length > 0 ? (
                   schoolsToDisplay.map(school => (
                     <div className="card mb-3 shadow-sm" key={school.school_code_adjusted}>
                       {/* Card Header (Name Section) */}
                       <div className="card-body pb-2">
                         <h5 className="card-title mb-0">
                           {formatDisplayValue(allPossibleColumns.find(c => c.key === 'display_name'), school)}
                         </h5>
                       </div>
                       {/* Card List Group */}
                       <ul className="list-group list-group-flush">
                         {columnsToDisplay.filter(col => col.key !== 'display_name').map(col => (
                           <li key={col.key} className={`list-group-item d-flex justify-content-between align-items-center py-2 ${col.key === 'diversity_chart' ? 'diversity-list-item-new' : ''}`}> {/* Add special class */}
                             {col.key === 'diversity_chart' ? (
                               <>
                                {/* Custom Diversity Layout */}
                                <div className='w-100'> {/* Wrapper to allow block layout */}
                                    <div className="row g-1 mb-1 align-items-center">
                                        <div className="col-7 d-flex align-items-center">
                                            <h6 className="diversity-title mb-0">{col.header || 'Student Diversity'}</h6>
                                        </div>
                                        <div className="col-5 diversity-chart-right d-flex justify-content-center align-items-center">
                                            {formatDisplayValue(col, school)} {/* This returns canvas+legend div */}
                                        </div>
                                    </div>
                                     {/* Legend gets populated by performChartRender targeting #diversityLegend-ID inside the value span */}
                                </div>
                               </>
                             ) : (
                               <>
                                 {/* Standard Layout */}
                                 <span>{col.header || col.key}</span>
                                 <span className="text-end">{formatDisplayValue(col, school)}</span>
                               </>
                             )}
                           </li>
                         ))}
                       </ul>
                     </div>
                   ))
                 ) : (
                   <p className="text-center mt-3 text-muted">No schools found matching your criteria.</p>
                 )}
               </div>
             </>
           )}

           {/* Initial placeholder */}
           {!isLoading && !error && !searchResults && ( <p className="text-center text-muted mt-4">Please enter address and level.</p> )}

        </section>

        <footer className="text-center mt-5 mb-3 text-muted">
            <small>Data provided for informational purposes.</small>
        </footer>
      </div>

      {/* --- Offcanvas (Keep structure, functionality added later) --- */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="customizeColumnsOffcanvas" aria-labelledby="customizeColumnsOffcanvasLabel">
        {/* ... Offcanvas header, body, footer ... */}
      </div>
    </>
  );
}

export default App;