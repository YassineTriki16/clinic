# System Architecture — Mobile Clinic App

## 1. Application Type

Mobile-first application.

Recommended options:

- Progressive Web App (PWA) — ideal for lightweight mobile use
OR
- Minimal mobile framework solution

Must not require desktop usage.

---

## 2. Core Components

1) Mobile UI
   - Patient list & details
   - Appointment scheduler
   - Treatment records

2) Backend API
   - Data storage & business logic
   - CRUD operations

3) Database
   - Patients
   - Appointments
   - Treatments

---

## 3. Data Relationships

Patient → has many → Appointments  
Patient → has many → Treatments  
Appointment → belongs to → Patient  

---

## 4. Suggested Screens

### Home Dashboard
- Today's appointments
- Quick actions:
  - Add patient
  - Add appointment

### Patients
- List view
- Search bar
- Patient detail screen

### Appointments
- Upcoming list
- Calendar-style or chronological view

### Treatments
- Patient-specific treatment history

---

## 5. Offline Considerations (Optional)
Basic offline capability is beneficial but not required.

---

## 6. Security (Basic)
- No sensitive data exposure
- Basic input validation

End of Architecture
