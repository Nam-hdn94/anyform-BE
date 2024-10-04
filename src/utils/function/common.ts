import { BadRequestException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { kebabCase, toLower, toUpper, trim } from 'lodash'
// import Channel from 'src/modules/channel/entities/channel.entity'
// import ChannelClose from 'src/modules/channel/entities/channelClose.entity'
// import ChannelMute from 'src/modules/channel/entities/channelMute.entity'
// import TaskFlag from 'src/modules/task/entities/taskFlag.entity'
import User from 'src/modules/user/entities/user.entity'
import { UpdateResult } from 'typeorm'
import { v4 as uuid } from 'uuid'
// import { regexPhone } from './regex'

export const FALLBACK_LANGUAGE = 'en'
export const VietnamTimezone = 'Asia/Saigon'
export const UTC = 'UTC'
export const YOU = '(you)'

/**
 * Remove special characters and numbers
 * @param {string} word string has contained special characters
 * @param type - "upper" | "lower" | "inherit", default is "inherit"
 * @return {string} new string not contained special characters
 * @example const word: string = '!@#$%^&*()_+-79hSFfDInDDFv736q';
 * removeSpecialCharacters(word) => '79hSFfDInDDFv736q'
 */
export const removeSpecialCharacters = (
  word: string,
  type: 'upper' | 'lower' | 'inherit' = 'inherit',
): string => {
  const nWord: string = word.replace(/[^a-zA-Z0-9]/g, '')

  if (type === 'lower') {
    return toLower(nWord)
  }

  if (type === 'upper') {
    return toUpper(nWord)
  }

  return nWord
}

/**
 * Remove Vietnamese characters
 * @param {string} text string has contained vietnamese characters
 * @return {string} new string has been removed vietnamese characters
 * @example const word: string = 'Ái chà chà';
 * removeAccents(word) => 'ai cha cha'
 */
export const removeAccents = (text: string): string => {
  let nText: string = trim(text)

  const from =
    'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệễđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ'
  const to =
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy'

  for (let i = 0, l = from.length; i < l; i++) {
    nText = nText.replace(RegExp(from[i], 'gi'), to[i])
  }

  nText = toLower(nText)

  return nText
}

/**
 * Remove HTML tag
 * @param {string} html string has contained html tag
 * @return {string} new string has been removed html tag
 * @example const html: string = '<h1>My First Heading</h1>';
 * removeHTML(html) => 'My First Heading'
 */
export const removeHTML = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, '').replace(/(\r\n|\n|\r)/gm, '')
}

/**
 * Change text to slug
 * @param {string} text string to change
 * @return {string} new string with slug
 * @example const word: string = 'Hello World';
 * toSlug(word) => 'hello-world'
 */
export const toSlug = (text: string): string => kebabCase(removeAccents(text))

/**
 * Create text from template
 * @param {string} text string to change
 * @return {string} new string with variable template
 * @example const text: string = 'Hello World {{foo}} and {{bar}}';
 * createStringFromTemplate(text, { foo: 'Peter', bar: 'Marry' }) => 'Hello World Peter and Marry'
 */
export const createStringFromTemplate = (
  text: string,
  variables: Record<string, string | number>,
): string => {
  return text.replace(
    new RegExp('{{([^{]+)}}', 'g'),
    (_unused: string, varName: string) => {
      return variables[varName].toString()
    },
  )
}

/**
 * Check is valid phone number
 * @param {string} phone string
 * @return {boolean} boolean
 * @example const phone: string = '84123456789';
 * isPhoneNumber(phone) => true
 */
// export const isPhoneNumber = (phone: string): boolean => regexPhone.test(phone)

/**
 * Convert phone Vietnamese contained country code +84
 * @param {string} search phone number
 * @return {string} phone with country code.
 * @example const phone: string = '0912123123'; // or 840912123123
 * changeKeywordToPhoneVN(phone) => '84912123123'
 */
export const changeKeywordToPhoneVN = (search: string): string => {
  let keyword: string = search

  const isZeroFirst: boolean = keyword.charAt(0) === '0'
  const is840: boolean = keyword.slice(0, 3) === '840'

  if (isZeroFirst || is840) {
    if (is840) {
      keyword = '0'.concat(keyword.slice(3, keyword.length))
    }

    keyword = '84'.concat(keyword.slice(1, keyword.length))
  }

  return keyword
}

/**
 * Convert phone United States contained country code +1
 * @param {string} search phone number
 * @return {string} phone with country code.
 * @example const phone: string = '6194224033';
 * changeKeywordToPhoneUS(phone) => '16194224033'
 */
export const changeKeywordToPhoneUS = (search: string): string => {
  let keyword: string = search

  const condition: boolean =
    !['0', '1'].includes(keyword.charAt(0)) && keyword.slice(0, 2) !== '84'

  if (condition) {
    keyword = '1'.concat(keyword)
  }

  return keyword
}

/**
 * Convert phone has contained country code
 * @param {string} search phone number
 * @param isLike (optional, default true) query builder has search like operator
 * @return {string} phone with country code.
 */
// export const changeKeywordToPhone = (search: string, isLike = true): string => {
//   let keyword: string = search.replace(/[^0-9]/g, '')

//   if (keyword.length && isPhoneNumber(keyword)) {
//     const vietnamCodes: string[] = ['0', '84', '840']

//     let isVNCode = false

//     for (const code of vietnamCodes) {
//       const getCode: string = keyword.slice(0, code.length)

//       const isContained: boolean = getCode === code

//       if (isContained) {
//         isVNCode = true

//         break
//       }
//     }

//     if (isVNCode) {
//       keyword = changeKeywordToPhoneVN(keyword)
//     } else {
//       keyword = changeKeywordToPhoneUS(keyword)
//     }
//   } else {
//     keyword = search
//   }

//   keyword = isLike ? `%${keyword}%` : keyword

//   return keyword
// }

/**
 * Generate opt code
 * @param length total digit for OTP code, default 6 digits
 * @return {string} OTP code
 * @example generateOTP() => '226699'
 */
export const generateOTP = (length = 6): string => {
  const digits = '0123456789'
  let OTP = ''

  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)]
  }

  return OTP
}

interface Coordinate {
  lat: number
  long: number
}

/**
 * Converts numeric degrees to radians
 * @param {number} value
 * @return {number} (value * Math.PI) / 180
 */
const toRad = (value: number): number => (value * Math.PI) / 180

/**
 * Get distance between 2 location
 * @param start Coordinate, include latitude and longitude of first location
 * @param end Coordinate, include latitude and longitude of second location
 * @return {number} kilometers between 2 location
 */
export const getDistance = (start: Coordinate, end: Coordinate): number => {
  const R = 6371 // km
  const dLat: number = toRad(end.lat - start.lat)
  const dLon: number = toRad(end.long - start.long)
  const lat1: number = toRad(start.lat)
  const lat2: number = toRad(end.lat)

  const a: number =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance: number = +(R * c).toFixed(1)

  return distance
}

/**
 * Convert date to cron expression every day
 * @param {Date} date with type Date
 * @return {string} string with cron expression
 * @example const date: Date = new Date(2022, 10, 1, 17, 0, 0);
 * dateToCronEveryday(date) => '0 17 * * *'
 */
export const dateToCronEveryday = (date: Date): string => {
  let hours: number | string = date.getHours()
  let minutes: number | string = date.getMinutes()

  if (hours > 0 && hours < 10) {
    hours = `0${hours}`
  }

  if (minutes > 0 && minutes < 10) {
    minutes = `0${minutes}`
  }

  return `${minutes} ${hours} * * *`
}

/**
 * Check is ID
 * @param {string} id string
 * @return {boolean} boolean
 * @example const id: string = '1';
 * isID(id) => true
 */
export const isID = (id: string): boolean => {
  const isInteger: boolean = Number.isInteger(+id)

  if (!isInteger) {
    throw new BadRequestException('ID must be an integer')
  }

  return true
}

export const rowAffected = (results: UpdateResult[] = []): UpdateResult => {
  const affected: number = results.reduce(
    (prevValue: number, cur: UpdateResult) => {
      return prevValue + cur.affected
    },
    0,
  )

  return {
    generatedMaps: [],
    raw: [],
    affected,
  }
}

// export const VnDateTime = (date: Date): string => {
//   return dayjs(
//     dayjs(date).tz(VietnamTimezone).format('YYYY-MM-DD HH:mm:ss.SSS'),
//   ).toISOString()
// }

// export const convertTz = (date: Date, tz: string): string => {
//   return dayjs(dayjs(date).tz(tz).format('HH:mm YYYY-MM-DD')).toString()
// }

export const timeZoneName = (offset: number): string => {
  const timezoneDict = {
    '-12': 'Pacific/Kwajalein',
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Caracas',
    '-3': 'America/Argentina/Buenos_Aires',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Athens',
    '3': 'Asia/Baghdad',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '5.5': 'Asia/Kolkata',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Guadalcanal',
    '12': 'Pacific/Fiji',
    '13': 'Pacific/Tongatapu',
    '14': 'Pacific/Kiritimati',
  }
  return timezoneDict[`${offset}`] ?? 'Unknown'
}

const uuidLength = 36

export const getAlias = (length = uuidLength): string => {
  const from: number = uuidLength - length

  const alias: string = uuid()

  if (from >= 0) {
    return alias.substring(from, uuidLength)
  }

  return alias
}

// export const saveToUpdateResult = (
//   save: Channel | ChannelMute | ChannelClose | TaskFlag,
// ): UpdateResult => {
//   const result: UpdateResult = {
//     generatedMaps: [],
//     raw: [],
//     affected: 0,
//   }

//   if (save?.id) {
//     result.affected = 1
//   }

//   return result
// }

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const randomAvatar = (user: User): string => {
  const palette: string[] = [
    '2596be',
    'eeeee4',
    'e28743',
    'eab676',
    '76b5c5',
    '21130d',
    '873e23',
    'abdbe3',
    '063970',
    '154c79',
  ]

  const background: string = palette[Math.floor(Math.random() * palette.length)]

  return 
}
