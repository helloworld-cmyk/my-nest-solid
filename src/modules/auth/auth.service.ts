import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { UserRepository } from '../../repositories/user.repository.js';
import { AuthResponseMapper } from '../../utils/converDtoResponse/auth.js';
import { AuthProvider, Role } from '../../../prisma/generated/prisma/enums.js';
import { LoginDto } from './dto/request/login.js';
import { RegisterDto } from './dto/request/register.js';
import { RegisterResponseDto } from './dto/response/register.js';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/request/refresh.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatches = await verify(user.passwordHash, loginDto.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user.id, user.email, user.role ?? Role.USER);
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const existing = await this.userRepository.emailExists(registerDto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }
    const passwordHash = await hash(registerDto.password);
    const user = await this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phoneNumber: registerDto.phone,
      authProvider: AuthProvider.EMAIL_PASSWORD,
    });
    return AuthResponseMapper.toRegisterResponse(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    let decoded: { sub: string };
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.generateTokens(user.id, user.email, user.role ?? Role.USER);
  }

  private generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXP') ?? '5m';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXP') ?? '7d';

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiresIn as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn as any,
    });

    return { accessToken, refreshToken, fcmToken: 'default_fcm_token' };
  }
}
