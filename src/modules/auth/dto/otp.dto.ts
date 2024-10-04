import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEmail, IsEnum } from 'class-validator'
import { toLower } from 'lodash'
import { i18nValidationMessage } from 'nestjs-i18n'
import { OtpType } from '../auth.constants'

export class OtpDto {
    @IsEmail({}, { message: i18nValidationMessage('validation.email.not_valid') })
  @Transform(({ value }: TransformFnParams) => toLower(value?.trim()))
  @ApiProperty({ example: 'r@gmail.com' })
  email: string

  @IsEnum(OtpType, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(OtpType).join(', '),
      field: 'type',
    }),
  })
  @ApiProperty({
    enum: OtpType,
    example: OtpType.SIGN_IN,
  })
  type: OtpType
}