import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
const port: number = process.env.PORTDB ? parseInt(process.env.PORTDB) : 3306;

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.HOST || 'localhost',
  port: port,
  username: process.env.USERNAMEDB || 'root',
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  logging: false,
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
});
