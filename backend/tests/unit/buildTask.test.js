import { buildTask } from '../../utils/task.utils.js';

describe('buildTask', () => {
  test('defaults', () => {
    const t = buildTask({ title: 'Comprar leche' });
    expect(t.title).toBe('Comprar leche');
    expect(t.description).toBe('');
    expect(t.priority).toBe('MEDIA');
    expect(t.dueDate).toBeNull();
    expect(t.done).toBe(false);
    expect(typeof t.createdAt).toBe('string');
  });

  test('lanza error si payload inválido', () => {
    expect(() => buildTask({})).toThrow(/Payload inválido/);
  });

  test('respeta campos válidos', () => {
    const t = buildTask({
      title: 'Pago luz',
      description: 'antes del viernes',
      priority: 'alta',
      dueDate: '2025-10-01',
      done: true
    });
    expect(t.priority).toBe('ALTA');
    expect(t.description).toBe('antes del viernes');
    expect(t.done).toBe(true);
    expect(typeof t.createdAt).toBe('string');
  });
});
