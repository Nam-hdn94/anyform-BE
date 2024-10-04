import { Injectable, Logger } from '@nestjs/common'
import { lowerCase } from 'lodash'
import { I18nContext } from 'nestjs-i18n'
import { removeSpecialCharacters } from 'src/utils/function/common'
import {
  BadRequest,
  Forbidden,
  NotAcceptable,
  NotFound,
} from 'src/utils/function/exception'

import { DeleteResult, FindOperator, In, Raw } from 'typeorm'
import User from '../user/entities/user.entity'
import { CreateRoleDto } from './dto/create-role.dto'
import { ListRoleDto, SortByRole } from './dto/list-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import Role from './entities/role.entity'
import { Roles } from './role.constant'
import { PSQL } from 'src/database'
import { List } from 'src/utils/interface/list-response'
import { OrderBy } from 'src/utils/interface/order-by'
// import { BadRequest } from 'src/utils/function/exception'

@Injectable()
export class RoleService {
  private logger = new Logger(RoleService.name)

  // async can(roles: Role[], api: string): Promise<boolean> {
  //   const valid: boolean[] = (
  //     await Promise.all(
  //       roles.map(async (r: Role) => {
  //         if (r.name === Roles.ADMIN) return true

  //         if (!r.is_active) return false

  //         const role: Role = await PSQL.getRepository(Role).findOne({
  //           where: { id: r.id },
  //           relations: ['permissions'],
  //         })

  //         return role.permissions.map((p: Permission) => p.apis.includes(api))
  //       }),
  //     )
  //   ).flat()

  //   return valid.some((v: boolean) => v)
  // }

  async create(
    {
      name: nName,
      description,
      is_active,
      user_ids,
      permission_ids,
    }: CreateRoleDto,
    i18n: I18nContext,
  ): Promise<Role> {
    const name: string = removeSpecialCharacters(nName, 'upper')

    if (!name) {
      return BadRequest('role.name_invalid', i18n)
    }

    const role: Role = await PSQL.getRepository(Role).findOne({
      where: { name },
    })

    if (role) {
      return Forbidden('role.existed', i18n)
    }

    const nRole = new Role()

    nRole.name = name
    nRole.description = description
    nRole.is_active = is_active

   
    const users: User[] = await PSQL.getRepository(User).find({
      where: { id: In(user_ids) },
    })

    nRole.users = users.filter((user: User) => !!user)

    return PSQL.getRepository(Role).save(nRole)
  }

  async find(query: ListRoleDto): Promise<List<Role>> {
    const {
      sort_by = SortByRole.ID,
      order_by = OrderBy.ASC,
      name,
      is_active,
    } = query

    let nPage: number = +1

    if (nPage < 1) {
      nPage = 1
    }

    const limit: number = +10
    const skip: number = (nPage - 1) * limit

    const filters: {
      name?: FindOperator<string>
      is_active?: boolean
    } = {}

    if (name) {
      filters.name = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(name)}%'`,
      )
    }

    if (is_active) {
      filters.is_active = is_active
    }

    const [data, total]: [Role[], number] = await PSQL.getRepository(
      Role,
    ).findAndCount({
      where: filters,
      order: { [sort_by]: order_by },
      take: limit,
      skip,
    })

    return {
      data,
      page: nPage,
      page_size: limit,
      total,
      total_page: Math.ceil(total / limit),
    }
  }

  async findOne(id: number, i18n: I18nContext): Promise<Role> {
    const role: Role = await PSQL.getRepository(Role).findOne({
      where: { id },
      relations: ['users', 'permissions'],
    })

    if (!role) {
      return NotFound('role', i18n)
    }

    return role
  }

  async update(
    id: number,
    {
      name: nName,
      description,
      is_active,
      user_ids,
      permission_ids,
    }: UpdateRoleDto,
    i18n: I18nContext,
  ): Promise<Role> {
    const name: string = removeSpecialCharacters(nName, 'upper')

    if (!name) {
      return BadRequest('role.name_invalid', i18n)
    }

    const defaultRoles: string[] = Object.values(Roles)
    const isNameForbid: boolean = defaultRoles.includes(name)

    const role: Role = await this.findOne(id, i18n)
    const isRoleDefault: boolean = defaultRoles.includes(role.name)

    role.description = description
    role.is_active = Roles.ADMIN === role.name ? true : is_active // can not deactive with role ADMIN

    if (isRoleDefault && role.name !== name) {
      return NotAcceptable('role.change_name_default', i18n)
    }

    if (!isNameForbid && role.deleteable) {
      role.name = name
    }

    if (isNameForbid && !isRoleDefault) {
      return NotAcceptable('role.unique', i18n)
    }

    if (role.name !== Roles.ADMIN) {
    

    }

    const users: User[] = await PSQL.getRepository(User).find({
      where: { id: In(user_ids) },
    })

    role.users = users.filter((user: User) => !!user)

    return PSQL.getRepository(Role).save(role)
  }

  async remove(id: number, i18n: I18nContext): Promise<DeleteResult> {
    const role: Role = await this.findOne(id, i18n)

    if (!role.deleteable) {
      return NotAcceptable('role.deleteable', i18n, { roleName: role.name })
    }

    return PSQL.getRepository(Role).delete(id)
  }
}
