# Mobile-First Clinic Management App — Leorio's Clinic

A lightweight mobile-first application to manage patients, appointments, and treatments for a single doctor. Designed for smartphone use and jury evaluation.

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd clinic

# Install dependencies
npm install

# Start the server
npm start
```

Open **http://localhost:3000** in your browser. For mobile testing, use your phone on the same network and visit `http://<your-computer-ip>:3000`.

## Usage

### Home
- View today's appointments at the top
- Use "Add Patient" or "Add Appointment" for quick actions

### Patients
- Search by name in the search bar
- Tap a patient to view details, appointments, and treatments
- Add, edit, or delete patients (delete asks for confirmation)

### Appointments
- View upcoming scheduled appointments
- Add appointments with patient, date/time, and optional reason
- Edit or cancel appointments from the list or patient detail

### Treatments
- Add treatments from the patient detail screen (+ button)
- Link treatments to appointments optionally
- Required: patient and description; optional: medication, notes

## Design Decisions

1. **Vanilla JS** — No React/Vue to keep dependencies minimal and the repo small for jury download.

2. **SQLite** — File-based database (`clinic.db`). No extra setup; data persists in the project folder.

3. **Hash routing** — URLs like `#patients`, `#patient/123` enable navigation without a build step or server-side routes.

4. **No build step** — Plain HTML, CSS, and JS. Edit and refresh; no webpack or Vite.

5. **PWA** — `manifest.json` and a basic service worker for caching; works best over HTTPS (e.g. localhost or ngrok).

6. **Touch targets** — Buttons and links use at least 44px height for mobile usability.

## Key Features

- Patient management (CRUD, search by name)
- Appointment scheduling (create, edit, cancel)
- Treatment tracking per patient
- Mobile-first UI with touch-friendly controls
- Today's appointments shown on the home screen

## Documents

- [PRD.md](PRD.md) — Product requirements
- [architecture.md](architecture.md) — System design
- [tech_spec.md](tech_spec.md) — Data models
- [api_spec.md](api_spec.md) — API endpoints
### Appointments
- View upcoming scheduled appointments
- Add appointments with patient, date/time, and optional reason
- Edit or cancel appointments from the list or patient detail

### Treatments
- Add treatments from the patient detail screen (+ button)
- Link treatments to appointments optionally
- Required: patient and description; optional: medication, notes

## Design Decisions

1. **Vanilla JS** — No React/Vue to keep dependencies minimal and the repo small for jury download.

2. **SQLite** — File-based database (`clinic.db`). No extra setup; data persists in the project folder.

3. **Hash routing** — URLs like `#patients`, `#patient/123` enable navigation without a build step or server-side routes.

4. **No build step** — Plain HTML, CSS, and JS. Edit and refresh; no webpack or Vite.

5. **PWA** — `manifest.json` and a basic service worker for caching; works best over HTTPS (e.g. localhost or ngrok).

6. **Touch targets** — Buttons and links use at least 44px height for mobile usability.

## Key Features

- Patient management (CRUD, search by name)
- Appointment scheduling (create, edit, cancel)
- Treatment tracking per patient
- Mobile-first UI with touch-friendly controls
- Today's appointments shown on the home screen

## Documents

- [PRD.md](PRD.md) — Product requirements
- [architecture.md](architecture.md) — System design
- [tech_spec.md](tech_spec.md) — Data models
- [api_spec.md](api_spec.md) — API endpoints
