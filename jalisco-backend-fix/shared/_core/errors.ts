/**
 * Small set of typed application errors. Currently only re-exported through
 * shared/types.ts for consumers that want a typed error hierarchy; extend as
 * needed.
 */

export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code = "APP_ERROR", statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Please login") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do this") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}
