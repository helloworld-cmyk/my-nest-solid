import type { UserRepository } from '../../repositories/user.repository.js';
import type { RegisterResponseDto } from '../../modules/auth/dto/response/register.js';

export type RegisteredUser = Awaited<ReturnType<UserRepository['create']>>;

export class AuthResponseMapper {
  private constructor() {}

  static toRegisterResponse(user: RegisteredUser): RegisterResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
  }
}
