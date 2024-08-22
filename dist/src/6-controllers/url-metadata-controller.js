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
exports.urlMetadataRouter = void 0;
const express_1 = __importDefault(require("express"));
const url_metadata_service_1 = require("../5-services/url-metadata-service");
const enums_1 = require("../3-models/enums");
const csurf_1 = __importDefault(require("csurf")); // Add this import
const helmet_1 = __importDefault(require("helmet")); // Add this import
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Data controller:
class UrlMetadataController {
    // Register routes once:
    constructor() {
        // Create a router object for listening to HTTP requests:
        this.router = express_1.default.Router();
        this.csrfProtection = (0, csurf_1.default)({
            cookie: {
                httpOnly: true,
                secure: process.env.ENVIRONMENT === "production", // Use secure cookies in production
                sameSite: "strict", // Adjust as needed
            },
        }); // CSRF protection middleware
        this.helmetMiddleware = (0, helmet_1.default)(); // Helmet middleware for security headers
        this.registerRoutes();
    }
    // Register routes:
    registerRoutes() {
        this.router.use(this.helmetMiddleware);
        this.router.use((0, cookie_parser_1.default)()); // Ensure cookieParser is used before csrfProtection
        // this.router.use(this.csrfProtection);
        this.router.get("/csrf-token", this.getCsrfToken);
        this.router.post("/fetch-metadata", this.addMetadata);
    }
    getCsrfToken(request, response, next) {
        const token = request.csrfToken();
        response.json({ csrfToken: token });
    }
    addMetadata(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const urls = request === null || request === void 0 ? void 0 : request.body;
                const addedMetadata = yield url_metadata_service_1.urlMetadataService.addMetadata(urls);
                response.status(enums_1.StatusCode.Created).json(addedMetadata);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
const urlMetadataController = new UrlMetadataController();
exports.urlMetadataRouter = urlMetadataController.router;
