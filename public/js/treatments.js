import { treatments as treatmentsApi } from './api.js';
import { patients as patientsApi } from './api.js';
import { appointments as appointmentsApi } from './api.js';
import { toast } from './ui.js';
import { showPatientDetail } from './patients.js';

export function openTreatmentForm(patientId = null, appointmentId = null) {
  const title = document.getElementById('modal-treatment-title');
  const form = document.getElementById('form-treatment');
  const tid = document.getElementById('treatment-id');
  const pidEl = document.getElementById('treatment-patient-id');
  const patientSel = document.getElementById('treatment-patient');
  const desc = document.getElementById('treatment-description');
  const med = document.getElementById('treatment-medication');
  const notes = document.getElementById('treatment-notes');
  const aptSel = document.getElementById('treatment-appointment');
  if (!form) return;
  form.reset();
  tid.value = '';
  patientsApi.list().then((patients) => {
    patientSel.innerHTML = patients.map((p) => `<option value="${p.id}" ${p.id == patientId ? 'selected' : ''}>${escapeHtml(p.full_name)}</option>`).join('');
    if (patientId) {
      pidEl.value = patientId;
      appointmentsApi.list().then((apts) => {
        const patientApts = (apts || []).filter((a) => a.patient_id == patientId && a.status !== 'CANCELLED');
        aptSel.innerHTML = '<option value="">None</option>' + patientApts.map((a) =>
          `<option value="${a.id}" ${a.id == appointmentId ? 'selected' : ''}>${formatApt(a)}</option>`
        ).join('');
      });
    } else {
      pidEl.value = '';
      aptSel.innerHTML = '<option value="">None</option>';
    }
  });
  title.textContent = 'Add Treatment';
  document.getElementById('modal-treatment').classList.remove('hidden');
}

function formatApt(a) {
  const d = new Date(a.datetime);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + (a.reason ? ' - ' + a.reason : '');
}

export async function saveTreatment(e) {
  e.preventDefault();
  const id = document.getElementById('treatment-id').value;
  const patientId = document.getElementById('treatment-patient').value;
  const body = {
    patient_id: parseInt(patientId, 10),
    appointment_id: document.getElementById('treatment-appointment').value || null,
    description: document.getElementById('treatment-description').value.trim(),
    medication: document.getElementById('treatment-medication').value.trim(),
    notes: document.getElementById('treatment-notes').value.trim(),
  };
  if (!body.patient_id) return toast('Patient is required', true);
  if (!body.description) return toast('Description is required', true);
  try {
    if (id) {
      await treatmentsApi.update(id, body);
      toast('Treatment updated');
    } else {
      await treatmentsApi.create(body);
      toast('Treatment added');
    }
    document.getElementById('modal-treatment').classList.add('hidden');
    showPatientDetail(patientId);
  } catch (e) {
    toast(e.message || 'Failed to save treatment', true);
  }
}

function escapeHtml(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
