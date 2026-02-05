import { getPool } from '../_lib/pool.js'
import { optionalAuth, requireAuth } from '../_lib/auth.js'
import { ensureTutorialsSchema, isPrimeOrEnterprise, normalizeSlug } from '../_lib/tutorials.js'

const pool = getPool()

export default async function handler(req, res) {
  await ensureTutorialsSchema(pool)

  const param = String(req.query?.param || '').trim()

  // GET by slug
  if (req.method === 'GET') {
    await new Promise(resolve => optionalAuth(pool)(req, res, resolve))

    const slug = normalizeSlug(param)
    if (!slug) {
      return res.status(400).json({ success: false, message: 'invalid_slug' })
    }

    const includeUnpublished = Boolean(req.user) && isPrimeOrEnterprise(req.user)

    try {
      const sql = `
        SELECT id, slug, title, summary, content_md, cover_image_url,
               author_user_id,
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
  }

  // PUT/DELETE by numeric id
  const id = Number.parseInt(param, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'invalid_id' })
  }

  await new Promise(resolve => requireAuth(pool)(req, res, resolve))

  let existing
  try {
    const cur = await pool.query('SELECT id, author_user_id FROM tutorial_posts WHERE id = $1 LIMIT 1', [id])
    existing = cur.rows?.[0] || null
    if (!existing) return res.status(404).json({ success: false, message: 'not_found' })
  } catch (e) {
    console.error('tutorials fetch owner error:', e)
    return res.status(500).json({ success: false, message: 'tutorials_owner_fetch_failed' })
  }

  const isAdminLike = isPrimeOrEnterprise(req.user)
  const isOwner = existing?.author_user_id != null && Number(existing.author_user_id) === Number(req.user?.id)
  if (!isAdminLike && !isOwner) {
    return res.status(403).json({ success: false, message: 'permission_denied' })
  }

  if (req.method === 'PUT') {
    const slugRaw = req.body?.slug
    const slug = slugRaw === undefined ? null : normalizeSlug(slugRaw)
    if (slugRaw !== undefined && !slug) {
      return res.status(400).json({ success: false, message: 'invalid_slug' })
    }

    const titleRaw = req.body?.title
    const title = titleRaw === undefined ? null : String(titleRaw || '').trim()

    const summaryRaw = req.body?.summary
    const summary = summaryRaw === undefined ? null : String(summaryRaw || '').trim()

    const contentRaw = req.body?.content_md ?? req.body?.content
    const contentMd = contentRaw === undefined ? null : String(contentRaw || '').trim()

    const coverRaw = req.body?.cover_image_url
    const coverImageUrl = coverRaw === undefined ? null : String(coverRaw || '').trim()

    const publishedRaw = req.body?.published
    const published = publishedRaw === undefined ? null : Boolean(publishedRaw)

    const sets = []
    const values = []
    let idx = 1

    function addSet(col, val) {
      sets.push(`${col} = $${idx}`)
      values.push(val)
      idx += 1
    }

    if (slug !== null) addSet('slug', slug)
    if (title !== null) addSet('title', title)
    if (summaryRaw !== undefined) addSet('summary', summary)
    if (contentMd !== null) addSet('content_md', contentMd)
    if (coverRaw !== undefined) addSet('cover_image_url', coverImageUrl)

    if (published !== null && isAdminLike) {
      addSet('published', published)
      if (published) addSet('published_at', new Date())
      else addSet('published_at', null)
    }

    addSet('updated_at', new Date())

    if (!sets.length) {
      return res.status(400).json({ success: false, message: 'no_fields' })
    }

    values.push(id)

    try {
      const result = await pool.query(
        `UPDATE tutorial_posts SET ${sets.join(', ')} WHERE id = $${idx} RETURNING id, slug, title, summary, content_md, cover_image_url, published, published_at, created_at, updated_at`,
        values
      )
      if (!result.rows?.length) return res.status(404).json({ success: false, message: 'not_found' })
      return res.json({ success: true, data: result.rows[0] })
    } catch (e) {
      if (String(e?.code) === '23505') {
        return res.status(409).json({ success: false, message: 'slug_exists' })
      }
      console.error('tutorials update error:', e)
      return res.status(500).json({ success: false, message: 'tutorials_update_failed' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await pool.query('DELETE FROM tutorial_posts WHERE id = $1 RETURNING id', [id])
      if (!result.rows?.length) return res.status(404).json({ success: false, message: 'not_found' })
      return res.json({ success: true, data: { id } })
    } catch (e) {
      console.error('tutorials delete error:', e)
      return res.status(500).json({ success: false, message: 'tutorials_delete_failed' })
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE')
  return res.status(405).json({ success: false, message: 'method_not_allowed' })
}
