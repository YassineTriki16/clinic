const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function json(res, data, status = 200) {
  res.status(status).json(data);
}

function error(res, message, status = 400) {
  res.status(status).json({ error: message });
}

function normalizeDatetime(dt) {
  if (!dt || typeof dt !== 'string') return dt;
  return dt.trim().replace('T', ' ').replace(/(\d{2}:\d{2})(?::\d{2})?$/, (_, m) => m + ':00');
}

// --- Patients ---
app.get('/api/patients', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM patients ORDER BY full_name').all();
    json(res, rows);
  } catch (e) {
    error(res, 'Failed to list patients', 500);
  }
});

app.post('/api/patients', (req, res) => {
  const { full_name, phone, age_or_dob, notes } = req.body || {};
  if (!full_name || !full_name.trim()) return error(res, 'Full name is required');
  if (!phone || !phone.trim()) return error(res, 'Phone number is required');
  try {
    const result = db.prepare(
      'INSERT INTO patients (full_name, phone, age_or_dob, notes) VALUES (?, ?, ?, ?)'
    ).run(full_name.trim(), phone.trim(), (age_or_dob || '').trim(), (notes || '').trim());
    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
    json(res, row, 201);
  } catch (e) {
    error(res, 'Failed to create patient', 500);
  }
});

app.get('/api/patients/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!row) return error(res, 'Patient not found', 404);
  json(res, row);
});

app.patch('/api/patients/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!row) return error(res, 'Patient not found', 404);
  const { full_name, phone, age_or_dob, notes } = req.body || {};
  if (full_name !== undefined && !full_name.trim()) return error(res, 'Full name cannot be empty');
  if (phone !== undefined && !phone.trim()) return error(res, 'Phone number cannot be empty');
  const name = full_name !== undefined ? full_name.trim() : row.full_name;
  const ph = phone !== undefined ? phone.trim() : row.phone;
  const age = age_or_dob !== undefined ? age_or_dob.trim() : row.age_or_dob;
  const n = notes !== undefined ? notes.trim() : row.notes;
  try {
    db.prepare(
      'UPDATE patients SET full_name = ?, phone = ?, age_or_dob = ?, notes = ? WHERE id = ?'
    ).run(name, ph, age, n, req.params.id);
    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    json(res, updated);
  } catch (e) {
    error(res, 'Failed to update patient', 500);
  }
});

app.delete('/api/patients/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!row) return error(res, 'Patient not found', 404);
  try {
    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    json(res, { success: true });
  } catch (e) {
    error(res, 'Failed to delete patient', 500);
  }
});

// --- Appointments ---
app.get('/api/appointments', (req, res) => {
  try {
    let sql = `
      SELECT a.*, p.full_name as patient_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];
    if (req.query.date) {
      sql += ` AND substr(REPLACE(a.datetime, 'T', ' '), 1, 10) = ?`;
      params.push(req.query.date);
    }
    if (req.query.upcoming === 'true') {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      sql += ` AND substr(REPLACE(a.datetime, 'T', ' '), 1, 10) >= ? AND a.status = 'SCHEDULED'`;
      params.push(today);
    }
    sql += ` ORDER BY a.datetime ASC`;
    const rows = db.prepare(sql).all(...params);
    json(res, rows);
  } catch (e) {
    error(res, 'Failed to list appointments', 500);
  }
});

app.get('/api/appointments/:id', (req, res) => {
  const row = db.prepare(`
    SELECT a.*, p.full_name as patient_name FROM appointments a
    JOIN patients p ON a.patient_id = p.id WHERE a.id = ?
  `).get(req.params.id);
  if (!row) return error(res, 'Appointment not found', 404);
  json(res, row);
});

app.post('/api/appointments', (req, res) => {
  const { patient_id, datetime, reason, status } = req.body || {};
  if (!patient_id) return error(res, 'Patient is required');
  if (!datetime || !datetime.trim()) return error(res, 'Date and time are required');
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
  if (!patient) return error(res, 'Patient not found');
  const st = status || 'SCHEDULED';
  if (!['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(st)) return error(res, 'Invalid status');
  try {
    const result = db.prepare(
      'INSERT INTO appointments (patient_id, datetime, reason, status) VALUES (?, ?, ?, ?)'
    ).run(patient_id, normalizeDatetime(datetime), (reason || '').trim(), st);
    const row = db.prepare(`
      SELECT a.*, p.full_name as patient_name FROM appointments a
      JOIN patients p ON a.patient_id = p.id WHERE a.id = ?
    `).get(result.lastInsertRowid);
    json(res, row, 201);
  } catch (e) {
    error(res, 'Failed to create appointment', 500);
  }
});

app.patch('/api/appointments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return error(res, 'Appointment not found', 404);
  const { patient_id, datetime, reason, status } = req.body || {};
  if (datetime !== undefined && !datetime.trim()) return error(res, 'Date and time cannot be empty');
  if (patient_id !== undefined) {
    const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
    if (!p) return error(res, 'Patient not found');
  }
  if (status !== undefined && !['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return error(res, 'Invalid status');
  }
  const pid = patient_id !== undefined ? patient_id : row.patient_id;
  const dt = datetime !== undefined ? normalizeDatetime(datetime) : row.datetime;
  const r = reason !== undefined ? reason.trim() : row.reason;
  const st = status !== undefined ? status : row.status;
  try {
    db.prepare(
      'UPDATE appointments SET patient_id = ?, datetime = ?, reason = ?, status = ? WHERE id = ?'
    ).run(pid, dt, r, st, req.params.id);
    const updated = db.prepare(`
      SELECT a.*, p.full_name as patient_name FROM appointments a
      JOIN patients p ON a.patient_id = p.id WHERE a.id = ?
    `).get(req.params.id);
    json(res, updated);
  } catch (e) {
    error(res, 'Failed to update appointment', 500);
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!row) return error(res, 'Appointment not found', 404);
  try {
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run('CANCELLED', req.params.id);
    const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    json(res, updated);
  } catch (e) {
    error(res, 'Failed to cancel appointment', 500);
  }
});

// --- Treatments ---
app.get('/api/treatments', (req, res) => {
  const patient_id = req.query.patient_id;
  if (!patient_id) return error(res, 'patient_id query parameter is required');
  try {
    const rows = db.prepare(`
      SELECT t.*, a.datetime as appointment_datetime, a.reason as appointment_reason
      FROM treatments t
      LEFT JOIN appointments a ON t.appointment_id = a.id
      WHERE t.patient_id = ?
      ORDER BY t.created_at DESC
    `).all(patient_id);
    json(res, rows);
  } catch (e) {
    error(res, 'Failed to list treatments', 500);
  }
});

app.post('/api/treatments', (req, res) => {
  const { patient_id, appointment_id, description, medication, notes } = req.body || {};
  if (!patient_id) return error(res, 'Patient is required');
  if (!description || !description.trim()) return error(res, 'Treatment description is required');
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
  if (!patient) return error(res, 'Patient not found');
  if (appointment_id) {
    const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointment_id);
    if (!apt) return error(res, 'Appointment not found');
  }
  try {
    const result = db.prepare(
      'INSERT INTO treatments (patient_id, appointment_id, description, medication, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(
      patient_id,
      appointment_id || null,
      description.trim(),
      (medication || '').trim(),
      (notes || '').trim()
    );
    const row = db.prepare('SELECT * FROM treatments WHERE id = ?').get(result.lastInsertRowid);
    json(res, row, 201);
  } catch (e) {
    error(res, 'Failed to create treatment', 500);
  }
});

app.patch('/api/treatments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM treatments WHERE id = ?').get(req.params.id);
  if (!row) return error(res, 'Treatment not found', 404);
  const { patient_id, appointment_id, description, medication, notes } = req.body || {};
  if (description !== undefined && !description.trim()) return error(res, 'Description cannot be empty');
  if (patient_id !== undefined) {
    const p = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
    if (!p) return error(res, 'Patient not found');
  }
  const pid = patient_id !== undefined ? patient_id : row.patient_id;
  const aid = appointment_id !== undefined ? appointment_id : row.appointment_id;
  const desc = description !== undefined ? description.trim() : row.description;
  const med = medication !== undefined ? medication.trim() : row.medication;
  const n = notes !== undefined ? notes.trim() : row.notes;
  try {
    db.prepare(
      'UPDATE treatments SET patient_id = ?, appointment_id = ?, description = ?, medication = ?, notes = ? WHERE id = ?'
    ).run(pid, aid, desc, med, n, req.params.id);
    const updated = db.prepare('SELECT * FROM treatments WHERE id = ?').get(req.params.id);
    json(res, updated);
  } catch (e) {
    error(res, 'Failed to update treatment', 500);
  }
});

app.delete('/api/treatments/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM treatments WHERE id = ?').get(req.params.id);
  if (!row) return error(res, 'Treatment not found', 404);
  try {
    db.prepare('DELETE FROM treatments WHERE id = ?').run(req.params.id);
    json(res, { success: true });
  } catch (e) {
    error(res, 'Failed to delete treatment', 500);
  }
});

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Clinic app running at http://localhost:${PORT}`);
});
