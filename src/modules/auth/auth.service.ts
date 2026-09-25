import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { AuthResponseMapper } from '../../utils/converDtoResponse/auth.js';
import { AuthProvider, Role } from '../../../prisma/generated/prisma/enums.js';
import { LoginRequestDto } from './dto/request/login.js';
import { RegisterRequestDto } from './dto/request/register.js';
import { RegisterResponseDto } from './dto/response/register.js';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRequestDto } from './dto/request/refresh.js';
import { FirebaseLoginRequestDto } from './dto/request/firebase-login.js';
import { FirebaseService } from '../../3rdparty/firebase/firebase.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly translator: I18nTranslator,
  ) {}

  async login(dto: LoginRequestDto) {
    const { data } = dto;
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(
        this.translator.t('auth.invalidCredentials'),
      );
    }
    const passwordMatches = await verify(user.passwordHash, data.password);
    if (!passwordMatches) {
      throw new UnauthorizedException(
        this.translator.t('auth.invalidCredentials'),
      );
    }
    return this.generateTokens(user.id, user.email, user.role ?? Role.USER);
  }

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const { data } = dto;
    const existing = await this.userRepository.emailExists(data.email);
    if (existing) {
      throw new ConflictException(
        this.translator.t('auth.emailAlreadyRegistered'),
      );
    }
    const passwordHash = await hash(data.password);
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phone,
      authProvider: AuthProvider.EMAIL_PASSWORD,
    });
    return AuthResponseMapper.toRegisterResponse(user);
  }

  async refreshToken(dto: RefreshTokenRequestDto) {
    const { data } = dto;
    const { refreshToken } = data;
    let decoded: { sub: string };
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        this.translator.t('auth.invalidRefreshToken'),
      );
    }
    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException(
        this.translator.t('auth.invalidRefreshToken'),
      );
    }
    return this.generateTokens(user.id, user.email, user.role ?? Role.USER);
  }

  async firebaseLogin(dto: FirebaseLoginRequestDto) {
    const { data } = dto;
    const decoded = await this.firebaseService.verifyIdToken(data.idToken);

    const firebaseUid = decoded.uid;
    const email = decoded.email;
    const providerId: string | undefined = (
      decoded as unknown as {
        firebase?: { sign_in_provider?: string };
      }
    ).firebase?.sign_in_provider;

    const providerMap: Record<string, AuthProvider> = {
      'google.com': AuthProvider.GOOGLE,
      'facebook.com': AuthProvider.FACEBOOK,
      'github.com': AuthProvider.GITHUB,
    };

    const authProvider = providerId ? providerMap[providerId] : undefined;
    if (!authProvider) {
      throw new BadRequestException(
        this.translator.t('auth.unsupportedFirebaseProvider'),
      );
    }

    if (!email) {
      throw new BadRequestException(
        this.translator.t('auth.emailNotProvidedByProvider'),
      );
    }

    const name: string | undefined = decoded.name as string | undefined;
    const picture: string | undefined = decoded.picture;

    let firstName: string;
    let lastName: string;
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(/\s+/);
      firstName = parts[0] ?? email.split('@')[0];
      lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'User';
    } else {
      firstName = email.split('@')[0]!;
      lastName = 'User';
    }

    const existingByUid =
      await this.userRepository.findByFirebaseUid(firebaseUid);
    if (existingByUid) {
      return this.generateTokens(
        existingByUid.id,
        existingByUid.email,
        existingByUid.role ?? Role.USER,
      );
    }

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      if (existingByEmail.authProvider !== authProvider) {
        throw new ConflictException(
          this.translator.t('auth.emailRegisteredWithDifferentProvider'),
        );
      }
      if (!existingByEmail.firebaseUid) {
        const linked = await this.userRepository.updateFirebaseLink(
          existingByEmail.id,
          {
            firebaseUid,
            avatarPath: picture ?? existingByEmail.avatarPath ?? null,
          },
        );
        return this.generateTokens(
          linked.id,
          linked.email,
          linked.role ?? Role.USER,
        );
      }
      return this.generateTokens(
        existingByEmail.id,
        existingByEmail.email,
        existingByEmail.role ?? Role.USER,
      );
    }

    const created = await this.userRepository.create({
      email,
      firstName,
      lastName,
      firebaseUid,
      avatarPath: picture ?? null,
      authProvider,
    });

    return this.generateTokens(
      created.id,
      created.email,
      created.role ?? Role.USER,
    );
  }

  private generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXP') ?? '5m';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXP') ?? '7d';

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
    });

    return { accessToken, refreshToken, fcmToken: 'default_fcm_token' };
  }
}
