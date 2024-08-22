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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app"); // Path to your app module
const chai_1 = require("chai");
describe('GET /csrf-token', () => {
    it('should return a CSRF token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.app.server).get('/api/csrf-token');
        (0, chai_1.expect)(response.status).to.equal(200);
        (0, chai_1.expect)(response.body).to.have.property('csrfToken');
    }));
});
describe('POST /fetch-metadata', () => {
    let csrfToken;
    let cookie;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        // Fetch CSRF token
        const response = yield (0, supertest_1.default)(app_1.app.server).get('/api/csrf-token');
        csrfToken = response.body.csrfToken;
        // Handle `set-cookie` correctly
        const setCookie = response.headers['set-cookie'];
        console.log('Raw Set-Cookie:', setCookie); // Debug log
        if (Array.isArray(setCookie)) {
            // Process multiple cookies correctly
            const csrfCookies = setCookie.filter(c => c.startsWith('_csrf'));
            cookie = csrfCookies.length > 0 ? csrfCookies[0].split(';')[0] : ''; // Use the first CSRF cookie
        }
        else {
            cookie = setCookie ? setCookie.split(';')[0] : ''; // Single cookie case
        }
        console.log('Fetched CSRF Token:', csrfToken);
        console.log('Fetched Cookie:', cookie);
    }));
    it('should add metadata for valid URLs and return the metadata', () => __awaiter(void 0, void 0, void 0, function* () {
        const urls = ['https://www.github.com']; // Valid URL for testing
        const response = yield (0, supertest_1.default)(app_1.app.server)
            .post('/api/fetch-metadata')
            .set('Cookie', cookie) // Correctly set cookie
            .set('X-CSRF-Token', csrfToken) // Ensure we are following your frontend implementation
            .send(urls);
        console.log('Request Headers:', {
            Cookie: cookie,
            'X-CSRF-Token': csrfToken,
        });
        (0, chai_1.expect)(response.status).to.equal(201);
        const metadataUrls = response.body;
        (0, chai_1.expect)(metadataUrls).to.be.an('array').that.is.not.empty;
        (0, chai_1.expect)(metadataUrls[0]).to.have.all.keys('_id', 'url', 'title', 'description', 'image');
    }));
    it('should return an error when provided with invalid URLs', () => __awaiter(void 0, void 0, void 0, function* () {
        const urls = ['invalid-url', 'ht://invalid-url', 'ht://invalid-url']; // Invalid URLs
        const response = yield (0, supertest_1.default)(app_1.app.server)
            .post('/api/fetch-metadata')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrfToken) // Use the CSRF token properly
            .send(urls);
        (0, chai_1.expect)(response.status).to.equal(400); // Expecting a 400 (Bad Request) for invalid URLs
        (0, chai_1.expect)(response.body).to.have.property('message');
        (0, chai_1.expect)(response.body.message).to.include('Invalid URL'); // Ensure this matches your error handling in the service
    }));
    it('should return an error when metadata is missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const urls = ['https://www.openai.com', 'https://www.openai.com', 'https://www.openai.com']; // Using a known URL
        const response = yield (0, supertest_1.default)(app_1.app.server)
            .post('/api/fetch-metadata')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', csrfToken) // Ensure CSRF token is sent here
            .send(urls);
        (0, chai_1.expect)(response.status).to.equal(400); // Expecting a 400 (Bad Request) when fields are missing
        (0, chai_1.expect)(response.body).to.have.property('message');
        (0, chai_1.expect)(response.body.message).to.include('Missing'); // Ensure this matches your error handling in the service
    }));
    it('should reject the request without a valid CSRF token', () => __awaiter(void 0, void 0, void 0, function* () {
        const urls = ['https://www.github.com', 'https://www.github.com', 'https://www.github.com']; // Valid URL for rejection test
        const response = yield (0, supertest_1.default)(app_1.app.server)
            .post('/api/fetch-metadata')
            .set('Cookie', cookie)
            .set('X-CSRF-Token', 'invalid-token') // Simulating invalid CSRF token
            .send(urls);
        (0, chai_1.expect)(response.status).to.equal(403); // Expecting a 403 (Forbidden) for invalid CSRF token
        (0, chai_1.expect)(response.body).to.have.property('message');
        (0, chai_1.expect)(response.body.message).to.include('invalid CSRF token'); // Check your service error message
    }));
});
