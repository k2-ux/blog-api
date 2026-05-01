import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// This file is used exclusively by the TypeORM CLI (migration commands).
// The app itself uses TypeOrmModule.forRootAsync() in app.module.ts.
// We keep them separate so the CLI can load DB config without booting NestJS.
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'blog_api',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;
