const express = require('express');
const cors = require('cors');
require('dotenv').config();

const facultyRoutes = require('./routes/facultyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const roomRoutes = require('./routes/roomRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const roomAllocationRoutes = require('./routes/roomAllocationRoutes');
const biometricLogRoutes = require('./routes/biometricLogRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const facultyLocationRoutes = require('./routes/facultyLocationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/faculty', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/room-allocation', roomAllocationRoutes);
app.use('/api/biometric-logs', biometricLogRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/faculty-location', facultyLocationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Faculty Portal API running on http://localhost:${PORT}`);
});