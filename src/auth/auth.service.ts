import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';
import { CreateUserDto } from './Dto/create-user.dto';
import { LoginUserDto } from './Dto/login-user.dto';
import { MailerService } from 'src/mailer.service';
import { createId } from '@paralleldrive/cuid2';
import { ResetUserPasswordDto } from './Dto/reset-user-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
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
  async login({ authBody }: { authBody: LoginUserDto }) {
    try {
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
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  }

  // Function to Request Reset password
  async resetUserPassword({ email }: { email: string }) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas.");
      }

      if (existingUser.isResettingPassword === true) {
        throw new Error(
          'Une demande de réinitialisation de mot de passe est déjà en cours.',
        );
      }

      const createdId = createId();
      await this.prisma.user.update({
        where: {
          email: email,
        },
        data: {
          isResettingPassword: true,
          resetPasswordToken: createdId,
        },
      });

      await this.mailerService.sendRequestPasswordEmail({
        firstname: existingUser.firstname,
        recipient: existingUser.email,
        token: createdId,
      });

      return {
        error: false,
        message: 'Consulter vos emails pour réinitialiser votre mot de passe.',
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  }

  // Function to Reset password
  async resetPassword({
    resetPasswordDto,
  }: {
    resetPasswordDto: ResetUserPasswordDto;
  }) {
    try {
      const { password, token } = resetPasswordDto;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });

      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas.");
      }

      if (existingUser.isResettingPassword === false) {
        throw new Error(
          "Aucune demande de réinitialisation de mot de passe n'est en cours.",
        );
      }
      const hasedPassword = await this.hashPassword({ password });
      await this.prisma.user.update({
        where: {
          resetPasswordToken: token,
        },
        data: {
          isResettingPassword: false,
          password: hasedPassword,
          // resetPasswordToken: createdId,
        },
      });

      return {
        error: false,
        message: 'Votre mot de passe a bien été changé.',
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  }
  // Function to Verify Reset password
  async verifyResetPassword({ token }: { token: string }) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });

      if (!existingUser) {
        throw new Error("L'utilisateur n'existe pas.");
      }

      if (existingUser.isResettingPassword === false) {
        throw new Error(
          "Aucune demande de réinitialisation de mot de passe n'est en cours.",
        );
      }

      return {
        error: false,
        message: 'Le token est valide et peut être utilisé.',
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  }

  // Function to register
  async register({ registerBody }: { registerBody: CreateUserDto }) {
    try {
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

      await this.mailerService.sendCreateAccount({
        firstname,
        recipient: email,
      });

      return this.authenticateUser({ userId: createdUser.id });
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  }
}
