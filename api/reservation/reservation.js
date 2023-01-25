const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const authService = require('../auth/auth.service')
const socketService = require('../../services/socket.service')
const reservationService = require('./reservation.service')
const ObjectId = require('mongodb').ObjectId

async function getReservations(req, res) {
    try {
        const reservations = await reservationService.query(req.query)
        res.send(reservations)
    } catch (err) {
        logger.error('Cannot get reservations', err)
        res.status(500).send({ err: 'Failed to get reservations' })
    }
}



async function updateReservation(req, res) {
    try {
        const reservation = req.body;
        const updatedReservation = await reservationService.update(reservation)
        
        socketService.emitToUser({ type: 'reservation-handled', data: reservation.status, userId: reservation.buyerId })

        res.json(updatedReservation)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(500).send({ err: 'Failed to update stay' })

    }
}


async function addReservation(req, res) {

    var loggedinUser = authService.validateToken(req.cookies.loginToken)

    try {
        var reservation = req.body
        reservation.buyerId = loggedinUser._id
        reservation.stayId = ObjectId(reservation.stayId)
        console.log('BEFORE ADDING RESERVATIONS',reservation);

        reservation = await reservationService.add(reservation)
        console.log('AFter ADDING RESERVATIONS',reservation);

        // socketService.broadcast({type: 'reservation-added', data: reservation, userId: reservation.buyerId})
        // socketService.emitToUser({type: 'reservation-about-you', data: reservation, userId: reservation.aboutUserId})

        // const fullUser = await userService.getById(loggedinUser._id)
        // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(reservation)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add reservation', err)
        res.status(500).send({ err: 'Failed to add reservation' })
    }
}

module.exports = {
    getReservations,
    addReservation,
    updateReservation
}