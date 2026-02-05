<<<<<<< HEAD
import { getPool } from '../_lib/pool.js'
import { optionalAuth, requireAuth } from '../_lib/auth.js'
import { ensureTutorialsSchema, isPrimeOrEnterprise, normalizeSlug } from '../_lib/tutorials.js'

const pool = getPool()

async function canViewPost(req, post) {
  if (!post) return false
  if (post.published) return true
  if (!req.user) return false
  const isAdminLike = isPrimeOrEnterprise(req.user)
  const isOwner = post.author_user_id != null && Number(post.author_user_id) === Number(req.user?.id)
  return isAdminLike || isOwner
}

export default async function handler(req, res) {
  await ensureTutorialsSchema(pool)

  const parts = Array.isArray(req.query?.path)
    ? req.query.path.map((p) => String(p || '').trim())
    : [String(req.query?.path || '').trim()]

  const slug = normalizeSlug(parts[0])
  const sub = String(parts[1] || '').trim().toLowerCase()

  if (!slug || parts.length < 2) {
    return res.status(404).json({ success: false, message: 'not_found' })
  }

  if (sub !== 'replies') {
    return res.status(404).json({ success: false, message: 'not_found' })
  }

  if (req.method === 'GET') {
    await new Promise((resolve) => optionalAuth(pool)(req, res, resolve))

    try {
      const p = await pool.query(
        'SELECT id, slug, published, author_user_id FROM tutorial_posts WHERE slug = $1 LIMIT 1',
        [slug]
      )
      const post = p.rows?.[0] || null
      if (!(await canViewPost(req, post))) {
        return res.status(404).json({ success: false, message: 'not_found' })
      }

      const r = await pool.query(
        `SELECT r.id, r.post_id, r.author_user_id, r.content_md, r.created_at,
                u.username, u.full_name
         FROM tutorial_replies r
         LEFT JOIN users u ON u.id = r.author_user_id
         WHERE r.post_id = $1
         ORDER BY r.created_at ASC, r.id ASC`,
        [post.id]
      )

      return res.json({ success: true, data: r.rows || [] })
    } catch (e) {
      console.error('tutorial replies list error:', e)
      return res.status(500).json({ success: false, message: 'tutorial_replies_list_failed' })
    }
  }

  if (req.method === 'POST') {
    await new Promise((resolve) => requireAuth(pool)(req, res, resolve))

    const contentMd = String(req.body?.content_md || req.body?.content || '').trim()
    if (!contentMd) {
      return res.status(400).json({ success: false, message: 'content_required' })
    }

    try {
      const p = await pool.query(
        'SELECT id, slug, published, author_user_id FROM tutorial_posts WHERE slug = $1 LIMIT 1',
        [slug]
      )
      const post = p.rows?.[0] || null
      if (!(await canViewPost(req, post))) {
        return res.status(404).json({ success: false, message: 'not_found' })
      }

      const ins = await pool.query(
        `INSERT INTO tutorial_replies (post_id, author_user_id, content_md)
         VALUES ($1, $2, $3)
         RETURNING id, post_id, author_user_id, content_md, created_at`,
        [post.id, req.user?.id ?? null, contentMd]
      )

      try {
        await pool.query('UPDATE tutorial_posts SET last_reply_at = NOW(), updated_at = NOW() WHERE id = $1', [post.id])
      } catch {}

      return res.status(201).json({ success: true, data: ins.rows?.[0] || null })
    } catch (e) {
      console.error('tutorial replies create error:', e)
      return res.status(500).json({ success: false, message: 'tutorial_replies_create_failed' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ success: false, message: 'method_not_allowed' })
=======
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'

import { getPool } from './_lib/pool.js'
import { optionalAuth, requireAuth, requirePlan, signToken, getToken, verifyToken } from './_lib/auth.js'

const pool = getPool()

const app = express()

app.set('trust proxy', 1)
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let ensured = false
let ensurePromise = null
async function ensureSchema() {
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
    await pool.query('ALTER TABLE tutorial_posts ADD COLUMN IF NOT EXISTS author_user_id BIGINT;')
    await pool.query('ALTER TABLE tutorial_posts ADD COLUMN IF NOT EXISTS last_reply_at TIMESTAMPTZ;')
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_posts_published_idx ON tutorial_posts (published, published_at DESC);')
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_posts_created_at_idx ON tutorial_posts (created_at DESC);')
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_posts_author_user_id_idx ON tutorial_posts (author_user_id);')
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_posts_last_reply_at_idx ON tutorial_posts (last_reply_at DESC);')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tutorial_replies (
        id BIGSERIAL PRIMARY KEY,
        post_id BIGINT NOT NULL REFERENCES tutorial_posts(id) ON DELETE CASCADE,
        author_user_id BIGINT,
        content_md TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_replies_post_id_created_at_idx ON tutorial_replies (post_id, created_at ASC, id ASC);')
    await pool.query('CREATE INDEX IF NOT EXISTS tutorial_replies_author_user_id_idx ON tutorial_replies (author_user_id);')
    ensured = true
  })()
  return ensurePromise
}

function normalizeSlug(value) {
  const slug = String(value || '').trim().toLowerCase()
  if (!slug) return ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return ''
  return slug
}

function isEnterpriseUser(req) {
  const plan = String(req?.user?.plan || '').toLowerCase()
  return plan === 'enterprise' || plan === 'prime'
}

function canViewPost(req, post) {
  if (!post) return false
  if (post.published) return true
  if (!req.user) return false
  const isAdminLike = isEnterpriseUser(req)
  const isOwner = post.author_user_id != null && Number(post.author_user_id) === Number(req.user?.id)
  return isAdminLike || isOwner
}

// Health
app.get('/api/health', (_req, res) => {
  res.json({ success: true })
})

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')

    if (!email || !password) {
      return res.status(400).json({ success: false, message: '請提供 Email 和密碼' })
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, username, full_name, plan, subscription_status,
              subscription_end_date, is_active, email_verified
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    )

    if (!result.rows?.length) {
      return res.status(401).json({ success: false, message: 'Email 或密碼錯誤' })
    }

    const user = result.rows[0]

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: '帳戶已被停用' })
    }

    if (!user.email_verified) {
      return res.status(403).json({ success: false, message: '此帳號尚未完成 Email 驗證，請先到信箱點擊驗證連結' })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Email 或密碼錯誤' })
    }

    const token = signToken(user)
    delete user.password_hash

    return res.json({ success: true, message: '登入成功', data: { token, user } })
  } catch (e) {
    console.error('auth login error:', e)
    return res.status(500).json({ success: false, message: '登入失敗，請稍後再試' })
  }
})

// Tutorials: replies
app.get('/api/tutorials/:slug/replies', optionalAuth(pool), async (req, res) => {
  await ensureSchema()

  const slug = normalizeSlug(req.params.slug)
  if (!slug) {
    return res.status(400).json({ success: false, message: 'invalid_slug' })
  }

  try {
    const p = await pool.query(
      'SELECT id, slug, published, author_user_id FROM tutorial_posts WHERE slug = $1 LIMIT 1',
      [slug]
    )
    const post = p.rows?.[0] || null
    if (!canViewPost(req, post)) {
      return res.status(404).json({ success: false, message: 'not_found' })
    }

    const r = await pool.query(
      `SELECT r.id, r.post_id, r.author_user_id, r.content_md, r.created_at,
              u.username, u.full_name
       FROM tutorial_replies r
       LEFT JOIN users u ON u.id = r.author_user_id
       WHERE r.post_id = $1
       ORDER BY r.created_at ASC, r.id ASC`,
      [post.id]
    )

    return res.json({ success: true, data: r.rows || [] })
  } catch (e) {
    console.error('tutorial replies list error:', e)
    return res.status(500).json({ success: false, message: 'tutorial_replies_list_failed' })
  }
})

app.post('/api/tutorials/:slug/replies', requireAuth(pool), async (req, res) => {
  await ensureSchema()

  const slug = normalizeSlug(req.params.slug)
  if (!slug) {
    return res.status(400).json({ success: false, message: 'invalid_slug' })
  }

  const contentMd = String(req.body?.content_md || req.body?.content || '').trim()
  if (!contentMd) {
    return res.status(400).json({ success: false, message: 'content_required' })
  }

  try {
    const p = await pool.query(
      'SELECT id, slug, published, author_user_id FROM tutorial_posts WHERE slug = $1 LIMIT 1',
      [slug]
    )
    const post = p.rows?.[0] || null
    if (!canViewPost(req, post)) {
      return res.status(404).json({ success: false, message: 'not_found' })
    }

    const ins = await pool.query(
      `INSERT INTO tutorial_replies (post_id, author_user_id, content_md)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, author_user_id, content_md, created_at`,
      [post.id, req.user?.id ?? null, contentMd]
    )

    try {
      await pool.query('UPDATE tutorial_posts SET last_reply_at = NOW(), updated_at = NOW() WHERE id = $1', [post.id])
    } catch {}

    return res.status(201).json({ success: true, data: ins.rows?.[0] || null })
  } catch (e) {
    console.error('tutorial replies create error:', e)
    return res.status(500).json({ success: false, message: 'tutorial_replies_create_failed' })
  }
})

// Auth: me
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = getToken(req)
    if (!token) {
      return res.status(401).json({ success: false, message: '未提供認證 Token' })
    }

    const decoded = verifyToken(token)

    const result = await pool.query(
      `SELECT id, email, username, full_name, avatar_url, phone,
              plan, subscription_status, subscription_end_date, trial_end_date,
              email_verified, is_active, last_login_at, created_at
       FROM users
       WHERE id = $1 AND is_active = true
       LIMIT 1`,
      [decoded.id]
    )

    if (!result.rows?.length) {
      return res.status(404).json({ success: false, message: '用戶不存在' })
    }

    const user = result.rows[0]
    return res.json({ success: true, data: { user } })
  } catch (e) {
    const name = String(e?.name || '')
    if (name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token 已過期' })
    }
    if (name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token 無效' })
    }
    console.error('auth me error:', e)
    return res.status(500).json({ success: false, message: '驗證失敗' })
  }
})

// Tutorials: list
app.get('/api/tutorials', optionalAuth(pool), async (req, res) => {
  await ensureSchema()

  const includeUnpublished = Boolean(req.user) && isEnterpriseUser(req)
  const limitRaw = Number.parseInt(String(req.query.limit || '50'), 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50

  try {
    const sql = `
      SELECT id, slug, title, summary, cover_image_url,
             published, published_at, created_at, updated_at
      FROM tutorial_posts
      WHERE ($1::boolean = true) OR (published = true)
      ORDER BY
        CASE WHEN published_at IS NULL THEN created_at ELSE published_at END DESC,
        id DESC
      LIMIT $2
    `
    const result = await pool.query(sql, [includeUnpublished, limit])
    return res.json({ success: true, data: result.rows || [] })
  } catch (e) {
    console.error('tutorials list error:', e)
    return res.status(500).json({ success: false, message: 'tutorials_list_failed' })
  }
})

// Tutorials: get by slug
app.get('/api/tutorials/:slug', optionalAuth(pool), async (req, res) => {
  await ensureSchema()

  const slug = normalizeSlug(req.params.slug)
  if (!slug) {
    return res.status(400).json({ success: false, message: 'invalid_slug' })
  }

  const includeUnpublished = Boolean(req.user) && isEnterpriseUser(req)

  try {
    const sql = `
      SELECT id, slug, title, summary, content_md, cover_image_url,
             published, published_at, created_at, updated_at
      FROM tutorial_posts
      WHERE slug = $1
        AND (($2::boolean = true) OR (published = true))
      LIMIT 1
    `
    const result = await pool.query(sql, [slug, includeUnpublished])
    const row = result.rows?.[0]
    if (!row) {
      return res.status(404).json({ success: false, message: 'not_found' })
    }
    return res.json({ success: true, data: row })
  } catch (e) {
    console.error('tutorials get error:', e)
    return res.status(500).json({ success: false, message: 'tutorials_get_failed' })
  }
})

// Tutorials: admin create
app.post('/api/tutorials', requireAuth(pool), requirePlan('enterprise', 'prime'), async (req, res) => {
  await ensureSchema()

  const slug = normalizeSlug(req.body?.slug)
  const title = String(req.body?.title || '').trim()
  const summary = req.body?.summary === undefined ? null : String(req.body?.summary || '').trim()
  const contentMd = String(req.body?.content_md || req.body?.content || '').trim()
  const coverImageUrl = req.body?.cover_image_url === undefined ? null : String(req.body?.cover_image_url || '').trim()
  const published = Boolean(req.body?.published)

  if (!slug) return res.status(400).json({ success: false, message: 'invalid_slug' })
  if (!title) return res.status(400).json({ success: false, message: 'title_required' })
  if (!contentMd) return res.status(400).json({ success: false, message: 'content_required' })

  try {
    const nowPublishedAt = published ? new Date() : null
    const sql = `
      INSERT INTO tutorial_posts (slug, title, summary, content_md, cover_image_url, published, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, slug, title, summary, cover_image_url, published, published_at, created_at, updated_at
    `
    const result = await pool.query(sql, [slug, title, summary, contentMd, coverImageUrl, published, nowPublishedAt])
    return res.status(201).json({ success: true, data: result.rows?.[0] || null })
  } catch (e) {
    if (String(e?.code) === '23505') {
      return res.status(409).json({ success: false, message: 'slug_exists' })
    }
    console.error('tutorials create error:', e)
    return res.status(500).json({ success: false, message: 'tutorials_create_failed' })
  }
})

// Tutorials: admin update
app.put('/api/tutorials/:id', requireAuth(pool), requirePlan('enterprise', 'prime'), async (req, res) => {
  await ensureSchema()

  const id = Number.parseInt(String(req.params.id || ''), 10)
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'invalid_id' })
  }

  const slugRaw = req.body?.slug
  const slug = slugRaw === undefined ? null : normalizeSlug(slugRaw)
  if (slugRaw !== undefined && !slug) {
    return res.status(400).json({ success: false, message: 'invalid_slug' })
  }

  const title = req.body?.title === undefined ? null : String(req.body?.title || '').trim()
  const summary = req.body?.summary === undefined ? null : String(req.body?.summary || '').trim()
  const contentMd = req.body?.content_md === undefined && req.body?.content === undefined
    ? null
    : String(req.body?.content_md || req.body?.content || '').trim()
  const coverImageUrl = req.body?.cover_image_url === undefined ? null : String(req.body?.cover_image_url || '').trim()
  const published = req.body?.published === undefined ? null : Boolean(req.body?.published)

  if (title !== null && !title) return res.status(400).json({ success: false, message: 'title_required' })
  if (contentMd !== null && !contentMd) return res.status(400).json({ success: false, message: 'content_required' })

  try {
    const current = await pool.query('SELECT id, published, published_at FROM tutorial_posts WHERE id = $1 LIMIT 1', [id])
    const existing = current.rows?.[0]
    if (!existing) return res.status(404).json({ success: false, message: 'not_found' })

    let nextPublishedAt = null
    if (published === null) {
      nextPublishedAt = existing.published_at
    } else if (published === true) {
      nextPublishedAt = existing.published_at || new Date()
    } else {
      nextPublishedAt = null
    }

    const sql = `
      UPDATE tutorial_posts
      SET
        slug = COALESCE($2, slug),
        title = COALESCE($3, title),
        summary = COALESCE($4, summary),
        content_md = COALESCE($5, content_md),
        cover_image_url = COALESCE($6, cover_image_url),
        published = COALESCE($7, published),
        published_at = CASE
          WHEN $7::boolean IS NULL THEN published_at
          WHEN $7::boolean = true THEN $8::timestamptz
          ELSE NULL
        END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, slug, title, summary, cover_image_url, published, published_at, created_at, updated_at
    `

    const result = await pool.query(sql, [id, slug, title, summary, contentMd, coverImageUrl, published, nextPublishedAt])
    return res.json({ success: true, data: result.rows?.[0] || null })
  } catch (e) {
    if (String(e?.code) === '23505') {
      return res.status(409).json({ success: false, message: 'slug_exists' })
    }
    console.error('tutorials update error:', e)
    return res.status(500).json({ success: false, message: 'tutorials_update_failed' })
  }
})

// Tutorials: admin delete
app.delete('/api/tutorials/:id', requireAuth(pool), requirePlan('enterprise', 'prime'), async (req, res) => {
  await ensureSchema()

  const id = Number.parseInt(String(req.params.id || ''), 10)
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'invalid_id' })
  }

  try {
    const result = await pool.query('DELETE FROM tutorial_posts WHERE id = $1 RETURNING id', [id])
    if (!result.rows?.length) return res.status(404).json({ success: false, message: 'not_found' })
    return res.json({ success: true, data: { id } })
  } catch (e) {
    console.error('tutorials delete error:', e)
    return res.status(500).json({ success: false, message: 'tutorials_delete_failed' })
  }
})

export default function handler(req, res) {
  return app(req, res)
>>>>>>> 07cf0bc (Add marketing + api for Vercel)
}
