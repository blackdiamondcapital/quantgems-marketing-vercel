import bcrypt from 'bcryptjs'

import { getPool } from '../_lib/pool.js'
import { signToken } from '../_lib/auth.js'

const pool = getPool()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, message: 'method_not_allowed' })
  }

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
       WHERE lower(email) = lower($1)
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
}
