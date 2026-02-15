import { showScreen, modal, toast } from './ui.js';
import { loadPatients, renderPatientList, filterPatients, showPatientDetail, openPatientForm, savePatient, deletePatient } from './patients.js';
import { loadTodayAppointments, loadUpcomingAppointments, openAppointmentForm, saveAppointment, cancelAppointment } from './appointments.js';
import { openTreatmentForm, saveTreatment } from './treatments.js';

function route() {
  const hash = (location.hash || '#home').slice(1);
  const parts = hash.split('/');
  const screen = parts[0];
  const id = parts[1];

  document.querySelectorAll('.nav-tab').forEach((t) => {
    const tab = t.dataset.tab;
    t.classList.toggle('active', tab === screen || (screen === 'patient' && tab === 'patients'));
  });

  if (screen === 'home') {
    showScreen('home');
    loadTodayAppointments();
  } else if (screen === 'patients') {
    showScreen('patients');
    loadPatients().then(() => renderPatientList(filterPatients(document.getElementById('patient-search')?.value || '')));
  } else if (screen === 'patient' && id) {
    showPatientDetail(id);
  } else if (screen === 'appointments') {
    showScreen('appointments');
    loadUpcomingAppointments();
  } else {
    showScreen('home');
    loadTodayAppointments();
  }
}

function handleClick(e) {
  const action = e.target.closest('[data-action]')?.dataset?.action;
  const id = e.target.closest('[data-id]')?.dataset?.id;
  if (!action) return;

  e.preventDefault();

  switch (action) {
    case 'add-patient':
      openPatientForm();
      break;
    case 'add-appointment':
      openAppointmentForm(null, id);
      break;
    case 'add-treatment-patient':
      openTreatmentForm(id || null);
      break;
    case 'edit-patient':
      openPatientForm(id);
      break;
    case 'delete-patient':
      if (confirm('Are you sure you want to delete this patient? All appointments and treatments will be removed.')) {
        deletePatient(id);
      }
      break;
    case 'edit-appointment':
      openAppointmentForm(id);
      break;
    case 'cancel-appointment':
      cancelAppointment(id);
      break;
    case 'close-modal':
      document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
      break;
  }
}

function init() {
  window.addEventListener('hashchange', route);
  route();

  document.addEventListener('click', handleClick);

  document.getElementById('patient-search')?.addEventListener('input', (e) => {
    renderPatientList(filterPatients(e.target.value));
  });

  document.getElementById('form-patient')?.addEventListener('submit', savePatient);
  document.getElementById('form-appointment')?.addEventListener('submit', saveAppointment);
  document.getElementById('form-treatment')?.addEventListener('submit', saveTreatment);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

init();
