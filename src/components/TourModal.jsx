import React, { useEffect } from 'react';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { formatEventDateTime } from '../utils/dateFormatter';
import styles from './TourModal.module.css';
import MarkdownLink from './MarkdownLink';

const stripMarkdown = (text) => {
  if (!text) return '';
  const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/g;
  return text.replace(markdownLinkRegex, '$1');
};

export const TourModal = ({ school, show, onClose }) => {
  useEffect(() => {
    if (show) {
      document.body.classList.add(styles.modalOpen);
    } else {
      document.body.classList.remove(styles.modalOpen);
    }
    return () => {
      document.body.classList.remove(styles.modalOpen);
    };
  }, [show]);

  if (!show) {
    return null;
  }

  const tourInfo = school.open_house_data || {};
  const now = new Date();

  const getUpcomingEvents = (events) => {
    if (!events || events.length === 0) return [];
    return events
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  const upcomingOpenHouses = getUpcomingEvents(tourInfo.events?.['Open House']);
  const upcomingTours = getUpcomingEvents(tourInfo.events?.['School Tour']);
  const upcomingOther = getUpcomingEvents(tourInfo.events?.['Other']);
  const hasAnyUpcomingEvents = upcomingOpenHouses.length > 0 || upcomingTours.length > 0 || upcomingOther.length > 0;

  const renderEventList = (events, type) => {
    if (!events || events.length === 0) return null;

    return (
      <div className={styles.eventSection}>
        <h6 className={styles.eventTitle}>{type}</h6>
        <ul className={styles.eventList}>
          {events.map((event, index) => {
            // <<< START: NEW LOGIC >>>
            // Prepare calendar properties, assuming a 1-hour duration if end time is missing.
            // This does NOT affect the displayed text, only the data sent to the calendar.
            let calendarEndDate;
            let calendarEndTime;

            if (event.end) {
              // If end time exists, use it directly.
              calendarEndDate = event.end.split('T')[0];
              calendarEndTime = event.end.split('T')[1].substring(0, 5);
            } else {
              // If end time is missing, calculate a 1-hour duration.
              const startDate = new Date(event.start);
              startDate.setHours(startDate.getHours() + 1);

              // Format the new end date back into YYYY-MM-DD and HH:mm strings.
              const year = startDate.getFullYear();
              const month = String(startDate.getMonth() + 1).padStart(2, '0');
              const day = String(startDate.getDate()).padStart(2, '0');
              const hours = String(startDate.getHours()).padStart(2, '0');
              const minutes = String(startDate.getMinutes()).padStart(2, '0');

              calendarEndDate = `${year}-${month}-${day}`;
              calendarEndTime = `${hours}:${minutes}`;
            }
            // <<< END: NEW LOGIC >>>

            return (
              <li key={index} className={styles.eventListItem}>
                {/* This displayed text remains unchanged, using the original event.end */}
                <span>{formatEventDateTime(event.start, event.end)}</span>
                
                <div className={styles.addToCalendarWrapper} title="Add to Calendar">
                  <AddToCalendarButton
                    name={`${event.type || 'Event'}: ${school.display_name}`}
                    description={stripMarkdown(tourInfo.notes)}
                    startDate={event.start.split('T')[0]}
                    startTime={event.start.split('T')[1].substring(0, 5)}
                    // Use the newly calculated end date and time for the button
                    endDate={calendarEndDate}
                    endTime={calendarEndTime}
                    timeZone="America/New_York"
                    location={school.address || 'See school website for details'}
                    options={['Google', 'Outlook.com', 'Apple']}
                    buttonStyle="round"
                    styleLight="--background: #f1f1f1; --background-hover: #e2e6ea; --button-shadow: none;"
                    styleDark="--background: #2d2d2d; --background-hover: #424242; --button-shadow: none;"
                    size="1"
                    listStyle='overlay'
                    trigger='click'
                    hideText
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  let registrationInfo = null;
  if (tourInfo.registration_link) {
    const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/;
    const match = tourInfo.registration_link.match(markdownLinkRegex);
    if (match) {
      registrationInfo = { text: match[1], url: match[2] };
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>{school.display_name}</h5>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          {registrationInfo && (
            <div className={styles.registrationSection}>
              <a href={registrationInfo.url} target="_blank" rel="noopener noreferrer" className={styles.registrationButton}>
                <i className="bi bi-box-arrow-up-right"></i>
                {registrationInfo.text}
              </a>
            </div>
          )}
          {tourInfo.phone && (
            <p className={styles.phoneInfo}>
              <strong>Call to schedule: </strong>
              <a href={`tel:${tourInfo.phone.replace(/\D/g, '')}`}>{tourInfo.phone}</a>
            </p>
          )}
          {renderEventList(upcomingOpenHouses, 'Open Houses')}
          {renderEventList(upcomingTours, 'School Tours')}
          {renderEventList(upcomingOther, 'Other Events')}
          {!hasAnyUpcomingEvents && !tourInfo.phone && (
             <p className={styles.noEventsMessage}>There are no upcoming tours or open houses scheduled at this time. Please check back later.</p>
          )}
          {tourInfo.notes && (
            <div className={styles.notesSection}>
              <h6>Additional Information</h6>
              <MarkdownLink text={tourInfo.notes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};