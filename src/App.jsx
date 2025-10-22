// src/App.jsx

import { useState, useEffect, useRef } from 'react';
import './App.css';
import { SearchForm } from './components/SearchForm.jsx';
import { ResultsDisplay } from './components/ResultsDisplay';
import Footer from './components/Footer.jsx';

const API_ENDPOINT = import.meta.env.VITE_API_URL;

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schoolLevel, setSchoolLevel] = useState(''); 
  const [address, setAddress] = useState(''); 
  const chartInstancesRef = useRef({});

  async function fetchSchoolData({ address, schoolLevel }) {
    console.log("App: fetchSchoolData called with:", { address, schoolLevel });
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    Object.values(chartInstancesRef.current).forEach(chart => { if (chart) chart.destroy(); });
    chartInstancesRef.current = {};

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }
      setSearchResults(data);
    } catch (fetchError) {
      console.error("App: API Fetch Error:", fetchError);
      setError(`Failed to retrieve school data: ${fetchError.message}`);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <div className="disclaimer-banner alert alert-warning mb-0" role="alert">
        <div className="container text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Disclaimer:</strong> This is an unofficial JCPS tool. Please verify all information with the official
          <a href="https://apps.jefferson.kyschools.us/demographics/schoolfinder.aspx" target="_blank" rel="noopener noreferrer" className="alert-link"> JCPS School Finder</a> or by calling the Office of School Choice at <strong>(502) 485-6250</strong>.
        </div>
      </div>

      <div className="main-container mt-4" style={{ flex: 1, width: '100%' }}>
        <header className="text-center mb-4">
          <h1 className="main-heading">JCPS School Comparison</h1>
          <p className="lead">Find and compare Jefferson County Public Schools in your zone.</p>
        </header>

        <SearchForm
            currentAddress={address}
            currentSchoolLevel={schoolLevel}
            onAddressChange={setAddress}
            onSchoolLevelChange={setSchoolLevel}
            onSearch={fetchSchoolData}
            isLoading={isLoading}
        />

        <section id="results-section" className="mt-4">
           {isLoading && (
                // <<< START: MODIFIED CODE >>>
                <>
                  <div id="loader" className="loader" style={{display:'block'}}></div>
                  <p className="text-center text-muted fst-italic">
                    Please allow up to 1 minute for data to load.
                  </p>
                </>
                // <<< END: MODIFIED CODE >>>
            )}
           {error && !isLoading && (
               <div id="error-message" className="alert alert-danger" role="alert">
                   {error}
                </div>
            )}
           {searchResults && !error && !isLoading && (
             <ResultsDisplay
                  searchResults={searchResults}
                  schoolLevel={schoolLevel}
             />
           )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default App;