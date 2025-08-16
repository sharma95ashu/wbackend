/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to automatically catch errors and pass them to the global error handler
 * 
 * Usage: 
 * app.get('/route', asyncHandler(async (req, res, next) => {
 *   // Your async code here
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
