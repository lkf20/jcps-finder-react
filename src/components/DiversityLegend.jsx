// src/components/DiversityLegend.jsx
import React from 'react';
import styles from './DiversityLegend.module.css';
import { DIVERSITY_LABELS, DIVERSITY_COLORS, DIVERSITY_KNOWN_KEYS } from '../utils/diversityConfig';  


export const DiversityLegend = ({ school, legendItemClass }) => {
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
    return (
        <ul className={`d-flex flex-wrap justify-content-end ${styles.diversityLegendList}`}>
            {legendItems.map(item => (
                <li key={item.label} className={`d-flex align-items-baseline ${styles.legendItem}${legendItemClass ? ` ${legendItemClass}` : ''}`}>
                    <span
                        className={styles.legendColorBox}
                        style={{ backgroundColor: item.color }}
                    ></span>
                    <span className={styles.legendLabel}>
                        {item.label}:
                    </span>
                    <span className={styles.legendValue}>
                        {item.value}%
                    </span>
                </li>
            ))}
        </ul>
    );
};

export default DiversityLegend;