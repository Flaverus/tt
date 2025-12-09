const sinon = require('sinon');
const apiService = require('../../src/services/api');

describe('Temperature Widget E2E Tests (Cypress + Sinon.js Stub)', () => {

  beforeEach(() => {
    cy.visit('/');
    cy.get('#app').should('exist');
    // Stub the fetchTemperatureFromBackend function using Sinon's spy on the module
    // We use a stub on the function itself rather than intercepting global fetch, as this is cleaner
    // when the API function is isolated.
    cy.window().then((win) => {
      // 1. Create a Sinon stub with a fixed cold response
      const coldResponse = {
        temperature: 15,
        status: 'too cold',
        message: 'It is too cold, you should turn on the heater.',
      };

      const warmResponse = {
        temperature: 28,
        status: 'too warm',
        message: 'It is too warm, you should turn off the heater.',
      };

      // 2. Stub the imported module's function
      cy.stub(apiService, 'fetchTemperatureFromBackend')
        .onFirstCall().resolves(coldResponse) // First call is cold
        .onSecondCall().resolves(warmResponse); // Second call is warm
    });

    // Visit the application root URL (Cypress handles starting the dev server)
    cy.visit('/');
  });

  it('Mocks the API service using Sinon and verifies state changes', () => {

    // Test 1: Cold Temperature (First Stub Call)
    cy.get('[data-testid="fetch-button"]').click();
    cy.get('[data-testid="temperature-value"]').should('contain', '15°C');
    cy.get('[data-testid="status-message"]').should('contain', 'you should turn on the heater.');

    // Test 2: Warm Temperature (Second Stub Call)
    cy.get('[data-testid="fetch-button"]').click();
    cy.get('[data-testid="temperature-value"]').should('contain', '28°C');
    cy.get('[data-testid="status-message"]').should('contain', 'you should turn off the heater.');
  });
});