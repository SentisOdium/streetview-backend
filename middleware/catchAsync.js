/**
 * Wraps async Express route handlers to intercept rejected promises or thrown exceptions
 * and automatically pass them to next(err). Eliminates controller try/catch boilerplate.
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
