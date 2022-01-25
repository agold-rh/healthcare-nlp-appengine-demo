# Healthcare NLP AppEngine Demo

The demo application is a Node.js and React.js system to visualize the 
Google Cloud [Healthcare Natural Language API](https://cloud.google.com/healthcare/docs/how-tos/nlp).
You can upload your own sample medical text to visualize the output such as medical dictionaries,
entity extraction and relationships, context assessment and more. We have also provided sample
texts for a a medical record, research paper and lab form. 

![screencast](screencast-short.gif)

## GoogleCloudPlatform/healthcare-nlp-visualizer-demo 
1. This is a fork and conversion of that project code to AppEngine standard.
1. In this case, AppEngine is simpler to deploy than a Cloud Function with a separate web server.
1. The demo app can be easily protected by IAP (https://cloud.google.com/iap/docs/concepts-overview).

## Prerequisites 

1. A GCP Project with billing and the Healthcare NLP API enabled.
1. Complete the Healthcare NLP [How-to Guide](https://cloud.google.com/healthcare/docs/how-tos/nlp).
    - Note: For the purposes of this demo, grant the new service account "Viewer", not "Owner".
1. Familiarity with Google Cloud AppEngine standard.
1. Familiarity with Google Cloud Identity Aware Proxy
    - This code validates identity with JWT headers set by IAP.
    - You must enable IAP for this application to work.
    - You must grant the application user `IAP Web Application User` (https://cloud.google.com/iap/docs/concepts-overview#authorization).

## Set Up Instructions

### Important

Protect your newly created AppEngine standard application with appropriate IAM and IAP controls.

### Instructions

Please note, this code is NOT meant for production use.

1. ```grep -r REPLACE *``` this source code for values that must be modified.
    - You will need to replace these placeholders with real values.
1. Download the service account key for your project.
    - Put it in the `/internal` directory.
1. Create and deploy the application on GCP App Engine: `https://cloud.google.com/appengine/docs/standard/nodejs/quickstart`
    - The App Engine deployment region CANNOT BE CHANGED after application creation. 
    - Almost certainly, you will want to deploy to region `us-central` otherwise known as `us-central1` in this case. 
    - Currently, the NLP API is only available in two regions, thus the selection of `us-central` for the application.

