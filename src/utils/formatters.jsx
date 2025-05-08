import React from 'react'; // Need React to return JSX
import { DiversityChart } from '../components/DiversityChart'; // Import the chart component

export function formatDisplayValue(colConfig, school) {
    // Get the raw value for the current column key
    const value = school[colConfig.key];

    // Handle null/undefined consistently at the start
    // Allow 0 to pass through for cases like ratings or percentages
    if (value === null || value === undefined) {
        // Allow diversity chart to render its own "No data" if necessary based on underlying percentages
        if (colConfig.key === 'diversity_chart') {
            // Let the component handle the check internally based on school prop
        } else {
            return 'N/A';
        }
    }

    try {
       switch (colConfig.key) {
            case 'distance_mi':
                return !isNaN(value) ? Number(value).toFixed(1) : 'N/A';
            case 'parent_satisfaction':
                return !isNaN(value) ? `${Number(value).toFixed(1)}%` : 'N/A';
            case 'student_teacher_ratio_value':
                return !isNaN(value) ? `${Math.round(value)}:1` : 'N/A';
            case 'ky_reportcard_URL':
                // Ensure value is a non-empty string before rendering link
                return value ? <a href={value} target="_blank" rel="noopener noreferrer" className='btn btn-outline-primary btn-sm py-0'>View <i className="bi bi-box-arrow-up-right ms-1"></i></a> : 'N/A';
            case 'great_schools_rating':
                return !isNaN(value) ? <span className="rating-circle">{value}</span> : 'N/A'; // Assumes CSS handles the circle
            case 'display_name': {
                 // Ensure value is a string for the name link
                 const nameDisplay = (value !== null && value !== undefined) ? String(value) : 'N/A';
                 let nameLink = <a href={school.school_website_link || '#'} target="_blank" rel="noopener noreferrer">{nameDisplay}</a>;
                 let detailsText = '';
                 if (school.type || school.school_level) { detailsText = `${school.type || ''}${school.type && school.school_level ? ' - ' : ''}${school.school_level || ''}`; }
                 if (school.type) { detailsText = school.type; }
                 let mapLink = null;
                 // Check for all necessary address components
                 if (school.address && school.city && school.state && school.zipcode) {
                     const fullAddress = `${school.address}, ${school.city}, ${school.state} ${school.zipcode}`;
                     const encodedAddress = encodeURIComponent(fullAddress);
                     const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                     mapLink = <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="me-1 text-secondary" title="View address"><i className="bi bi-geo-alt-fill"></i></a>;
                 }
                 // Return JSX conditionally including the details div
                 return <>{nameLink} {(detailsText || mapLink) && <div className="mt-2 d-flex align-items-center mt-1">{mapLink}<small className="text-muted" style={{ fontSize: '1em' }}>{detailsText}</small></div>}</>;
             }
            // --- <<< MODIFIED diversity_chart case >>> ---
            case 'diversity_chart': {
                // Render the dedicated component, passing the *entire* school object
                // The component itself will extract percentages and handle 'No data' state
                return <DiversityChart school={school} />;
            }
            // --- <<< END MODIFICATION >>> ---

            // Default case for simple text display
            default:
                return String(value); // Convert other values to string
       }
     } catch (formatError) {
          // Log error for debugging
          console.error(`Error formatting key ${colConfig?.key} for school ${school?.school_code_adjusted}:`, formatError);
          // Return user-friendly error message
          return <span className='text-danger small'>Format Err</span>;
     }
}