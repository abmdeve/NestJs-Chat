import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetUserPasswordDto {
  @IsString({ message: 'Vous devez fournir un token.' })
  token: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'Votre mot de passe doit faire plus de 6 caractères.',
  })
  password: string;
}
