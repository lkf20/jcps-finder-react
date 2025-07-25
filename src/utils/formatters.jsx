import React from 'react'; // Need React to return JSX
import tableStyles from '../components/TableView.module.css';
import ProficiencyBarChart from '../components/ProficiencyBarChart';
import SingleMetricPieChart from '../components/SingleMetricPieChart';


export function formatDisplayValue(colConfig, school, viewMode = 'table') {
    // Get the raw value for the current column key
    const value = school[colConfig.key];

    // Handle null/undefined consistently at the start
    // Allow 0 to pass through for cases like ratings or percentages
    if (value === null || value === undefined) {
        // Allow computed columns to fall through to the switch
        if ([
            'diversity_chart',
            'start_end_time',
            'reading_math_proficiency',
            'overall_indicator_rating',
            'gifted_talented_percent',            
            'economically_disadvantaged_percent', 
            'percent_teachers_3_years_or_less_experience',
            'parent_satisfaction',
            'pta_membership_percent',
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
            case 'student_teacher_ratio_value':
                return !isNaN(value) ? `${Math.round(value)}:1` : 'N/A';
            case 'great_schools_rating':
                return !isNaN(value) ? <span className="rating-circle">{value}</span> : 'N/A'; // Assumes CSS handles the circle
            case 'display_name': {
                const nameDisplay = (value !== null && value !== undefined) ? String(value) : 'N/A';
                let nameLink = <a href={school.school_website_link || '#'} target="_blank" rel="noopener noreferrer" className={tableStyles.schoolNameTable}>{nameDisplay}</a>;
            
                let detailsText = school.display_type || ''; // Start with the base type (e.g., "Magnet/Choice Program")

                // If it's a choice school AND we have a specific program name, format it.
                if (detailsText === 'Magnet/Choice Program' && school.magnet_programs && school.magnet_programs.trim().toLowerCase() !== '#n/a') {
                    // THIS IS THE ONLY LINE THAT HAS CHANGED
                    detailsText = `Magnet: ${school.magnet_programs}`; 
                }
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
            case 'diversity_chart': {
                return null;
            }
            case 'start_end_time': {
               const start = school.start_time || 'N/A';
               const end = school.end_time || 'N/A';
               
               let innerDivTextAlign = 'left'; // Default for table view
               // The outer div's alignment within .standardListItemValue (which is flex-end)
               // will be handled by .standardListItemValue itself if this outer div is not width: 100%.
               // If this outer div IS width: 100%, then its own alignItems matters for its children.

               if (viewMode === 'card') {
                   innerDivTextAlign = 'right'; 
               }

               return (
                   <div style={{ 
                       display: 'flex', 
                       flexDirection: 'column', 
                       // For card view, if we want this block itself to be pushed right by parent,
                       // and its content (inner div) also right aligned.
                       alignItems: viewMode === 'card' ? 'flex-end' : 'center', // << YOUR CORRECTION
                       width: viewMode === 'card' ? 'auto' : '100%' // For card, let width be auto so parent can align it
                   }}>
                     <div style={{ 
                         textAlign: innerDivTextAlign, 
                         width: 'auto' // Let inner div size to its content
                     }}>
                       {start}<br />{end}
                     </div>
                   </div>
               );
           }
            case 'teacher_avg_years_experience':
                return !isNaN(value) ? Math.round(value) : 'N/A';
            case 'reading_math_proficiency': {
               const chartVariant = viewMode === 'card' ? 'card' : 'table'; 
               return <ProficiencyBarChart school={school} variant={chartVariant} />;
            }
            case 'gifted_talented_percent': {
               const giftedPercent = school.gifted_talented_percent;
               if (giftedPercent === null || giftedPercent === undefined || isNaN(parseFloat(giftedPercent))) {
                    return 'N/A';
               }
               return (
                    <SingleMetricPieChart
                         percentage={parseFloat(giftedPercent)}
                         metricLabel="Gifted"
                         metricColor="#4CAF50" // Green
                         baseColor="#E8F5E9"   // Light Green
                         chartIdSuffix={`gifted-${school.school_code_adjusted || school.display_name}`}
                         variant="table"
                    />
               );
            }
            case 'economically_disadvantaged_percent': {
               const econPercent = school.economically_disadvantaged_percent;
               if (econPercent === null || econPercent === undefined || isNaN(parseFloat(econPercent))) {
                    return 'N/A';
               }
               return (
                    <SingleMetricPieChart
                         percentage={parseFloat(econPercent)}
                         metricLabel="Econ. Disadv."
                         metricColor="#673AB7" // Deep Purple
                         baseColor="#EDE7F6"   // Light Purple
                         chartIdSuffix={`econ-${school.school_code_adjusted || school.display_name}`}
                         variant="table"
                    />
               );
            }
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
           case 'percent_teachers_3_years_or_less_experience': {
               const newTeacherPercent = school.percent_teachers_3_years_or_less_experience;
               if (newTeacherPercent === null || newTeacherPercent === undefined || isNaN(parseFloat(newTeacherPercent))) {
                   return 'N/A';
               }
               return (
                   <SingleMetricPieChart
                       percentage={parseFloat(newTeacherPercent)}
                       metricLabel="<3 Yrs Exp" // Shortened label
                       metricColor="#00BCD4" // Cyan/Teal
                       baseColor="#B2EBF2"   // Light Cyan/Teal
                       chartIdSuffix={`newteach-${school.school_code_adjusted || school.display_name}`}
                       variant="table"
                   />
               );
           }
           case 'parent_satisfaction': {
               const satisfactionPercent = school.parent_satisfaction;
               if (satisfactionPercent === null || satisfactionPercent === undefined || isNaN(parseFloat(satisfactionPercent))) {
                   return 'N/A';
               }
               return (
                   <SingleMetricPieChart
                       percentage={parseFloat(satisfactionPercent)}
                       metricLabel="Parent Sat." // Shortened label
                       metricColor="#FF9800" // Orange
                       baseColor="#FFE0B2"   // Light Orange
                       chartIdSuffix={`parentsat-${school.school_code_adjusted || school.display_name}`}
                       variant="table"
                   />
               );
           }
           case 'pta_membership_percent': {
               const ptaPercent = school.pta_membership_percent;
               if (ptaPercent === null || ptaPercent === undefined || isNaN(parseFloat(ptaPercent))) {
                   return 'N/A';
               }
               return (
                   <SingleMetricPieChart
                       percentage={parseFloat(ptaPercent)}
                       metricLabel="PTA Memb." // Shortened label
                       metricColor="#2196F3" // Blue
                       baseColor="#BBDEFB"   // Light Blue
                       chartIdSuffix={`pta-${school.school_code_adjusted || school.display_name}`}
                       variant="table"
                   />
               );
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