const express = require('express')
const {requireAuth} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addReservation, getReservations,updateReservation} = require('./reservation')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log,requireAuth, getReservations)
router.post('/',  log, requireAuth, addReservation)
router.put('/:id',  log, requireAuth, updateReservation)
// router.delete('/:id',  requireAuth, deleteReview)

module.exports = router