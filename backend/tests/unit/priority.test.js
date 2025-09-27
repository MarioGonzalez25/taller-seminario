import { normalizePriority } from '../../utils/task.utils.js';

describe('normalizePriority', () => {
  test('ALTA', () => {
    expect(normalizePriority('alta')).toBe('ALTA');
    expect(normalizePriority('High')).toBe('ALTA');
    expect(normalizePriority('h')).toBe('ALTA');
    expect(normalizePriority(3)).toBe('ALTA');
  });
  test('MEDIA', () => {
    expect(normalizePriority('media')).toBe('MEDIA');
    expect(normalizePriority('medium')).toBe('MEDIA');
    expect(normalizePriority('m')).toBe('MEDIA');
    expect(normalizePriority(2)).toBe('MEDIA');
  });
  test('BAJA', () => {
    expect(normalizePriority('baja')).toBe('BAJA');
    expect(normalizePriority('low')).toBe('BAJA');
    expect(normalizePriority('l')).toBe('BAJA');
    expect(normalizePriority(1)).toBe('BAJA');
  });
  test('desconocido => null', () => {
    expect(normalizePriority('urgente')).toBeNull();
    expect(normalizePriority('')).toBeNull();
    expect(normalizePriority(undefined)).toBeNull();
  });
});
