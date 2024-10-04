import {
  BadRequestException,
  ForbiddenException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'

export const NotFound = async (
  index: string,
  i18n: I18nContext,
): Promise<never> => {
  const message: string = await i18n.t(`${index}.not_found`, {
    lang: i18n.lang,
  })

  throw new NotFoundException(message)
}

export const NotAcceptable = async (
  key: string,
  i18n: I18nContext,
  args?: Record<string, string | number>,
): Promise<never> => {
  const message: string = await i18n.t(key, { lang: i18n.lang, args })

  throw new NotAcceptableException(message)
}

export const BadRequest = async (
  key: string,
  i18n: I18nContext,
  args?: Record<string, string | number>,
): Promise<never> => {
  const message: string = await i18n.t(key, { lang: i18n.lang, args })

  throw new BadRequestException(message)
}

export const Forbidden = async (
  key: string,
  i18n: I18nContext,
): Promise<never> => {
  const message: string = await i18n.t(key, { lang: i18n.lang })

  throw new ForbiddenException(message)
}

export const RequireUpgrade = async (
  key: string,
  i18n: I18nContext,
): Promise<never> => {
  const message: string = await i18n.t(key, { lang: i18n.lang })
  console.log(message)
  throw new BadRequestException(message)
}
