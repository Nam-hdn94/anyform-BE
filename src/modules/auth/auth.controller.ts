import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Post, Query } from '@nestjs/common'
import { LoginDto, LoginResponse } from "./dto/auth.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { RegisterDto } from "../user/dto/register.dto";
import { CheckEmailDto } from "./dto/check-mail.dto";
import { OtpDto } from "./dto/otp.dto";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";
import User from "../user/entities/user.entity";
import { GetAuthUser } from "src/decorators/user.decorator";
import { Auth } from "src/decorators/roles.decorator";
import { UpdateResult } from "typeorm";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}

    @ApiOperation({ summary: 'Register account' })
    @Post('register')
    register(
      @Body() payload: RegisterDto,
      @I18n() i18n: I18nContext,
    ): Promise<LoginResponse> {
      return this.authService.register(payload, i18n)
    }

    @ApiOperation({ summary: 'Login to service' })
    @Post('login')
    login(
        @Body() payload: LoginDto,
        @I18n() i18n: I18nContext,
    ): Promise<LoginResponse> {
        return this.authService.login(payload, i18n)
    }

    @ApiOperation({summary: 'Check account' })
    @Post('check')
    checkEmail(
        @Body() email : CheckEmailDto,
        @I18n() i18n : I18nContext,
    ): Promise<boolean> {
      return this.authService.CheckEmail(email, i18n)
    }

    @ApiOperation({  summary: 'Request OTP'})
    @Post('otp')
    otp(
      @Body() payload: OtpDto, 
      @I18n() i18n: I18nContext): Promise<boolean> {
      return this.authService.otp(payload, i18n)
    }

    @Auth()
    @ApiOperation({ summary: 'Confirm email' })
    @Post('email-confirm')
    confirmEmail(
      @Body() payload: ConfirmEmailDto,
      @GetAuthUser() user: User,
      @I18n() i18n: I18nContext,
    ): Promise<UpdateResult> {
      return this.authService.confirmEmail(payload, user, i18n)
    }

    @ApiOperation({ summary: 'Refresh token to service' })
    @Post('refresh-token')
    refreshToken(
      @Body() payload: RefreshTokenDto,
      @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.refresh(payload, i18n)
  }
    
    }
