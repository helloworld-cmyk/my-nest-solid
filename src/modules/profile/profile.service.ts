import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nTranslator } from '../../i18n/i18n.translator.js';
import { UserRepository } from '../../repositories/user.repository.js';
import { ProfileResponseMapper } from '../../utils/converDtoResponse/profile.js';
import { ProfileResponseDto } from './dto/response/profile.js';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly translator: I18nTranslator,
  ) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findProfileById(userId);
    if (!user) {
      throw new UnauthorizedException(
        this.translator.t('profile.userNotFound'),
      );
    }
    return ProfileResponseMapper.toProfileResponse(user);
  }
}
