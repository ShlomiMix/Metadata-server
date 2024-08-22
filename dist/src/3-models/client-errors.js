"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.ValidationError = exports.ResourceNotFoundError = exports.RouteNotFoundError = void 0;
const enums_1 = require("./enums");
// Base class for any client error:
class ClientError {
    constructor(message, status) {
        this.message = message;
        this.status = status;
    }
}
// Route not found error:
class RouteNotFoundError extends ClientError {
    constructor(route) {
        super(`Route ${route} not found.`, enums_1.StatusCode.NotFound);
    }
}
exports.RouteNotFoundError = RouteNotFoundError;
// Resource not found error:
class ResourceNotFoundError extends ClientError {
    constructor(id) {
        super(`id ${id} not exist.`, enums_1.StatusCode.NotFound);
    }
}
exports.ResourceNotFoundError = ResourceNotFoundError;
// Validation error:
class ValidationError extends ClientError {
    constructor(message) {
        super(message, enums_1.StatusCode.BadRequest);
    }
}
exports.ValidationError = ValidationError;
// Unauthorized error:
class UnauthorizedError extends ClientError {
    constructor(message) {
        super(message, enums_1.StatusCode.Unauthorized);
    }
}
exports.UnauthorizedError = UnauthorizedError;
