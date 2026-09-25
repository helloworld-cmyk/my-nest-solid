import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { I18nTranslator } from '../../i18n/i18n.translator.js';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private initialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly translator: I18nTranslator,
  ) {
    this.init();
  }

  private init() {
    if (getApps().length > 0) {
      this.initialized = true;
      return;
    }

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (projectId && clientEmail && privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
      if (
        (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))
      ) {
        privateKey = privateKey.slice(1, -1);
      }

      try {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          projectId,
        });
        this.initialized = true;
        this.logger.log('Firebase Admin initialized with service account');
        return;
      } catch (error) {
        this.logger.error(
          'Failed to initialize Firebase Admin with cert',
          error,
        );
      }
    }

    try {
      initializeApp({
        projectId: projectId ?? undefined,
      });
      this.initialized = true;
      this.logger.warn(
        'Firebase Admin initialized with default credentials (set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_* env vars for production)',
      );
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
    }
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    if (!idToken) {
      throw new UnauthorizedException(
        this.translator.t('auth.missingFirebaseToken'),
      );
    }
    if (!this.initialized && getApps().length === 0) {
      throw new UnauthorizedException(
        this.translator.t('auth.firebaseNotInitialized'),
      );
    }
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      return decoded;
    } catch {
      throw new UnauthorizedException(
        this.translator.t('auth.invalidFirebaseToken'),
      );
    }
  }
}
