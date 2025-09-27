// tests/integration/tasks.api.test.js
import request from 'supertest';
import app from './setup/test-server.js';
import './setup/mongo-memory.js';
import Task from '../../models/Task.js';

// Helpers para tolerar distintos formatos de respuesta
const unwrapTask = (body) => {
  if (!body) return null;
  if (body.task) return body.task;
  if (body.data && !Array.isArray(body.data)) return body.data;
  return body; // objeto plano
};

const unwrapList = (body) => {
  if (Array.isArray(body)) return body;
  if (body?.tasks && Array.isArray(body.tasks)) return body.tasks;
  if (body?.data && Array.isArray(body.data)) return body.data;
  if (body?.items && Array.isArray(body.items)) return body.items;
  return []; // por si viene vacio u otro formato
};

// Payload válido según tu schema
const buildTask = (overrides = {}) => ({
  title: 'Tarea de prueba',
  description: 'Descripción inicial',
  priority: 'ALTA',   // ajusta si usas otro enum
  completed: false,
  ...overrides,
});

describe('Tasks API – integración', () => {
  it('POST crea una tarea (201)', async () => {
    const payload = buildTask();

    const res = await request(app).post('/api/tasks').send(payload).expect(201);

    const body = unwrapTask(res.body);
    expect(body).toBeDefined();
    expect(body).toHaveProperty('_id');

    // Validamos campos principales (sin exigir "completed" si tu API no lo retorna)
    expect(body.title).toBe(payload.title);
    expect(body.description).toBe(payload.description);
    expect(body.priority).toBe(payload.priority);

    // Si tu API retorna "completed", que coincida
    if ('completed' in body) {
      expect(body.completed).toBe(payload.completed);
    }
  });

  it('GET lista tareas (200)', async () => {
    await Task.create([
      buildTask({ title: 'Tarea A', priority: 'MEDIA' }),
      buildTask({ title: 'Tarea B', priority: 'BAJA' }),
    ]);

    const res = await request(app).get('/api/tasks').expect(200);

    const list = unwrapList(res.body);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0]).toHaveProperty('_id');
    expect(list[0]).toHaveProperty('title');
  });

  it('PUT actualiza una tarea (200)', async () => {
    const task = await Task.create(buildTask({ title: 'Original' }));

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .send({ title: 'Actualizada', completed: true })
      .expect(200);

    const body = unwrapTask(res.body);
    expect(body).toBeDefined();
    expect(body).toHaveProperty('_id', task._id.toString());
    expect(body.title).toBe('Actualizada');

    // Solo verificamos "completed" si tu API lo retorna
    if ('completed' in body) {
      expect(body.completed).toBe(true);
    }
  });

  it('DELETE elimina una tarea (200/204)', async () => {
    const task = await Task.create(buildTask());

    const delRes = await request(app).delete(`/api/tasks/${task._id}`);
    expect([200, 204]).toContain(delRes.status);

    // Confirmamos que ya no aparezca en el listado
    const listRes = await request(app).get('/api/tasks').expect(200);
    const list = unwrapList(listRes.body);
    const ids = list.map((t) => t._id?.toString?.() ?? t._id);
    expect(ids).not.toContain(task._id.toString());
  });
});
