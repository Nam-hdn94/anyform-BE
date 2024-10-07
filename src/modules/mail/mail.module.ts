import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';
import * as redisStore from 'cache-manager-redis-store';

// Constants for config keys
const MAIL_HOST = 'MAIL_HOST';
const MAIL_USER = 'MAIL_USER';
const MAIL_PASSWORD = 'MAIL_PASSWORD';
const MAIL_FROM = 'MAIL_FROM';
const REDIS_HOST = 'REDIS_HOST';
const REDIS_PORT = 'REDIS_PORT';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>(MAIL_HOST) || 'localhost',  
          secure: false,
          auth: {
            user: config.get<string>(MAIL_USER) || '',
            pass: config.get<string>(MAIL_PASSWORD) || '',
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"AnyForm" <${config.get<string>(MAIL_FROM) || 'no-reply@anyform.com'}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    CacheModule.registerAsync({
        useFactory: (config: ConfigService) => ({
          store: redisStore as unknown as string, // Force cast to string if needed
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        }),
        inject: [ConfigService],
      }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

