
Cypress.Commands.add('apiClearTestData', () => {
  const api = Cypress.env('apiUrl');
  return cy.request('GET', `${api}/api/tasks`).then(({ body }) => {
    const list =
      Array.isArray(body) ? body :
      Array.isArray(body?.data) ? body.data :
      Array.isArray(body?.tasks) ? body.tasks :
      [];

    const toDelete = list
      .filter(t => {
        const title = t.title || t.name || t.titulo || '';
        return typeof title === 'string' && title.startsWith('E2E - ');
      })
      .map(t => t._id || t.id)
      .filter(Boolean);

    return toDelete.reduce((acc, id) => {
      return acc.then(() => cy.request('DELETE', `${api}/api/tasks/${id}`));
    }, Cypress.Promise.resolve());
  });
});

// Crea una tarea por API (útil para semillas rápidas)
Cypress.Commands.add('apiCreateTask', (title, extra = {}) => {
  const api = Cypress.env('apiUrl');
  const payload = { title, ...extra };
  return cy.request('POST', `${api}/api/tasks`, payload)
    .its('status')
    .should('be.oneOf', [200, 201]);
});
