// /frontend/cypress/e2e/tasks.crud.cy.js
describe('TaskMaster — E2E CRUD con control de limpieza', () => {
  // Limpia sólo si corres con: npm run cy:open:clean / cy:run:clean
  const START_CLEAN = String(Cypress.env('CYPRESS_CLEAN') || '').trim() === '1';

  // Títulos únicos por corrida
  const makeTitle = (label) => `E2E - ${label} - ${Date.now()}`;

  // App lista: no exige lista al inicio (puede estar vacía)
  const waitForAppReady = () => {
    cy.intercept('GET', '**/api/tasks*').as('getTasks');
    cy.visit('/');
    cy.wait('@getTasks').its('response.statusCode').should('be.oneOf', [200, 304]);
    cy.get('[data-testid="task-title-input"]').should('be.visible');
  };

  // Contar items de forma segura (sin fallar cuando hay 0)
  const countItems = () =>
    cy.get('body').then(($b) => $b.find('[data-testid="task-item"]').length);

  before(() => {
    if (START_CLEAN) cy.apiClearTestData();
  });

  it('Crea una tarea desde el formulario y aparece en la lista', () => {
    waitForAppReady();

    const title = makeTitle('Crear tarea');

    // (Opcional) Asegura filtros neutrales si existen
    cy.get('body').then(($b) => {
      if ($b.find('select').length) {
        cy.contains('Todas las tareas').should('exist');
        cy.contains('Todas las prioridades').should('exist');
      }
    });

    cy.intercept('POST', '**/api/tasks').as('createTask');
    cy.get('[data-testid="task-title-input"]').clear().type(title);
    cy.get('[data-testid="add-task-btn"]').click();
    cy.wait('@createTask').its('response.statusCode').should('be.oneOf', [200, 201]);

    // ✅ verificación robusta: que el nuevo título exista (sin depender de cantidad)
    cy.contains('[data-testid="task-title"]', title).should('exist');
  });

  it('Actualiza la tarea (título) y marca como completada', () => {
    waitForAppReady();

    // Toma el primer ítem (si no hay, crea uno rápido)
    countItems().then((n) => {
      if (n === 0) {
        const seed = makeTitle('Semilla');
        cy.intercept('POST', '**/api/tasks').as('createTask');
        cy.get('[data-testid="task-title-input"]').clear().type(seed);
        cy.get('[data-testid="add-task-btn"]').click();
        cy.wait('@createTask');
      }

      cy.get('[data-testid="task-item"]').first().as('row');

      const newTitle = makeTitle('Editada');
      cy.intercept('PUT', '**/api/tasks/*').as('updateTask');
      cy.get('@row').find('[data-testid="task-edit-btn"]').click();
      cy.get('[data-testid="task-title-input"]').clear().type(newTitle);
      cy.get('[data-testid="save-task-btn"]').click();
      cy.wait('@updateTask').its('response.statusCode').should('be.oneOf', [200, 204]);
      cy.contains('[data-testid="task-title"]', newTitle).should('exist');

      // Toggle completada
      cy.intercept('PUT', '**/api/tasks/*').as('toggleTask');
      cy.contains('[data-testid="task-title"]', newTitle)
        .parents('[data-testid="task-item"]')
        .find('[data-testid="task-toggle"]')
        .check({ force: true });
      cy.wait('@toggleTask').its('response.statusCode').should('be.oneOf', [200, 204]);
    });
  });

  it('Elimina una tarea y ya no aparece en el listado', () => {
    waitForAppReady();

    countItems().then((initial) => {
      // Si está vacío, crea una rápida para poder borrar
      if (initial === 0) {
        const t = makeTitle('Para eliminar');
        cy.intercept('POST', '**/api/tasks').as('createTask');
        cy.get('[data-testid="task-title-input"]').clear().type(t);
        cy.get('[data-testid="add-task-btn"]').click();
        cy.wait('@createTask').its('response.statusCode').should('be.oneOf', [200, 201]);
      }

      // Toma primera fila y guarda el título
      cy.get('[data-testid="task-item"]').first().as('row');
      cy.get('@row')
        .find('[data-testid="task-title"]')
        .invoke('text')
        .then((txt) => {
          const titleToDelete = txt.trim();

          cy.intercept('DELETE', '**/api/tasks/*').as('deleteTask');
          cy.get('@row').find('[data-testid="task-delete-btn"]').click();
          cy.wait('@deleteTask').its('response.statusCode').should('be.oneOf', [200, 204]);

          // Ese título ya no debe existir
          cy.contains('[data-testid="task-title"]', titleToDelete).should('not.exist');

          // Conteo final seguro
          countItems().then((after) => {
            if (initial > 0) {
              expect(after).to.eq(initial - 1);
            } else {
              expect(after).to.eq(0); // creamos 1 y la borramos → vuelve a 0
            }
          });
        });
    });
  });
});
