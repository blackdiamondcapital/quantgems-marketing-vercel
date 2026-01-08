import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function getToken(req) {
  return String(req.headers.authorization || '').replace('Bearer ', '').trim()
}

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      plan: user.plan,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function requireAuth(pool) {
  return async (req, res, next) => {
    try {
      const token = getToken(req)
      if (!token) {
        return res.status(401).json({ success: false, message: '請先登入' })
      }

      const decoded = verifyToken(token)
      const result = await pool.query(
        'SELECT id, email, plan, subscription_status, is_active FROM users WHERE id = $1',
        [decoded.id]
      )

      if (!result.rows?.length || !result.rows[0].is_active) {
        return res.status(401).json({ success: false, message: '無效的認證' })
      }

      req.user = result.rows[0]
      return next()
    } catch (e) {
      const name = String(e?.name || '')
      if (name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token 已過期，請重新登入' })
      }
      if (name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token 無效' })
      }
      return res.status(500).json({ success: false, message: '認證失敗' })
    }
  }
}

export function optionalAuth(pool) {
  return async (req, _res, next) => {
    try {
      const token = getToken(req)
      if (!token) {
        req.user = null
        return next()
      }
      const decoded = verifyToken(token)
      const result = await pool.query(
        'SELECT id, email, plan, subscription_status, is_active FROM users WHERE id = $1',
        [decoded.id]
      )
      if (!result.rows?.length || !result.rows[0].is_active) {
        req.user = null
        return next()
      }
      req.user = result.rows[0]
      return next()
    } catch {
      req.user = null
      return next()
    }
  }
}

export function requirePlan(...allowedPlans) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '請先登入' })
    }
    if (!allowedPlans.includes(req.user.plan)) {
      return res.status(403).json({
        success: false,
        message: '此功能需要升級訂閱方案',
        data: {
          current_plan: req.user.plan,
          required_plans: allowedPlans,
        },
      })
    }
    return next()
  }
}
