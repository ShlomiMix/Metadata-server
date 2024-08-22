"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
class LoggerMiddleware {
    // Log request to console:
    logToConsole(request, response, next) {
        // Log request to console:
        console.log("Method: ", request.method);
        console.log("Route: ", request.originalUrl);
        console.log("Body: ", request.body);
        console.log("---------------------------------");
        // Continue to next middleware or controller:
        next();
    }
}
exports.loggerMiddleware = new LoggerMiddleware();
