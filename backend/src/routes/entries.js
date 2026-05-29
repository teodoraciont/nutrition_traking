const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

const toStr = date => date.toISOString().slice(0, 10)
const fmt = e => ({ ...e, date: toStr(e.date) })

// GET /entries?from=2026-04-01&to=2026-05-31
router.get('/', async (req, res) => {
  const { from, to } = req.query
  const entries = await prisma.gymEntry.findMany({
    where: {
      userId: req.user.id,
      ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
    },
    orderBy: { date: 'asc' },
  })
  res.json(entries.map(fmt))
})

// PUT /entries/:date — upsert a day
router.put('/:date', async (req, res) => {
  const date = new Date(req.params.date)
  const { kcal, protein, weight, gym, foodNote } = req.body
  const entry = await prisma.gymEntry.upsert({
    where: { userId_date: { userId: req.user.id, date } },
    update: { kcal, protein, weight, gym, foodNote },
    create: { userId: req.user.id, date, kcal, protein, weight, gym, foodNote },
  })
  res.json(fmt(entry))
})

module.exports = router
