/**
 * Sends a successful JSON response.
 *
 * @param {import("express").Response} res
 * @param {Object} data        – payload fields merged into the response body
 * @param {number} statusCode  – HTTP status code (default 200)
 */
export function successResponse(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
}

/**
 * Sends an error JSON response.
 *
 * @param {import("express").Response} res
 * @param {string} message     – human-readable error description
 * @param {number} statusCode  – HTTP status code (default 400)
 * @param {any}    details     – optional extra debug/validation details
 */
export function errorResponse(res, message, statusCode = 400, details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details !== null && { details }),
  });
}
