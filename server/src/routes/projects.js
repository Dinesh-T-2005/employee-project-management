
const router = require('express').Router();
const db = require('../db');
const { requiredString, validDate } = require('../utils');

const { sql } = db;

const statuses = ['Planned', 'In Progress', 'On Hold', 'Completed'];

function validate(body) {
  const name = requiredString(body.name, 'Project name', 160);

  const description =
    typeof body.description === 'string'
      ? body.description.trim()
      : '';

  const startDate = validDate(body.startDate, 'Start date');
  const endDate = validDate(body.endDate, 'End date');

  if (endDate < startDate) {
    throw Object.assign(
      new Error('End date must be on or after start date.'),
      { status: 400 }
    );
  }

  const status = body.status || 'Planned';

  if (!statuses.includes(status)) {
    throw Object.assign(new Error('Invalid project status.'), {
      status: 400,
    });
  }

  return { name, description, startDate, endDate, status };
}

// Get all projects with search and status filters
router.get('/', async (req, res, next) => {
  try {
    const pool = await db.connectDB();

    const search = `%${String(req.query.search || '').trim()}%`;
    const status = String(req.query.status || '').trim();

    const request = pool.request()
      .input('search', sql.NVarChar(400), search);

    let query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.start_date AS startDate,
        p.end_date AS endDate,
        p.status,
        p.created_at AS createdAt,
        COUNT(ep.employee_id) AS employeeCount
      FROM projects p
      LEFT JOIN employee_projects ep
        ON ep.project_id = p.id
      WHERE (
        p.name LIKE @search
        OR p.description LIKE @search
      )
    `;

    if (status && statuses.includes(status)) {
      request.input('status', sql.NVarChar(30), status);
      query += ' AND p.status = @status';
    }

    query += `
      GROUP BY
        p.id,
        p.name,
        p.description,
        p.start_date,
        p.end_date,
        p.status,
        p.created_at
      ORDER BY p.created_at DESC, p.id DESC
    `;

    const result = await request.query(query);

    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

// Get one project and its assigned employees
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid project ID.' });
    }

    const pool = await db.connectDB();

    const projectResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          id,
          name,
          description,
          start_date AS startDate,
          end_date AS endDate,
          status,
          created_at AS createdAt
        FROM projects
        WHERE id = @id
      `);

    if (projectResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const employeeResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT
          e.id,
          e.name,
          e.email,
          e.designation
        FROM employees e
        INNER JOIN employee_projects ep
          ON ep.employee_id = e.id
        WHERE ep.project_id = @id
        ORDER BY e.name
      `);

    res.json({
      ...projectResult.recordset[0],
      employees: employeeResult.recordset,
    });
  } catch (err) {
    next(err);
  }
});

// Create project
router.post('/', async (req, res, next) => {
  try {
    const project = validate(req.body);
    const pool = await db.connectDB();

    const result = await pool.request()
      .input('name', sql.NVarChar(160), project.name)
      .input('description', sql.NVarChar(sql.MAX), project.description)
      .input('startDate', sql.Date, project.startDate)
      .input('endDate', sql.Date, project.endDate)
      .input('status', sql.NVarChar(30), project.status)
      .query(`
        INSERT INTO projects (
          name,
          description,
          start_date,
          end_date,
          status
        )
        OUTPUT INSERTED.id
        VALUES (
          @name,
          @description,
          @startDate,
          @endDate,
          @status
        )
      `);

    const id = result.recordset[0].id;

    res.status(201).json({
      id,
      ...project,
      employeeCount: 0,
    });
  } catch (err) {
    next(err);
  }
});

// Update project
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid project ID.' });
    }

    const project = validate(req.body);
    const pool = await db.connectDB();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(160), project.name)
      .input('description', sql.NVarChar(sql.MAX), project.description)
      .input('startDate', sql.Date, project.startDate)
      .input('endDate', sql.Date, project.endDate)
      .input('status', sql.NVarChar(30), project.status)
      .query(`
        UPDATE projects
        SET
          name = @name,
          description = @description,
          start_date = @startDate,
          end_date = @endDate,
          status = @status
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const countResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT COUNT(*) AS employeeCount
        FROM employee_projects
        WHERE project_id = @id
      `);

    res.json({
      id,
      ...project,
      employeeCount: countResult.recordset[0].employeeCount,
    });
  } catch (err) {
    next(err);
  }
});

// Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid project ID.' });
    }

    const pool = await db.connectDB();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM projects WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.json({ message: 'Project deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
