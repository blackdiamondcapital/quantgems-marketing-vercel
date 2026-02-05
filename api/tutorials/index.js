import { getPool } from '../_lib/pool.js'
import { optionalAuth, requireAuth } from '../_lib/auth.js'
import { ensureTutorialsSchema, isPrimeOrEnterprise, normalizeSlug } from '../_lib/tutorials.js'

const pool = getPool()

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await ensureTutorialsSchema(pool)

    await new Promise(resolve => optionalAuth(pool)(req, res, resolve))

    const includeUnpublished = Boolean(req.user) && isPrimeOrEnterprise(req.user)
    const limitRaw = Number.parseInt(String(req.query?.limit || '50'), 10)
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
  }

  if (req.method === 'POST') {
    await ensureTutorialsSchema(pool)

    await new Promise(resolve => requireAuth(pool)(req, res, resolve))

    const slug = normalizeSlug(req.body?.slug)
    const title = String(req.body?.title || '').trim()
    const summary = req.body?.summary === undefined ? null : String(req.body?.summary || '').trim()
    const contentMd = String(req.body?.content_md || req.body?.content || '').trim()
    const coverImageUrl = req.body?.cover_image_url === undefined ? null : String(req.body?.cover_image_url || '').trim()
    const published = req.body?.published === undefined ? true : Boolean(req.body?.published)

    if (!slug) return res.status(400).json({ success: false, message: 'invalid_slug' })
    if (!title) return res.status(400).json({ success: false, message: 'title_required' })
    if (!contentMd) return res.status(400).json({ success: false, message: 'content_required' })

    try {
      const nowPublishedAt = published ? new Date() : null
      const sql = `
        INSERT INTO tutorial_posts (slug, title, summary, content_md, cover_image_url, published, published_at, author_user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, slug, title, summary, cover_image_url, published, published_at, created_at, updated_at
      `
      const result = await pool.query(sql, [slug, title, summary, contentMd, coverImageUrl, published, nowPublishedAt, req.user?.id ?? null])
      return res.status(201).json({ success: true, data: result.rows?.[0] || null })
    } catch (e) {
      if (String(e?.code) === '23505') {
        return res.status(409).json({ success: false, message: 'slug_exists' })
      }
      console.error('tutorials create error:', e)
      return res.status(500).json({ success: false, message: 'tutorials_create_failed' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ success: false, message: 'method_not_allowed' })
}
