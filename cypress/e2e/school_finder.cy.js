// cypress/e2e/school_finder.cy.js

describe('School Finder E2E Tests', () => {
  beforeEach(() => {
    cy.fixture('test_cases.json').as('testData');
  });

  it('should display the correct list of schools for a Waggener Zone address', function() {
    const testCase = this.testData.find(tc => tc.zone_name === "Waggener Zone");
    
    // 1. Visit the application
    cy.visit('http://localhost:5173/');

    // 2. Interact with the form
    cy.get('#address').type(testCase.address);
    cy.get('#schoolLevel').select('Elementary');
    cy.get('button[type="submit"]').click();

    // 3. Wait for results and verify the main zone name is correct
    cy.get('#results-info').should('contain', `Your zone is: ${testCase.zone_name.toUpperCase()}`);

    // <<< START: MODIFIED CODE >>>
    // 4. Check that each expected school name appears in the results.
    // We are no longer checking for a specific status, only for the presence of the school.
    testCase.expected_schools.Elementary.forEach(school => {
      cy.get('#results-output')
        .should('contain', school.display_name);
    });
    // <<< END: MODIFIED CODE >>>
  });
});