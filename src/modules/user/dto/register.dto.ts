import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class RegisterDto {
  
    @IsEmail({}, { message: i18nValidationMessage('validation.email.not_valid') })
    @Transform(({ value }: TransformFnParams) => value?.trim().toLowerCase())
    @ApiProperty({ example: 'nam.ha@tmessage.net' })
    email: string;
  
    @IsString({
      message: i18nValidationMessage('validation.is_string', {
        name: 'otp',
      }),
    })
    @IsNotEmpty({
      message: i18nValidationMessage('validation.is_required', {
        name: 'otp',
      }),
    })
    @ApiProperty({ example: '123456' })
    otp: string;
  
    @ValidateIf((_, value) => !!value) // Only validates if value is provided
    @IsString({
      message: i18nValidationMessage('validation.is_string', {
        name: 'name',
      }),
    })
    @IsNotEmpty({
      message: i18nValidationMessage('validation.is_required', {
        name: 'name',
      }),
    })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    @ApiPropertyOptional({ example: 'Peter' })
    name?: string; // Optional, so marked with `?`
  
    @IsOptional()
    @IsString({
      message: i18nValidationMessage('validation.is_string', {
        name: 'fcm_token',
      }),
    })
    @ApiPropertyOptional({ example: '' })
    fcm_token?: string; // Optional property
}
