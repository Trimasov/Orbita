export default class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    // @ts-expect-error solve a problem with declare statusCode method in Model
    this.statusCode = statusCode;
    // @ts-expect-error solve a problem with declare isOperational method in Model
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}