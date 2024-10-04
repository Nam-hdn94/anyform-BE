import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, TransformFnParams } from 'class-transformer'
import { IsBooleanString, IsEnum, IsOptional } from 'class-validator'
import { i18nValidationMessage } from 'nestjs-i18n'
import { RequiredPagination } from 'src/utils/dto/pagination.dto'
import { OrderBy } from 'src/utils/interface/order-by'

export enum SortByRole {
  ID = 'id',
  NAME = 'name',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export class ListRoleDto extends RequiredPagination {
  @IsOptional()
  @IsEnum(SortByRole, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(SortByRole).join(', '),
      field: 'sort_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Sort by field name',
    enum: SortByRole,
    example: SortByRole.ID,
  })
  sort_by: SortByRole

  @IsOptional()
  @IsEnum(OrderBy, {
    message: i18nValidationMessage('validation.match_enum', {
      enum: Object.values(OrderBy).join(', '),
      field: 'order_by',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by role',
    enum: OrderBy,
    example: OrderBy.ASC,
  })
  order_by: OrderBy

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @ApiPropertyOptional({ description: 'Search by name' })
  name: string

  @IsOptional()
  @IsBooleanString({
    message: i18nValidationMessage('validation.is_boolean', {
      name: 'is_active',
    }),
  })
  @ApiPropertyOptional({ description: 'Search role active', type: Boolean })
  is_active: boolean
}
