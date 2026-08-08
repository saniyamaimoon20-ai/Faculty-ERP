// =====================================================================
// Shared DB error handler (same logic as the inline version in
// facultyController.js — extracted so every new controller can reuse it
// instead of redefining it). Safe to swap facultyController.js over to
// this too, but not required.
// =====================================================================
function handleDbError(res, err) {
    // Duplicate key (unique constraint)
    if (err.errno === 1062) {
        return res.status(409).json({ error: 'Duplicate value', detail: err.sqlMessage });
    }
    // CHECK constraint failure - MySQL 8.0.16+
    if (err.errno === 3819 || err.errno === 4025) {
        return res.status(400).json({ error: 'Validation failed', detail: err.sqlMessage });
    }
    // Custom SIGNAL raised inside a stored procedure (not found / conflict / etc.)
    if (err.sqlState === '45000') {
        return res.status(err.sqlMessage && err.sqlMessage.toLowerCase().includes('conflict') ? 409 : 404)
            .json({ error: err.sqlMessage });
    }
    // Payload validation thrown in the model layer
    if (err.message && !err.sqlState) {
        return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}

module.exports = handleDbError;
