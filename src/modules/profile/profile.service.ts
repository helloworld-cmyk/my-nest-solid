import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository.js';
import { ProfileResponseMapper } from '../../utils/converDtoResponse/profile.js';
import { ProfileResponseDto } from './dto/response/profile.js';

@Injectable()
export class ProfileService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findProfileById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return ProfileResponseMapper.toProfileResponse(user);
  }
}
