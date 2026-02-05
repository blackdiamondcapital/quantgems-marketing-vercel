import { getPool } from '../../_lib/pool.js'
import { optionalAuth, requireAuth } from '../../_lib/auth.js'
import { ensureTutorialsSchema, isPrimeOrEnterprise, normalizeSlug } from '../../_lib/tutorials.js'

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

  const param = String(req.query?.param || '').trim()
  const slug = normalizeSlug(param)
  if (!slug) {
    return res.status(400).json({ success: false, message: 'invalid_slug' })
  }

  if (req.method === 'GET') {
    await new Promise(resolve => optionalAuth(pool)(req, res, resolve))

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
    await new Promise(resolve => requireAuth(pool)(req, res, resolve))

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
}
