"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlMetadataModel = exports.UrlMetadataSchema = void 0;
const mongoose_1 = require("mongoose");
// Define the schema for the metadata model
exports.UrlMetadataSchema = new mongoose_1.Schema({
    url: {
        type: String, // Change from [String] to String
        required: [true, "URL is required"],
    },
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    image: {
        type: String,
        required: [true, "Image URL is required"],
    },
}, {
    id: false, toJSON: { virtuals: true }, versionKey: false
});
// Create the model
exports.UrlMetadataModel = (0, mongoose_1.model)("UrlMetadata", exports.UrlMetadataSchema, "urlMetadata");
