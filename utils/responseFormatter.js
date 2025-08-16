/**
 * Response Formatter Utilities
 * Provides consistent response formatting across the application
 */

/**
 * Success Response Formatter
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data }),
    ...(meta && { meta })
  };

  res.status(statusCode).json(response);
};

/**
 * Error Response Formatter
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Detailed error information
 */
const sendErrorResponse = (res, statusCode = 500, message = 'Something went wrong', errors = null) => {
  const response = {
    success: false,
    error: {
      message,
      ...(errors && { details: errors }),
      ...(process.env.NODE_ENV === 'development' && errors && { stack: errors.stack })
    }
  };

  res.status(statusCode).json(response);
};

/**
 * Validation Error Response Formatter
 * @param {Object} res - Express response object
 * @param {Array} validationErrors - Array of validation errors
 */
const sendValidationErrorResponse = (res, validationErrors) => {
  const response = {
    success: false,
    error: {
      message: 'Validation failed',
      type: 'ValidationError',
      details: validationErrors
    }
  };

  res.status(400).json(response);
};

/**
 * Not Found Response Formatter
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name that was not found
 */
const sendNotFoundResponse = (res, resource = 'Resource') => {
  const response = {
    success: false,
    error: {
      message: `${resource} not found`,
      type: 'NotFoundError'
    }
  };

  res.status(404).json(response);
};

/**
 * Unauthorized Response Formatter
 * @param {Object} res - Express response object
 * @param {string} message - Custom unauthorized message
 */
const sendUnauthorizedResponse = (res, message = 'Unauthorized access') => {
  const response = {
    success: false,
    error: {
      message,
      type: 'UnauthorizedError'
    }
  };

  res.status(401).json(response);
};

/**
 * Forbidden Response Formatter
 * @param {Object} res - Express response object
 * @param {string} message - Custom forbidden message
 */
const sendForbiddenResponse = (res, message = 'Access forbidden') => {
  const response = {
    success: false,
    error: {
      message,
      type: 'ForbiddenError'
    }
  };

  res.status(403).json(response);
};

/**
 * Paginated Response Formatter
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
const sendPaginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const response = {
    success: true,
    message,
    data,
    meta: {
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext,
        hasPrev,
        ...(hasNext && { nextPage: page + 1 }),
        ...(hasPrev && { prevPage: page - 1 })
      }
    }
  };

  res.status(200).json(response);
};

/**
 * Created Response Formatter (for POST requests)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Created resource data
 */
const sendCreatedResponse = (res, message = 'Resource created successfully', data = null) => {
  sendSuccessResponse(res, 201, message, data);
};

/**
 * Updated Response Formatter (for PUT/PATCH requests)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Updated resource data
 */
const sendUpdatedResponse = (res, message = 'Resource updated successfully', data = null) => {
  sendSuccessResponse(res, 200, message, data);
};

/**
 * Deleted Response Formatter (for DELETE requests)
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendDeletedResponse = (res, message = 'Resource deleted successfully') => {
  sendSuccessResponse(res, 200, message);
};

/**
 * No Content Response Formatter
 * @param {Object} res - Express response object
 */
const sendNoContentResponse = (res) => {
  res.status(204).send();
};

/**
 * Rate Limited Response Formatter
 * @param {Object} res - Express response object
 * @param {string} message - Rate limit message
 * @param {number} retryAfter - Seconds until retry is allowed
 */
const sendRateLimitResponse = (res, message = 'Too many requests', retryAfter = null) => {
  const response = {
    success: false,
    error: {
      message,
      type: 'RateLimitError',
      ...(retryAfter && { retryAfter })
    }
  };

  if (retryAfter) {
    res.set('Retry-After', retryAfter.toString());
  }

  res.status(429).json(response);
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendValidationErrorResponse,
  sendNotFoundResponse,
  sendUnauthorizedResponse,
  sendForbiddenResponse,
  sendPaginatedResponse,
  sendCreatedResponse,
  sendUpdatedResponse,
  sendDeletedResponse,
  sendNoContentResponse,
  sendRateLimitResponse
};
