const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    const criteria = _buildCriteria(filterBy)

    try {
        const collection = await dbService.getCollection('stay')
        var stays = await collection.find(criteria).toArray()
        return stays

    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        // console.log('collection', collection)
        // console.log('stayId', stayId)
        // const stay = collection.findOne({ _id: stayId })
        const stay = collection.findOne({ _id: ObjectId(stayId) })
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: ObjectId(stayId) })
        return stayId
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        const res = await collection.insertOne(stay)
        return res.ops[0]
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}
async function update(stay) {
    try {
        var id = ObjectId(stay._id)
        delete stay._id
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: id }, { $set: { ...stay } })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const { category, searchBy, properties, hostId } = filterBy

    let criteria = {}

    if (searchBy) {
        const newSearchBy = JSON.parse(searchBy)
        const { location, guestsNum } = newSearchBy

        if (location) {
            const regex = new RegExp(newSearchBy.location, 'i')
            criteria = {
                $or: [
                    { 'address.country': { $regex: regex } },
                    { 'address.city': { $regex: regex } },
                    { 'address.region': { $regex: regex } }
                ]
            }
        }
        if (guestsNum > 1) {
            criteria.guests = { $gte: guestsNum }
        }
    }

    if (category) criteria.category = category

    if (properties) {
        const newProperties = JSON.parse(properties)
        const { price, beds, roomType, amenities } = newProperties

        if (beds) {
            criteria.bedrooms = { $gte: beds }
        }

        if (price) {
            criteria = {
                ...criteria,
                $and: [
                    { 'price': { $gte: price.min } },
                    { 'price': { $lte: price.max } },

                ]
            }
        }

        let roomTypesKeys = Object.keys(roomType)

        const filterdRoomTypes = roomTypesKeys.filter(type => roomType[type])
        if (filterdRoomTypes.length) {
            criteria.roomType = { $all: filterdRoomTypes }
        }

        let amenitiesKeys = Object.keys(amenities)
        const filterdAmenities = amenitiesKeys.filter(amenitie => amenities[amenitie])


        if (filterdAmenities.length) {
            criteria.amenities = { $all: filterdAmenities }
        }
    }

    if (hostId) {
        criteria['host._id'] = hostId
    }

    return criteria
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}



