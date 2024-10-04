import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export interface LoginResponse {
    token: string;
    refresh_token: string;
    expired_time: number;
}

export interface TokenResponse {
    access_token: string;
    expires_in: number;
    id_token: string;
    refresh_token: string;
    token_type: string;
}

export class LogoutDto {
    @IsOptional()
    @IsString({
        message: i18nValidationMessage('validation.is_string', {
            name: 'fcm_token',
        }),
    })
    @ApiPropertyOptional({ example: '' })
    fcm_token?: string;  // Optional property with ?
}

export class LoginDto extends LogoutDto {
    
    @IsEmail({}, { message: i18nValidationMessage('validation.email.not_valid') })
    @Transform(({ value }: TransformFnParams) => value?.trim().toLowerCase())
    @ApiProperty({ example: 'r@gmail.com' })
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
    @ApiProperty({ example: '123456' })  // Example added for OTP
    otp: string;
}

   