import { Pool } from 'pg';

const pool = new Pool({
  user: 'dddb_30fk_user',
  password: 'T6uC79Lxh6F6uyTlAHfu2eLv9R0X4Yxf',
  host: 'dpg-d4tevce3jp1c73ee0vc0-a.frankfurt-postgres.render.com',
  port: 5432,
  database: 'dddb_30fk',
  ssl: { rejectUnauthorized: false }
});

export function query(text: string, params?: any[]): any {
  return pool.query(text, params);
}
