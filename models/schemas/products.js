const Mongoose = require('mongoose')

module.exports = new Mongoose.Schema({
  name: {
		type: String,
		required: false,
	},
  description: {
		type: String,
		required: false,
	},
	imageUrl: {
		type: String,
		required: false,
	},
	price: {
		type: Number,
		required: false,
		default: 0
	},
	companyId: {
    type: String,
    required: false,
  },
	creatorId: {
		type: String,
		denyUpdate: true,
		required: false,
	},
}, { timestamps: true })
