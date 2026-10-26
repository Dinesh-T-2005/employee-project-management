
const router = require('express').Router();
const db = require('../db');
const { requiredString, parseProjectIds } = require('../utils');

const { sql } = db;

function validateEmployee(body) {
  const name = requiredString(body.name, 'Name', 120);
  const email = requiredString(body.email, 'Email', 190).toLowerCase();
  const phone = requiredString(body.phone, 'Phone', 30);
  const designation = requiredString(body.designation, 'Designation', 120);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error('Enter a valid email address.'), {
      status: 400,
    });
  }

  return { name, email, phone, designation };
}

async function syncProjects(transaction, employeeId, projectIds) {
  const deleteRequest = new sql.Request(transaction);

  await deleteRequest
    .input('employeeId', sql.Int, employeeId)
    .query(`
      DELETE FROM employee_projects
      WHERE employee_id = @employeeId
    `);

  for (const projectId of projectIds) {
    const insertRequest = new sql.Request(transaction);

    await insertRequest
      .input('employeeId', sql.Int, employeeId)
      .input('projectId', sql.Int, projectId)
      .query(`
        INSERT INTO employee_projects (employee_id, project_id)
        VALUES (@employeeId, @projectId)
      `);
  }
}

async function getEmployee(id) {
  const pool = await db.connectDB();

  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        e.id,
        e.name,
        e.email,
        e.phone,
        e.designation,
        e.created_at AS createdAt,
        p.id AS projectId,
        p.name AS projectName,
        p.description AS projectDescription,
        p.start_date AS projectStartDate,
        p.end_date AS projectEndDate,
        p.status AS projectStatus
      FROM employees e
      LEFT JOIN employee_projects ep
        ON ep.employee_id = e.id
      LEFT JOIN projects p
        ON p.id = ep.project_id
      WHERE e.id = @id
      ORDER BY p.id
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  const first = result.recordset[0];

  const projects = result.recordset
    .filter(row => row.projectId !== null)
    .map(row => ({
      id: row.projectId,
      name: row.projectName,
      description: row.projectDescription,
      startDate: row.projectStartDate,
      endDate: row.projectEndDate,
      status: row.projectStatus,
    }));

  return {
    id: first.id,
    name: first.name,
    email: first.email,
    phone: first.phone,
    designation: first.designation,
    createdAt: first.createdAt,
    projects,
    projectIds: projects.map(project => project.id),
  };
}

router.get('/', async (req, res, next) => {
  try {
    const pool = await db.connectDB();

    const searchText = String(req.query.search || '').trim();
    const search = `%${searchText}%`;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const offset = (page - 1) * limit;

    const countResult = await pool.request()
      .input('search', sql.NVarChar(400), search)
      .query(`
        SELECT COUNT(DISTINCT e.id) AS total
        FROM employees e
        WHERE e.name LIKE @search
           OR e.email LIKE @search
           OR e.phone LIKE @search
           OR e.designation LIKE @search
      `);

    const total = countResult.recordset[0].total;

    const rowsResult = await pool.request()
      .input('search', sql.NVarChar(400), search)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT
          e.id,
          e.name,
          e.email,
          e.phone,
          e.designation,
          e.created_at AS createdAt,
          COUNT(ep.project_id) AS projectCount
        FROM employees e
        LEFT JOIN employee_projects ep
          ON ep.employee_id = e.id
        WHERE e.name LIKE @search
           OR e.email LIKE @search
           OR e.phone LIKE @search
           OR e.designation LIKE @search
        GROUP BY
          e.id,
          e.name,
          e.email,
          e.phone,
          e.designation,
          e.created_at
        ORDER BY e.created_at DESC, e.id DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    res.json({
      data: rowsResult.recordset,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }

    const employee = await getEmployee(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.json(employee);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  let transaction;

  try {
    const { name, email, phone, designation } = validateEmployee(req.body);
    const projectIds = parseProjectIds(req.body.projectIds);

    const pool = await db.connectDB();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const insertResult = await new sql.Request(transaction)
      .input('name', sql.NVarChar(120), name)
      .input('email', sql.NVarChar(190), email)
      .input('phone', sql.NVarChar(30), phone)
      .input('designation', sql.NVarChar(120), designation)
      .query(`
        INSERT INTO employees (name, email, phone, designation)
        OUTPUT INSERTED.id
        VALUES (@name, @email, @phone, @designation)
      `);

    const employeeId = insertResult.recordset[0].id;

    await syncProjects(transaction, employeeId, projectIds);
    await transaction.commit();

    res.status(201).json(await getEmployee(employeeId));
  } catch (err) {
    if (transaction && transaction._aborted !== true) {
      try {
        await transaction.rollback();
      } catch (_) {
      }
    }

    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  let transaction;

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }

    const { name, email, phone, designation } = validateEmployee(req.body);
    const projectIds = parseProjectIds(req.body.projectIds);

    const pool = await db.connectDB();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const updateResult = await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(120), name)
      .input('email', sql.NVarChar(190), email)
      .input('phone', sql.NVarChar(30), phone)
      .input('designation', sql.NVarChar(120), designation)
      .query(`
        UPDATE employees
        SET name = @name,
            email = @email,
            phone = @phone,
            designation = @designation
        WHERE id = @id
      `);

    if (updateResult.rowsAffected[0] === 0) {
      await transaction.rollback();
      transaction = null;

      return res.status(404).json({ message: 'Employee not found.' });
    }

    await syncProjects(transaction, id, projectIds);
    await transaction.commit();
    transaction = null;

    res.json(await getEmployee(id));
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (_) {
      }
    }

    next(err);
  }
});

router.put('/:id/projects', async (req, res, next) => {
  let transaction;

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }

    const projectIds = parseProjectIds(req.body.projectIds);
    const pool = await db.connectDB();

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const exists = await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .query('SELECT id FROM employees WHERE id = @id');

    if (exists.recordset.length === 0) {
      await transaction.rollback();
      transaction = null;

      return res.status(404).json({ message: 'Employee not found.' });
    }

    await syncProjects(transaction, id, projectIds);
    await transaction.commit();
    transaction = null;

    res.json(await getEmployee(id));
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (_) {
      }
    }

    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }

    const pool = await db.connectDB();

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM employees WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.json({ message: 'Employee deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
