import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from 'src/decorators/roles.decorator'
import { PSQL } from 'src/modules/database'
import { Roles } from 'src/modules/role/role.constant'
import { RoleService } from 'src/modules/role/role.service'
import User from 'src/modules/user/entities/user.entity'
import WorkspaceDeactivateUser from 'src/modules/workspace/entities/workspaceDeactivateUser.entity'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private roleService: RoleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: string[] = this.reflector.getAllAndOverride<Roles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    const request = context.switchToHttp().getRequest()
    const headers: Record<string, string> = request?.headers
    const workspaceId: number = +headers?.['workspace-id']

    const user: User | undefined = request?.user

    if (!user?.is_active) {
      throw new NotAcceptableException('You have not been active in system')
    }

    if (user?.id && workspaceId) {
      const check: WorkspaceDeactivateUser = await PSQL.createQueryBuilder(
        WorkspaceDeactivateUser,
        'deactive',
      )
        .where('deactive.user_id = :user_id', { user_id: user.id })
        .andWhere('deactive.workspace_id = :workspace_id', {
          workspace_id: workspaceId,
        })
        .getOne()

      if (check?.id) {
        throw new NotAcceptableException(
          'You have been deactivated to this workspace',
        )
      }
    }

    if (requiredRoles.length === 0) {
      return true
    }

    const isValid: boolean = await this.roleService.can(
      user.roles,
      requiredRoles[0],
    )

    if (!isValid) {
      throw new ForbiddenException()
    }

    return true
  }
}
