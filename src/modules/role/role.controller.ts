import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { I18n, I18nContext } from 'nestjs-i18n'
import { Auth } from 'src/decorators/roles.decorator'
import { List } from 'src/utils/interface/list-response'
import { DeleteResult } from 'typeorm'
import { RoleApis } from '../api/api.constant'
import { CreateRoleDto } from './dto/create-role.dto'
import { ListRoleDto } from './dto/list-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import Role from './entities/role.entity'
import { RoleService } from './role.service'

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Auth(RoleApis.ADD_ROLE)
  @ApiOperation({
    summary: 'Create a role, role ADMIN or role have permission ADD_ROLE',
  })
  @Post()
  create(
    @Body() payload: CreateRoleDto,
    @I18n() i18n: I18nContext,
  ): Promise<Role> {
    return this.roleService.create(payload, i18n)
  }

  @Auth(RoleApis.VIEW_ROLE)
  @ApiOperation({
    summary: 'Find all role, role ADMIN or role have permission VIEW_ROLE',
  })
  @Get()
  find(@Query() query: ListRoleDto): Promise<List<Role>> {
    return this.roleService.find(query)
  }

  @Auth(RoleApis.VIEW_ROLE)
  @ApiOperation({
    summary: 'Find a role, role ADMIN or role have permission VIEW_ROLE',
  })
  @Get(':id')
  findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Role> {
    return this.roleService.findOne(+id, i18n)
  }

  @Auth(RoleApis.EDIT_ROLE)
  @ApiOperation({
    summary: 'Update a role, role ADMIN or role have permission EDIT_ROLE',
  })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateRoleDto,
    @I18n() i18n: I18nContext,
  ): Promise<Role> {
    return this.roleService.update(+id, payload, i18n)
  }

  @Auth(RoleApis.DELETE_ROLE)
  @ApiOperation({
    summary: 'Delete a role, role ADMIN or role have permission DELETE_ROLE',
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.roleService.remove(+id, i18n)
  }
}
