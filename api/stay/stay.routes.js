const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getStays, getStayById, updateStay, addStay, removeStay, addReview } = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

// router.get('/', log, getStays)
// router.post('/', requireAuth, requireAdmin, addStay)
// router.put('/:id', requireAuth, requireAdmin, updateStay)
// router.delete('/:id', requireAuth, requireAdmin, removeStay)
router.get('/', getStays)
router.get('/:id', getStayById)
router.post('/', addStay)
router.put('/:id', updateStay)
router.delete('/:id', removeStay)


module.exports = router