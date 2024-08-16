import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Get()
    // @Get('settings')
    getUsers(){
        return this.userService.getUsers();
    }

    @Get('/one/:userId')
    getUser(@Param('userId') userId: string){
        return this.userService.getUser({userId});
    }
}
