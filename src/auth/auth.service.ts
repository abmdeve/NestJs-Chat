import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';
import { AuthBody } from './Dto/auth-body.dto';
import { CreateUser } from './Dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Function to encrypt password
  private async hashPassword({ password }: { password: string }) {
    const hasedPassword = await hash(password, 10);

    return hasedPassword;
  }

  // Function to compare password
  private async isPasswordValid({
    password,
    hasedPassword,
  }: {
    password: string;
    hasedPassword: string;
  }) {
    const isPasswordValid = await compare(password, hasedPassword);

    return isPasswordValid;
  }

  // Function to generate a token in which user information is encapsulated
  private async authenticateUser({ userId }: UserPayload) {
    const payload: UserPayload = { userId };

    return {
      acces_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  // Function to log in
  async login({ authBody }: { authBody: AuthBody }) {
    const { email, password } = authBody;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      throw new Error("L'utilisateur n'existe pas.");
    }

    const isPasswordValid = await this.isPasswordValid({
      password,
      hasedPassword: existingUser.password,
    });

    if (!isPasswordValid) {
      throw new Error('Le mot de passe est invalide.');
    }

    return this.authenticateUser({ userId: existingUser.id });
  }

  // Function to register
  async register({ registerBody }: { registerBody: CreateUser }) {
    const { email, firstname, password } = registerBody;

    const hashPassword = await this.hashPassword({ password });

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new Error('Un compte existe déjà à cette adresse email.');
    }

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        firstname,
      },
    });
    return this.authenticateUser({ userId: createdUser.id });
  }
}
