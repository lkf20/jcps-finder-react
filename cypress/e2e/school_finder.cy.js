// cypress/e2e/school_finder.cy.js

// (The normalizeSchoolName function remains the same at the top)
function normalizeSchoolName(name) {
  if (typeof name !== 'string') {
    return "";
  }
  let normalized = name.toLowerCase().replace(/\./g, '').trim();
  normalized = normalized.replace(/\s+/g, ' ');
  const nameMap = {
    'the academy @ shawnee middle': 'the academy @ shawnee',
    'the academy @ shawnee high': 'the academy @ shawnee',
    'dupont manual high': 'dupont manual high',
    'hudson middle school': 'hudson middle',
    'perry elementary': 'dr william h perry elementary school',
    'stuart middle school': 'stuart academy',
    'wilkerson traditional elementary': 'wilkerson elementary',
    'greathouse/shryock traditional': 'greathouse/shryock traditional elementary',
    'norton commons elementary school': 'norton commons elementary'
  };
  if (nameMap[normalized]) {
    return nameMap[normalized];
  }
  return normalized;
}

// Load the test data once at the beginning
const testData = require('../fixtures/test_cases.json');

describe('School Finder E2E Tests', () => {

  // Loop through each test case (address) in the JSON file
  testData.forEach(testCase => {

    // <<< START: MODIFIED CODE >>>
    // Get the school levels available for this address (e.g., ['Elementary', 'Middle', 'High'])
    const schoolLevels = Object.keys(testCase.expected_schools);

    // Now, loop through each school level and create a test for it
    schoolLevels.forEach(schoolLevel => {

      // Create a more descriptive test title
      it(`should display correct ${schoolLevel} schools for address in ${testCase.zone_name}`, () => {
        
        cy.visit('http://localhost:5173/');
    
        cy.get('#address').type(testCase.address);
        // Use the schoolLevel from our loop
        cy.get('#schoolLevel').select(schoolLevel);
        cy.get('button[type="submit"]').click();
    
        cy.get('#results-info', { timeout: 10000 }).should('contain', testCase.zone_name.toUpperCase());
    
        cy.get('#results-output').then($resultsDiv => {
          const resultsText = normalizeSchoolName($resultsDiv.text());

          // Use the schoolLevel to get the correct list of expected schools
          testCase.expected_schools[schoolLevel].forEach(school => {
            const expectedName = normalizeSchoolName(school.display_name);
            expect(resultsText).to.include(expectedName);
          });
        });
      });
    });
    // <<< END: MODIFIED CODE >>>
  });
});