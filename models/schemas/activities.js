const Mongoose = require('mongoose')

module.exports = new Mongoose.Schema({
  action: {
		type: String,
	},
  orderId: {
		type: String,
	},
  customerId: {
		type: String,
	},
  userId: {
		type: String,
	},
  ip: {
		type: String,
	},
  location: {
		type: Mongoose.Schema.Types.Mixed
	},
}, { timestamps: true })
