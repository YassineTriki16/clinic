const API = '/api';

async function req(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const patients = {
  list: () => req('/patients'),
  get: (id) => req(`/patients/${id}`),
  create: (body) => req('/patients', { method: 'POST', body }),
  update: (id, body) => req(`/patients/${id}`, { method: 'PATCH', body }),
  delete: (id) => req(`/patients/${id}`, { method: 'DELETE' }),
};

export const appointments = {
  get: (id) => req(`/appointments/${id}`),
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req('/appointments' + (q ? '?' + q : ''));
  },
  create: (body) => req('/appointments', { method: 'POST', body }),
  update: (id, body) => req(`/appointments/${id}`, { method: 'PATCH', body }),
  cancel: (id) => req(`/appointments/${id}`, { method: 'DELETE' }),
};

export const treatments = {
  list: (patientId) => req(`/treatments?patient_id=${patientId}`),
  create: (body) => req('/treatments', { method: 'POST', body }),
  update: (id, body) => req(`/treatments/${id}`, { method: 'PATCH', body }),
  delete: (id) => req(`/treatments/${id}`, { method: 'DELETE' }),
};
