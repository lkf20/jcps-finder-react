// cypress/e2e/school_finder.cy.js

describe('School Finder E2E Tests', () => {
    // Before each test, we load the test_cases.json file from the fixtures folder.
    // The `.as('testData')` part creates an alias that we can access later.
    beforeEach(() => {
      cy.fixture('test_cases.json').as('testData');
    });
  
    // This is our first test case. The 'it' block defines a single test.
    it('should display the correct Reside and Satellite schools for a Waggener Zone address', function() {
      // We access the loaded data using 'this.testData'.
      // We find the specific test case for the Waggener Zone from our array of test cases.
      const testCase = this.testData.find(tc => tc.zone_name === "Waggener Zone");
      
      // 1. Visit the application's local URL.
      cy.visit('http://localhost:5173/');
  
      // 2. Interact with the form.
      cy.get('#address').type(testCase.address);
      cy.get('#schoolLevel').select('Elementary');
      cy.get('button[type="submit"]').click();
  
      // 3. Wait for results and verify the main zone name is correct.
      // `should('contain', ...)` makes Cypress automatically wait for the element to appear.
      cy.get('#results-info').should('contain', `Your zone is: ${testCase.zone_name.toUpperCase()}`);
  
      // 4. Check each expected school in the Elementary list.
      testCase.expected_schools.Elementary.forEach(school => {
        cy.get('#results-output')
          // Find the table cell (`td`) that contains the school's name.
          .contains('td', school.display_name)
          // Go up to the parent table row (`tr`).
          .parent('tr')
          // From now on, all commands will be limited to within this specific row.
          .within(() => {
            // Assert that the row contains the expected status text (e.g., "Reside" or "Satellite School").
            cy.contains(school.expected_status);
          });
      });
    });
  
    // You can add more tests here by copying the `it()` block above and changing the zone_name.
    // For example: it('should display the correct schools for a Ballard Zone address', function() { ... });
  });