import axios from "axios";
import { JSDOM } from "jsdom";
import {
  IUrlMetadataModel,
  UrlMetadataModel,
} from "../3-models/url-metadata-model";
import validator from "validator"; // Add this import
import { response } from "express";

class UrlMetadataService {
  private sanitizeUrl(url: string): string {
    try {
      return encodeURI(url);
    } catch (e) {
      console.error("Error encoding URL:", e);
      return url;
    }
  }

  //   Function to fetch metadata for a single URL
  private async fetchMetadata(url: string) {
    if (
      !validator.isURL(url, {
        protocols: ["http", "https"],
        require_protocol: true,
      })
    ) {
      throw new Error(`Invalid URL: ${url}`);
    }

    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      console.log("sanitizedUrl", sanitizedUrl);

      // Debugging output

      const { data } = await axios.get(url);
      const dom = new JSDOM(data);

      const title = dom.window.document.querySelector("title")?.textContent;
      const description = dom.window.document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content");
      const image = dom.window.document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content");

      // Throw an error if any of these fields are missing
      if (!title) throw new Error(`Missing title for URL: ${url}`);
      if (!description) throw new Error(`Missing description for URL: ${url}`);
      if (!image) throw new Error(`Missing image for URL: ${url}`);

      return { url, title, description, image };
    } catch (error: any) {
      console.error(`Error fetching metadata for URL: ${url}`, error); // Additional error logging
      throw new Error(
        `Error fetching metadata for URL: ${url}. ${error.message}`
      );
    }
  }

  // Function to add new metadata
  public async addMetadata(urls: string[]): Promise<IUrlMetadataModel[]> {
    // Access the array of URLs from the input object
    // const urlList = urls.url;

    try {
      const metadataPromises = urls?.map((url) => this.fetchMetadata(url));
      const metadataArray = await Promise.all(metadataPromises);
      const savedMetadata = await UrlMetadataModel.insertMany(metadataArray);
      return savedMetadata;
    } catch (error: any) {
      throw new Error(`Error adding metadata: ${error.message}`);
    }
  }

  public async getAllMetadata(): Promise<IUrlMetadataModel[]> {
    const metadata = await UrlMetadataModel.find().exec();
    return metadata;
  }
}

export const urlMetadataService = new UrlMetadataService();
