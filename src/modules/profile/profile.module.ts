import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [PrismaService, UserRepository, ProfileService],
})
export class ProfileModule {}
