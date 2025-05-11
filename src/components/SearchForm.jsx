import React, { useState } from 'react'; // Keep useState for local formError
import styles from './SearchForm.module.css';

// Receive props from App
export const SearchForm = ({
  currentAddress,
  currentSchoolLevel,
  onAddressChange,
  onSchoolLevelChange,
  onSearch,
  isLoading
}) => {
  const [formError, setFormError] = useState(''); // Local error state

  const handleSubmit = (event) => {
    event.preventDefault();
    // Read values directly from props for validation
    if (!currentAddress.trim() || !currentSchoolLevel) {
      setFormError('Please enter a full address and select a school level.');
      return;
    }
    setFormError('');
    // Pass data up using the onSearch prop
    onSearch({ address: currentAddress.trim(), schoolLevel: currentSchoolLevel });
  };

  return (
    <section id="search-section" className={styles.searchSection}>
      <form id="school-search-form" className={styles.form} onSubmit={handleSubmit}>
        {formError && <div className={styles.formError}>{formError}</div>}
        <div className="mb-3">
          <label htmlFor="address" className={styles.label}>Enter Your Full Address:</label>
          <input
            type="text"
            className={styles.input}
            id="address"
            name="address"
            placeholder="e.g., 123 Main St, Louisville, KY 40202"
            required
            value={currentAddress} // Use prop for value
            onChange={(e) => onAddressChange(e.target.value)} // Call prop function on change
            disabled={isLoading}
          />
        </div>
        <div className="row g-3 align-items-end">
          <div className="col-md-9">
            <label htmlFor="schoolLevel" className={styles.label}>Select School Level:</label>
            <select
            className={`${styles.input} ${styles.noMarginBottom}`}
            id="schoolLevel"
            name="schoolLevel"
            required
            value={currentSchoolLevel} // Use prop for value
            onChange={(e) => onSchoolLevelChange(e.target.value)} // Call prop function on change
            disabled={isLoading}
            >
            <option value="" disabled>-- Please Select --</option>
            <option value="Elementary">Elementary School</option>
            <option value="Middle">Middle School</option>
            <option value="High">High School</option>
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-center">
            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Find Schools'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
