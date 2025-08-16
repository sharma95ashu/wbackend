const mongoose = require('mongoose');

/**
 * Global Error Handler Middleware
 * Handles all errors in the application and formats responses based on environment
 */
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (always log in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', err);
  } else {
    // Log only essential info in production
    console.error('Error:', err.message);
  }

  // MongoDB Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: process.env.NODE_ENV === 'development' ? message : 'Invalid input data'
    };
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    error = {
      statusCode: 400,
      message: process.env.NODE_ENV === 'development' ? message : 'Duplicate data found'
    };
  }

  // MongoDB Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = {
      statusCode: 400,
      message: process.env.NODE_ENV === 'development' ? message : 'Invalid data format'
    };
  }

  // MongoDB Connection Error
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    error = {
      statusCode: 503,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Database connection failed'
    };
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid token'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Token expired'
    };
  }

  // Multer Errors (File upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      statusCode: 400,
      message: process.env.NODE_ENV === 'development' ? err.message : 'File size too large'
    };
  }

  // Rate Limiting Error
  if (err.status === 429) {
    error = {
      statusCode: 429,
      message: process.env.NODE_ENV === 'development' ? err.message : 'Too many requests, please try again later'
    };
  }

  // Default error handling
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? error.message || err.message || 'Server Error'
    : statusCode === 500 ? 'Something went wrong' : error.message || 'Something went wrong';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
};

/**
 * Handle 404 errors - routes not found
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  globalErrorHandler,
  notFoundHandler
};
