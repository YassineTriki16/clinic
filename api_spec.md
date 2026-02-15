# API Specification — Clinic Management App

Base: /api

## Patients

### GET /api/patients
List all patients

### POST /api/patients
Create patient

### GET /api/patients/:id
Get patient details

### PATCH /api/patients/:id
Update patient

### DELETE /api/patients/:id
Delete patient

---

## Appointments

### GET /api/appointments
List appointments

### POST /api/appointments
Create appointment

### PATCH /api/appointments/:id
Update appointment

### DELETE /api/appointments/:id
Cancel appointment

---

## Treatments

### GET /api/treatments?patient_id=...
List treatments for a patient

### POST /api/treatments
Add treatment record

### PATCH /api/treatments/:id
Update treatment

### DELETE /api/treatments/:id
Delete treatment

End of API Spec
