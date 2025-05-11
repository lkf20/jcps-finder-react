import React from 'react'; // Need React to return JSX
import tableStyles from '../components/TableView.module.css';
import ProficiencyBarChart from '../components/ProficiencyBarChart';


export function formatDisplayValue(colConfig, school) {
    // Get the raw value for the current column key
    const value = school[colConfig.key];
    console.log("school", school);

    // Handle null/undefined consistently at the start
    // Allow 0 to pass through for cases like ratings or percentages
    if (value === null || value === undefined) {
        // Allow computed columns to fall through to the switch
        if ([
            'diversity_chart',
            'start_end_time',
            'reading_math_proficiency',
        ].includes(colConfig.key)) {
            // Do nothing, let the switch handle it
        } else {
            return 'N/A';
        }
    }

    try {
       switch (colConfig.key) {
            case 'distance_mi':
                return !isNaN(value) ? Number(value).toFixed(1) : 'N/A';
            case 'parent_satisfaction':
                return !isNaN(value) ? `${Math.round(value)}%` : 'N/A';
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
                 let nameLink = <a href={school.school_website_link || '#'} target="_blank" rel="noopener noreferrer" className={tableStyles.schoolNameTable}>{nameDisplay}</a>;
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
                 return <>{nameLink} {(detailsText || mapLink) && <div className="mt-2 d-flex align-items-center mt-1">{mapLink}<span className={tableStyles.schoolDetailsText}>{detailsText}</span></div>}</>;
             }
            // --- <<< MODIFIED diversity_chart case >>> ---
            case 'diversity_chart': {
                return null;
            }
            case 'start_end_time': {
                const start = school.start_time || 'N/A';
                const end = school.end_time || 'N/A';
                return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{ textAlign: 'left', width: 'max-content' }}>{start}<br />{end}</div>
                </div>;
            }
            case 'pta_membership_percent':
            case 'gifted_talented_percent':
                return !isNaN(value) ? `${Math.round(value)}%` : 'N/A';
            case 'teacher_avg_years_experience':
                return !isNaN(value) ? Math.round(value) : 'N/A';
            case 'percent_teachers_3_years_or_less_experience':
                return !isNaN(value) ? `${Number(value).toFixed(1)}%` : 'N/A';
            case 'reading_math_proficiency': {
                return <ProficiencyBarChart school={school} variant="table" />;
            }
            case 'economically_disadvantaged_percent':
                return !isNaN(value) ? `${Math.round(value)}%` : 'N/A';
            case 'membership': {
               const allStudents = school.all_grades_with_preschool_membership;
                const mainStudents = !isNaN(value) ? Number(value) : null;
                const totalStudents = !isNaN(allStudents) ? Number(allStudents) : null;
                // Only show total if it exists and is different from main
                if (mainStudents !== null && totalStudents !== null && totalStudents !== mainStudents) {
                    return <>
                        {mainStudents.toLocaleString()}
                        <div style={{ fontSize: '0.8em', fontStyle: 'italic', color: '#888' }}>
                            {totalStudents.toLocaleString()} total
                        </div>
                    </>;
                }
                return mainStudents !== null ? mainStudents.toLocaleString() : 'N/A';
            }
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