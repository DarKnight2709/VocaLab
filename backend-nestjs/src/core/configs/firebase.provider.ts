import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@/common/services/config.service';

export const FirebaseProvider: Provider = {
  provide: 'FIREBASE_ADMIN',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    if (admin.apps.length > 0) {
      return admin.app();
    }

    const serviceAccountRaw = configService.get('FIREBASE_SERVICE_ACCOUNT');
    if (!serviceAccountRaw) {
      console.warn("⚠️ Missing FIREBASE_SERVICE_ACCOUNT environment variable! Firebase features will not work.");
      return null;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountRaw);
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("🔥 Firebase Admin SDK initialized successfully!");
      return app;
    } catch (error) {
      console.error("❌ Failed to parse Firebase Service Account JSON string:", error);
      return null;
    }
  },
};
