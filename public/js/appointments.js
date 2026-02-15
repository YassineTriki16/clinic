import { appointments as api } from './api.js';
import { patients as patientsApi } from './api.js';
import { showScreen, show, hide, formatDate, formatTime, todayStr, toast } from './ui.js';
import { loadPatients, getPatients } from './patients.js';

export function renderAppointmentCard(apt, opts = {}) {
  const div = document.createElement('div');
  div.className = 'appointment-card' + (apt.status === 'CANCELLED' ? ' cancelled' : '');
  div.innerHTML = `
    <div class="time">${formatTime(apt.datetime)}</div>
    <div class="patient">${escapeHtml(apt.patient_name || 'Patient')}</div>
    ${apt.reason ? `<div class="reason">${escapeHtml(apt.reason)}</div>` : ''}
    <div class="status">${apt.status}</div>
  `;
  if (opts.showActions && apt.status === 'SCHEDULED') {
    const actions = document.createElement('div');
    actions.className = 'detail-actions';
    actions.style.marginTop = '0.5rem';
    actions.innerHTML = `
      <button type="button" class="btn btn-primary btn-sm" data-action="edit-appointment" data-id="${apt.id}">Edit</button>
      <button type="button" class="btn btn-danger btn-sm" data-action="cancel-appointment" data-id="${apt.id}">Cancel</button>
    `;
    div.appendChild(actions);
  }
  if (apt.status !== 'CANCELLED' && !opts.hideLink) {
    div.style.cursor = 'pointer';
    div.addEventListener('click', (e) => {
      if (!e.target.closest('button')) location.hash = '#patient/' + apt.patient_id;
    });
  }
  return div;
}

export async function loadTodayAppointments() {
  try {
    const list = await api.list({ date: todayStr() });
    const container = document.getElementById('today-list');
    const empty = document.getElementById('today-empty');
    if (!container || !empty) return;
    container.innerHTML = '';
    const scheduled = (list || []).filter((a) => a.status === 'SCHEDULED');
    if (!scheduled.length) {
      show(empty);
      return;
    }
    hide(empty);
    scheduled.forEach((a) => container.appendChild(renderAppointmentCard(a, { hideLink: false })));
  } catch (e) {
    document.getElementById('today-empty')?.classList.remove('hidden');
  }
}

export async function loadUpcomingAppointments() {
  try {
    const list = await api.list({ upcoming: 'true' });
    const container = document.getElementById('appointment-list');
    const empty = document.getElementById('appointments-empty');
    if (!container || !empty) return;
    container.innerHTML = '';
    if (!list || !list.length) {
      show(empty);
      return;
    }
    hide(empty);
    list.forEach((a) => container.appendChild(renderAppointmentCard(a, { showActions: true })));
  } catch (e) {
    document.getElementById('appointments-empty')?.classList.remove('hidden');
  }
}

export function openAppointmentForm(id = null, patientId = null) {
  const title = document.getElementById('modal-appointment-title');
  const form = document.getElementById('form-appointment');
  const aid = document.getElementById('appointment-id');
  const sel = document.getElementById('appointment-patient');
  const dt = document.getElementById('appointment-datetime');
  const reason = document.getElementById('appointment-reason');
  if (!form) return;
  form.reset();
  patientsApi.list().then((patients) => {
    sel.innerHTML = patients.map((p) => `<option value="${p.id}" ${p.id == patientId ? 'selected' : ''}>${escapeHtml(p.full_name)}</option>`).join('');
    if (id) {
      title.textContent = 'Edit Appointment';
      aid.value = id;
      api.get(id).then((a) => {
        sel.value = a.patient_id;
        if (a.datetime) {
          const d = new Date(a.datetime);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          dt.value = d.toISOString().slice(0, 16);
        }
        reason.value = a.reason || '';
      });
    } else {
      title.textContent = 'Add Appointment';
      aid.value = '';
      if (patientId) sel.value = patientId;
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dt.value = now.toISOString().slice(0, 16);
    }
    document.getElementById('modal-appointment').classList.remove('hidden');
  });
}

export async function saveAppointment(e) {
  e.preventDefault();
  const id = document.getElementById('appointment-id').value;
  const body = {
    patient_id: parseInt(document.getElementById('appointment-patient').value, 10),
    datetime: document.getElementById('appointment-datetime').value,
    reason: document.getElementById('appointment-reason').value.trim(),
  };
  if (!body.patient_id) return toast('Patient is required', true);
  if (!body.datetime) return toast('Date and time are required', true);
  try {
    if (id) {
      await api.update(id, body);
      toast('Appointment updated');
    } else {
      await api.create(body);
      toast('Appointment added');
    }
    document.getElementById('modal-appointment').classList.add('hidden');
    await loadTodayAppointments();
    await loadUpcomingAppointments();
  } catch (e) {
    toast(e.message || 'Failed to save appointment', true);
  }
}

export async function cancelAppointment(id) {
  if (!confirm('Cancel this appointment?')) return;
  try {
    await api.cancel(id);
    toast('Appointment cancelled');
    loadTodayAppointments();
    loadUpcomingAppointments();
  } catch (e) {
    toast(e.message || 'Failed to cancel appointment', true);
  }
}

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
