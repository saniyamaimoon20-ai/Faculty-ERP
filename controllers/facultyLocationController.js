// =====================================================================
// Faculty Current Location REST controller
// Powers the "click a faculty member's name" panel.
// =====================================================================
const facultyLocationModel = require('../models/facultyLocationModel');
const handleDbError = require('../utils/handleDbError');

exports.getLocation = async (req, res) => {
    try {
        const facultyId = req.params.facultyId;
        const [current, next] = await Promise.all([
            facultyLocationModel.getCurrentStatus(facultyId),
            facultyLocationModel.getNextClass(facultyId)
        ]);

        if (!current) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        res.json({
            faculty_name: current.faculty_name,
            department_name: current.department_name,
            current_subject: current.current_subject,
            current_room: current.current_room,
            current_class: current.current_class,
            attendance_status: current.current_subject ? current.attendance_status : 'No class right now',
            check_in_time: current.check_in_time,
            next_class: next
        });
    } catch (err) {
        handleDbError(res, err);
    }
};
