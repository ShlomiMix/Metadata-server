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
exports.urlMetadataService = void 0;
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = require("jsdom");
const url_metadata_model_1 = require("../3-models/url-metadata-model");
const validator_1 = __importDefault(require("validator")); // Add this import
class UrlMetadataService {
    sanitizeUrl(url) {
        try {
            return encodeURI(url);
        }
        catch (e) {
            console.error("Error encoding URL:", e);
            return url;
        }
    }
    // Function to fetch metadata for a single URL
    //   private async fetchMetadata(url: string) {
    //     // if (
    //     //   !validator.isURL(url, {
    //     //     protocols: ["http", "https"],
    //     //     require_protocol: true,
    //     //   })
    //     // ) {
    //     //   throw new Error(`Invalid URL: ${url}`);
    //     // }
    //     if (!validator.isURL(url, { protocols: ["http", "https"], require_protocol: true })) {
    //         throw { status: 400, message: `Invalid URL: ${url}` };
    //     }
    //     try {
    //       const sanitizedUrl = this.sanitizeUrl(url);
    //       console.log("sanitizedUrl", sanitizedUrl);
    //       // Debugging output
    //       const { data } = await axios.get(url);
    //       const dom = new JSDOM(data);
    //       const title = dom.window.document.querySelector("title")?.textContent;
    //       const description = dom.window.document
    //         .querySelector('meta[name="description"]')
    //         ?.getAttribute("content");
    //       const image = dom.window.document
    //         .querySelector('meta[property="og:image"]')
    //         ?.getAttribute("content");
    //       // Throw an error if any of these fields are missing
    //       if (!title) throw new Error(`Missing title for URL: ${url}`);
    //       if (!description) throw new Error(`Missing description for URL: ${url}`);
    //       if (!image) throw new Error(`Missing image for URL: ${url}`);
    //       return { url, title, description, image };
    //     } catch (error:any) {
    //       console.error(`Error fetching metadata for URL: ${url}`, error); // Additional error logging
    //       throw new Error(
    //         `Error fetching metadata for URL: ${url}. ${error.message}`
    //       );
    //     }
    //   }
    // Function to add new metadata
    addMetadata(urls) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const metadataPromises = urls.map((url) => this.fetchMetadata(url));
                const metadataArray = yield Promise.all(metadataPromises);
                const savedMetadata = yield url_metadata_model_1.UrlMetadataModel.insertMany(metadataArray);
                return savedMetadata;
            }
            catch (error) {
                throw new Error(`Error adding metadata: ${error.message}`);
            }
        });
    }
    fetchMetadata(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!validator_1.default.isURL(url, {
                protocols: ["http", "https"],
                require_protocol: true,
            })) {
                throw { status: 400, message: `Invalid URL: ${url}` };
            }
            try {
                const sanitizedUrl = this.sanitizeUrl(url);
                console.log("sanitizedUrl", sanitizedUrl);
                const { data } = yield axios_1.default.get(sanitizedUrl);
                const dom = new jsdom_1.JSDOM(data);
                const title = ((_a = dom.window.document.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent) || "";
                const description = ((_b = dom.window.document
                    .querySelector('meta[name="description"]')) === null || _b === void 0 ? void 0 : _b.getAttribute("content")) || "";
                const image = ((_c = dom.window.document
                    .querySelector('meta[property="og:image"]')) === null || _c === void 0 ? void 0 : _c.getAttribute("content")) || "";
                // Throw an error if any of these fields are missing
                if (!title)
                    throw { status: 400, message: `Missing title for URL: ${url}` };
                if (!description)
                    throw { status: 400, message: `Missing description for URL: ${url}` };
                if (!image)
                    throw { status: 400, message: `Missing image for URL: ${url}` };
                return { url, title, description, image };
            }
            catch (error) {
                console.error(`Error fetching metadata for URL: ${url}`, error);
                if (error.response) {
                    throw {
                        status: error.response.status,
                        message: `Error fetching metadata for URL: ${url}. ${error.message}`,
                    };
                }
                else {
                    throw {
                        status: 500,
                        message: `Unknown error fetching metadata for URL: ${url}.`,
                    };
                }
            }
        });
    }
}
exports.urlMetadataService = new UrlMetadataService();
