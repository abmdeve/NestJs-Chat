import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { AuthBody } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService){}

private async hashPassword({password}: {password: string}) {
    const hasedPassword = await hash(password, 100);

    return hasedPassword;
}
private async isPasswordValid({password, hasedPassword}: {password: string; hasedPassword: string}) {
    const isPasswordValid = await compare(password, hasedPassword);

    return isPasswordValid;
}

private authenticateUser({ userId }: UserPayload) {
// private authenticateUser({userId}: {userId: string}) {
    const payload : UserPayload = { userId };

    return {
        // acces_token: await this.jwtService.signAsync(payload),
        acces_token: this.jwtService.sign(payload),
    };
}

    async login({authBody}: {authBody: AuthBody}) {
        const { email, password } = authBody;

        // const hashPassword = await this.hashPassword({password});
        // console.log("PASSWORD HASED --------", {hashPassword, password});
        
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!existingUser) {
            throw new Error("L'utilisateur n'existe pas.");
        }

        const isPasswordValid = await this.isPasswordValid({password, hasedPassword: existingUser.password});

        if (!isPasswordValid) {
            throw new Error("Le mot de passe est invalide.");
        } 

        // return existingUser;
        return this.authenticateUser({userId: existingUser.id});
    }

}
