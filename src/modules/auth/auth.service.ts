import { Inject, Injectable, Logger } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { LoginResponse } from "./dto/auth.dto";
import { RegisterDto } from "../user/dto/register.dto";
import User from "../user/entities/user.entity";
import { NotAcceptable } from "src/utils/function/exception";
import { UserService } from "../user/user.service";
import { ConfigService } from "@nestjs/config";
import { DeviceService } from "src/device/device.service";
import { JwtService } from "@nestjs/jwt";
import Device from "src/device/entities/device.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';



@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name)

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
         private deviceService: DeviceService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private config: ConfigService,
      ) {}
      
    
      expiredDay(day: number): number {
        return new Date().setDate(new Date().getDate() + day)
      }
      async registerNotification(fcmToken: string, user: User): Promise<Device> {
        if (fcmToken) {
          return this.deviceService.create(fcmToken, user)
        }
      }
   
      async generateToken(
        user: User,
        generateRefreshToken: boolean = true,
      ): Promise<LoginResponse> {
        const payload: { id: number; secret: string } = {
          id: user.id,
          secret: user.password,
        }
        // equal to 2 month
        const accessTokenTime = 5260032000
    
        // equal to 1 years
        const refreshTokenTime = 31536000000
    
        const token: string = this.jwtService.sign(payload, {
          secret: this.config.get<string>('JWT_KEY'),
          expiresIn: accessTokenTime,
        })
        const expiredTime: number = Date.now() + 5184000000 // 15 minutes
        this.logger.log('access token: ', token)
    
        if (generateRefreshToken) {
          const refreshToken: string = this.jwtService.sign(payload, {
            secret: this.config.get<string>('JWT_KEY_REFRESH'),
            expiresIn: refreshTokenTime,
          })
    
          await this.userService.updateRefreshToken(user.id, refreshToken)
    
          return {
            token,
            expired_time: expiredTime,
            refresh_token: refreshToken,
          }
        }
    
        return {
          token,
          expired_time: expiredTime,
          refresh_token: null,
        }
      }


    async register(
        { fcm_token, ...payload }: RegisterDto,
        i18n: I18nContext,
      ): Promise<LoginResponse> {
        const { email, otp } = payload
    
        let verified = false
    
        const appName: string = this.config.get<string>('APP_NAME')
        const key = `${appName}-${email}`
        const code: string = await this.cacheManager.get<string>(key)
    
        if (!code) return NotAcceptable('auth.otp.timeout', i18n)
    
        verified = code === otp
    
        if (!verified) {
          return NotAcceptable('auth.otp.invalid', i18n)
        }
    
        const user: User = await this.userService.create(payload, i18n)
    
        await this.cacheManager.del(`${appName}-${email}`) // remove OTP code
        await this.cacheManager.del(`${appName}-${email}-count`) // remove count resend OTP
    
        await this.registerNotification(fcm_token, user)
    
        return this.generateToken(user)
      }
}