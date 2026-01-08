import { getPool } from '../_lib/pool.js'
import { getToken, verifyToken } from '../_lib/auth.js'

const pool = getPool()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ success: false, message: 'method_not_allowed' })
  }

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

    return res.json({ success: true, data: { user: result.rows[0] } })
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
}
