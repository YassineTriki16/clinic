import { patients as api, treatments as treatmentsApi, appointments as appointmentsApi } from './api.js';
import { showScreen, show, hide, toast } from './ui.js';
import { renderAppointmentCard } from './appointments.js';

let currentPatientId = null;
let allPatients = [];

export async function loadPatients() {
  try {
    allPatients = await api.list();
    return allPatients;
  } catch (e) {
    toast(e.message || 'Failed to load patients', true);
    return [];
  }
}

export function filterPatients(q) {
  const lower = (q || '').toLowerCase().trim();
  if (!lower) return allPatients;
  return allPatients.filter((p) => p.full_name.toLowerCase().includes(lower));
}

export function renderPatientList(patients) {
  const list = document.getElementById('patient-list');
  const empty = document.getElementById('patients-empty');
  if (!list || !empty) return;
  list.innerHTML = '';
  if (!patients.length) {
    hide(list);
    show(empty);
    return;
  }
  show(list);
  hide(empty);
  patients.forEach((p) => {
    const a = document.createElement('a');
    a.href = '#patient/' + p.id;
    a.className = 'list-item';
    a.innerHTML = `
      <span>
        <span class="list-item-name">${escapeHtml(p.full_name)}</span>
        <span class="list-item-meta">${escapeHtml(p.phone)}</span>
      </span>
    `;
    list.appendChild(a);
  });
}

export async function showPatientDetail(id) {
  currentPatientId = id;
  showScreen('patient-detail');
  const content = document.getElementById('patient-detail-content');
  if (!content) return;
  try {
    const [patient, treatments, aptList] = await Promise.all([
      api.get(id),
      treatmentsApi.list(id),
      appointmentsApi.list(),
    ]);
    const patientApts = (aptList || []).filter((a) => a.patient_id == id);
    content.innerHTML = `
      <a href="#patients" class="back-link">← Back to Patients</a>
      <div class="detail-card">
        <div class="detail-row"><span class="detail-label">Name</span><span>${escapeHtml(patient.full_name)}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span>${escapeHtml(patient.phone)}</span></div>
        ${patient.age_or_dob ? `<div class="detail-row"><span class="detail-label">Age/DOB</span><span>${escapeHtml(patient.age_or_dob)}</span></div>` : ''}
        ${patient.notes ? `<div class="detail-row"><span class="detail-label">Notes</span><span>${escapeHtml(patient.notes)}</span></div>` : ''}
        <div class="detail-actions">
          <button type="button" class="btn btn-primary btn-sm" data-action="edit-patient" data-id="${patient.id}">Edit</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="add-treatment-patient" data-id="${patient.id}">Add Treatment</button>
          <button type="button" class="btn btn-danger btn-sm" data-action="delete-patient" data-id="${patient.id}">Delete</button>
        </div>
      </div>
      <h3 class="section-title">Appointments</h3>
      <div id="patient-appointments" class="appointment-list"></div>
      <h3 class="section-title">Treatments</h3>
      <div id="patient-treatments"></div>
    `;
    const aptEl = content.querySelector('#patient-appointments');
    if (patientApts.length) {
      patientApts.forEach((a) => {
        aptEl.appendChild(renderAppointmentCard(a, { showActions: true }));
      });
    } else {
      aptEl.innerHTML = '<p class="empty-state">No appointments</p>';
    }
    const trEl = content.querySelector('#patient-treatments');
    if (treatments.length) {
      treatments.forEach((t) => {
        const div = document.createElement('div');
        div.className = 'treatment-item';
        div.innerHTML = `
          <div class="desc">${escapeHtml(t.description)}</div>
          ${t.medication ? `<div class="meta">Medication: ${escapeHtml(t.medication)}</div>` : ''}
          ${t.notes ? `<div class="meta">${escapeHtml(t.notes)}</div>` : ''}
          <div class="meta">${new Date(t.created_at).toLocaleDateString()}</div>
        `;
        trEl.appendChild(div);
      });
    } else {
      trEl.innerHTML = '<p class="empty-state">No treatments yet</p>';
    }
  } catch (e) {
    toast(e.message || 'Failed to load patient', true);
    content.innerHTML = '<p class="empty-state">Failed to load patient details.</p>';
  }
}

export function openPatientForm(id = null) {
  const title = document.getElementById('modal-patient-title');
  const form = document.getElementById('form-patient');
  const pid = document.getElementById('patient-id');
  const name = document.getElementById('patient-name');
  const phone = document.getElementById('patient-phone');
  const age = document.getElementById('patient-age');
  const notes = document.getElementById('patient-notes');
  if (!form) return;
  form.reset();
  if (id) {
    title.textContent = 'Edit Patient';
    pid.value = id;
    api.get(id).then((p) => {
      name.value = p.full_name;
      phone.value = p.phone;
      age.value = p.age_or_dob || '';
      notes.value = p.notes || '';
    });
  } else {
    title.textContent = 'Add Patient';
    pid.value = '';
  }
  document.getElementById('modal-patient').classList.remove('hidden');
}

export async function savePatient(e) {
  e.preventDefault();
  const id = document.getElementById('patient-id').value;
  const body = {
    full_name: document.getElementById('patient-name').value.trim(),
    phone: document.getElementById('patient-phone').value.trim(),
    age_or_dob: document.getElementById('patient-age').value.trim(),
    notes: document.getElementById('patient-notes').value.trim(),
  };
  if (!body.full_name) return toast('Full name is required', true);
  if (!body.phone) return toast('Phone number is required', true);
  try {
    if (id) {
      await api.update(id, body);
      toast('Patient updated');
    } else {
      await api.create(body);
      toast('Patient added');
    }
    document.getElementById('modal-patient').classList.add('hidden');
    await loadPatients();
    renderPatientList(filterPatients(document.getElementById('patient-search')?.value || ''));
    if (id && currentPatientId == id) showPatientDetail(id);
  } catch (e) {
    toast(e.message || 'Failed to save patient', true);
  }
}

export async function deletePatient(id) {
  if (!confirm('Are you sure you want to delete this patient? This will remove all related appointments and treatments.')) return;
  try {
    await api.delete(id);
    toast('Patient deleted');
    document.getElementById('modal-confirm').classList.add('hidden');
    showScreen('patients');
    loadPatients().then(() => renderPatientList(allPatients));
  } catch (e) {
    toast(e.message || 'Failed to delete patient', true);
  }
}

export function getPatients() {
  return allPatients;
}

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
