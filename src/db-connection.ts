import { Pool } from 'pg';

const pool = new Pool({
  user: 'dungeonsbbdd_user',
  password: '6OpbIzzxopuW1Z48WfeI9X5Sz7fah7n3',
  host: 'dpg-d5fsf5c9c44c738rhsrg-a.frankfurt-postgres.render.com',
  port: 5432,
  database: 'dungeonsbbdd',
  ssl: { rejectUnauthorized: false }
});

export function query(text: string, params?: any[]): any {
  return pool.query(text, params);
}
