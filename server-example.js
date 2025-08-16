const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import error handling utilities
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const asyncHandler = require('./utils/asyncHandler');
const { AppError, mongoOperationWrapper } = require('./utils/mongoErrorHandler');
const { 
  sendSuccessResponse, 
  sendCreatedResponse, 
  sendNotFoundResponse,
  sendErrorResponse 
} = require('./utils/responseFormatter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Example User Schema (for demonstration)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150']
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Example Routes with Error Handling

// GET all users with pagination
app.get('/api/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Using mongoOperationWrapper for better error handling
  const getUsers = mongoOperationWrapper(async () => {
    const users = await User.find().skip(skip).limit(limit);
    const total = await User.countDocuments();
    return { users, total };
  });

  const { users, total } = await getUsers();
  
  sendSuccessResponse(res, 200, 'Users fetched successfully', users, {
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  });
}));

// GET user by ID
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const getUser = mongoOperationWrapper(async () => {
    return await User.findById(id);
  });

  const user = await getUser();

  if (!user) {
    return sendNotFoundResponse(res, 'User');
  }

  sendSuccessResponse(res, 200, 'User fetched successfully', user);
}));

// CREATE new user
app.post('/api/users', asyncHandler(async (req, res) => {
  const { name, email, age } = req.body;

  const createUser = mongoOperationWrapper(async () => {
    return await User.create({ name, email, age });
  });

  const user = await createUser();
  sendCreatedResponse(res, 'User created successfully', user);
}));

// UPDATE user
app.put('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;

  const updateUser = mongoOperationWrapper(async () => {
    return await User.findByIdAndUpdate(
      id,
      { name, email, age },
      { 
        new: true, 
        runValidators: true,
        select: '-__v'
      }
    );
  });

  const user = await updateUser();

  if (!user) {
    return sendNotFoundResponse(res, 'User');
  }

  sendSuccessResponse(res, 200, 'User updated successfully', user);
}));

// DELETE user
app.delete('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleteUser = mongoOperationWrapper(async () => {
    return await User.findByIdAndDelete(id);
  });

  const user = await deleteUser();

  if (!user) {
    return sendNotFoundResponse(res, 'User');
  }

  sendSuccessResponse(res, 200, 'User deleted successfully');
}));

// Example route that throws custom error
app.get('/api/error-test', asyncHandler(async (req, res) => {
  // This will be caught by the global error handler
  throw new AppError('This is a test error', 400);
}));

// Example route that throws MongoDB error (for testing)
app.get('/api/mongo-error-test', asyncHandler(async (req, res) => {
  // This will cause a MongoDB CastError (invalid ObjectId)
  await User.findById('invalid-id');
  sendSuccessResponse(res, 200, 'This should not execute');
}));

// Health check route
app.get('/api/health', (req, res) => {
  sendSuccessResponse(res, 200, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Handle 404 errors
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED PROMISE REJECTION! Shutting down...');
  console.error('Error:', err);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
