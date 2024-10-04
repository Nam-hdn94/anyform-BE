import { ConflictException, Injectable } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { I18nContext } from "nestjs-i18n";
import User from "./entities/user.entity";
import { PSQL } from "src/database";
import { UpdateResult } from "typeorm";
import { NotFound } from "src/utils/function/exception";


@Injectable()
export class UserService {
    async create(
        { email, name = '' }: RegisterDto, 
        i18n: I18nContext,               
    ): Promise<User> {
        // kiem tra email da ton tai hay chua
        const foundUser = await PSQL.createQueryBuilder(User, 'user').where('user.email = emailx',{emailx: email} )
        .select(['user.id'])
        .getOne()

        if (foundUser) {
            throw new ConflictException(i18n.t('validation.email.already_exists')); 
        }
    
        const newUser = new User();
        newUser.email = email;
        newUser.name = name || email.split('@')[0];  

        const saveUser: User = await PSQL.getRepository(User).save(newUser);
    
        return saveUser;
    }

    async updateRefreshToken(
        id: number,
        refreshToken: string,
      ): Promise<UpdateResult> {
        return PSQL.getRepository(User).update(id, { refresh_token: refreshToken })
      }

      async findByRefreshToken(
        id: number,
        refresh_token: string,
        i18n: I18nContext,
      ): Promise<User> {
        const user: User = await PSQL.createQueryBuilder(User, 'user')
          .where('user.id = :id', { id })
          .andWhere('user.refresh_token = :refresh_token', { refresh_token })
          .select(['user.id', 'user.email', 'user.password'])
          .getOne()
    
        if (!user) {
          return NotFound('user', i18n)
        }
    
        return user
      }
    
}