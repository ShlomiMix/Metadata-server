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
    //   Function to fetch metadata for a single URL
    fetchMetadata(url) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!validator_1.default.isURL(url, {
                protocols: ["http", "https"],
                require_protocol: true,
            })) {
                throw new Error(`Invalid URL: ${url}`);
            }
            try {
                const sanitizedUrl = this.sanitizeUrl(url);
                console.log("sanitizedUrl", sanitizedUrl);
                // Debugging output
                const { data } = yield axios_1.default.get(url);
                const dom = new jsdom_1.JSDOM(data);
                const title = (_a = dom.window.document.querySelector("title")) === null || _a === void 0 ? void 0 : _a.textContent;
                const description = (_b = dom.window.document
                    .querySelector('meta[name="description"]')) === null || _b === void 0 ? void 0 : _b.getAttribute("content");
                const image = (_c = dom.window.document
                    .querySelector('meta[property="og:image"]')) === null || _c === void 0 ? void 0 : _c.getAttribute("content");
                // Throw an error if any of these fields are missing
                if (!title)
                    throw new Error(`Missing title for URL: ${url}`);
                if (!description)
                    throw new Error(`Missing description for URL: ${url}`);
                if (!image)
                    throw new Error(`Missing image for URL: ${url}`);
                return { url, title, description, image };
            }
            catch (error) {
                console.error(`Error fetching metadata for URL: ${url}`, error); // Additional error logging
                throw new Error(`Error fetching metadata for URL: ${url}. ${error.message}`);
            }
        });
    }
    // Function to add new metadata
    addMetadata(urls) {
        return __awaiter(this, void 0, void 0, function* () {
            // Access the array of URLs from the input object
            // const urlList = urls.url;
            try {
                const metadataPromises = urls === null || urls === void 0 ? void 0 : urls.map((url) => this.fetchMetadata(url));
                const metadataArray = yield Promise.all(metadataPromises);
                const savedMetadata = yield url_metadata_model_1.UrlMetadataModel.insertMany(metadataArray);
                return savedMetadata;
            }
            catch (error) {
                throw new Error(`Error adding metadata: ${error.message}`);
            }
        });
    }
    getAllMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield url_metadata_model_1.UrlMetadataModel.find().exec();
            return metadata;
        });
    }
}
exports.urlMetadataService = new UrlMetadataService();
