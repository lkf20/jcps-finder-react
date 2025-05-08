import React from 'react';
import styles from './TableView.module.css';
import { SchoolTableRow } from './SchoolTableRow'; // Import row component

export const TableView = ({ schools, columns }) => {
  return (
    <table className={`table table-hover mt-3 ${styles.tableCustom}`}>
      <thead className={`table-light ${styles.tableHeaderCustom}`}>
        <tr>
          {columns.map(col => <th key={col.key}>{col.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {schools.map(school => (
          // Pass school and columns data to the row component
          <SchoolTableRow key={school.school_code_adjusted} school={school} columns={columns} />
        ))}
      </tbody>
    </table>
  );
}

