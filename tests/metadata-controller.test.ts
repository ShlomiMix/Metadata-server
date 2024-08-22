import request from 'supertest';
import { app } from '../src/app'; // Path to your app module
import { expect } from 'chai';
import { IUrlMetadataModel } from '../src/3-models/url-metadata-model'; // Path to your URL metadata model

describe('GET /csrf-token', () => {
  it('should return a CSRF token', async () => {
    const response = await request(app.server).get('/api/csrf-token');
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('csrfToken');
  });
});

describe('POST /fetch-metadata', () => {
  let csrfToken: string;
  let cookie: string;

  before(async () => {
    // Fetch CSRF token
    const response = await request(app.server).get('/api/csrf-token');
    csrfToken = response.body.csrfToken;

    // Handle `set-cookie` correctly
    const setCookie = response.headers['set-cookie'];
    console.log('Raw Set-Cookie:', setCookie); // Debug log

    if (Array.isArray(setCookie)) {
      // Process multiple cookies correctly
      const csrfCookies = setCookie.filter(c => c.startsWith('_csrf'));
      cookie = csrfCookies.length > 0 ? csrfCookies[0].split(';')[0] : ''; // Use the first CSRF cookie
    } else {
      cookie = setCookie ? setCookie.split(';')[0] : ''; // Single cookie case
    }

    console.log('Fetched CSRF Token:', csrfToken);
    console.log('Fetched Cookie:', cookie);
  });

  it('should add metadata for valid URLs and return the metadata', async () => {
    const urls = ['https://www.github.com']; // Valid URL for testing
    const response = await request(app.server)
      .post('/api/fetch-metadata')
      .set('Cookie', cookie) // Correctly set cookie
      .set('X-CSRF-Token', csrfToken) // Ensure we are following your frontend implementation
      .send(urls);

    console.log('Request Headers:', {
      Cookie: cookie,
      'X-CSRF-Token': csrfToken,
    });

    expect(response.status).to.equal(201);
    const metadataUrls: IUrlMetadataModel[] = response.body;
    expect(metadataUrls).to.be.an('array').that.is.not.empty;
    expect(metadataUrls[0]).to.have.all.keys('_id', 'url', 'title', 'description', 'image');
  });

  it('should return an error when provided with invalid URLs', async () => {
    const urls = ['invalid-url', 'ht://invalid-url', 'ht://invalid-url']; // Invalid URLs
    const response = await request(app.server)
      .post('/api/fetch-metadata')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken) // Use the CSRF token properly
      .send(urls);

    expect(response.status).to.equal(400); // Expecting a 400 (Bad Request) for invalid URLs
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.include('Invalid URL'); // Ensure this matches your error handling in the service
  });

  it('should return an error when metadata is missing required fields', async () => {
    const urls = ['https://www.openai.com', 'https://www.openai.com', 'https://www.openai.com']; // Using a known URL
    const response = await request(app.server)
      .post('/api/fetch-metadata')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken) // Ensure CSRF token is sent here
      .send(urls);

    expect(response.status).to.equal(400); // Expecting a 400 (Bad Request) when fields are missing
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.include('Missing'); // Ensure this matches your error handling in the service
  });

  it('should reject the request without a valid CSRF token', async () => {
    const urls = ['https://www.github.com', 'https://www.github.com', 'https://www.github.com']; // Valid URL for rejection test
    const response = await request(app.server)
      .post('/api/fetch-metadata')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', 'invalid-token') // Simulating invalid CSRF token
      .send(urls);

    expect(response.status).to.equal(403); // Expecting a 403 (Forbidden) for invalid CSRF token
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.include('invalid CSRF token'); // Check your service error message
  });
});
