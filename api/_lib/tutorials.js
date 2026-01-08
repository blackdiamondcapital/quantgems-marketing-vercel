import pkg from 'pg'

const { Pool } = pkg

let ensured = false
let ensurePromise = null

export async function ensureTutorialsSchema(pool) {
  if (ensured) return
  if (ensurePromise) return ensurePromise
  ensurePromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tutorial_posts (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        summary TEXT,
        content_md TEXT NOT NULL,
        cover_image_url TEXT,
        published BOOLEAN NOT NULL DEFAULT FALSE,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_posts_published_idx ON tutorial_posts (published, published_at DESC);')
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_posts_created_at_idx ON tutorial_posts (created_at DESC);')
    ensured = true
  })()
  return ensurePromise
}

export function normalizeSlug(value) {
  const slug = String(value || '').trim().toLowerCase()
  if (!slug) return ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return ''
  return slug
}

export function isPrimeOrEnterprise(user) {
  const plan = String(user?.plan || '').toLowerCase()
  return plan === 'enterprise' || plan === 'prime'
}
