import { useState, useEffect, useRef } from 'react'; // Keep useRef for later chart instances
// Removed Chart import for now, will add to specific component
import './App.css';
import { SearchForm } from './components/SearchForm.jsx'; // Import the new component
import { ResultsDisplay } from './components/ResultsDisplay';



const API_ENDPOINT = 'https://1248-2603-6010-6202-ce13-78bb-dfe0-99f2-7526.ngrok-free.app/school-details-by-address'; // <<< UPDATE THIS

function App() {
  // --- State Variables ---
  // Removed address, schoolLevel state from App, they live in SearchForm now
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schoolLevel, setSchoolLevel] = useState(''); 
  const [address, setAddress] = useState(''); 
  // const [sortConfig, setSortConfig] = useState({ key: 'distance_mi', descending: false }); // Keep for later
  // const [selectedColumns, setSelectedColumns] = useState([]); // Keep for later

  // --- Ref for Chart Instances (keep for later) ---
  const chartInstancesRef = useRef({});

  // --- API Call Function ---
  // Renamed from handleSearchSubmit to make its purpose clearer
  async function fetchSchoolData({ address, schoolLevel }) { // Receives search criteria
    console.log("App: fetchSchoolData called with:", { address, schoolLevel });
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    // Destroy any existing charts if we were re-searching
    Object.values(chartInstancesRef.current).forEach(chart => { if (chart) chart.destroy(); });
    chartInstancesRef.current = {};

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }), // Pass address from props
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }
      console.log("App: API Response:", data);
      setSearchResults(data);
    } catch (fetchError) {
      console.error("App: API Fetch Error:", fetchError);
      setError(`Failed to retrieve school data: ${fetchError.message}`);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }

    // --- Render Logic ---
    return (
      <> {/* React Fragment to return multiple top-level elements */}
        {/* Main container */}
        <div className="main-container mt-4">
  
          {/* Header Section */}
          <header className="text-center mb-4">
            <h1 className="main-heading">JCPS School Comparison</h1>
            <p className="lead">Find and compare Jefferson County Public Schools in your zone.</p>
          </header>
  
          {/* Search Form Component */}
          {/* Pass the API call function and loading state */}
          <SearchForm
              // Pass current values for controlled inputs
              currentAddress={address} // Renamed prop for clarity
              currentSchoolLevel={schoolLevel} // Renamed prop for clarity
              // Pass functions to update state in App
              onAddressChange={setAddress}
              onSchoolLevelChange={setSchoolLevel}
              // Pass function to trigger search in App
              onSearch={fetchSchoolData}
              isLoading={isLoading}
          />
  
          {/* Results Section - Content changes based on state */}
          <section id="results-section" className="mt-4">
  
             {/* 1. Show Loader when isLoading is true */}
             {isLoading && (
                  <div id="loader" className="loader" style={{display:'block'}}></div>
              )}
  
             {/* 2. Show Error message if error state is set */}
             {error && !isLoading && ( // Don't show error if also loading
                 <div id="error-message" className="alert alert-danger" role="alert">
                     {error}
                  </div>
              )}
  
             {/* 3. Show Results Info and the ResultsDisplay component if search completed successfully */}
             {searchResults && !error && !isLoading && (
               <>
                 {/* Render the component responsible for displaying results */}
                 <ResultsDisplay
                      searchResults={searchResults}
                      schoolLevel={schoolLevel}
                      // Pass down other state/handlers needed by ResultsDisplay later:
                      // sortConfig={sortConfig}
                      // onSortChange={handleSortChange} // Need to define handleSortChange
                      // selectedColumns={selectedColumns}
                      // onSelectedColumnsChange={handleSelectedColumnsChange} // Need definition
                      // allPossibleColumns={allPossibleColumns} // Pass full config
                 />
               </>
             )}
  
  
          </section>
  
          {/* Footer Section */}
          <footer className="text-center mt-5 mb-3 text-muted">
              <small>Data provided for informational purposes. Verify all information with JCPS directly.</small>
          </footer>
  
        </div> {/* End Container */}
  
        {/* --- Offcanvas Definition (Structure Only) --- */}
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="customizeColumnsOffcanvas" aria-labelledby="customizeColumnsOffcanvasLabel">
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title" id="customizeColumnsOffcanvasLabel">Select Columns to Display</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <form id="column-selection-form">
                {/* Checkboxes will be generated by React component */}
                <p>Column selection component will go here.</p>
            </form>
          </div>
          <div className="offcanvas-footer p-3 border-top bg-light">
               <button type="button" className="btn btn-primary w-100" id="apply-column-changes" data-bs-dismiss="offcanvas">Apply Changes</button> {/* data-bs-dismiss for now */}
          </div>
        </div>
        {/* --- End Offcanvas --- */}
  
      </> // End React Fragment
    );
  }

export default App;