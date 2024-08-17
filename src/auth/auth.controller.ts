import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { AuthBody } from './Dto/auth-body.dto';
import { CreateUser } from './Dto/create-user.dto';

// @UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // Function to log in
  @Post('login')
  async login(@Body() authBody: AuthBody) {
    return this.authService.login({ authBody });
  }

  // Function to register
  @Post('register')
  async register(@Body() registerBody: CreateUser) {
    return this.authService.register({ registerBody });
  }

  // Function to generate a token in which user information is encapsulated
  @UseGuards(JwtAuthGuard)
  @Get()
  async authenticate(@Request() request: RequestWithUser) {
    return await this.userService.getUser({ userId: request.user.userId });
  }
}
