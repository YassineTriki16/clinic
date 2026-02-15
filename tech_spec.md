# Technical Specification

## 1. Data Models (Conceptual)

### Patient
- id (PK)
- full_name
- phone
- age_or_dob
- notes
- created_at

### Appointment
- id (PK)
- patient_id (FK)
- datetime
- reason
- status (SCHEDULED / COMPLETED / CANCELLED)
- created_at

### Treatment
- id (PK)
- patient_id (FK)
- appointment_id (optional FK)
- description
- medication
- notes
- created_at

---

## 2. Validation Rules

Patient:
- Name required
- Phone required

Appointment:
- Patient required
- Date/time required

Treatment:
- Patient required
- Description required

---

## 3. Mobile UX Requirements

- Large touch targets
- Minimal typing required
- Clear navigation
- Fast load time

---

## 4. Repository Size Optimization

- Minimal dependencies
- No large UI libraries unless necessary
- Avoid unnecessary assets
- Exclude build output

End of Technical Spec
