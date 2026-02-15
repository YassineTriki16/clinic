# Product Requirements Document (PRD)
## Mobile-First Clinic Management App — Leorio's Clinic

### 1. Overview
Leorio has opened a busy medical clinic and needs a **mobile-first application** to manage patients, appointments, and treatments using only his phone.

The system must work primarily on mobile devices (small screens, touch input) and allow efficient day-to-day clinic operations.

This project will be submitted via GitHub and downloaded by juries, so the repository must remain lightweight.

---

### 2. Goals

#### Primary Goals
1. Manage patient records
2. Schedule and manage appointments
3. Track treatments for each patient
4. Provide a clean mobile-first interface
5. Allow quick access during daily clinic workflow
6. Keep project size small for evaluation

#### Non-Goals
- Billing / insurance processing
- Multi-doctor support (single doctor sufficient)
- Hospital-scale features
- Desktop-only design
- Complex analytics

---

### 3. Target User
Single primary user:

**Leorio (Doctor / Clinic Owner)**

Optional future users:
- Assistants
- Nurses

---

### 4. Functional Requirements

#### FR-1: Patient Management
Doctor must be able to:

- Create new patient records
- View list of patients
- View patient details
- Edit patient information
- Delete patient (optional but recommended)

Required patient fields:

- Full name (required)
- Phone number (required)
- Age or date of birth (optional)
- Notes / medical history (optional)
- Creation date (auto)

---

#### FR-2: Appointment Scheduling
Doctor must be able to:

- Create appointments for patients
- Assign date and time
- View upcoming appointments
- View past appointments
- Cancel or reschedule appointments

Appointment fields:

- Patient reference (required)
- Date & time (required)
- Reason (optional)
- Status (Scheduled / Completed / Cancelled)

---

#### FR-3: Treatment Tracking
Doctor must be able to record treatments per patient.

Treatment entry fields:

- Patient reference
- Appointment reference (optional)
- Treatment description (required)
- Prescribed medication (optional)
- Notes (optional)
- Date (auto or selected)

---

#### FR-4: Mobile-First UX
Application must:

- Be optimized for phone screens
- Use touch-friendly controls
- Support quick navigation
- Avoid clutter
- Load quickly

---

#### FR-5: Search & Quick Access
Doctor must be able to:

- Search patients by name
- Quickly access patient history
- See today's appointments prominently

---

#### FR-6: Error Handling
Provide clear messages for:

- Missing required fields
- Invalid inputs
- Failed operations

---

### 5. Non-Functional Requirements

#### NFR-1: Mobile-First Requirement
- Designed primarily for smartphone use
- Responsive layout required
- Usable on small screens
- Fast interactions

#### NFR-2: Lightweight Repository
Because juries will download the project:

- Avoid heavy dependencies
- Prefer lightweight frameworks or minimal stack
- Exclude build artifacts and node_modules
- Simple setup

#### NFR-3: Reliability
- Data operations must be consistent
- Prevent accidental data loss (confirm deletes)

---

### 6. Acceptance Criteria

1. Doctor can add, edit, and view patients
2. Doctor can schedule appointments
3. Doctor can track treatments per patient
4. Mobile UI is usable on phone screens
5. Search functionality works
6. Repository remains lightweight
7. App supports daily clinic workflow

End of PRD
