import { Controller, Body, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from 'src/user/user.service';

export type AuthBody = {email: string, password: string};

// @UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService, private readonly userService: UserService){}

@Post('login')
    async login(@Body() authBody: AuthBody) {
    // console.log("THE AUTH BODY IS -----------", {authBody});
        return this.authService.login({authBody});
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async authenticate(@Request() request: RequestWithUser) {
        const { userId } = request.user;
        return await this.userService.getUser({userId: userId});
    }

}
