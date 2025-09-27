// /frontend/cypress.config.cjs
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    env: {
      apiUrl: 'http://localhost:5001'
    },
    viewportWidth: 1280,
    viewportHeight: 800,
    retries: { runMode: 2, openMode: 0 },
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      return config;
    }
  }
});
