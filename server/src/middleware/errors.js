
function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'That email address is already in use.',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      message: 'One or more selected projects do not exist.',
    });
  }

  const status = err.status || 500;

  res.status(status).json({
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : status === 500
          ? 'Internal server error.'
          : err.message,
  });
}

module.exports = { notFound, errorHandler };
