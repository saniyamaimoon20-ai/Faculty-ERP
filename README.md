# Faculty Class Engagement Portal — Complete Backend

This is your **entire project**, merged: your original Faculty module +
the new Department / Subject / Room / Timetable / Room Allocation /
Biometric Attendance / Faculty Location / Admin module. Every file is
already in the folder it needs to be in — nothing to merge by hand.

## Folder structure (this is exactly what you should have)

```
Faculty_Database/
├── .env.example
├── package.json
├── server.js
├── config/
│   └── db.js
├── models/
│   ├── facultyModel.js
│   ├── departmentModel.js
│   ├── subjectModel.js
│   ├── roomModel.js
│   ├── timetableModel.js
│   ├── roomAllocationModel.js
│   ├── biometricLogModel.js
│   ├── attendanceModel.js
│   ├── facultyLocationModel.js
│   └── adminModel.js
├── controllers/
│   ├── facultyController.js
│   ├── departmentController.js
│   ├── subjectController.js
│   ├── roomController.js
│   ├── timetableController.js
│   ├── roomAllocationController.js
│   ├── biometricLogController.js
│   ├── attendanceController.js
│   ├── facultyLocationController.js
│   └── adminController.js
├── routes/
│   ├── facultyRoutes.js
│   ├── departmentRoutes.js
│   ├── subjectRoutes.js
│   ├── roomRoutes.js
│   ├── timetableRoutes.js
│   ├── roomAllocationRoutes.js
│   ├── biometricLogRoutes.js
│   ├── attendanceRoutes.js
│   ├── facultyLocationRoutes.js
│   └── adminRoutes.js
├── middleware/
│   └── authenticate.js
├── utils/
│   └── handleDbError.js
└── sql/
    ├── 01_schema.sql
    ├── 02_procedures.sql
    ├── 03_seed_data.sql
    ├── 04_schema_extended.sql
    ├── 05_procedures_extended.sql
    └── 06_seed_data_extended.sql
```

## Step 1 — Replace your project folder

Delete your current `Faculty Database` folder's contents (or just work in
this one instead) so there's no risk of duplicate/half-updated files.

## Step 2 — Set up `.env`

Copy `.env.example` to `.env` and fill in your real MySQL password:

```bash
cp .env.example .env
```

## Step 3 — Install dependencies

```bash
npm install
npm install bcrypt jsonwebtoken
```

## Step 4 — Run the SQL, in this exact numbered order

In VS Code's terminal, from the `sql/` folder:

```bash
cd sql
mysql -u root -p < 01_schema.sql
mysql -u root -p < 02_procedures.sql
mysql -u root -p < 03_seed_data.sql
mysql -u root -p < 04_schema_extended.sql
mysql -u root -p < 05_procedures_extended.sql
mysql -u root -p < 06_seed_data_extended.sql
cd ..
```

Verify it worked:
```sql
mysql -u root -p
USE faculty_engagement_portal;
SHOW TABLES;
```
You should see: `faculty`, `department`, `subject`, `room`, `timetable`,
`room_allocation`, `biometric_log`, `attendance`, `admin`.

## Step 5 — Start the server

```bash
node server.js
```

Expected output:
```
Faculty Portal API running on http://localhost:4000
```

## Step 6 — Test it

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/faculty
curl http://localhost:4000/api/departments
```

## Endpoint reference

| Resource | Routes |
|---|---|
| Faculty | `GET/POST /api/faculty`, `GET/PUT /api/faculty/:id`, `PATCH /api/faculty/:id/deactivate`, `PATCH /api/faculty/:id/reactivate`, `DELETE /api/faculty/:id` |
| Department | `GET/POST /api/departments`, `GET/PUT/DELETE /api/departments/:id` |
| Subject | `GET/POST /api/subjects`, `GET/PUT/DELETE /api/subjects/:id` |
| Room | `GET/POST /api/rooms`, `GET/PUT/DELETE /api/rooms/:id` |
| Timetable | `POST /api/timetable`, `GET/PUT/DELETE /api/timetable/:id`, `GET /api/timetable/faculty/:facultyId`, `GET /api/timetable/room/:roomId` |
| Room Allocation | `POST /api/room-allocation`, `PUT/DELETE /api/room-allocation/:id`, `GET /api/room-allocation/current/:facultyId`, `GET /api/room-allocation/faculty/:facultyId` |
| Biometric Log | `POST /api/biometric-logs`, `GET /api/biometric-logs/faculty/:facultyId?date=` |
| Attendance | `GET /api/attendance?date=`, `GET /api/attendance/faculty/:facultyId?date=`, `POST /api/attendance/mark-absentees` |
| Faculty Location | `GET /api/faculty-location/:facultyId` |
| Admin | `POST /api/admin/login`, `POST /api/admin` (protected — needs a JWT) |

## Things to know

- **Overlap prevention** for timetable/room-allocation lives inside the
  stored procedures — a conflict raises a SQL error, which surfaces as
  HTTP 409.
- **Attendance status is automatic**: posting to `/api/biometric-logs`
  triggers `sp_attendance_process_log` in the database, which matches the
  scan to the closest scheduled class and writes On Time / Late. Absent
  requires a daily call to `POST /api/attendance/mark-absentees` (no
  biometric row means nothing fires automatically for it).
- **`faculty.department` (the old varchar) was left alone** — a nullable
  `department_id` foreign key was added alongside it, so nothing in your
  original faculty module breaks.
- **First admin account**: `POST /api/admin` is behind the JWT
  `authenticate` middleware, so you can't create the first admin through
  the API without already having a token. Either use the seed row in
  `06_seed_data_extended.sql` (replace its placeholder hash with a real
  bcrypt hash first) or temporarily remove `authenticate` from that one
  route to bootstrap, then put it back.
