const mongoose = require('mongoose')


const barangayInfo = new mongoose.Schema({
    location: {
        houseNumber: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        barangay: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        zipcode: {
            type: String,
            required: true
        }
    },
    contact: {
        hotline: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    demographic: {
        residents: {
            type: Number,
            default: 0
        },
        families: {
            type: Number,
            default: 0
        },
        households: {
            type: Number,
            default: 0
        },
        landAreas: {
            type: Number,
            default: 0
        },
        streets: {
            type: Number,
            default: 0
        },
        healthCenters: {
            type: Number,
            default: 0
        },
        schools: {
            type: Number,
            default: 0
        }
    }
})

const mainOfficial = new mongoose.Schema({
    name: {
        type: String,
    },
    position: {
        type: String,
    },
    image: {
        type: String,
    }
})
const skOfficial = new mongoose.Schema({
    name: {
        type: String,
    },
    position: {
        type: String,
    },
    image: {
        type: String,
    }
})
const barangayOfficials = new mongoose.Schema({
    barangayOfficials: [mainOfficial],
    skOfficials: [skOfficial]
})
const image = new mongoose.Schema({
    public_id: {
        type: String,
    },
    url: {
        type: String,
    }
})

const barangaySchema = new mongoose.Schema(
    {   
        authorized: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Authorized',
		},
        barangayInfo: barangayInfo,
        barangayOfficials: barangayOfficials,
        images: [image]
    },
    {
        timestamps: true,
    }
);

mongoose.models = {};
module.exports = mongoose.model.Barangay ||
    mongoose.model('Barangay', barangaySchema);
