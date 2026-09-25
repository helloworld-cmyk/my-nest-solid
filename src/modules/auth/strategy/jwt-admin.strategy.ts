import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { I18nTranslator } from '../../../i18n/i18n.translator.js';
import { UserRepository } from '../../../repositories/user.repository.js';
import { Role } from '../../../../prisma/generated/prisma/enums.js';
import { AuthenticatedUser, JwtPayload } from './jwt.strategy.js';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly translator: I18nTranslator,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException(
        this.translator.t('auth.invalidTokenPayload'),
      );
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(this.translator.t('auth.userNotFound'));
    }

    const userRole = user.role ?? Role.USER;
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        this.translator.t('auth.adminAccessRequired'),
      );
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role ?? Role.USER,
    };
  }
}
