import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserRepository } from '../../repositories/user.repository.js';
import { JwtStrategy } from './strategy/jwt.strategy.js';
import { JwtAdminStrategy } from './strategy/jwt-admin.strategy.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXP', '5m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [UserRepository, AuthService, JwtStrategy, JwtAdminStrategy],
  exports: [JwtStrategy, JwtAdminStrategy],
})
export class AuthModule {}
