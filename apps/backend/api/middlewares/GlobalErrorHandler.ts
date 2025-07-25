import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { HTTPMessages, HTTPStatusCode } from "../utils/constants.js";

export interface IHTTPError extends Error {
  statusCode: number;
}

export class BadRequestException {
  constructor(message: string = HTTPMessages.BAD_REQUEST) {
    throw createError(HTTPStatusCode.BadRequest, message);
  }
}

export class ConflictException {
  constructor(message: string = HTTPMessages.CONFLICT) {
    throw createError(HTTPStatusCode.Conflict, message);
  }
}

export class ResourceNotFoundError {
  constructor(message: string = HTTPMessages.NOT_FOUND) {
    throw createError(HTTPStatusCode.NotFound, message);
  }
}

export class UnauthorizedError {
  constructor(message: string = HTTPMessages.UNAUTHORIZED) {
    throw createError(HTTPStatusCode.Unauthorized, message);
  }
}

export class ForbiddenError {
  constructor(message: string = HTTPMessages.FORBIDDEN) {
    throw createError(HTTPStatusCode.Forbidden, message);
  }
}

export class InternalServerError {
  constructor(message: string = HTTPMessages.INTERNAL_SERVER_ERROR) {
    throw createError(HTTPStatusCode.InternalServerError, message);
  }
}

export class SessionExpiredError {
  constructor(message: string = HTTPMessages.SESSION_EXPIRED) {
    throw createError(HTTPStatusCode.Unauthorized, message);
  }
}

export class EnvironmentVariableNotDefinedException {
  constructor(message: string = HTTPMessages.ENV_VARIABLE_NOT_DEFINED) {
    throw createError(HTTPStatusCode.NotFound, message);
  }
}

const GlobalErrorHandler: ErrorRequestHandler = (err: IHTTPError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || HTTPStatusCode.InternalServerError;
  const message: string = err.message || HTTPMessages.INTERNAL_SERVER_ERROR;
  const stack = err.stack;

  return res.status(statusCode).json({
    message,
    statusCode,
    ...(process.env.NODE_ENV === "DEV" && { stack }),
  });
};

export default GlobalErrorHandler;
