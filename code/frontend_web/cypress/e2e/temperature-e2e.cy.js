describe('Temperature Widget E2E Integration Test', () => {
  const apiUrl = '/api/temperature';

  // Test Case 1: Should handle a "too cold" response
  it('should fetch and display "too cold" temperature data correctly', () => {
    const mockColdResponse = {
      temperature: 15,
      status: 'too cold',
      message: 'It is too cold, you should turn on the heater.',
    };

    // 1. Arrange - Intercept the API call and return the mock response.
    cy.intercept('GET', apiUrl, mockColdResponse).as('getColdTemperature');

    cy.visit('/');

    // 2. Initial State Assertions
    const fetchButton = cy.get('[data-testid="fetch-button"]');

    cy.get('[data-testid="status-message"]')
      .should('be.visible')
      .and('have.text', 'Press the button to get the current temperature.');

    // 3. Act - Click the button to trigger the fetch
    fetchButton.click();

    // Wait for the mocked network request to complete.
    cy.wait('@getColdTemperature');

    // 4. Final State Assertions (Cold)
    // Check temperature value after it has been rendered.
    cy.get('[data-testid="temperature-value"]')
      .should('include.text', `${mockColdResponse.temperature}°C`)
      .and('have.class', 'cold')
      .and('not.have.class', 'warm');

    // Check status message
    cy.get('[data-testid="status-message"]').should('have.text', mockColdResponse.message);
  });

  // Test Case 2: Should handle a "too warm" response
  it('should fetch and display "too warm" temperature data correctly', () => {
    const mockWarmResponse = {
      temperature: 25,
      status: 'too warm',
      message: 'It is too warm, you should turn off the heater.',
    };

    cy.intercept('GET', apiUrl, mockWarmResponse).as('getWarmTemperature');
    cy.visit('/');

    // 1. Act - Click the button
    cy.get('[data-testid="fetch-button"]').click();

    // Wait for the mocked network request to complete
    cy.wait('@getWarmTemperature');

    // 2. Final State Assertions (Warm)
    // Check temperature value and verify the 'warm' CSS class is applied
    cy.get('[data-testid="temperature-value"]')
      .should('include.text', `${mockWarmResponse.temperature}°C`)
      .and('have.class', 'warm')
      .and('not.have.class', 'cold');

    // Check status message
    cy.get('[data-testid="status-message"]').should('have.text', mockWarmResponse.message);
  });
});