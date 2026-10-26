
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);

app.use(express.json({ limit: '1mb' }));

app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/projects', require('./routes/projects'));

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5001);

async function startServer() {
  try {
    await db.connectDB();

    app.listen(port, () => {
      console.log(
        `API listening on http://localhost:${port}/api`
      );
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}

startServer();
