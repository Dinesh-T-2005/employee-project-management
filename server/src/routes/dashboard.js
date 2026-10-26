
const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const pool = await db.connectDB();

    const employeesResult = await pool.request().query(
      'SELECT COUNT(*) AS total FROM employees'
    );

    const projectsResult = await pool.request().query(
      'SELECT COUNT(*) AS total FROM projects'
    );

    const assignmentsResult = await pool.request().query(
      'SELECT COUNT(*) AS total FROM employee_projects'
    );

    const activeProjectsResult = await pool.request().query(
      "SELECT COUNT(*) AS total FROM projects WHERE status = 'In Progress'"
    );

    res.json({
      employees: employeesResult.recordset[0].total,
      projects: projectsResult.recordset[0].total,
      assignments: assignmentsResult.recordset[0].total,
      activeProjects: activeProjectsResult.recordset[0].total,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
