class HttpError extends Error {
  constructor(message, errorType, statusCode) {
    super(message);
    this.errorType = errorType;
    this.statusCode = statusCode;
  }
}

// Unauthorized Error
class HttpUnAuthorizedError extends HttpError {
  constructor() {
    super("Unauthorized", "UnAuthorizedError", 401);
  }
}

// Bad Request Error
class HttpBadRequestError extends HttpError {
  constructor() {
    super("Bad Request", "BadRequestError", 400);
  }
}

// Bad Request Error
class HttpSomethingWentWrong extends HttpError {
  constructor() {
    super("SomethingWentWrong", "SomethingWentWrong", 500);
  }
}
// Not Found Error
class HttpNotFoundError extends HttpError {
  constructor() {
    super("Not Found", "NotFoundError", 404);
  }
}

// Export the classes and error types
module.exports = {
  HttpError,
  HttpUnAuthorizedError,
  HttpBadRequestError,
  HttpNotFoundError,
  HttpSomethingWentWrong,
};
