import { MailerService } from "@nestjs-modules/mailer"
import { Inject, Injectable, Logger, NotAcceptableException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { MailOtp } from "./mail.constant"
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from "@nestjs/cache-manager"


const MAX_SEND = 6
const DEFAULT_SUBJECT = 'Welcome AnyForm Sevice!'

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name)
  private FE_URL: string

  constructor(
    private mailerService: MailerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private config: ConfigService,
  ){}

  async otp({code, email}:MailOtp): Promise<boolean>{
    const key = `${this.config.get<string>('AnyForm')}-${email}-count`;
    const countSent: number = +(await this.cacheManager.get<string>(key)) || 0;
    if (countSent && countSent >= MAX_SEND - 1){
        return false;
    }
    try{
        const result = await this.mailerService.sendMail({
            to: email,
            subject: DEFAULT_SUBJECT,
            template: 'otp',
            context: { email, code},
        })
        const isSucceed =!!result?.messageId;
        if (isSucceed) {
            await this.cacheManager.set(key, countSent + 1, { ttl: 600 }); // 10 mins
        }
        return isSucceed;
    } catch (error) {
        this.logger.error(`🚫 Failed to send OTP to ${email}. Error: ${error?.message}`, error);
        throw new NotAcceptableException('Unable to send OTP');
    }
  }

}  