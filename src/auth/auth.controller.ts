import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './Dto/create-user.dto';
import { LoginUserDto } from './Dto/login-user.dto';
import { ResetUserPasswordDto } from './Dto/reset-user-password.dto';

// @UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // Function to log in
  @Post('login')
  async login(@Body() authBody: LoginUserDto) {
    return this.authService.login({ authBody });
  }

  // Function to register
  @Post('register')
  async register(@Body() registerBody: CreateUserDto) {
    return this.authService.register({ registerBody });
  }

  // Function to request-reset-password
  @Post('request-reset-password')
  async resetUserPasswordRequest(@Body('email') email: string) {
    return await this.authService.resetUserPassword({
      email,
    });
  }
  // Function to request-reset-password
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetUserPasswordDto) {
    return await this.authService.resetPassword({
      resetPasswordDto,
    });
  }
  // Function to verify-reset-password
  @Post('verify-reset-password')
  async verifyResetPassword(@Query('token') token: string) {
    return await this.authService.verifyResetPassword({
      token,
    });
  }

  // Function to generate a token in which user information is encapsulated
  @UseGuards(JwtAuthGuard)
  @Get()
  async authenticate(@Request() request: RequestWithUser) {
    return await this.userService.getUser({ userId: request.user.userId });
  }
}
