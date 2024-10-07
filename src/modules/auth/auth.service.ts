import { Inject, Injectable, Logger } from "@nestjs/common";
import { I18n, I18nContext } from "nestjs-i18n";
import { LoginDto, LoginResponse } from "./dto/auth.dto";
import { RegisterDto } from "../user/dto/register.dto";
import User from "../user/entities/user.entity";
import { NotAcceptable, NotFound } from "src/utils/function/exception";
import { UserService } from "../user/user.service";
import { ConfigService } from "@nestjs/config";
import { DeviceService } from "src/device/device.service";
import { JwtService } from "@nestjs/jwt";
import Device from "src/device/entities/device.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';
import { PSQL } from "src/database";
import { CheckEmailDto } from "./dto/check-mail.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { OtpDto } from "./dto/otp.dto";
import { OtpType } from "./auth.constants";
import { generateOTP } from "src/utils/function/common";
import { Environments } from "src/utils/interface/environments";
import { MailService } from "../mail/mail.service";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";



@Injectable()
export class AuthService {
  confirmEmail(payload: ConfirmEmailDto, user: User, i18n: I18nContext<Record<string, unknown>>): Promise<import("typeorm").UpdateResult> {
    throw new Error("Method not implemented.");
  }
    private logger = new Logger(AuthService.name)

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private deviceService: DeviceService,
        private mailService: MailService,
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

      async login(
        { email, otp, fcm_token }: LoginDto,
        i18n: I18nContext,
      ): Promise<LoginResponse> {
        const user: User = await PSQL.createQueryBuilder(User, 'user')
          .where('user.email = :email', { email })
          .select(['user.id', 'user.email', 'user.password','user.is_deleted'])
          .getOne()
    
        if (!user) {
          return NotFound('user', i18n)
        }
        if (user?.is_deleted === true) {
          return NotAcceptable('user.deleted', i18n)
        }
        let verified = false
    
        const appName: string = this.config.get<string>('APP_NAME')
    
        const key = `${appName}-${email}`
        const code: string = await this.cacheManager.get<string>(key)
    
        if (!code) return NotAcceptable('auth.otp.timeout', i18n)
    
        verified = code === otp
    
        if (!verified) {
          return NotAcceptable('auth.otp.invalid', i18n)
        }
    
        await this.cacheManager.del(`${appName}-${email}`) // remove OTP code
        await this.cacheManager.del(`${appName}-${email}-count`) // remove count resend OTP
    
        await this.registerNotification(fcm_token, user)
    
        return this.generateToken(user)
      }

      async CheckEmail(
        { email }: CheckEmailDto,
        i18n : I18nContext,
      ): Promise<boolean>{
        const user: User = await PSQL.createQueryBuilder(User, 'user')
         .where('user.email = :email', { email })
         .select(['user.id', 'user.email', 'user.password'])
         .getOne()
         if(!user) {
          return false
         } else return true
      }

      async refresh(
        { refresh_token }: RefreshTokenDto,
        i18n : I18nContext,
      ): Promise<LoginResponse>{
        const jwtSecret = this.config.get<string>('JWT_KEy_REFRESH');
        try{
          const verified = await this.jwtService.verify(refresh_token, {secret: jwtSecret})
           const user = await this.userService.findByRefreshToken(verified.id, refresh_token, i18n);
          return this.generateToken(user, false);
        } catch(error) {
          console.error('Error in token refresh: ', error);
          if(error.name === 'TokenExpireError'){
            return NotAcceptable('auth.token.expired', i18n);
          }
          return NotAcceptable('auth.token.invalid', i18n);
        }
        
      }

      async otp(
        { email, type }: OtpDto,
        i18n: I18nContext,
    ): Promise<boolean> {
        const user = await PSQL.createQueryBuilder(User, 'user')
            .where('user.email = :email', { email })
            .select(['user.id', 'user.id_deleted'])
            .getOne();

        if (user?.is_deleted === true) {
            return NotAcceptable('user.deleted', i18n);
        }

        switch (type) {
            case OtpType.SIGN_UP:
                if (user) {
                    return NotAcceptable('user.email.existed', i18n);
                }
                break;
            case OtpType.SIGN_IN:
                if (!user) {
                    return NotFound('user.email', i18n);
                }
                break;
            default:
                break;
        }

        const key = `${this.config.get<string>('APP_NAME')}-${email}`;
        let code: string = await this.cacheManager.get<string>(key);

        if (!code) {
            code = generateOTP();
            const env = this.config.get<string>('NODE_ENV');

            if (env !== Environments.PRODUCTION) {
                console.log(`📧 ~ OTP code for email ${email}:`, code);
            }

            await this.cacheManager.set(key, code, 600);
        }
        return this.mailService.otp({ code, email });
    }
      

}