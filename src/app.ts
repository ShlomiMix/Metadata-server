import cors from "cors";
import express from "express";
import expressFileUpload from "express-fileupload";
import path from "path";
import { fileSaver } from "uploaded-file-saver";
import { appConfig } from "./2-utils/app-config";
import { dal } from "./2-utils/dal";
import { errorsMiddleware } from "./4-middleware/errors-middleware";
import { loggerMiddleware } from "./4-middleware/logger-middleware";
import { urlMetadataRouter } from "./6-controllers/url-metadata-controller";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import csrf from "csurf";

// Create a rate limiter for 5 requests per second
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Main application class:
class App {
  // Express server:
  public server = express();

  // Start app:
  public async start(): Promise<void> {
    // Enable CORS requests:
    this.server.use(
      cors({
        origin: "http://localhost:3000", // Your frontend origin
        credentials: true,
      })
    ); // Enable CORS for any frontend website.


    this.server.use(cookieParser());

    this.server.use(
      csrf({
        cookie: {
          httpOnly: true,
          secure: process.env.ENVIRONMENT === "production",
          sameSite: "strict",
        },
      })
    );

    this.server.use(helmet());
    // Create a request.body containing the given json from the front:
 
    this.server.use(express.json());
    
    // Create request.files containing uploaded files:
    this.server.use(expressFileUpload());

    // Configure images folder:
    fileSaver.config(path.join(__dirname, "1-assets", "images"));

    // Register middleware:
    this.server.use(loggerMiddleware.logToConsole);

    // Apply rate limiting middleware to all routes
    this.server.use(limiter);

    // Connect any controller route to the server:
    this.server.use("/api", urlMetadataRouter);

    // Route not found middleware:
    this.server.use(errorsMiddleware.routeNotFound);

    // Catch all middleware:
    this.server.use(errorsMiddleware.catchAll);

    // Connect to MongoDB:
    await dal.connect();

    // Run server:
    this.server.listen(appConfig.port, () =>
      console.log("Listening on http://localhost:" + appConfig.port)
    );
  }
}

export const app = new App();
app.start();
