import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsNotEmpty } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos',
    example: 123456,
  })
  @IsNumber()
  @IsNotEmpty()
  code: number;
}
