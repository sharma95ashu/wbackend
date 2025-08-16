/**
 * MongoDB Error Handler Utilities
 * Contains specific error handling functions for MongoDB operations
 */

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle MongoDB Validation Errors
 * @param {Object} err - MongoDB validation error
 * @returns {AppError} - Formatted error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Key Error
 * @param {Object} err - MongoDB duplicate key error
 * @returns {AppError} - Formatted error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Cast Error (Invalid ObjectId)
 * @param {Object} err - MongoDB cast error
 * @returns {AppError} - Formatted error
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Connection Errors
 * @param {Object} err - MongoDB connection error
 * @returns {AppError} - Formatted error
 */
const handleConnectionError = (err) => {
  const message = 'Database connection failed. Please try again later.';
  return new AppError(message, 503);
};

/**
 * MongoDB Operation Error Wrapper
 * Wraps MongoDB operations and provides better error handling
 * @param {Function} operation - MongoDB operation function
 * @returns {Function} - Wrapped operation
 */
const mongoOperationWrapper = (operation) => {
  return async (...args) => {
    try {
      return await operation(...args);
    } catch (error) {
      // Transform MongoDB errors into more user-friendly errors
      if (error.name === 'ValidationError') {
        throw handleValidationError(error);
      }
      
      if (error.code === 11000) {
        throw handleDuplicateKeyError(error);
      }
      
      if (error.name === 'CastError') {
        throw handleCastError(error);
      }
      
      if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
        throw handleConnectionError(error);
      }
      
      // If it's already an AppError, just re-throw it
      if (error.isOperational) {
        throw error;
      }
      
      // For other errors, create a generic server error
      throw new AppError(
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Something went wrong with database operation',
        500
      );
    }
  };
};

/**
 * MongoDB Transaction Error Handler
 * Special handler for MongoDB transactions
 * @param {Function} transactionFn - Transaction function
 * @returns {Function} - Wrapped transaction
 */
const mongoTransactionWrapper = (transactionFn) => {
  return async (session) => {
    try {
      return await transactionFn(session);
    } catch (error) {
      // Abort the transaction on any error
      await session.abortTransaction();
      
      // Re-throw the error to be handled by the global error handler
      throw error;
    } finally {
      // End the session
      await session.endSession();
    }
  };
};

/**
 * Specific MongoDB Error Codes
 */
const MONGO_ERROR_CODES = {
  DUPLICATE_KEY: 11000,
  WRITE_CONFLICT: 11001,
  INTERRUPTED: 11601,
  MAXIMUM_TIME_MS_EXPIRED: 50,
  NETWORK_TIMEOUT: 89,
  PRIMARY_STEPPED_DOWN: 189,
  INTERRUPTED_DUE_TO_REPL_STATE_CHANGE: 11602
};

/**
 * Check if error is retryable
 * @param {Object} error - Error object
 * @returns {boolean} - Whether the error is retryable
 */
const isRetryableError = (error) => {
  const retryableCodes = [
    MONGO_ERROR_CODES.WRITE_CONFLICT,
    MONGO_ERROR_CODES.INTERRUPTED,
    MONGO_ERROR_CODES.NETWORK_TIMEOUT,
    MONGO_ERROR_CODES.PRIMARY_STEPPED_DOWN,
    MONGO_ERROR_CODES.INTERRUPTED_DUE_TO_REPL_STATE_CHANGE
  ];
  
  return retryableCodes.includes(error.code) || 
         error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError');
};

module.exports = {
  AppError,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleConnectionError,
  mongoOperationWrapper,
  mongoTransactionWrapper,
  MONGO_ERROR_CODES,
  isRetryableError
};
