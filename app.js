// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

///////////////////////////////////////////////////////////////////////////////
// Libraries
const {google} = require('googleapis');
const superagent = require('superagent');
const {OAuth2Client} = require("google-auth-library");
const express = require("express");
const process = require("process");
const bodyParser = require("body-parser");
///////////////////////////////////////////////////////////////////////////////
// Enviornment variables set in app.yaml
const PROJECT_ID = process.env.MY_PROJECT_ID;
const PROJECT_NUMBER = process.env.MY_PROJECT_NUMBER;
const KEY_PATH = process.env.MY_KEY_PATH;
const SERVER_PORT = process.env.MY_SERVER_PORT || 8080;
const EXPECTED_AUDIENCE = `/projects/${PROJECT_NUMBER}/apps/${PROJECT_ID}`;
///////////////////////////////////////////////////////////////////////////////
// How to validate the IAP JWT headers
async function iap_validation(headers){
  let valid = false;
  const oAuth2Client = new OAuth2Client();
  const iapJwt = headers["x-goog-iap-jwt-assertion"]; 

  // Should never happen ...
  if (! iapJwt) {
    return valid;
  }

  // The IAP JWT is validated against the project, public keys, etc.
  try {
    const response = await oAuth2Client.getIapPublicKeys();
    const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
      iapJwt,
      response.pubkeys,
      EXPECTED_AUDIENCE,
      ["https://cloud.google.com/iap"]
    );

    valid = true; 
  } catch (error) {
    console.error(error);
  }

  return valid;
}
///////////////////////////////////////////////////////////////////////////////
// Load middleware and set routes
const app = express();

// Middleware function loading order is important!
// When any custom middleware function is used, 
// the default urlencode and json processing functions are disabled.
// Explicitly load these handlers so req.body (below) is populated. 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Make sure the IAP JWT headers are valid for the intended audience.
app.use(async (req, res, next) => {
  const valid = await iap_validation(req.headers);
  if (valid) {
    next();
  } else {
    res.status(401).send('IAP rejected this request').end();
  }
});

// Middleware function gives access to files in /static
app.use(express.static('static'));

// Enable POST requests to the /analyzeDocument route.
app.post('/analyzeDocument', async (req, res) => {

  const url = `https://healthcare.googleapis.com/v1beta1/projects/${PROJECT_NUMBER}/locations/us-central1/services/nlp:analyzeEntities`;
  let input_text;

  // Make sure there is input to process
  if (!req.body || !req.body.text) {
    res.status(202).send('No input text provided.');
    return
  } else {
    input_text = req.body.text;
  }

  // Standard GCP IAP JWT header validation
  const auth = new google.auth.GoogleAuth({
    keyFile: `${MY_KEY_PATH}`,
    scopes: ['https://www.googleapis.com/auth/cloud-healthcare'],
  });

  const accessToken = await auth.getAccessToken();
  const response = await superagent.post(url)
                          .send(JSON.stringify({'document_content': input_text}))
                          .set("Authorization", `Bearer ${accessToken}`)
                          .set("Content-Type", "application/json");

  if (! response.ok) {
    res.status(401).send(JSON.stringify(response));
  }

  res.type('text/json').status(200).send(response.body);
});

////////////////////////////////////////////////////////////////////////////////

// Start the server
app.listen(SERVER_PORT, () => {
  console.log(`App listening on port ${SERVER_PORT}`);
});

// Expose app to AppEngine
module.exports = app;

////////////////////////////////////////////////////////////////////////////////
