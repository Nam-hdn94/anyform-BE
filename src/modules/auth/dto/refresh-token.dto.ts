import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class RefreshTokenDto {
    @IsString({
        message: i18nValidationMessage('validation.is_string',{
              name: 'refresh_token'
        }),
    })
    @IsNotEmpty({
        message: i18nValidationMessage('validation.is_not_empty',{
              name: 'refresh_token'
        }),
    })
    @ApiProperty()
    refresh_token: string;  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token for refreshing access token.  // JWT token
}