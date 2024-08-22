"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const uploaded_file_saver_1 = require("uploaded-file-saver");
const app_config_1 = require("./2-utils/app-config");
const dal_1 = require("./2-utils/dal");
const errors_middleware_1 = require("./4-middleware/errors-middleware");
const logger_middleware_1 = require("./4-middleware/logger-middleware");
const url_metadata_controller_1 = require("./6-controllers/url-metadata-controller");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const csurf_1 = __importDefault(require("csurf"));
// Create a rate limiter for 5 requests per second
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1000, // 1 second
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again later.",
});
// Main application class:
class App {
    constructor() {
        // Express server:
        this.server = (0, express_1.default)();
    }
    // Start app:
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            // Enable CORS requests:
            this.server.use((0, cors_1.default)({
                origin: "https://metadata-frontend.onrender.com",
                credentials: true,
            })); // Enable CORS for any frontend website.
            this.server.use((0, cookie_parser_1.default)());
            this.server.use((0, csurf_1.default)({
                cookie: {
                    httpOnly: true,
                    secure: process.env.ENVIRONMENT === "production",
                    //   sameSite: "strict",
                    sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax", // 'none' for cross-domain in production
                },
            }));
            this.server.use((0, helmet_1.default)());
            // Create a request.body containing the given json from the front:
            this.server.use(express_1.default.json());
            // Create request.files containing uploaded files:
            this.server.use((0, express_fileupload_1.default)());
            // Configure images folder:
            uploaded_file_saver_1.fileSaver.config(path_1.default.join(__dirname, "1-assets", "images"));
            // Register middleware:
            this.server.use(logger_middleware_1.loggerMiddleware.logToConsole);
            // Apply rate limiting middleware to all routes
            this.server.use(limiter);
            // Connect any controller route to the server:
            this.server.use("/api", url_metadata_controller_1.urlMetadataRouter);
            // Route not found middleware:
            this.server.use(errors_middleware_1.errorsMiddleware.routeNotFound);
            // Catch all middleware:
            this.server.use(errors_middleware_1.errorsMiddleware.catchAll);
            // Connect to MongoDB:
            yield dal_1.dal.connect();
            // Run server:
            this.server.listen(app_config_1.appConfig.port, () => console.log("Listening on http://localhost:" + app_config_1.appConfig.port));
        });
    }
}
exports.app = new App();
exports.app.start();
