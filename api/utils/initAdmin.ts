import * as admin from "firebase-admin";

export function initAdmin() {
  if (!admin.apps.length) {
    let serviceAccount;
    const key = process.env.FIREBASE_ADMIN_KEY!;
    
    // Check if Base64 encoded (doesn't start with '{')
    if (!key.trim().startsWith('{')) {
      // Decode from Base64
      const decoded = Buffer.from(key, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    } else {
      // Already JSON, just parse (also fix any escaped newlines in private_key)
      serviceAccount = JSON.parse(key);
    }
    
    // Ensure private_key has proper newlines
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}
