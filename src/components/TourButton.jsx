// src/components/TourButton.jsx
import React, { useState } from 'react';
import styles from './TourButton.module.css';

export const TourButton = ({ school, onClick }) => { 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // <<< START: MODIFIED CODE >>>
  const tourInfo = school.open_house_data;
  // Don't render the button if there's no info to show
  const hasEvents = tourInfo && tourInfo.events && Object.keys(tourInfo.events).length > 0;
  if (!tourInfo || (!tourInfo.phone && !hasEvents && !tourInfo.notes)) {
    return null;
  }
  // <<< END: MODIFIED CODE >>>

  return (
    <button className={styles.tourButton} onClick={onClick}>
      <i className="bi bi-calendar-event"></i>
      <span>Open House & School Tours</span>
    </button>
  );
};