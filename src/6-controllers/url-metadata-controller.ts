import express, { NextFunction, Request, Response } from "express";
import { urlMetadataService } from "../5-services/url-metadata-service";
import { StatusCode } from "../3-models/enums";
import csrf from "csurf"; // Add this import
import helmet from "helmet"; // Add this import
import cookieParser from "cookie-parser";

// Data controller:
class UrlMetadataController {
  // Create a router object for listening to HTTP requests:
  public readonly router = express.Router();

//   private csrfProtection = csrf({
//     cookie: {
//       httpOnly: true,
//       secure: process.env.ENVIRONMENT === "production", // Use secure cookies in production
//       sameSite: "strict", // Adjust as needed
//     },
//   }); // CSRF protection middleware
  private helmetMiddleware = helmet(); // Helmet middleware for security headers

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.use(this.helmetMiddleware);
    this.router.use(cookieParser()); // Ensure cookieParser is used before csrfProtection
    // this.router.use(this.csrfProtection);
    this.router.get("/csrf-token", this.getCsrfToken);
    this.router.get("/metadata", this.getAllMetadata);
    this.router.post("/fetch-metadata", this.addMetadata);
 
  }

  public getCsrfToken(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    const token = request.csrfToken();
    response.json({ csrfToken: token });
  }

  public async addMetadata(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const urls = request?.body;
      const addedMetadata = await urlMetadataService.addMetadata(urls);
      response.status(StatusCode.Created).json(addedMetadata);
    } catch (err: any) {
      next(err);
    }
  }

  public async getAllMetadata(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const allMetadata = await urlMetadataService.getAllMetadata();
      response.json(allMetadata);
    } catch (err: any) {
      next(err);
    }
  }
}

const urlMetadataController = new UrlMetadataController();
export const urlMetadataRouter = urlMetadataController.router;
