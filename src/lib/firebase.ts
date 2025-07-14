
'use server';

import admin from 'firebase-admin';

// This simplified initialization will use Application Default Credentials (ADC).
// In a managed environment (like Firebase App Hosting), it will automatically
// find the service account credentials. For local development, you would
// need to set up ADC by running `gcloud auth application-default login`.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // Log the error but don't re-throw, so the app can handle db being null.
  }
}

// Export the firestore instance. If initialization failed, db will be null,
// and any function using it will throw an error, which is the desired behavior.
const db = admin.apps.length > 0 ? admin.firestore() : null;

export { db };
