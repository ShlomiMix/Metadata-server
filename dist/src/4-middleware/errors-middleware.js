"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorsMiddleware = void 0;
const enums_1 = require("../3-models/enums");
const client_errors_1 = require("../3-models/client-errors");
const logger_1 = require("../2-utils/logger");
const app_config_1 = require("../2-utils/app-config");
class ErrorsMiddleware {
    // Route not found:
    routeNotFound(request, response, next) {
        // Create client error:
        const err = new client_errors_1.RouteNotFoundError(request.originalUrl);
        // Go to catch-all: 
        next(err);
    }
    // Catch all: 
    catchAll(err, request, response, next) {
        // Log error to console:
        console.log(err);
        // Log error to file:
        logger_1.logger.logError(err);
        // Take error status: 
        const status = err.status || enums_1.StatusCode.InternalServerError;
        // Take error message: 
        const message = (status === enums_1.StatusCode.InternalServerError && app_config_1.appConfig.isProduction) ? "Some error, please try again later." : err.message;
        // Response the error:
        response.status(status).send(message);
    }
}
exports.errorsMiddleware = new ErrorsMiddleware();
