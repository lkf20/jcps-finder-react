// src/utils/dateFormatter.js

/**
 * Formats an ISO 8601 date string into a readable format.
 * Example: "2025-11-18T17:30:00" -> "Tuesday, Nov 18, 2025 from 5:30 PM"
 * @param {string} startTimeIso - The ISO 8601 start time.
 * @param {string} endTimeIso - The optional ISO 8601 end time.
 * @returns {string} A formatted, human-readable date/time string.
 */
export function formatEventDateTime(startTimeIso, endTimeIso) {
    if (!startTimeIso) return "Date not specified";
  
    const startDate = new Date(startTimeIso);
  
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
  
    let formattedString = new Intl.DateTimeFormat('en-US', options).format(startDate);
  
    // Remove the comma after the weekday
    formattedString = formattedString.replace(/,([^,]*)$/, '$1');
  
    if (endTimeIso) {
      const endDate = new Date(endTimeIso);
      const endTimeString = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(endDate);
      formattedString += ` - ${endTimeString}`;
    }
  
    return formattedString;
  }