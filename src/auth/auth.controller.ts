import {Controller, Get, Post} from '@nestjs/common';


@Controller('auth')
export class AuthController {
  @Post('login')
  login(): string {
    return 'Login endpoint';
  }

  @Post('register')
  register(): string {
    return 'Register endpoint';
  }
}