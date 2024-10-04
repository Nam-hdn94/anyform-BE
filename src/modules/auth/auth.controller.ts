import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Post, Query } from '@nestjs/common'
import { LoginDto, LoginResponse } from "./dto/auth.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { RegisterDto } from "../user/dto/register.dto";

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

    }
