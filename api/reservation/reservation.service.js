const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('reservation')
    //  

        // let reservations = await collection.find(criteria).toArray()
        // console.log('RESERVATIONS',reservations)
        let reservations = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    localField: 'stayId',
                    from: 'stay',
                    foreignField: '_id',
                    as: 'listingName'
                }
            },
            {
                $unwind: '$listingName'
            },

        ]).toArray()
        console.log('RESERVATIONS BEFORE',reservations);
        reservations = reservations.map(reservation => {
            reservation.listingName = reservation.listingName.name
            reservation.guests = reservation.guests.total
            reservation.checkIn = reservation.dates.checkIn
            reservation.checkOut = reservation.dates.checkOut
            // reservation.bookedAt = '3423'
            reservation.bookedAt = reservation._id.getTimestamp()
            delete reservation.dates
            delete reservation.buyerId
            return reservation
        })
        return reservations
    } catch (err) {
        logger.error('cannot find reservations', err)
        throw err
    }

}

async function remove(reservationId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('reservation')

        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reservationId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove reservation ${reservationId}`, err)
        throw err
    }
}

async function update(reservation) {
    try {
        var id = ObjectId(reservation._id)
        const status = reservation.status
        delete reservation._id
        const collection = await dbService.getCollection('reservation')
        await collection.updateOne({ _id: id }, { $set: { status } })
        return reservation
    } catch (err) {
        logger.error(`cannot update stay ${reservation._id}`, err)
        throw err
    }
}



async function add(reservation) {
    try {
        const collection = await dbService.getCollection('reservation')
        await collection.insertOne(reservation)
       
        return reservation
    } catch (err) {
        logger.error('cannot book reservation', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.hostId) criteria.hostId = filterBy.hostId
    if (filterBy.buyerId) criteria.buyerId = filterBy.buyerId
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    update
}


