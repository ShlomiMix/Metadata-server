import { Document, Schema, model } from "mongoose";

// Define the interface for the metadata model
export interface IUrlMetadataModel extends Document {
  url: string;
  title: string;
  description: string;
  image: string; // URL of the image
}

// Define the schema for the metadata model
export const UrlMetadataSchema = new Schema<IUrlMetadataModel>(
    {
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
    },
    {
      id: false, toJSON: { virtuals: true }, versionKey: false
    }
  );




// Create the model
export const UrlMetadataModel = model<IUrlMetadataModel>(
  "UrlMetadata",
  UrlMetadataSchema,
  "urlMetadata"
);
