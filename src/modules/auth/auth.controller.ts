import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseLoginRequestDto } from './dto/request/firebase-login.js';
import { LoginRequestDto } from './dto/request/login.js';
import { RefreshTokenRequestDto } from './dto/request/refresh.js';
import { RegisterRequestDto } from './dto/request/register.js';
import { LoginResponseDto } from './dto/response/login.js';
import { RefreshTokenResponseDto } from './dto/response/refresh.js';
import { RegisterResponseDto } from './dto/response/register.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email is already registered',
  })
  register(@Body() dto: RegisterRequestDto) {
    return this.authService.register(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  refreshToken(@Body() dto: RefreshTokenRequestDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('firebase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with Firebase OAuth (Google/Facebook/GitHub)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Firebase login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid Firebase ID token',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered with different provider',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Unsupported provider or missing email',
  })
  firebaseLogin(@Body() dto: FirebaseLoginRequestDto) {
    return this.authService.firebaseLogin(dto);
  }
}
