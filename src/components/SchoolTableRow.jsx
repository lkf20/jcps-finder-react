import React from 'react';
import { formatDisplayValue } from '../utils/formatters';
// Import a potential CellValue component if formatting gets very complex
// Or import the formatting helper if defined separately
// For now, formatting logic is assumed to be passed via columns prop or handled here




export const SchoolTableRow = ({ school, columns }) => {
  return (
    <tr>
      {columns.map(col => (
        <td key={col.key}>
          {/* Call formatting logic here */}
          {formatDisplayValue(col, school)}
        </td>
      ))}
    </tr>
  );
}

