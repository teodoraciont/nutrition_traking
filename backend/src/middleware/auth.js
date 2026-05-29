const prisma = require('../lib/prisma')

module.exports = async function auth(req, res, next) {
  if (process.env.COGNITO_USER_POOL_ID === 'placeholder') {
    const user = await prisma.user.findFirst()
    if (!user) return res.status(401).json({ error: 'No dev user — run: node prisma/seed.js' })
    req.user = user
    return next()
  }
  // Real Cognito JWT verification goes here in Phase 2
  res.status(401).json({ error: 'Auth not configured' })
}
