import { validateTaskPayload } from '../../utils/task.utils.js';

describe('validateTaskPayload', () => {
  test('falta title', () => {
    const { ok, errors } = validateTaskPayload({});
    expect(ok).toBe(false);
    expect(errors.find(e => e.field === 'title')).toBeTruthy();
  });

  test('mínimo válido + priority=MEDIA', () => {
    const { ok, value } = validateTaskPayload({ title: '  Hacer tarea  ' });
    expect(ok).toBe(true);
    expect(value.title).toBe('Hacer tarea');
    expect(value.priority).toBe('MEDIA');
  });

  test('priority inválida', () => {
    const { ok, errors } = validateTaskPayload({ title: 'X', priority: 'urgente' });
    expect(ok).toBe(false);
    expect(errors.find(e => e.field === 'priority')).toBeTruthy();
  });

  test('priority válida y normalizada', () => {
    const { ok, value } = validateTaskPayload({ title: 'X', priority: 'high' });
    expect(ok).toBe(true);
    expect(value.priority).toBe('ALTA');
  });

  test('dueDate inválida', () => {
    const { ok, errors } = validateTaskPayload({ title: 'X', dueDate: 'fecha-mala' });
    expect(ok).toBe(false);
    expect(errors.find(e => e.field === 'dueDate')).toBeTruthy();
  });

  test('dueDate válida', () => {
    const { ok, value } = validateTaskPayload({ title: 'X', dueDate: '2025-12-31' });
    expect(ok).toBe(true);
    expect(typeof value.dueDate).toBe('string');
  });

  test('done debe ser boolean', () => {
    const { ok, errors } = validateTaskPayload({ title: 'X', done: 'si' });
    expect(ok).toBe(false);
    expect(errors.find(e => e.field === 'done')).toBeTruthy();
  });
});
