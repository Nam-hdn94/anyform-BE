import { ConfigService } from '@nestjs/config'
import 'dotenv/config'
import { DataSource } from 'typeorm'

const config = new ConfigService()

const ORM = new DataSource({
  type: 'postgres',
  host: config.get<string>('POSTGRES_HOST'),
  port: +config.get<string>('POSTGRES_PORT'),
  username: config.get<string>('POSTGRES_USER'),
  password: config.get<string>('POSTGRES_PASSWORD'),
  database: config.get<string>('POSTGRES_DB'),
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../../migrations/*.{js,ts}'],
  synchronize: true,
})

export default ORM
