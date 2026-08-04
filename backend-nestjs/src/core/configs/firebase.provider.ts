import { Provider, Logger } from '@nestjs/common';
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
      Logger.warn('Missing FIREBASE_SERVICE_ACCOUNT env variable — Firebase features will be disabled', 'FirebaseProvider');
      return null;
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountRaw);
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      Logger.log('Firebase Admin SDK initialized successfully', 'FirebaseProvider');
      return app;
    } catch (error) {
      Logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON', error, 'FirebaseProvider');
      return null;
    }
  },
};
