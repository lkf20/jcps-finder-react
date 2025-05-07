import React from 'react';
import { SchoolCard } from './SchoolCard'; // Import card component

export const CardView = ({ schools, columns }) => {
  return (
    <div> {/* Simple wrapper div */}
      {schools.map(school => (
        <SchoolCard key={school.school_code_adjusted} school={school} columns={columns} />
      ))}
    </div>
  );
}
