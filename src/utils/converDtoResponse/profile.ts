import type { UserRepository } from '../../repositories/user.repository.js';
import type { ProfileResponseDto } from '../../modules/profile/dto/response/profile.js';

export type ProfileData = NonNullable<
  Awaited<ReturnType<UserRepository['findProfileById']>>
>;

export class ProfileResponseMapper {
  private constructor() {}

  static toProfileResponse(user: ProfileData): ProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ?? '',
      avatarPath: user.avatarPath,
      firebaseUid: user.firebaseUid,
      authProvider: user.authProvider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
