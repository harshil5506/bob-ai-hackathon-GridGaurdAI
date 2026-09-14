// GridGuard AI — Error Handling Middleware

/**
 * Centralized error handler for Express.
 * Catches all errors from route handlers and sends structured JSON responses.
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the full error in development
  if (process.env.APP_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path}: ${message}`);
  }

  res.status(status).json({
    error: true,
    message,
    ...(process.env.APP_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Wraps an async route handler so thrown errors are caught and forwarded to errorHandler.
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, asyncHandler };
