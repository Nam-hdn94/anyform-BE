import * as crypto from 'crypto'
import ORM from './orm.config'
import { removeAccents } from 'src/utils/function/common'
import { Roles } from 'src/modules/role/role.constant'
import Role from 'src/modules/role/entities/role.entity'
import User from 'src/modules/user/entities/user.entity'

const PSQL = ORM

const initRoles = async (): Promise<Role[]> => {
  const roles: Role[] = await Promise.all(
    Object.values(Roles).map(async (name: string) => {
      const role: Role = await PSQL.getRepository(Role).findOne({
        where: { name },
      })

      if (!role) {
        const nRole = new Role()

        nRole.name = name
        nRole.deleteable = false

        return PSQL.getRepository(Role).save(nRole)
      }

      return role
    }),
  )

  const email: string = process.env.EMAIL_ADMIN

  if (email) {
    let admin: User = await PSQL.createQueryBuilder(User, 'user')
      .where('user.email = :email', { email })
      .select(['user.id'])
      .getOne()

    if (!admin) {
      admin = new User()

      admin.email = email
      admin.password = crypto.createHmac('sha256', '123').digest('hex')
      admin.name = Roles.ADMIN
      admin.search_name = removeAccents(Roles.ADMIN)

      const role: Role = roles.find((r: Role) => r.name === Roles.ADMIN)
      admin.roles = [role]

      await PSQL.getRepository(User).save(admin)
    }
  }

  return roles
}

PSQL.initialize().then(() => initRoles())

export { PSQL }
