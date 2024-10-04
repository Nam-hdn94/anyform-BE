import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'

export class UpdateDeviceDto {
  @IsString({
    message: i18nValidationMessage('validation.is_string', {
      name: 'fcm_token',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.is_required', {
      name: 'fcm_token',
    }),
  })
  @ApiProperty({ example: '' })
  fcm_token: string
}
