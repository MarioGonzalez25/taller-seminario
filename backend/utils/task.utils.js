export const PRIORITIES = ['BAJA', 'MEDIA', 'ALTA'];

export function normalizePriority(input) {
  if (input === undefined || input === null) return null;
  const raw = String(input).trim().toLowerCase();
  const map = new Map([
    ['baja', 'BAJA'], ['low', 'BAJA'], ['l', 'BAJA'], ['1', 'BAJA'],
    ['media', 'MEDIA'], ['medium', 'MEDIA'], ['m', 'MEDIA'], ['2', 'MEDIA'],
    ['alta', 'ALTA'], ['high', 'ALTA'], ['h', 'ALTA'], ['3', 'ALTA']
  ]);
  return map.get(raw) || null;
}

export function validateTaskPayload(payload = {}) {
  const errors = [];
  const value = {};

  if (typeof payload.title !== 'string' || !payload.title.trim()) {
    errors.push({ field: 'title', message: 'title es obligatorio' });
  } else {
    value.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    if (typeof payload.description !== 'string') {
      errors.push({ field: 'description', message: 'description debe ser string' });
    } else value.description = payload.description;
  }

  if (payload.priority === undefined || payload.priority === null || payload.priority === '') {
    value.priority = 'MEDIA';
  } else {
    const p = normalizePriority(payload.priority);
    if (!p) errors.push({ field: 'priority', message: 'priority inválida' });
    else value.priority = p;
  }

  if (payload.dueDate !== undefined) {
    const d = new Date(payload.dueDate);
    if (Number.isNaN(d.getTime())) errors.push({ field: 'dueDate', message: 'dueDate inválida' });
    else value.dueDate = d.toISOString();
  }

  if (payload.done !== undefined) {
    if (typeof payload.done !== 'boolean') errors.push({ field: 'done', message: 'done debe ser boolean' });
    else value.done = payload.done;
  }

  return { ok: errors.length === 0, errors, value };
}

export function buildTask(payload = {}) {
  const { ok, errors, value } = validateTaskPayload(payload);
  if (!ok) {
    const msg = errors.map(e => `${e.field}: ${e.message}`).join('; ');
    throw new Error(`Payload inválido — ${msg}`);
  }
  return {
    title: value.title,
    description: value.description ?? '',
    priority: value.priority,
    dueDate: value.dueDate ?? null,
    done: value.done ?? false,
    createdAt: new Date().toISOString()
  };
}
