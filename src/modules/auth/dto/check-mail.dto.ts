import { ApiProperty } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { toLower } from 'lodash'
import { i18nValidationMessage } from 'nestjs-i18n'

export class CheckEmailDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.email.not_valid') })
  @Transform(({ value }: TransformFnParams) => toLower(value?.trim()))
  @ApiProperty({ example: 'r@gmail.com' })
  email: string
}