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
            'overall_indicator_rating',
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
            case 'great_schools_rating':
                return !isNaN(value) ? <span className="rating-circle">{value}</span> : 'N/A'; // Assumes CSS handles the circle
            case 'display_name': {
                 // Ensure value is a string for the name link
                 const nameDisplay = (value !== null && value !== undefined) ? String(value) : 'N/A';
                 let nameLink = <a href={school.school_website_link || '#'} target="_blank" rel="noopener noreferrer" className={tableStyles.schoolNameTable}>{nameDisplay}</a>;
                 let detailsText = '';
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
            case 'overall_indicator_rating': {
               const rating = parseInt(value, 10);
               if (value === null || value === undefined || isNaN(rating) || rating < 1 || rating > 5) {
                   return 'N/A';
               }
               const ratingMap = {
                   1: { color: 'red', text: 'Red (Overall Performance Rating: 1)' },
                   2: { color: 'orange', text: 'Orange (Overall Performance Rating: 2)' },
                   3: { color: 'yellow', text: 'Yellow (Overall Performance Rating: 3)' },
                   4: { color: 'green', text: 'Green (Overall Performance Rating: 4)' },
                   5: { color: 'blue', text: 'Blue (Overall Performance Rating: 5)' },
               };
               const ratingInfo = ratingMap[rating];
               if (!ratingInfo) return 'N/A';

               const imagePath = `/images/indicator_${ratingInfo.color}.png`;
               const altText = `KY School Rating: ${ratingInfo.text}. Click to view report card.`; // Updated alt text
               const reportCardUrl = school.ky_reportcard_URL;

               const imageElement = (
                   <img
                       src={imagePath}
                       alt={altText}
                       title={altText}
                       className={tableStyles.kyRatingImage} // Using class from TableView.module.css
                   />
               );

               const content = (
                <div className={tableStyles.kyRatingCell}> {/* Using class from TableView.module.css */}
                    {reportCardUrl ? (
                        <a
                            href={reportCardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-block', textDecoration: 'none' }} // inline-block to wrap image tightly
                            title={`View KY Report Card for ${school.display_name || 'this school'}`} // More specific title for the link
                        >
                            {imageElement}
                        </a>
                    ) : (
                        imageElement // Render image without link if no URL
                    )}
                </div>
               );
               return content;
           }
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