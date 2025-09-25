// src/components/TableView.jsx
import React, { useState } from 'react'; // <<< ADD useState
import styles from './TableView.module.css';
import { SchoolTableRow } from './SchoolTableRow';
import { TourModal } from './TourModal'; // <<< ADD TourModal IMPORT

export const TableView = ({ schools, columns }) => {
  // <<< START: ADDED CODE >>>
  // State to track which school's modal is currently open
  const [modalSchool, setModalSchool] = useState(null);
  // <<< END: ADDED CODE >>>

  return (
    // <<< START: MODIFIED CODE >>>
    // Wrap everything in a React Fragment
    <>
      <table className={`table table-hover mt-3 ${styles.tableCustom}`}>
        <thead className={`table-light ${styles.tableHeaderCustom}`}>
            <tr>
            {columns.map(col => <th key={col.key}>{col.header}</th>)}
            </tr>
        </thead>
        <tbody>
            {schools.map(school => (
            // Pass the school and a function to set the modalSchool state
            <SchoolTableRow 
              key={school.school_code_adjusted} 
              school={school} 
              columns={columns} 
              onOpenModal={setModalSchool}
            />
            ))}
        </tbody>
      </table>

      {/* Render the modal here, OUTSIDE the table structure. */}
      {/* It will only be visible if modalSchool is not null. */}
      <TourModal
        school={modalSchool}
        show={!!modalSchool}
        onClose={() => setModalSchool(null)}
      />
    </>
    // <<< END: MODIFIED CODE >>>
  );
}

