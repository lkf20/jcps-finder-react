// src/components/DiversityLegend.jsx
import React from 'react';
import { DIVERSITY_LABELS, DIVERSITY_COLORS, DIVERSITY_KNOWN_KEYS } from '../utils/diversityConfig';  


export const DiversityLegend = ({ school }) => {
    if (!school) {
        return <p className="text-muted small mb-0">Diversity data not available.</p>;
    }

    // --- 1. Prepare Data ---
    const processedData = {};
    let dataAvailable = false;
    const knownKeys = ['white_percent', 'african_american_percent', 'hispanic_percent', 'asian_percent', 'two_or_more_races_percent'];

    knownKeys.forEach(key => {
        const pct = school[key];
        const numPct = (pct != null && !isNaN(parseFloat(pct))) ? Number(parseFloat(pct).toFixed(2)) : 0;
        processedData[key] = numPct;
        if (numPct > 0) dataAvailable = true;
    });

    const calculatedKnownTotal = knownKeys.reduce((sum, key) => sum + (processedData[key] || 0), 0);
    const otherPercent = Math.max(0, 100 - parseFloat(calculatedKnownTotal.toFixed(2)));
    processedData['other_percent'] = parseFloat(otherPercent.toFixed(2));

    if (processedData['other_percent'] > 0) dataAvailable = true;

    const rawDataValues = [
        processedData['white_percent'] || 0,
        processedData['african_american_percent'] || 0,
        processedData['hispanic_percent'] || 0,
        processedData['asian_percent'] || 0,
        processedData['two_or_more_races_percent'] || 0,
        processedData['other_percent'] || 0
    ];

    // --- 2. Filter Data for Legend ---
    const legendItems = [];
    rawDataValues.forEach((value, index) => {
        if (value > 0) { // Only show legend items for categories with data
            legendItems.push({
                label: DIVERSITY_LABELS[index],
                value: parseFloat(value.toFixed(1)), // Round to one decimal for legend
                color: DIVERSITY_COLORS[index % DIVERSITY_COLORS.length]
            });
        }
    });

    if (!dataAvailable || legendItems.length === 0) {
        // This case might be redundant if the parent component (SchoolCard) already checks,
        // but good for robustness if DiversityLegend is used elsewhere.
        return <p className="text-muted small mb-0">No diversity data to display in legend.</p>;
    }

    // --- 3. Render Legend ---
    // Add diversity-legend-list class to UL
    return (
        <ul className="list-unstyled mb-0 d-flex flex-wrap justify-content-start diversity-legend-list">
            {legendItems.map(item => (
                <li key={item.label} className="d-flex align-items-baseline me-2 mb-1">
                    <span
                        className="legend-color-box me-1"
                        style={{
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            backgroundColor: item.color,
                            borderRadius: '2px',
                            verticalAlign: 'middle',
                            flexShrink: 0, // Good practice for flex items
                        }}
                    ></span>
                    {/* Split label and value for better styling via CSS if needed */}
                    <span className="legend-label text-muted" style={{ fontSize: '0.7rem', lineHeight: '1' }}> {/* Decreased font size */}
                          {item.label}:
                     </span>
                    <span className="legend-value text-muted ms-1" style={{ fontSize: '0.7rem',  fontWeight: '500', lineHeight: '1' }}> {/* Decreased font size, added class & style for value */}
                      {item.value}%
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default DiversityLegend;