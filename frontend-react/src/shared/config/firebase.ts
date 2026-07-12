// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";
import envConfig from "@/shared/config/envConfig";


const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
let messagingInstance: Messaging | null = null;
try {
  messagingInstance = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging is not supported (likely due to missing HTTPS).");
}

export const messaging = messagingInstance;
