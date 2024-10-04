import { Injectable, Logger } from '@nestjs/common'
import * as admin from 'firebase-admin'
import { I18nContext } from 'nestjs-i18n'
import { BadRequest } from 'src/utils/function/exception'
import { Admin, DeleteResult } from 'typeorm'
import { UpdateDeviceDto } from './dto/update-device.dto'
import Device from './entities/device.entity'
import User from 'src/modules/user/entities/user.entity'
import { PSQL } from 'src/database'

@Injectable()
export class DeviceService {
  private logger = new Logger(DeviceService.name)

  verifyFcmToken(token: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      return admin
        .messaging()
        .send({ token }, true)
        .then(() => resolve(true))
        .catch((error: Error) => {
          this.logger.error('🚫 ~ verify fcm token error', error)

          resolve(false)
        })
    })
  }

  async create(fcm_token: string, user: User): Promise<Device> {
    return this.verifyFcmToken(fcm_token).then(async (valid: boolean) => {
      if (valid) {
        let device: Device = await PSQL.getRepository(Device).findOne({
          where: { fcm_token },
        })

        if (!device) {
          device = new Device()

          device.fcm_token = fcm_token
        }

        device.user = user

        return PSQL.getRepository(Device).save(device)
      }
    })
  }

  async update(
    { fcm_token }: UpdateDeviceDto,
    user: User,
    i18n: I18nContext,
  ): Promise<Device> {
    return this.verifyFcmToken(fcm_token).then(async (valid: boolean) => {
      if (valid) {
        let device: Device = await PSQL.getRepository(Device).findOne({
          where: { fcm_token },
        })

        if (!device) {
          device = new Device()

          device.fcm_token = fcm_token
        }

        device.user = user

        return PSQL.getRepository(Device).save(device)
      }

      return BadRequest('device.invalid', i18n)
    })
  }

  async remove(fcm_token: string, user: User): Promise<DeleteResult> {
    const device: Device = await PSQL.getRepository(Device).findOne({
      where: { fcm_token, user: { id: user.id } },
    })

    if (device) {
      return PSQL.getRepository(Device).delete(device.id)
    }
  }
}
