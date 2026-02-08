import { Pool } from 'pg';

const pool = new Pool({
  user: 'ddbb_wcpt_user',
  password: '3VApO1utjDl6uPLfEJNLI3EyhM8f5LTB',
  host: 'dpg-d6472jpr0fns73c27ph0-a.frankfurt-postgres.render.com',
  port: 5432,
  database: 'ddbb_wcpt',
  ssl: { rejectUnauthorized: false }
});

export function query(text: string, params?: any[]): any {
  return pool.query(text, params);
}
