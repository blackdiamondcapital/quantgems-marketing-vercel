import pkg from 'pg'

const { Pool } = pkg

let pool

export function getPool() {
  if (pool) return pool

  const baseConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME || 'postgres',
      }

  const requireSsl = String(process.env.DB_SSL_REQUIRE ?? (process.env.NODE_ENV === 'production'))
    .toLowerCase() === 'true'

  if (requireSsl) {
    baseConfig.ssl = { rejectUnauthorized: false }
  }

  pool = new Pool({
    ...baseConfig,
    max: Math.min(Math.max(Number.parseInt(process.env.DB_POOL_MAX || '5', 10) || 5, 1), 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
  })

  return pool
}
